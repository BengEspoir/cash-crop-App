-- Create marketplace orders from server-authoritative listing or accepted-quote terms.
-- The service role is the only caller; all stock and quote state changes occur in one transaction.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES inquiries(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_quote_id_unique
  ON orders(quote_id)
  WHERE quote_id IS NOT NULL;

-- Marketplace writes must go through server-owned operations; browser roles cannot bypass the RPC invariants.
REVOKE INSERT, UPDATE, DELETE ON TABLE orders, listings, inquiries
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION create_marketplace_order(
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
  p_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_buyer buyer_profiles%ROWTYPE;
  v_listing listings%ROWTYPE;
  v_quote inquiries%ROWTYPE;
  v_order orders%ROWTYPE;
  v_listing_id UUID := p_listing_id;
  v_effective_quantity NUMERIC;
  v_effective_price NUMERIC;
  v_effective_currency TEXT;
  v_quantity_kg NUMERIC;
  v_base_amount NUMERIC;
  v_logistics_fee NUMERIC;
  v_platform_commission NUMERIC;
  v_seller_net_amount NUMERIC;
  v_total_amount NUMERIC;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF (p_listing_id IS NULL) = (p_quote_id IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_SOURCE_INVALID';
  END IF;

  SELECT *
  INTO v_buyer
  FROM buyer_profiles
  WHERE user_id = p_buyer_user_id
  FOR KEY SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_BUYER_NOT_FOUND';
  END IF;

  IF p_quote_id IS NOT NULL THEN
    SELECT *
    INTO v_quote
    FROM inquiries
    WHERE id = p_quote_id
    FOR UPDATE;

    IF NOT FOUND OR v_quote.buyer_id <> v_buyer.id THEN
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

  IF p_quote_id IS NULL AND v_listing.status <> 'active'::listing_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_LISTING_NOT_ACTIVE';
  END IF;

  IF p_quote_id IS NOT NULL AND (
    v_quote.listing_id <> v_listing.id
    OR v_quote.farmer_id IS DISTINCT FROM v_listing.farmer_id
    OR v_quote.reseller_id IS DISTINCT FROM v_listing.reseller_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_LISTING_MISMATCH';
  END IF;

  IF NULLIF(TRIM(COALESCE(p_requested_quantity_unit, '')), '') IS NOT NULL
    AND LOWER(TRIM(p_requested_quantity_unit)) <> LOWER(TRIM(v_listing.quantity_unit))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUANTITY_UNIT_MISMATCH';
  END IF;

  IF v_effective_quantity IS NULL OR v_effective_quantity <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUANTITY_INVALID';
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

  v_quantity_kg := CASE LOWER(TRIM(COALESCE(v_listing.quantity_unit, 'kg')))
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

  IF p_quote_id IS NOT NULL THEN
    UPDATE inquiries
    SET status = 'completed'
    WHERE id = v_quote.id
      AND status = 'accepted';

    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_QUOTE_NOT_ACCEPTED';
    END IF;
  END IF;

  INSERT INTO orders (
    order_number,
    listing_id,
    quote_id,
    buyer_id,
    farmer_id,
    reseller_id,
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
    timeline
  )
  VALUES (
    'ORD-' || UPPER(SUBSTRING(REPLACE(pg_catalog.gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12)),
    v_listing.id,
    p_quote_id,
    v_buyer.id,
    v_listing.farmer_id,
    v_listing.reseller_id,
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
    NULLIF(TRIM(COALESCE(p_shipping_address, '')), ''),
    NULLIF(TRIM(COALESCE(p_billing_address, '')), ''),
    NULLIF(TRIM(COALESCE(p_notes, '')), ''),
    (
      CASE
        WHEN JSONB_TYPEOF(COALESCE(p_metadata, '{}'::JSONB)) = 'object'
          THEN COALESCE(p_metadata, '{}'::JSONB)
        ELSE '{}'::JSONB
      END
    ) || JSONB_BUILD_OBJECT(
      'orderSource', CASE WHEN p_quote_id IS NULL THEN 'listing' ELSE 'accepted_quote' END,
      'quoteId', p_quote_id
    ),
    JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT(
        'event', 'Order created',
        'status', 'pending_payment',
        'date', v_now
      )
    )
  )
  RETURNING * INTO v_order;

  RETURN TO_JSONB(v_order);
END;
$$;

REVOKE ALL ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB
) TO service_role;

COMMENT ON COLUMN orders.quote_id
  IS 'Accepted inquiry converted atomically into this order; unique when present.';

COMMENT ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB
) IS 'Atomically locks stock/quote rows, reserves listing quantity, converts an accepted quote once, and inserts an order using authoritative marketplace terms.';
