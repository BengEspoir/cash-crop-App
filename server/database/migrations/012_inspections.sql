-- AgriculNet — Field Inspections

CREATE TABLE IF NOT EXISTS inspections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  inspector_id    UUID REFERENCES users(id), -- Field agent or Admin
  
  status          inspection_status NOT NULL DEFAULT 'pending',
  subject         VARCHAR(200) NOT NULL, -- e.g. "Cocoa Quality Check"
  
  report_url      VARCHAR(500),
  findings        TEXT,
  rating          INTEGER, -- 1-5 scale
  
  scheduled_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_order_id  ON inspections(order_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status    ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON inspections(inspector_id);

DROP TRIGGER IF EXISTS inspections_updated_at ON inspections;
CREATE TRIGGER inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
