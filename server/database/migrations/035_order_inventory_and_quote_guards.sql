-- Harden marketplace order creation, quote transitions, and inventory settlement.
-- Apply after 032_atomic_order_creation.sql and before deploying callers that send
-- p_idempotency_key or invoke transition_marketplace_quote.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS idempotency_key UUID,
  ADD COLUMN IF NOT EXISTS stock_reserved_quantity NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS stock_reserved_unit VARCHAR(20),
  ADD COLUMN IF NOT EXISTS stock_reserved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stock_released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stock_committed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_buyer_idempotency_unique
  ON orders(buyer_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_open_stock_reservations
  ON orders(listing_id)
  WHERE stock_reserved_at IS NOT NULL
    AND stock_released_at IS NULL
    AND stock_committed_at IS NULL;

-- Only 032 orders carry this server-owned source marker and are known to have
-- decremented stock. Cancelled 032 rows are intentionally excluded: operators must
-- reconcile whether their stock was already restored before marking them released.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM orders o
    LEFT JOIN listings l ON l.id = o.listing_id
    WHERE o.stock_reserved_at IS NULL
      AND o.status NOT IN ('cancelled'::order_status, 'completed'::order_status)
      AND o.metadata ->> 'orderSource' IN ('listing', 'accepted_quote')
      AND (
        o.quantity <= 0
        OR NULLIF(BTRIM(o.quantity_unit), '') IS NULL
        OR
        l.id IS NULL
        OR LOWER(BTRIM(l.quantity_unit)) <> LOWER(BTRIM(o.quantity_unit))
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_035_STOCK_RECONCILIATION_REQUIRED';
  END IF;
END;
$$;

UPDATE orders
SET stock_reserved_quantity = quantity,
    stock_reserved_unit = quantity_unit,
    stock_reserved_at = COALESCE(created_at, NOW()),
    stock_committed_at = CASE
      WHEN status = 'completed'::order_status
        THEN GREATEST(
          COALESCE(completed_at, created_at, NOW()),
          COALESCE(updated_at, created_at, NOW()),
          COALESCE(created_at, NOW())
        )
      ELSE NULL
    END
WHERE stock_reserved_at IS NULL
  AND status <> 'cancelled'::order_status
  AND quantity > 0
  AND NULLIF(BTRIM(quantity_unit), '') IS NOT NULL
  AND metadata ->> 'orderSource' IN ('listing', 'accepted_quote');

-- NOT VALID avoids a table-wide historical-data validation during deployment while
-- still enforcing the invariants for every new or updated row.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'listings_nonnegative_inventory_price_check'
      AND conrelid = 'public.listings'::regclass
  ) THEN
    ALTER TABLE listings
      ADD CONSTRAINT listings_nonnegative_inventory_price_check
      CHECK (quantity >= 0 AND price_per_unit >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inquiries_positive_terms_check'
      AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_positive_terms_check
      CHECK (
        (requested_qty IS NULL OR requested_qty > 0)
        AND (requested_price IS NULL OR requested_price >= 0)
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'inquiries_known_status_check'
      AND conrelid = 'public.inquiries'::regclass
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_known_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed'))
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_positive_quantity_nonnegative_amounts_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_positive_quantity_nonnegative_amounts_check
      CHECK (
        quantity > 0
        AND unit_price >= 0
        AND base_amount >= 0
        AND total_amount >= 0
        AND logistics_fee >= 0
        AND platform_commission >= 0
        AND seller_net_amount >= 0
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_stock_reservation_consistency_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_stock_reservation_consistency_check
      CHECK (
        (
          stock_reserved_at IS NULL
          AND stock_reserved_quantity IS NULL
          AND stock_reserved_unit IS NULL
          AND stock_released_at IS NULL
          AND stock_committed_at IS NULL
        )
        OR
        (
          stock_reserved_at IS NOT NULL
          AND stock_reserved_quantity IS NOT NULL
          AND stock_reserved_quantity > 0
          AND stock_reserved_unit IS NOT NULL
          AND NULLIF(BTRIM(stock_reserved_unit), '') IS NOT NULL
          AND NUM_NONNULLS(stock_released_at, stock_committed_at) <= 1
          AND (stock_released_at IS NULL OR stock_released_at >= stock_reserved_at)
          AND (stock_committed_at IS NULL OR stock_committed_at >= stock_reserved_at)
        )
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_idempotency_request_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_idempotency_request_check
      CHECK (
        idempotency_key IS NULL
        OR COALESCE(JSONB_TYPEOF(metadata -> 'idempotencyRequest'), '') = 'object'
      ) NOT VALID;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_listing_unit_with_open_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF LOWER(BTRIM(NEW.quantity_unit)) IS DISTINCT FROM LOWER(BTRIM(OLD.quantity_unit))
    AND EXISTS (
      SELECT 1
      FROM orders
      WHERE listing_id = OLD.id
        AND stock_reserved_at IS NOT NULL
        AND stock_released_at IS NULL
        AND stock_committed_at IS NULL
    )
  THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'ORDER_LISTING_UNIT_RESERVED';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_open_order_unit_guard ON listings;
CREATE TRIGGER listings_open_order_unit_guard
  BEFORE UPDATE OF quantity_unit ON listings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_listing_unit_with_open_orders();

CREATE OR REPLACE FUNCTION settle_order_stock_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing listings%ROWTYPE;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'cancelled'::order_status THEN
    IF OLD.status NOT IN (
      'pending_payment'::order_status,
      'confirmed'::order_status,
      'inspection_in_progress'::order_status,
      'verified'::order_status,
      'processing'::order_status,
      'disputed'::order_status
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'ORDER_CANCELLATION_INVALID';
    END IF;

    -- Legacy orders without a trusted reservation marker can still be cancelled, but
    -- migration 035 never guesses whether their stock should be restored.
    IF OLD.stock_reserved_at IS NULL THEN
      RETURN NEW;
    END IF;

    IF OLD.stock_released_at IS NOT NULL THEN
      NEW.stock_released_at := OLD.stock_released_at;
      RETURN NEW;
    END IF;

    IF OLD.stock_committed_at IS NOT NULL THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'ORDER_STOCK_ALREADY_COMMITTED';
    END IF;

    SELECT *
    INTO v_listing
    FROM listings
    WHERE id = OLD.listing_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0002',
        MESSAGE = 'ORDER_STOCK_LISTING_NOT_FOUND';
    END IF;

    IF LOWER(BTRIM(v_listing.quantity_unit)) <> LOWER(BTRIM(OLD.stock_reserved_unit)) THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'ORDER_STOCK_UNIT_MISMATCH';
    END IF;

    UPDATE listings
    SET quantity = quantity + OLD.stock_reserved_quantity,
        status = CASE
          WHEN status = 'sold_out'::listing_status AND quantity = 0
            THEN 'active'::listing_status
          ELSE status
        END
    WHERE id = v_listing.id;

    NEW.stock_released_at := NOW();
    RETURN NEW;
  END IF;

  IF NEW.status = 'completed'::order_status
    AND OLD.stock_reserved_at IS NOT NULL
    AND OLD.stock_released_at IS NULL
    AND OLD.stock_committed_at IS NULL
  THEN
    NEW.stock_committed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_stock_reservation_settlement ON orders;
CREATE TRIGGER orders_stock_reservation_settlement
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION settle_order_stock_reservation();

CREATE OR REPLACE FUNCTION enforce_inquiry_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected', 'cancelled') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'accepted' AND NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'accepted'
    AND NEW.status = 'completed'
    AND EXISTS (SELECT 1 FROM orders WHERE quote_id = OLD.id)
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION USING
    ERRCODE = 'P0001',
    MESSAGE = 'QUOTE_INVALID_TRANSITION';
END;
$$;

DROP TRIGGER IF EXISTS inquiries_status_transition_guard ON inquiries;
CREATE TRIGGER inquiries_status_transition_guard
  BEFORE UPDATE OF status ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION enforce_inquiry_status_transition();

DROP FUNCTION IF EXISTS transition_marketplace_quote(UUID, UUID, TEXT, TEXT);

CREATE FUNCTION transition_marketplace_quote(
  p_actor_user_id UUID,
  p_quote_id UUID,
  p_expected_status TEXT,
  p_target_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quote inquiries%ROWTYPE;
  v_actor users%ROWTYPE;
  v_farmer farmer_profiles%ROWTYPE;
  v_reseller reseller_profiles%ROWTYPE;
  v_buyer buyer_profiles%ROWTYPE;
BEGIN
  SELECT *
  INTO v_quote
  FROM inquiries
  WHERE id = p_quote_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'QUOTE_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_actor
  FROM users
  WHERE id = p_actor_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_actor.status <> 'active'::user_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
  END IF;

  IF p_target_status = 'completed' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_COMPLETION_RPC_ONLY';
  ELSIF p_target_status IN ('accepted', 'rejected') THEN
    IF v_actor.role = 'farmer'::user_role THEN
      SELECT *
      INTO v_farmer
      FROM farmer_profiles
      WHERE user_id = v_actor.id
        AND id = v_quote.farmer_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
      END IF;

      IF p_target_status = 'accepted'
        AND v_farmer.identity_verification_status <> 'verified'
      THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_SELLER_NOT_ELIGIBLE';
      END IF;
    ELSIF v_actor.role = 'reseller'::user_role THEN
      SELECT *
      INTO v_reseller
      FROM reseller_profiles
      WHERE user_id = v_actor.id
        AND id = v_quote.reseller_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
      END IF;

      IF p_target_status = 'accepted'
        AND v_reseller.identity_verification_status <> 'verified'
      THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_SELLER_NOT_ELIGIBLE';
      END IF;
    ELSIF p_target_status = 'rejected'
      AND v_actor.role IN ('admin'::user_role, 'super_admin'::user_role)
    THEN
      NULL;
    ELSE
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
    END IF;
  ELSIF p_target_status = 'cancelled' THEN
    IF v_actor.role NOT IN ('local_buyer'::user_role, 'international_buyer'::user_role) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
    END IF;

    SELECT *
    INTO v_buyer
    FROM buyer_profiles
    WHERE user_id = v_actor.id
      AND id = v_quote.buyer_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_ACTOR_FORBIDDEN';
    END IF;
  ELSE
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_INVALID_TRANSITION';
  END IF;

  IF v_quote.status = p_target_status THEN
    RETURN TO_JSONB(v_quote);
  END IF;

  IF v_quote.status <> p_expected_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_STATUS_CHANGED';
  END IF;

  IF (p_target_status IN ('accepted', 'rejected') AND p_expected_status <> 'pending')
    OR (p_target_status = 'cancelled' AND p_expected_status NOT IN ('pending', 'accepted'))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_INVALID_TRANSITION';
  END IF;

  UPDATE inquiries
  SET status = p_target_status
  WHERE id = v_quote.id
    AND status = p_expected_status
  RETURNING * INTO v_quote;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_STATUS_CHANGED';
  END IF;

  RETURN TO_JSONB(v_quote);
END;
$$;

REVOKE ALL ON FUNCTION transition_marketplace_quote(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION transition_marketplace_quote(UUID, UUID, TEXT, TEXT)
  TO service_role;

-- Replace 032's function instead of leaving an ambiguous PostgREST overload.
DROP FUNCTION IF EXISTS create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB
);
DROP FUNCTION IF EXISTS create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID
);

CREATE FUNCTION create_marketplace_order(
  p_buyer_user_id UUID,
  p_listing_id UUID,
  p_quote_id UUID,
  p_quantity NUMERIC,
  p_requested_quantity_unit TEXT,
  p_logistics_required BOOLEAN,
  p_logistics_fee NUMERIC,
  p_shipping_address TEXT,
  p_billing_address TEXT,
  p_notes TEXT,
  p_metadata JSONB,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_buyer buyer_profiles%ROWTYPE;
  v_buyer_id UUID;
  v_listing listings%ROWTYPE;
  v_quote inquiries%ROWTYPE;
  v_order orders%ROWTYPE;
  v_listing_id UUID := p_listing_id;
  v_seller_user_id UUID;
  v_seller_role TEXT;
  v_seller_verification_status TEXT;
  v_seller_user_status TEXT;
  v_seller_user_role TEXT;
  v_effective_quantity NUMERIC;
  v_effective_price NUMERIC;
  v_effective_currency TEXT;
  v_quantity_kg NUMERIC;
  v_base_amount NUMERIC;
  v_logistics_fee NUMERIC;
  v_platform_commission NUMERIC;
  v_seller_net_amount NUMERIC;
  v_total_amount NUMERIC;
  v_idempotency_request JSONB;
  v_metadata JSONB;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF (p_listing_id IS NULL) = (p_quote_id IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_SOURCE_INVALID';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUANTITY_INVALID';
  END IF;

  IF p_quote_id IS NOT NULL AND p_idempotency_key IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_IDEMPOTENCY_QUOTE_INVALID';
  END IF;

  v_idempotency_request := JSONB_STRIP_NULLS(JSONB_BUILD_OBJECT(
    'listingId', p_listing_id,
    'quantity', p_quantity,
    'quantityUnit', NULLIF(LOWER(BTRIM(COALESCE(p_requested_quantity_unit, ''))), ''),
    'logisticsRequired', COALESCE(p_logistics_required, FALSE),
    'shippingAddress', NULLIF(BTRIM(COALESCE(p_shipping_address, '')), ''),
    'billingAddress', NULLIF(BTRIM(COALESCE(p_billing_address, '')), ''),
    'notes', NULLIF(BTRIM(COALESCE(p_notes, '')), '')
  ));

  IF p_idempotency_key IS NOT NULL THEN
    PERFORM PG_ADVISORY_XACT_LOCK(
      PG_CATALOG.HASHTEXTEXTENDED(
        p_buyer_user_id::TEXT || ':' || p_idempotency_key::TEXT,
        0
      )
    );

    SELECT id
    INTO v_buyer_id
    FROM buyer_profiles
    WHERE user_id = p_buyer_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_BUYER_NOT_FOUND';
    END IF;

    SELECT *
    INTO v_order
    FROM orders
    WHERE buyer_id = v_buyer_id
      AND idempotency_key = p_idempotency_key
    FOR UPDATE;

    IF FOUND THEN
      IF v_order.metadata -> 'idempotencyRequest' IS DISTINCT FROM v_idempotency_request THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_IDEMPOTENCY_CONFLICT';
      END IF;

      RETURN TO_JSONB(v_order);
    END IF;
  END IF;

  IF p_quote_id IS NOT NULL THEN
    SELECT *
    INTO v_quote
    FROM inquiries
    WHERE id = p_quote_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_QUOTE_NOT_FOUND';
    END IF;

    IF v_quote.status <> 'accepted' THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_NOT_ACCEPTED';
    END IF;

    IF v_quote.requested_qty IS NOT NULL AND v_quote.requested_qty <> p_quantity THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_QUANTITY_MISMATCH';
    END IF;

    v_effective_quantity := COALESCE(v_quote.requested_qty, p_quantity);
    v_listing_id := v_quote.listing_id;
  ELSE
    v_effective_quantity := p_quantity;
  END IF;

  SELECT *
  INTO v_listing
  FROM listings
  WHERE id = v_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_LISTING_NOT_FOUND';
  END IF;

  IF v_listing.status <> 'active'::listing_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_LISTING_NOT_ACTIVE';
  END IF;

  SELECT *
  INTO v_buyer
  FROM buyer_profiles
  WHERE user_id = p_buyer_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_BUYER_NOT_FOUND';
  END IF;

  IF p_quote_id IS NOT NULL AND v_quote.buyer_id <> v_buyer.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_QUOTE_NOT_FOUND';
  END IF;

  IF p_quote_id IS NOT NULL AND (
    v_quote.listing_id <> v_listing.id
    OR v_quote.farmer_id IS DISTINCT FROM v_listing.farmer_id
    OR v_quote.reseller_id IS DISTINCT FROM v_listing.reseller_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_LISTING_MISMATCH';
  END IF;

  IF v_listing.farmer_id IS NOT NULL AND v_listing.reseller_id IS NULL THEN
    SELECT p.user_id, 'farmer', p.identity_verification_status, u.status::TEXT, u.role::TEXT
    INTO v_seller_user_id, v_seller_role, v_seller_verification_status,
      v_seller_user_status, v_seller_user_role
    FROM farmer_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_listing.farmer_id
    FOR UPDATE OF p, u;
  ELSIF v_listing.farmer_id IS NULL AND v_listing.reseller_id IS NOT NULL THEN
    SELECT p.user_id, 'reseller', p.identity_verification_status, u.status::TEXT, u.role::TEXT
    INTO v_seller_user_id, v_seller_role, v_seller_verification_status,
      v_seller_user_status, v_seller_user_role
    FROM reseller_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_listing.reseller_id
    FOR UPDATE OF p, u;
  ELSE
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_SELLER_NOT_ELIGIBLE';
  END IF;

  IF NOT FOUND
    OR v_seller_verification_status <> 'verified'
    OR v_seller_user_status <> 'active'
    OR v_seller_user_role <> v_seller_role
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_SELLER_NOT_ELIGIBLE';
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_requested_quantity_unit, '')), '') IS NOT NULL
    AND LOWER(BTRIM(p_requested_quantity_unit)) <> LOWER(BTRIM(v_listing.quantity_unit))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUANTITY_UNIT_MISMATCH';
  END IF;

  IF v_listing.quantity < v_effective_quantity THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_INSUFFICIENT_QUANTITY';
  END IF;

  IF p_quote_id IS NOT NULL AND v_quote.requested_price IS NOT NULL THEN
    v_effective_price := v_quote.requested_price;
    v_effective_currency := COALESCE(NULLIF(v_quote.currency, ''), v_listing.currency, 'XAF');
  ELSE
    v_effective_price := v_listing.price_per_unit;
    v_effective_currency := COALESCE(NULLIF(v_listing.currency, ''), 'XAF');
  END IF;

  IF v_effective_price IS NULL OR v_effective_price < 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_PRICE_INVALID';
  END IF;

  v_logistics_fee := CASE
    WHEN COALESCE(p_logistics_required, FALSE) THEN COALESCE(p_logistics_fee, 0)
    ELSE 0
  END;

  IF v_logistics_fee < 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_LOGISTICS_FEE_INVALID';
  END IF;

  v_quantity_kg := CASE LOWER(BTRIM(COALESCE(v_listing.quantity_unit, 'kg')))
    WHEN 't' THEN v_effective_quantity * 1000
    WHEN 'ton' THEN v_effective_quantity * 1000
    WHEN 'tons' THEN v_effective_quantity * 1000
    WHEN 'tonne' THEN v_effective_quantity * 1000
    WHEN 'tonnes' THEN v_effective_quantity * 1000
    WHEN 'metric_ton' THEN v_effective_quantity * 1000
    WHEN 'g' THEN v_effective_quantity / 1000
    WHEN 'gram' THEN v_effective_quantity / 1000
    WHEN 'grams' THEN v_effective_quantity / 1000
    WHEN 'lb' THEN v_effective_quantity * 0.45359237
    WHEN 'lbs' THEN v_effective_quantity * 0.45359237
    WHEN 'pound' THEN v_effective_quantity * 0.45359237
    WHEN 'pounds' THEN v_effective_quantity * 0.45359237
    ELSE v_effective_quantity
  END;

  v_base_amount := ROUND(v_effective_quantity * v_effective_price, 2);
  v_platform_commission := ROUND(v_quantity_kg * 200, 2);
  v_seller_net_amount := GREATEST(0, v_base_amount - v_platform_commission);
  v_total_amount := v_base_amount + v_logistics_fee;

  UPDATE listings
  SET quantity = quantity - v_effective_quantity,
      status = CASE
        WHEN quantity - v_effective_quantity = 0 THEN 'sold_out'::listing_status
        ELSE status
      END
  WHERE id = v_listing.id;

  v_metadata := (
    CASE
      WHEN JSONB_TYPEOF(COALESCE(p_metadata, '{}'::JSONB)) = 'object'
        THEN COALESCE(p_metadata, '{}'::JSONB)
      ELSE '{}'::JSONB
    END
  ) || JSONB_BUILD_OBJECT(
    'orderSource', CASE WHEN p_quote_id IS NULL THEN 'listing' ELSE 'accepted_quote' END,
    'quoteId', p_quote_id
  );

  IF p_idempotency_key IS NOT NULL THEN
    v_metadata := v_metadata || JSONB_BUILD_OBJECT(
      'idempotencyRequest', v_idempotency_request
    );
  END IF;

  INSERT INTO orders (
    order_number,
    listing_id,
    quote_id,
    buyer_id,
    farmer_id,
    reseller_id,
    idempotency_key,
    quantity,
    quantity_unit,
    unit_price,
    base_amount,
    total_amount,
    logistics_required,
    logistics_fee,
    platform_commission,
    seller_net_amount,
    currency,
    status,
    shipping_address,
    billing_address,
    notes,
    metadata,
    timeline,
    stock_reserved_quantity,
    stock_reserved_unit,
    stock_reserved_at
  )
  VALUES (
    'ORD-' || UPPER(SUBSTRING(REPLACE(pg_catalog.gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12)),
    v_listing.id,
    p_quote_id,
    v_buyer.id,
    v_listing.farmer_id,
    v_listing.reseller_id,
    p_idempotency_key,
    v_effective_quantity,
    v_listing.quantity_unit,
    v_effective_price,
    v_base_amount,
    v_total_amount,
    COALESCE(p_logistics_required, FALSE),
    v_logistics_fee,
    v_platform_commission,
    v_seller_net_amount,
    v_effective_currency,
    'pending_payment',
    NULLIF(BTRIM(COALESCE(p_shipping_address, '')), ''),
    NULLIF(BTRIM(COALESCE(p_billing_address, '')), ''),
    NULLIF(BTRIM(COALESCE(p_notes, '')), ''),
    v_metadata,
    JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT(
        'event', 'Order created',
        'status', 'pending_payment',
        'date', v_now
      )
    ),
    v_effective_quantity,
    v_listing.quantity_unit,
    v_now
  )
  RETURNING * INTO v_order;

  IF p_quote_id IS NOT NULL THEN
    UPDATE inquiries
    SET status = 'completed'
    WHERE id = v_quote.id
      AND status = 'accepted';

    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_NOT_ACCEPTED';
    END IF;
  END IF;

  RETURN TO_JSONB(v_order);
END;
$$;

REVOKE ALL ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID
) TO service_role;

REVOKE ALL ON FUNCTION enforce_listing_unit_with_open_orders() FROM PUBLIC;
REVOKE ALL ON FUNCTION settle_order_stock_reservation() FROM PUBLIC;
REVOKE ALL ON FUNCTION enforce_inquiry_status_transition() FROM PUBLIC;

COMMENT ON COLUMN orders.idempotency_key
  IS 'Optional buyer-generated key. Reusing it for the same direct-order request returns the original order.';
COMMENT ON COLUMN orders.stock_reserved_at
  IS 'Set only when this order atomically decremented listing stock.';
COMMENT ON COLUMN orders.stock_released_at
  IS 'Exactly-once marker set in the same transaction that cancellation restores listing stock.';
COMMENT ON COLUMN orders.stock_committed_at
  IS 'Marks a completed sale whose stock reservation must never be restored.';
COMMENT ON FUNCTION transition_marketplace_quote(UUID, UUID, TEXT, TEXT)
  IS 'Locks a quote and actor rows, enforces actor/state rules, and applies an expected-state transition. Completion is forbidden here.';
COMMENT ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID
) IS 'Creates an idempotent server-authoritative order, locks seller eligibility and active stock, records the reservation, and converts an accepted quote atomically.';

NOTIFY pgrst, 'reload schema';
