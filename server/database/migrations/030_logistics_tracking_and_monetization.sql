-- AgriculNet - Logistics tracking, buyer-paid transport, and seller deduction support

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logistics_required BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS logistics_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_commission DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS trucks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name    VARCHAR(160) NOT NULL,
  plate_number    VARCHAR(80),
  owner_type      VARCHAR(30) NOT NULL DEFAULT 'partner',
  carrier_name    VARCHAR(160),
  driver_name     VARCHAR(160),
  driver_phone    VARCHAR(30),
  gps_device_id   VARCHAR(120),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trucks_updated_at ON trucks;
CREATE TRIGGER trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS logistics_rate_zones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_region       VARCHAR(100) NOT NULL,
  origin_city         VARCHAR(120),
  destination_region  VARCHAR(100) NOT NULL,
  destination_city    VARCHAR(120),
  fee_amount          DECIMAL(12,2) NOT NULL,
  currency            VARCHAR(10) NOT NULL DEFAULT 'XAF',
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS logistics_rate_zones_updated_at ON logistics_rate_zones;
CREATE TRIGGER logistics_rate_zones_updated_at
  BEFORE UPDATE ON logistics_rate_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS logistics_position_updates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logistics_id    UUID NOT NULL REFERENCES logistics(id) ON DELETE CASCADE,
  latitude        DECIMAL(10,6),
  longitude       DECIMAL(10,6),
  location_label  VARCHAR(200),
  speed_kph       DECIMAL(8,2),
  heading         DECIMAL(8,2),
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE logistics
  ADD COLUMN IF NOT EXISTS truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS origin_region VARCHAR(100),
  ADD COLUMN IF NOT EXISTS origin_city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS destination_region VARCHAR(100),
  ADD COLUMN IF NOT EXISTS destination_city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS logistics_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,6),
  ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(10,6),
  ADD COLUMN IF NOT EXISTS last_position_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_trucks_active ON trucks(is_active);
CREATE INDEX IF NOT EXISTS idx_logistics_rate_zones_origin_region ON logistics_rate_zones(origin_region);
CREATE INDEX IF NOT EXISTS idx_logistics_rate_zones_destination_region ON logistics_rate_zones(destination_region);
CREATE INDEX IF NOT EXISTS idx_logistics_positions_logistics_id ON logistics_position_updates(logistics_id);
CREATE INDEX IF NOT EXISTS idx_logistics_positions_captured_at ON logistics_position_updates(captured_at);
CREATE INDEX IF NOT EXISTS idx_orders_logistics_required ON orders(logistics_required);

INSERT INTO trucks (display_name, plate_number, owner_type, carrier_name, driver_name, driver_phone, metadata)
SELECT * FROM (
  VALUES
    ('AgriculNet Partner Truck 01', 'LT-AG-2401', 'partner', 'AgriculNet Partner Logistics', 'Samuel Etame', '+237670000101', '{"capacityKg": 12000}'::jsonb),
    ('AgriculNet Partner Truck 02', 'LT-AG-2402', 'partner', 'AgriculNet Partner Logistics', 'Brigitte Kotto', '+237670000102', '{"capacityKg": 9000}'::jsonb),
    ('AgriculNet Fleet Truck 01', 'LT-AG-2403', 'platform', 'AgriculNet Fleet', 'Jean Tabi', '+237670000103', '{"capacityKg": 15000}'::jsonb)
) AS seed(display_name, plate_number, owner_type, carrier_name, driver_name, driver_phone, metadata)
WHERE NOT EXISTS (
  SELECT 1 FROM trucks existing WHERE existing.plate_number = seed.plate_number
);

INSERT INTO logistics_rate_zones (origin_region, origin_city, destination_region, destination_city, fee_amount, currency, metadata)
SELECT * FROM (
  VALUES
    ('South West', NULL, 'Littoral', NULL, 18000, 'XAF', '{"type":"regional"}'::jsonb),
    ('South West', NULL, 'Centre', NULL, 22000, 'XAF', '{"type":"regional"}'::jsonb),
    ('West', NULL, 'Littoral', NULL, 16000, 'XAF', '{"type":"regional"}'::jsonb),
    ('West', NULL, 'Centre', NULL, 18000, 'XAF', '{"type":"regional"}'::jsonb),
    ('Littoral', NULL, 'Centre', NULL, 14000, 'XAF', '{"type":"regional"}'::jsonb),
    ('Centre', NULL, 'Littoral', NULL, 14000, 'XAF', '{"type":"regional"}'::jsonb),
    ('South West', 'Kumba', 'Littoral', 'Douala', 19000, 'XAF', '{"type":"city"}'::jsonb),
    ('South West', 'Limbe', 'Littoral', 'Douala', 17000, 'XAF', '{"type":"city"}'::jsonb),
    ('West', 'Bafoussam', 'Centre', 'Yaounde', 18500, 'XAF', '{"type":"city"}'::jsonb),
    ('Centre', 'Yaounde', 'Centre', 'Yaounde', 6000, 'XAF', '{"type":"city"}'::jsonb),
    ('Littoral', 'Douala', 'Littoral', 'Douala', 6000, 'XAF', '{"type":"city"}'::jsonb)
) AS seed(origin_region, origin_city, destination_region, destination_city, fee_amount, currency, metadata)
WHERE NOT EXISTS (
  SELECT 1
  FROM logistics_rate_zones existing
  WHERE existing.origin_region = seed.origin_region
    AND COALESCE(existing.origin_city, '') = COALESCE(seed.origin_city, '')
    AND existing.destination_region = seed.destination_region
    AND COALESCE(existing.destination_city, '') = COALESCE(seed.destination_city, '')
);
