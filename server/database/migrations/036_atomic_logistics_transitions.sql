-- Make shipment assignment, GPS history, shipment state, and order state one transaction.
-- Apply after 035_order_inventory_and_quote_guards.sql and before 037_core_rls_lockdown.sql.

UPDATE logistics
SET status = CASE LOWER(REPLACE(BTRIM(status), ' ', '_'))
  WHEN 'pending' THEN 'pending_dispatch'
  WHEN 'pending_dispatch' THEN 'pending_dispatch'
  WHEN 'assigned' THEN 'assigned'
  WHEN 'in_transit' THEN 'in_transit'
  WHEN 'near_destination' THEN 'near_destination'
  WHEN 'delivered' THEN 'delivered'
  WHEN 'exception' THEN 'exception'
  ELSE status
END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM logistics
    WHERE status NOT IN (
      'pending_dispatch', 'assigned', 'in_transit',
      'near_destination', 'delivered', 'exception'
    )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_036_LOGISTICS_STATUS_RECONCILIATION_REQUIRED';
  END IF;
END;
$$;

UPDATE logistics
SET details = '[]'::JSONB
WHERE details IS NULL OR JSONB_TYPEOF(details) <> 'array';

UPDATE logistics
SET dispatched_at = COALESCE(dispatched_at, updated_at, created_at, NOW())
WHERE status IN ('in_transit', 'near_destination', 'delivered')
  AND dispatched_at IS NULL;

UPDATE logistics
SET delivered_at = CASE
  WHEN status = 'delivered' THEN COALESCE(delivered_at, updated_at, created_at, NOW())
  ELSE NULL
END;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'logistics_known_status_check'
      AND conrelid = 'public.logistics'::regclass
  ) THEN
    ALTER TABLE logistics
      ADD CONSTRAINT logistics_known_status_check
      CHECK (status IN (
        'pending_dispatch', 'assigned', 'in_transit',
        'near_destination', 'delivered', 'exception'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'logistics_delivery_timestamp_check'
      AND conrelid = 'public.logistics'::regclass
  ) THEN
    ALTER TABLE logistics
      ADD CONSTRAINT logistics_delivery_timestamp_check
      CHECK (
        (status = 'delivered' AND delivered_at IS NOT NULL)
        OR (status <> 'delivered' AND delivered_at IS NULL)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'logistics_position_coordinate_check'
      AND conrelid = 'public.logistics_position_updates'::regclass
  ) THEN
    ALTER TABLE logistics_position_updates
      ADD CONSTRAINT logistics_position_coordinate_check
      CHECK (
        latitude BETWEEN -90 AND 90
        AND longitude BETWEEN -180 AND 180
        AND (speed_kph IS NULL OR speed_kph >= 0)
        AND (heading IS NULL OR heading BETWEEN 0 AND 360)
      ) NOT VALID;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS transition_logistics_shipment(
  UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, JSONB, JSONB, TIMESTAMPTZ
);

CREATE FUNCTION transition_logistics_shipment(
  p_shipment_id UUID,
  p_expected_status TEXT,
  p_next_status TEXT,
  p_operation TEXT,
  p_actor_user_id UUID,
  p_event TEXT,
  p_location_label TEXT,
  p_estimated_arrival TIMESTAMPTZ,
  p_assignment JSONB,
  p_position JSONB,
  p_occurred_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_actor users%ROWTYPE;
  v_shipment logistics%ROWTYPE;
  v_order orders%ROWTYPE;
  v_order_id UUID;
  v_truck trucks%ROWTYPE;
  v_position logistics_position_updates%ROWTYPE;
  v_history JSONB;
  v_assignment JSONB := COALESCE(p_assignment, '{}'::JSONB);
  v_position_data JSONB := COALESCE(p_position, '{}'::JSONB);
  v_position_metadata JSONB := '{}'::JSONB;
  v_truck_id UUID;
  v_latitude NUMERIC;
  v_longitude NUMERIC;
  v_speed_kph NUMERIC;
  v_heading NUMERIC;
  v_occurred_at TIMESTAMPTZ := COALESCE(p_occurred_at, NOW());
  v_event TEXT := COALESCE(NULLIF(BTRIM(p_event), ''), 'Shipment updated');
  v_location TEXT;
  v_order_event TEXT;
BEGIN
  SELECT *
  INTO v_actor
  FROM users
  WHERE id = p_actor_user_id
  FOR UPDATE;

  IF NOT FOUND
    OR v_actor.status <> 'active'::user_status
    OR v_actor.role NOT IN ('admin'::user_role, 'super_admin'::user_role)
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ACTOR_FORBIDDEN';
  END IF;

  -- Discover the parent without a row lock, then follow the global commerce lock
  -- order used by payment settlement: order first, child shipment second.
  SELECT order_id
  INTO v_order_id
  FROM logistics
  WHERE id = p_shipment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'LOGISTICS_SHIPMENT_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_order
  FROM orders
  WHERE id = v_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'LOGISTICS_ORDER_NOT_FOUND';
  END IF;

  SELECT *
  INTO v_shipment
  FROM logistics
  WHERE id = p_shipment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'LOGISTICS_SHIPMENT_NOT_FOUND';
  END IF;

  IF v_shipment.order_id IS DISTINCT FROM v_order.id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_STATUS_CHANGED';
  END IF;

  IF v_shipment.status IS DISTINCT FROM p_expected_status THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_STATUS_CHANGED';
  END IF;

  IF p_next_status IS NULL OR p_next_status NOT IN (
    'pending_dispatch', 'assigned', 'in_transit',
    'near_destination', 'delivered', 'exception'
  ) OR v_shipment.status = 'delivered' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_INVALID_TRANSITION';
  END IF;

  IF v_order.status IN ('cancelled'::order_status, 'completed'::order_status)
    OR (v_order.status = 'delivered'::order_status AND p_next_status <> 'delivered')
  THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ORDER_STATE_INVALID';
  END IF;

  IF p_operation = 'assign' THEN
    IF JSONB_TYPEOF(v_assignment) <> 'object'
      OR NOT (
        (v_shipment.status = 'pending_dispatch' AND p_next_status IN ('assigned', 'in_transit'))
        OR (v_shipment.status = 'assigned' AND p_next_status IN ('assigned', 'in_transit'))
        OR (v_shipment.status = 'exception' AND p_next_status IN ('assigned', 'in_transit'))
      )
    THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_INVALID_TRANSITION';
    END IF;
  ELSIF p_operation = 'position' THEN
    IF JSONB_TYPEOF(v_position_data) <> 'object'
      OR NOT (
        (v_shipment.status = 'assigned' AND p_next_status = 'in_transit')
        OR (v_shipment.status = 'in_transit' AND p_next_status IN ('in_transit', 'near_destination', 'delivered'))
        OR (v_shipment.status = 'near_destination' AND p_next_status IN ('near_destination', 'delivered'))
        OR (v_shipment.status = 'exception' AND p_next_status IN ('exception', 'in_transit'))
      )
    THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_INVALID_TRANSITION';
    END IF;
  ELSIF p_operation = 'status' THEN
    IF NOT (
      (v_shipment.status = 'pending_dispatch' AND p_next_status IN ('assigned', 'exception'))
      OR (v_shipment.status = 'assigned' AND p_next_status IN ('in_transit', 'exception'))
      OR (v_shipment.status = 'in_transit' AND p_next_status IN ('near_destination', 'delivered', 'exception'))
      OR (v_shipment.status = 'near_destination' AND p_next_status IN ('delivered', 'exception'))
      OR (v_shipment.status = 'exception' AND p_next_status IN ('assigned', 'in_transit'))
    ) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_INVALID_TRANSITION';
    END IF;
  ELSE
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_INVALID_TRANSITION';
  END IF;

  -- Keep order progression in the same transaction as its shipment progression.
  IF p_next_status = 'assigned' THEN
    IF v_order.status IN ('confirmed'::order_status, 'verified'::order_status) THEN
      v_order_event := 'Shipment assigned; order entered processing';
      UPDATE orders
      SET status = 'processing',
          timeline = COALESCE(timeline, '[]'::JSONB) || JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT('event', v_order_event, 'status', 'processing', 'date', v_occurred_at)
          )
      WHERE id = v_order.id
      RETURNING * INTO v_order;
    ELSIF v_order.status <> 'processing'::order_status THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ORDER_STATE_INVALID';
    END IF;
  ELSIF p_next_status IN ('in_transit', 'near_destination') THEN
    IF v_order.status IN ('confirmed'::order_status, 'verified'::order_status) THEN
      UPDATE orders
      SET status = 'processing',
          timeline = COALESCE(timeline, '[]'::JSONB) || JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
              'event', 'Shipment assigned; order entered processing',
              'status', 'processing',
              'date', v_occurred_at
            )
          )
      WHERE id = v_order.id
      RETURNING * INTO v_order;
    END IF;

    IF v_order.status = 'processing'::order_status THEN
      UPDATE orders
      SET status = 'in_transit',
          timeline = COALESCE(timeline, '[]'::JSONB) || JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
              'event', 'Logistics confirmed shipment in transit',
              'status', 'in_transit',
              'date', v_occurred_at
            )
          )
      WHERE id = v_order.id
      RETURNING * INTO v_order;
    ELSIF v_order.status <> 'in_transit'::order_status THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ORDER_STATE_INVALID';
    END IF;
  ELSIF p_next_status = 'delivered' THEN
    IF v_order.status = 'in_transit'::order_status THEN
      UPDATE orders
      SET status = 'delivered',
          timeline = COALESCE(timeline, '[]'::JSONB) || JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
              'event', 'Logistics confirmed delivery',
              'status', 'delivered',
              'date', v_occurred_at
            )
          )
      WHERE id = v_order.id
      RETURNING * INTO v_order;
    ELSIF v_order.status <> 'delivered'::order_status THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ORDER_STATE_INVALID';
    END IF;
  END IF;

  v_history := CASE
    WHEN JSONB_TYPEOF(v_shipment.details) = 'array' THEN v_shipment.details
    ELSE '[]'::JSONB
  END;
  v_location := COALESCE(NULLIF(BTRIM(p_location_label), ''), v_shipment.current_location);

  IF p_operation = 'assign' AND p_next_status = 'in_transit' THEN
    v_history := v_history || JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT(
        'event', 'Shipment assigned to operations',
        'status', 'assigned',
        'location', v_location,
        'date', v_occurred_at
      ),
      JSONB_BUILD_OBJECT(
        'event', v_event,
        'status', 'in_transit',
        'location', v_location,
        'date', v_occurred_at
      )
    );
  ELSE
    v_history := v_history || JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT(
        'event', v_event,
        'status', p_next_status,
        'location', v_location,
        'date', v_occurred_at
      )
    );
  END IF;

  IF p_operation = 'assign' AND v_assignment ? 'truckId' THEN
    BEGIN
      v_truck_id := NULLIF(v_assignment ->> 'truckId', '')::UUID;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_ASSIGNMENT_INVALID';
    END;

    IF v_truck_id IS NOT NULL THEN
      SELECT *
      INTO v_truck
      FROM trucks
      WHERE id = v_truck_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'LOGISTICS_TRUCK_NOT_FOUND';
      END IF;
      IF NOT v_truck.is_active THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_TRUCK_INACTIVE';
      END IF;
    END IF;
  ELSE
    v_truck_id := v_shipment.truck_id;
  END IF;

  IF p_operation = 'position' THEN
    BEGIN
      v_latitude := NULLIF(v_position_data ->> 'latitude', '')::NUMERIC;
      v_longitude := NULLIF(v_position_data ->> 'longitude', '')::NUMERIC;
      v_speed_kph := NULLIF(v_position_data ->> 'speedKph', '')::NUMERIC;
      v_heading := NULLIF(v_position_data ->> 'heading', '')::NUMERIC;
    EXCEPTION WHEN invalid_text_representation OR numeric_value_out_of_range THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_POSITION_INVALID';
    END;

    IF v_latitude IS NULL OR v_latitude NOT BETWEEN -90 AND 90
      OR v_longitude IS NULL OR v_longitude NOT BETWEEN -180 AND 180
      OR (v_speed_kph IS NOT NULL AND v_speed_kph < 0)
      OR (v_heading IS NOT NULL AND v_heading NOT BETWEEN 0 AND 360)
    THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_POSITION_INVALID';
    END IF;

    IF JSONB_TYPEOF(v_position_data -> 'metadata') = 'object' THEN
      v_position_metadata := v_position_data -> 'metadata';
    END IF;

    INSERT INTO logistics_position_updates (
      logistics_id,
      latitude,
      longitude,
      location_label,
      speed_kph,
      heading,
      captured_at,
      metadata
    )
    VALUES (
      v_shipment.id,
      v_latitude,
      v_longitude,
      v_location,
      v_speed_kph,
      v_heading,
      v_occurred_at,
      v_position_metadata
    )
    RETURNING * INTO v_position;
  END IF;

  UPDATE logistics
  SET status = p_next_status,
      truck_id = CASE WHEN p_operation = 'assign' THEN v_truck_id ELSE truck_id END,
      assigned_by = CASE WHEN p_operation = 'assign' THEN v_actor.id ELSE assigned_by END,
      carrier_name = CASE WHEN p_operation = 'assign' THEN COALESCE(
        NULLIF(BTRIM(v_assignment ->> 'carrierName'), ''),
        v_truck.carrier_name,
        carrier_name,
        'AgriculNet Logistics'
      ) ELSE carrier_name END,
      tracking_number = CASE WHEN p_operation = 'assign' THEN COALESCE(
        NULLIF(BTRIM(v_assignment ->> 'trackingNumber'), ''),
        tracking_number,
        'AGN-TRK-' || UPPER(SUBSTRING(REPLACE(pg_catalog.gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 12))
      ) ELSE tracking_number END,
      estimated_arrival = COALESCE(p_estimated_arrival, estimated_arrival),
      current_location = v_location,
      current_latitude = CASE WHEN p_operation = 'position' THEN v_latitude ELSE current_latitude END,
      current_longitude = CASE WHEN p_operation = 'position' THEN v_longitude ELSE current_longitude END,
      last_position_at = CASE WHEN p_operation = 'position' THEN v_occurred_at ELSE last_position_at END,
      dispatched_at = CASE
        WHEN p_next_status IN ('in_transit', 'near_destination', 'delivered')
          THEN COALESCE(dispatched_at, v_occurred_at)
        ELSE dispatched_at
      END,
      delivered_at = CASE
        WHEN p_next_status = 'delivered' THEN COALESCE(delivered_at, v_occurred_at)
        ELSE delivered_at
      END,
      details = v_history,
      metadata = CASE WHEN p_operation = 'assign' THEN
        COALESCE(metadata, '{}'::JSONB) || JSONB_STRIP_NULLS(JSONB_BUILD_OBJECT(
          'driverName', COALESCE(
            NULLIF(BTRIM(v_assignment ->> 'driverName'), ''),
            v_truck.driver_name,
            metadata ->> 'driverName'
          ),
          'driverPhone', COALESCE(
            NULLIF(BTRIM(v_assignment ->> 'driverPhone'), ''),
            v_truck.driver_phone,
            metadata ->> 'driverPhone'
          )
        ))
      ELSE metadata END
  WHERE id = v_shipment.id
    AND status = p_expected_status
  RETURNING * INTO v_shipment;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'LOGISTICS_STATUS_CHANGED';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_order.id;

  RETURN JSONB_BUILD_OBJECT(
    'shipment', TO_JSONB(v_shipment),
    'order', TO_JSONB(v_order),
    'position', CASE WHEN v_position.id IS NULL THEN NULL ELSE TO_JSONB(v_position) END
  );
END;
$$;

REVOKE ALL ON FUNCTION transition_logistics_shipment(
  UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, JSONB, JSONB, TIMESTAMPTZ
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION transition_logistics_shipment(
  UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, JSONB, JSONB, TIMESTAMPTZ
) TO service_role;

COMMENT ON FUNCTION transition_logistics_shipment(
  UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TIMESTAMPTZ, JSONB, JSONB, TIMESTAMPTZ
) IS 'Applies guarded shipment assignment/status/GPS changes and the related order transition atomically.';

NOTIFY pgrst, 'reload schema';
