-- AgriculNet — Disputes

CREATE TABLE IF NOT EXISTS disputes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  opened_by       UUID NOT NULL REFERENCES users(id),
  
  status          dispute_status NOT NULL DEFAULT 'open',
  subject         VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  
  resolution      TEXT,
  resolved_at     TIMESTAMPTZ,
  resolved_by     UUID REFERENCES users(id), -- Admin who resolved it
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status   ON disputes(status);

DROP TRIGGER IF EXISTS disputes_updated_at ON disputes;
CREATE TRIGGER disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
