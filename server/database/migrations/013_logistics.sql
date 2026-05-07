-- AgriculNet — Logistics and Tracking

CREATE TABLE IF NOT EXISTS logistics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier_id      UUID REFERENCES users(id), -- Optional carrier ref
  
  lane            VARCHAR(200), -- e.g. "Kumba to Douala Port"
  status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_transit, delivered
  
  tracking_number VARCHAR(100),
  carrier_name    VARCHAR(100),
  
  current_location VARCHAR(200),
  estimated_arrival TIMESTAMPTZ,
  
  details         JSONB NOT NULL DEFAULT '[]', -- history of status updates
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logistics_order_id ON logistics(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_status   ON logistics(status);

DROP TRIGGER IF EXISTS logistics_updated_at ON logistics;
CREATE TRIGGER logistics_updated_at
  BEFORE UPDATE ON logistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
