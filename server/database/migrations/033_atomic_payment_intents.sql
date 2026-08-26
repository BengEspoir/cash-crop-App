-- Keep one authoritative payment intent per payable order and serialize provider work.
-- Apply after 032. Reconcile legacy duplicate order payments before applying this
-- migration; the unique index deliberately fails closed.

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_order_id_unique
  ON payments(order_id);

CREATE OR REPLACE FUNCTION get_or_create_payment_intent(
  p_order_id UUID,
  p_payer_id UUID,
  p_payee_id UUID,
  p_amount NUMERIC,
  p_currency TEXT,
  p_channel TEXT,
  p_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_authoritative_payer_id UUID;
  v_authoritative_payee_id UUID;
  v_created BOOLEAN := FALSE;
  v_currency TEXT;
BEGIN
  -- Parent-before-child is the lock order used by every payment RPC.
  SELECT *
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  IF v_order.status <> 'pending_payment'::order_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ORDER_NOT_PAYABLE';
  END IF;

  SELECT p.user_id
  INTO v_authoritative_payer_id
  FROM buyer_profiles p
  JOIN users u ON u.id = p.user_id
  WHERE p.id = v_order.buyer_id
    AND u.status = 'active'::user_status
    AND u.role IN ('local_buyer'::user_role, 'international_buyer'::user_role);

  IF NOT FOUND OR v_authoritative_payer_id IS DISTINCT FROM p_payer_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_PARTICIPANTS_INVALID';
  END IF;

  IF v_order.reseller_id IS NOT NULL THEN
    SELECT p.user_id
    INTO v_authoritative_payee_id
    FROM reseller_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.reseller_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'reseller'::user_role;
  ELSE
    SELECT p.user_id
    INTO v_authoritative_payee_id
    FROM farmer_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.farmer_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'farmer'::user_role;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_SELLER_NOT_ELIGIBLE';
  END IF;

  IF v_authoritative_payee_id IS DISTINCT FROM p_payee_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_PARTICIPANTS_INVALID';
  END IF;

  v_currency := UPPER(COALESCE(NULLIF(BTRIM(v_order.currency), ''), 'XAF'));
  IF p_amount IS NULL
    OR p_amount <= 0
    OR p_amount <> v_order.total_amount
    OR UPPER(COALESCE(NULLIF(BTRIM(p_currency), ''), 'XAF')) <> v_currency
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INTENT_MISMATCH';
  END IF;

  SELECT *
  INTO v_payment
  FROM payments
  WHERE order_id = v_order.id
  FOR UPDATE;

  IF FOUND THEN
    IF v_payment.payer_id IS DISTINCT FROM v_authoritative_payer_id
      OR v_payment.payee_id IS DISTINCT FROM v_authoritative_payee_id
      OR v_payment.amount IS DISTINCT FROM v_order.total_amount
      OR UPPER(v_payment.currency) IS DISTINCT FROM v_currency
    THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INTENT_MISMATCH';
    END IF;
  ELSE
    INSERT INTO payments (
      order_id,
      payer_id,
      payee_id,
      amount,
      currency,
      status,
      channel,
      metadata
    )
    VALUES (
      v_order.id,
      v_authoritative_payer_id,
      v_authoritative_payee_id,
      v_order.total_amount,
      v_currency,
      'pending',
      NULLIF(p_channel, '')::payment_channel,
      CASE
        WHEN JSONB_TYPEOF(COALESCE(p_metadata, '{}'::JSONB)) = 'object'
          THEN COALESCE(p_metadata, '{}'::JSONB)
        ELSE '{}'::JSONB
      END
    )
    RETURNING * INTO v_payment;
    v_created := TRUE;
  END IF;

  RETURN JSONB_BUILD_OBJECT(
    'payment', TO_JSONB(v_payment),
    'order', TO_JSONB(v_order),
    'created', v_created
  );
END;
$$;

CREATE OR REPLACE FUNCTION claim_payment_provider_initiation(
  p_payment_id UUID,
  p_provider TEXT,
  p_claimed_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id UUID;
  v_order orders%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_authoritative_payer_id UUID;
  v_authoritative_payee_id UUID;
  v_claimed BOOLEAN := FALSE;
  v_now TIMESTAMPTZ := COALESCE(p_claimed_at, NOW());
BEGIN
  SELECT order_id INTO v_order_id FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;
  IF v_payment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;

  IF v_order.status <> 'pending_payment'::order_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ORDER_NOT_PAYABLE';
  END IF;

  SELECT p.user_id INTO v_authoritative_payer_id
  FROM buyer_profiles p
  JOIN users u ON u.id = p.user_id
  WHERE p.id = v_order.buyer_id
    AND u.status = 'active'::user_status
    AND u.role IN ('local_buyer'::user_role, 'international_buyer'::user_role);

  IF v_order.reseller_id IS NOT NULL THEN
    SELECT p.user_id INTO v_authoritative_payee_id
    FROM reseller_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.reseller_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'reseller'::user_role;
  ELSE
    SELECT p.user_id INTO v_authoritative_payee_id
    FROM farmer_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.farmer_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'farmer'::user_role;
  END IF;

  IF v_authoritative_payer_id IS NULL
    OR v_authoritative_payee_id IS NULL
    OR v_payment.payer_id IS DISTINCT FROM v_authoritative_payer_id
    OR v_payment.payee_id IS DISTINCT FROM v_authoritative_payee_id
    OR v_payment.amount IS DISTINCT FROM v_order.total_amount
    OR UPPER(v_payment.currency) IS DISTINCT FROM UPPER(COALESCE(NULLIF(v_order.currency, ''), 'XAF'))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INTENT_MISMATCH';
  END IF;

  IF COALESCE(v_payment.metadata ->> 'providerInitiationState', '') = 'reconciliation_required' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_RECONCILIATION_REQUIRED';
  END IF;

  IF v_payment.status NOT IN ('pending'::payment_status, 'failed'::payment_status) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INVALID_TRANSITION';
  END IF;

  IF COALESCE(v_payment.metadata ->> 'providerInitiationState', '') <> 'initiating'
    AND (
      v_payment.status = 'failed'::payment_status
      OR NULLIF(v_payment.metadata ->> 'checkoutUrl', '') IS NULL
    )
  THEN
    UPDATE payments
    SET status = 'pending',
        transaction_ref = CASE WHEN status = 'failed' THEN NULL ELSE transaction_ref END,
        metadata = (
          CASE
            WHEN status = 'failed' THEN
              (COALESCE(metadata, '{}'::JSONB) - 'checkoutUrl' - 'nextAction') ||
              CASE
                WHEN transaction_ref IS NOT NULL
                  THEN JSONB_BUILD_OBJECT('previousProviderReference', transaction_ref)
                ELSE '{}'::JSONB
              END
            ELSE COALESCE(metadata, '{}'::JSONB)
          END
        ) || JSONB_BUILD_OBJECT(
          'provider', COALESCE(NULLIF(p_provider, ''), 'fapshi'),
          'mode', 'hosted_checkout',
          'providerInitiationState', 'initiating',
          'providerInitiationClaimedAt', v_now,
          'nextAction', 'await_payment'
        )
    WHERE id = v_payment.id
    RETURNING * INTO v_payment;
    v_claimed := TRUE;
  END IF;

  RETURN JSONB_BUILD_OBJECT(
    'payment', TO_JSONB(v_payment),
    'order', TO_JSONB(v_order),
    'claimed', v_claimed
  );
END;
$$;

CREATE OR REPLACE FUNCTION save_payment_provider_checkout(
  p_payment_id UUID,
  p_transaction_ref TEXT,
  p_checkout_url TEXT,
  p_channel TEXT,
  p_provider_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id UUID;
  v_order orders%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_authoritative_payer_id UUID;
  v_authoritative_payee_id UUID;
BEGIN
  IF NULLIF(BTRIM(p_transaction_ref), '') IS NULL
    OR NULLIF(BTRIM(p_checkout_url), '') IS NULL
    OR JSONB_TYPEOF(COALESCE(p_provider_metadata, '{}'::JSONB)) <> 'object'
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_PROVIDER_CHECKOUT_INVALID';
  END IF;

  SELECT order_id INTO v_order_id FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;
  IF v_payment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;

  IF v_order.status <> 'pending_payment'::order_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ORDER_NOT_PAYABLE';
  END IF;

  SELECT p.user_id INTO v_authoritative_payer_id
  FROM buyer_profiles p
  JOIN users u ON u.id = p.user_id
  WHERE p.id = v_order.buyer_id
    AND u.status = 'active'::user_status
    AND u.role IN ('local_buyer'::user_role, 'international_buyer'::user_role);

  IF v_order.reseller_id IS NOT NULL THEN
    SELECT p.user_id INTO v_authoritative_payee_id
    FROM reseller_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.reseller_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'reseller'::user_role;
  ELSE
    SELECT p.user_id INTO v_authoritative_payee_id
    FROM farmer_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.farmer_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'farmer'::user_role;
  END IF;

  IF v_authoritative_payer_id IS NULL
    OR v_authoritative_payee_id IS NULL
    OR v_payment.payer_id IS DISTINCT FROM v_authoritative_payer_id
    OR v_payment.payee_id IS DISTINCT FROM v_authoritative_payee_id
    OR v_payment.amount IS DISTINCT FROM v_order.total_amount
    OR UPPER(v_payment.currency) IS DISTINCT FROM UPPER(COALESCE(NULLIF(v_order.currency, ''), 'XAF'))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INTENT_MISMATCH';
  END IF;

  IF v_payment.transaction_ref = p_transaction_ref
    AND v_payment.metadata ->> 'checkoutUrl' = p_checkout_url
    AND v_payment.metadata ->> 'providerInitiationState' = 'initiated'
  THEN
    RETURN JSONB_BUILD_OBJECT('payment', TO_JSONB(v_payment), 'order', TO_JSONB(v_order));
  END IF;

  IF v_payment.status <> 'pending'::payment_status
    OR v_payment.metadata ->> 'providerInitiationState' <> 'initiating'
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INVALID_TRANSITION';
  END IF;

  BEGIN
    UPDATE payments
    SET channel = COALESCE(NULLIF(p_channel, '')::payment_channel, channel),
        transaction_ref = p_transaction_ref,
        metadata = p_provider_metadata
    WHERE id = v_payment.id
    RETURNING * INTO v_payment;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_PROVIDER_REFERENCE_CONFLICT';
  END;

  RETURN JSONB_BUILD_OBJECT('payment', TO_JSONB(v_payment), 'order', TO_JSONB(v_order));
END;
$$;

CREATE OR REPLACE FUNCTION release_marketplace_escrow(
  p_payment_id UUID,
  p_actor_user_id UUID,
  p_released_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor users%ROWTYPE;
  v_order_id UUID;
  v_order orders%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_payer_id UUID;
  v_payee_id UUID;
  v_now TIMESTAMPTZ := COALESCE(p_released_at, NOW());
BEGIN
  SELECT * INTO v_actor FROM users WHERE id = p_actor_user_id;
  IF NOT FOUND
    OR v_actor.status <> 'active'::user_status
    OR v_actor.role NOT IN ('admin'::user_role, 'super_admin'::user_role)
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ACTOR_FORBIDDEN';
  END IF;

  SELECT order_id INTO v_order_id FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;
  IF v_payment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;

  IF v_payment.status = 'released'::payment_status THEN
    RETURN JSONB_BUILD_OBJECT(
      'payment', TO_JSONB(v_payment),
      'order', TO_JSONB(v_order),
      'released', FALSE
    );
  END IF;

  IF v_payment.status <> 'held_in_escrow'::payment_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INVALID_TRANSITION';
  END IF;
  IF v_order.status NOT IN ('delivered'::order_status, 'completed'::order_status) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ORDER_NOT_READY';
  END IF;

  SELECT user_id INTO v_payer_id FROM buyer_profiles WHERE id = v_order.buyer_id;
  IF v_order.reseller_id IS NOT NULL THEN
    SELECT p.user_id INTO v_payee_id
    FROM reseller_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.reseller_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'reseller'::user_role
    FOR UPDATE OF p, u;
  ELSE
    SELECT p.user_id INTO v_payee_id
    FROM farmer_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.farmer_id
      AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status
      AND u.role = 'farmer'::user_role
    FOR UPDATE OF p, u;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_SELLER_NOT_ELIGIBLE';
  END IF;

  IF v_payment.payer_id IS DISTINCT FROM v_payer_id
    OR v_payment.payee_id IS DISTINCT FROM v_payee_id
    OR v_payment.amount IS DISTINCT FROM v_order.total_amount
    OR UPPER(v_payment.currency) IS DISTINCT FROM UPPER(COALESCE(NULLIF(v_order.currency, ''), 'XAF'))
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INTENT_MISMATCH';
  END IF;

  UPDATE payments
  SET status = 'released',
      released_at = COALESCE(released_at, v_now),
      metadata = COALESCE(metadata, '{}'::JSONB) || JSONB_BUILD_OBJECT(
        'payoutReleasedAmount', COALESCE(v_order.seller_net_amount, 0),
        'payoutReleasedBy', v_actor.id,
        'payoutReleasedAt', v_now
      )
  WHERE id = v_payment.id
    AND status = 'held_in_escrow'
  RETURNING * INTO v_payment;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;

  RETURN JSONB_BUILD_OBJECT(
    'payment', TO_JSONB(v_payment),
    'order', TO_JSONB(v_order),
    'released', TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION mark_cancelled_order_payment_reconciliation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'cancelled'::order_status
    AND OLD.status IS DISTINCT FROM NEW.status
  THEN
    -- The order UPDATE already owns the parent-row lock. Child payment locks are
    -- therefore acquired in the same order->payment direction as every RPC.
    UPDATE payments
    SET metadata = COALESCE(metadata, '{}'::JSONB) || JSONB_BUILD_OBJECT(
      'providerInitiationState', 'reconciliation_required',
      'nextAction', CASE
        WHEN status = 'held_in_escrow'::payment_status OR transaction_ref IS NOT NULL
          THEN 'refund_required'
        ELSE 'contact_support'
      END,
      'reconciliationRequired', TRUE,
      'reconciliationReason', 'order_cancelled_with_provider_payment',
      'refundRequired', status = 'held_in_escrow'::payment_status OR transaction_ref IS NOT NULL,
      'providerOutcomeUnknown', status = 'pending'::payment_status AND transaction_ref IS NULL,
      'reconciliationRecordedAt', NOW()
    )
    WHERE order_id = NEW.id
      AND status IN ('pending'::payment_status, 'held_in_escrow'::payment_status)
      AND (
        status = 'held_in_escrow'::payment_status
        OR transaction_ref IS NOT NULL
        OR COALESCE(metadata ->> 'providerInitiationState', '') IN (
          'initiating', 'initiated', 'reconciliation_required'
        )
      );

    UPDATE commissions
    SET status = 'cancelled'
    WHERE order_id = NEW.id
      AND status IN ('pending', 'collected');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_cancelled_payment_reconciliation ON orders;
CREATE TRIGGER orders_cancelled_payment_reconciliation
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION mark_cancelled_order_payment_reconciliation();

REVOKE ALL ON FUNCTION get_or_create_payment_intent(UUID, UUID, UUID, NUMERIC, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_payment_intent(UUID, UUID, UUID, NUMERIC, TEXT, TEXT, JSONB)
  TO service_role;

REVOKE ALL ON FUNCTION claim_payment_provider_initiation(UUID, TEXT, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_payment_provider_initiation(UUID, TEXT, TIMESTAMPTZ)
  TO service_role;

REVOKE ALL ON FUNCTION save_payment_provider_checkout(UUID, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION save_payment_provider_checkout(UUID, TEXT, TEXT, TEXT, JSONB)
  TO service_role;

REVOKE ALL ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ)
  TO service_role;

REVOKE ALL ON FUNCTION mark_cancelled_order_payment_reconciliation() FROM PUBLIC;

COMMENT ON FUNCTION get_or_create_payment_intent(UUID, UUID, UUID, NUMERIC, TEXT, TEXT, JSONB)
  IS 'Locks a payable order and creates or returns its authoritative payment intent.';
COMMENT ON FUNCTION claim_payment_provider_initiation(UUID, TEXT, TIMESTAMPTZ)
  IS 'Locks order before payment and claims provider initiation only while the order remains payable.';
COMMENT ON FUNCTION save_payment_provider_checkout(UUID, TEXT, TEXT, TEXT, JSONB)
  IS 'Atomically persists a provider checkout only if its order is still payable after the external call.';
COMMENT ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ)
  IS 'Atomically releases held escrow after delivery to a still-eligible authoritative seller.';
COMMENT ON FUNCTION mark_cancelled_order_payment_reconciliation()
  IS 'Marks provider funds for reconciliation/refund and cancels commission in the order cancellation transaction.';

NOTIFY pgrst, 'reload schema';
