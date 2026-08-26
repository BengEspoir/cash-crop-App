-- Atomically reconcile a verified Fapshi collection with marketplace records.
-- The API service must verify the provider response before invoking this function.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM payments
    WHERE transaction_ref IS NOT NULL
    GROUP BY transaction_ref
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM commissions
    GROUP BY order_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM logistics
    GROUP BY order_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED';
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_transaction_ref_unique
  ON payments(transaction_ref)
  WHERE transaction_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_commissions_order_id_unique
  ON commissions(order_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_logistics_order_id_unique
  ON logistics(order_id);

CREATE OR REPLACE FUNCTION reconcile_fapshi_payment(
  p_payment_id UUID,
  p_transaction_ref TEXT,
  p_provider_status TEXT,
  p_provider_amount NUMERIC,
  p_provider_currency TEXT,
  p_confirmed_at TIMESTAMPTZ,
  p_provider_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment payments%ROWTYPE;
  v_order orders%ROWTYPE;
  v_order_id UUID;
  v_status TEXT := UPPER(COALESCE(p_provider_status, ''));
  v_settled BOOLEAN := FALSE;
  v_reconciliation_required BOOLEAN := FALSE;
  v_shipment_id UUID;
  v_now TIMESTAMPTZ := NOW();
  v_origin TEXT;
  v_destination TEXT;
BEGIN
  -- Discover the parent without a row lock, then lock parent before child. This
  -- matches payment intent, escrow release, and logistics lock ordering.
  SELECT order_id
  INTO v_order_id
  FROM payments
  WHERE id = p_payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_order
  FROM orders
  WHERE id = v_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_ORDER_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_payment
  FROM payments
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PAYMENT_INTENT_NOT_FOUND';
  END IF;

  IF v_payment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_STATE_CHANGED';
  END IF;

  IF v_status NOT IN ('SUCCESSFUL', 'FAILED', 'EXPIRED')
    OR v_payment.transaction_ref IS NULL
    OR v_payment.transaction_ref <> p_transaction_ref
    OR p_provider_amount IS NULL
    OR ROUND(v_payment.amount) <> p_provider_amount
    OR (
      NULLIF(p_provider_currency, '') IS NOT NULL
      AND UPPER(v_payment.currency) <> UPPER(p_provider_currency)
    )
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'PAYMENT_VERIFICATION_FAILED';
  END IF;

  -- Released and refunded records are immutable, even if the RPC is called directly.
  IF v_payment.status IN ('released', 'refunded') THEN
    RETURN JSONB_BUILD_OBJECT(
      'payment', TO_JSONB(v_payment),
      'order', TO_JSONB(v_order),
      'settled', FALSE,
      'shipmentId', NULL,
      'reconciliationRequired', COALESCE(v_payment.metadata, '{}'::JSONB)
        @> '{"reconciliationRequired":true}'::JSONB,
      'refundRequired', v_payment.status <> 'refunded'::payment_status
        AND COALESCE(v_payment.metadata, '{}'::JSONB) @> '{"refundRequired":true}'::JSONB
    );
  END IF;

  -- A provider success that arrives after cancellation represents real received
  -- funds, but must never reopen the order or create commission/logistics records.
  IF v_status = 'SUCCESSFUL' AND v_order.status = 'cancelled'::order_status THEN
    UPDATE payments
    SET status = 'held_in_escrow',
        channel = COALESCE(channel, 'mtn_momo'::payment_channel),
        paid_at = COALESCE(paid_at, p_confirmed_at, v_now),
        escrow_held_at = COALESCE(escrow_held_at, v_now),
        metadata = COALESCE(metadata, '{}'::JSONB)
          || COALESCE(p_provider_metadata, '{}'::JSONB)
          || JSONB_BUILD_OBJECT(
            'providerInitiationState', 'reconciliation_required',
            'nextAction', 'refund_required',
            'reconciliationRequired', TRUE,
            'reconciliationReason', 'order_cancelled_before_payment_confirmation',
            'providerFundsReceived', TRUE,
            'refundRequired', TRUE,
            'reconciliationRecordedAt', v_now
          )
    WHERE id = v_payment.id
    RETURNING * INTO v_payment;

    v_reconciliation_required := TRUE;

    RETURN JSONB_BUILD_OBJECT(
      'payment', TO_JSONB(v_payment),
      'order', TO_JSONB(v_order),
      'settled', FALSE,
      'shipmentId', NULL,
      'reconciliationRequired', TRUE,
      'refundRequired', TRUE
    );
  END IF;

  IF v_status = 'SUCCESSFUL' THEN
    -- Never reopen released/refunded escrow or rewrite an already-held payment.
    IF v_payment.status NOT IN ('held_in_escrow', 'released', 'refunded') THEN
      UPDATE payments
      SET status = 'held_in_escrow',
          channel = COALESCE(channel, 'mtn_momo'::payment_channel),
          paid_at = COALESCE(paid_at, p_confirmed_at, v_now),
          escrow_held_at = COALESCE(escrow_held_at, v_now),
          metadata = COALESCE(metadata, '{}'::JSONB) || COALESCE(p_provider_metadata, '{}'::JSONB)
      WHERE id = v_payment.id;
      v_settled := TRUE;
    END IF;

    -- Payment confirmation may advance a new order, but never regress later states.
    IF v_order.status = 'pending_payment' THEN
      UPDATE orders
      SET status = 'confirmed',
          confirmed_at = COALESCE(confirmed_at, p_confirmed_at, v_now),
          timeline = COALESCE(timeline, '[]'::JSONB) || JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
              'event', 'Payment provider confirmed payment',
              'status', 'confirmed',
              'date', v_now
            )
          )
      WHERE id = v_order.id;
    END IF;

    SELECT * INTO v_payment FROM payments WHERE id = v_payment.id;
    SELECT * INTO v_order FROM orders WHERE id = v_order.id;

    IF v_payment.status <> 'refunded' AND COALESCE(v_order.platform_commission, 0) > 0 THEN
      UPDATE commissions
      SET amount = v_order.platform_commission,
          percentage = CASE
            WHEN COALESCE(v_order.base_amount, 0) > 0
              THEN ROUND((v_order.platform_commission / v_order.base_amount) * 100, 2)
            ELSE 0
          END,
          status = 'collected'
      WHERE order_id = v_order.id;

      IF NOT FOUND THEN
        INSERT INTO commissions (order_id, amount, percentage, status)
        VALUES (
          v_order.id,
          v_order.platform_commission,
          CASE
            WHEN COALESCE(v_order.base_amount, 0) > 0
              THEN ROUND((v_order.platform_commission / v_order.base_amount) * 100, 2)
            ELSE 0
          END,
          'collected'
        )
        ON CONFLICT (order_id) DO UPDATE
        SET amount = EXCLUDED.amount,
            percentage = EXCLUDED.percentage,
            status = EXCLUDED.status;
      END IF;
    END IF;

    IF v_payment.status <> 'refunded'
      AND v_order.logistics_required
      AND v_order.status NOT IN ('cancelled', 'completed')
    THEN
      SELECT id
      INTO v_shipment_id
      FROM logistics
      WHERE order_id = v_order.id
      ORDER BY created_at
      LIMIT 1;

      IF v_shipment_id IS NULL THEN
        v_origin := COALESCE(
          NULLIF(v_order.metadata ->> 'originCity', ''),
          NULLIF(v_order.metadata ->> 'originRegion', '')
        );
        v_destination := COALESCE(
          NULLIF(v_order.metadata ->> 'destinationCity', ''),
          NULLIF(v_order.metadata ->> 'destinationRegion', '')
        );

        INSERT INTO logistics (
          order_id,
          lane,
          status,
          tracking_number,
          carrier_name,
          current_location,
          origin_region,
          origin_city,
          destination_region,
          destination_city,
          logistics_fee,
          details,
          metadata
        )
        VALUES (
          v_order.id,
          COALESCE(NULLIF(CONCAT_WS(' to ', v_origin, v_destination), ''), 'Route pending'),
          'pending_dispatch',
      'AGR-' || UPPER(SUBSTRING(REPLACE(pg_catalog.gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12)),
          'AgriculNet Logistics',
          COALESCE(v_origin, 'Origin pending'),
          NULLIF(v_order.metadata ->> 'originRegion', ''),
          NULLIF(v_order.metadata ->> 'originCity', ''),
          NULLIF(v_order.metadata ->> 'destinationRegion', ''),
          NULLIF(v_order.metadata ->> 'destinationCity', ''),
          COALESCE(v_order.logistics_fee, 0),
          JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
              'event', 'Shipment record created after verified payment',
              'status', 'pending_dispatch',
              'date', v_now
            )
          ),
          JSONB_BUILD_OBJECT('createdBy', 'payment_settlement')
        )
        ON CONFLICT (order_id) DO NOTHING
        RETURNING id INTO v_shipment_id;

        IF v_shipment_id IS NULL THEN
          SELECT id
          INTO v_shipment_id
          FROM logistics
          WHERE order_id = v_order.id;
        END IF;
      END IF;
    END IF;
  ELSE
    -- A late failure must never unwind held, released, or refunded funds.
    IF v_payment.status = 'pending' THEN
      UPDATE payments
      SET status = 'failed',
          metadata = COALESCE(metadata, '{}'::JSONB) || COALESCE(p_provider_metadata, '{}'::JSONB)
      WHERE id = v_payment.id;
    END IF;
  END IF;

  SELECT * INTO v_payment FROM payments WHERE id = v_payment.id;
  SELECT * INTO v_order FROM orders WHERE id = v_order.id;

  RETURN JSONB_BUILD_OBJECT(
    'payment', TO_JSONB(v_payment),
    'order', TO_JSONB(v_order),
    'settled', v_settled,
    'shipmentId', v_shipment_id,
    'reconciliationRequired', v_reconciliation_required,
    'refundRequired', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION reconcile_fapshi_payment(UUID, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION reconcile_fapshi_payment(UUID, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, JSONB)
  TO service_role;

COMMENT ON FUNCTION reconcile_fapshi_payment(UUID, TEXT, TEXT, NUMERIC, TEXT, TIMESTAMPTZ, JSONB)
  IS 'Atomically reconciles a server-verified Fapshi payment without regressing settled records.';
