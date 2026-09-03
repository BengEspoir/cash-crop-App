-- Buyer receipt is an explicit, auditable prerequisite for protected payout.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS buyer_receipt_status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (buyer_receipt_status IN ('pending', 'received', 'problem_reported')),
  ADD COLUMN IF NOT EXISTS buyer_received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS buyer_received_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS payout_hold_reason TEXT;

CREATE OR REPLACE FUNCTION confirm_marketplace_order_receipt(
  p_order_id UUID,
  p_buyer_user_id UUID,
  p_confirmed_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_buyer_profile_id UUID;
  v_now TIMESTAMPTZ := COALESCE(p_confirmed_at, NOW());
BEGIN
  SELECT id INTO v_buyer_profile_id
  FROM buyer_profiles
  WHERE user_id = p_buyer_user_id;

  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR v_buyer_profile_id IS NULL OR v_order.buyer_id IS DISTINCT FROM v_buyer_profile_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_NOT_FOUND_FOR_BUYER';
  END IF;
  IF v_order.status NOT IN ('delivered'::order_status, 'completed'::order_status) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_NOT_READY_FOR_RECEIPT';
  END IF;
  IF v_order.buyer_receipt_status = 'problem_reported' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_RECEIPT_BLOCKED_BY_PROBLEM';
  END IF;
  IF v_order.buyer_receipt_status = 'received' THEN
    RETURN JSONB_BUILD_OBJECT('order', TO_JSONB(v_order), 'confirmed', FALSE);
  END IF;

  UPDATE orders
  SET buyer_receipt_status = 'received',
      buyer_received_at = v_now,
      buyer_received_by = p_buyer_user_id,
      payout_hold_reason = NULL,
      timeline = COALESCE(timeline, '[]'::jsonb) || JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT(
        'event', 'Buyer confirmed receipt',
        'status', 'received',
        'date', v_now
      ))
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN JSONB_BUILD_OBJECT('order', TO_JSONB(v_order), 'confirmed', TRUE);
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
  IF NOT FOUND OR v_actor.status <> 'active'::user_status
    OR v_actor.role NOT IN ('admin'::user_role, 'super_admin'::user_role) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ACTOR_FORBIDDEN';
  END IF;

  SELECT order_id INTO v_order_id FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND'; END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND'; END IF;
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND'; END IF;
  IF v_payment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;
  IF v_payment.status = 'released'::payment_status THEN
    RETURN JSONB_BUILD_OBJECT('payment', TO_JSONB(v_payment), 'order', TO_JSONB(v_order), 'released', FALSE);
  END IF;
  IF v_payment.status = 'refunded'::payment_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_REFUNDED';
  END IF;
  IF v_payment.status <> 'held_in_escrow'::payment_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_INVALID_TRANSITION';
  END IF;
  IF v_order.status NOT IN ('delivered'::order_status, 'completed'::order_status) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_ORDER_NOT_READY';
  END IF;
  IF v_order.buyer_receipt_status <> 'received' OR v_order.buyer_received_at IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_BUYER_RECEIPT_REQUIRED';
  END IF;
  IF EXISTS (
    SELECT 1 FROM disputes
    WHERE order_id = v_order.id AND status IN ('open'::dispute_status, 'under_review'::dispute_status, 'escalated'::dispute_status)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_BLOCKED_BY_DISPUTE';
  END IF;

  SELECT user_id INTO v_payer_id FROM buyer_profiles WHERE id = v_order.buyer_id;
  IF v_order.reseller_id IS NOT NULL THEN
    SELECT p.user_id INTO v_payee_id
    FROM reseller_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.reseller_id AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status AND u.role = 'reseller'::user_role
    FOR UPDATE OF p, u;
  ELSE
    SELECT p.user_id INTO v_payee_id
    FROM farmer_profiles p JOIN users u ON u.id = p.user_id
    WHERE p.id = v_order.farmer_id AND p.identity_verification_status = 'verified'
      AND u.status = 'active'::user_status AND u.role = 'farmer'::user_role
    FOR UPDATE OF p, u;
  END IF;
  IF NOT FOUND THEN
    UPDATE orders SET payout_hold_reason = 'Seller verification or active status is required for payout' WHERE id = v_order.id;
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_SELLER_NOT_ELIGIBLE';
  END IF;
  IF v_payment.payer_id IS DISTINCT FROM v_payer_id OR v_payment.payee_id IS DISTINCT FROM v_payee_id
    OR v_payment.amount IS DISTINCT FROM v_order.total_amount
    OR UPPER(v_payment.currency) IS DISTINCT FROM UPPER(COALESCE(NULLIF(v_order.currency, ''), 'XAF')) THEN
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
  WHERE id = v_payment.id AND status = 'held_in_escrow'
  RETURNING * INTO v_payment;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED'; END IF;

  UPDATE orders SET payout_hold_reason = NULL WHERE id = v_order.id;
  RETURN JSONB_BUILD_OBJECT('payment', TO_JSONB(v_payment), 'order', TO_JSONB(v_order), 'released', TRUE);
END;
$$;

REVOKE ALL ON FUNCTION confirm_marketplace_order_receipt(UUID, UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION confirm_marketplace_order_receipt(UUID, UUID, TIMESTAMPTZ) TO service_role;
REVOKE ALL ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ) TO service_role;

COMMENT ON FUNCTION confirm_marketplace_order_receipt(UUID, UUID, TIMESTAMPTZ)
  IS 'Idempotently records receipt by the owning buyer after delivery.';
COMMENT ON FUNCTION release_marketplace_escrow(UUID, UUID, TIMESTAMPTZ)
  IS 'Releases protected funds only after delivery, buyer receipt, verified active seller, and no blocking dispute.';
