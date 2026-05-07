-- AgriculNet — Marketplace Commissions

CREATE TABLE IF NOT EXISTS commissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  amount          DECIMAL(12,2) NOT NULL,
  percentage      DECIMAL(5,2) NOT NULL,
  
  status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, collected, cancelled
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_order_id ON commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status   ON commissions(status);

DROP TRIGGER IF EXISTS commissions_updated_at ON commissions;
CREATE TRIGGER commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
