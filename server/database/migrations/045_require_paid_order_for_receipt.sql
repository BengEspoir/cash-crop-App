-- Buyer receipt confirmation requires a provider-confirmed held or released payment.
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
  IF NOT EXISTS (
    SELECT 1 FROM payments
    WHERE order_id = v_order.id
      AND status IN ('held_in_escrow'::payment_status, 'released'::payment_status)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_PAYMENT_NOT_CONFIRMED';
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

REVOKE ALL ON FUNCTION confirm_marketplace_order_receipt(UUID, UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION confirm_marketplace_order_receipt(UUID, UUID, TIMESTAMPTZ) TO service_role;
NOTIFY pgrst, 'reload schema';
