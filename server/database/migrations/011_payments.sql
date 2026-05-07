-- AgriculNet — Payments and Escrow

CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_id        UUID NOT NULL REFERENCES users(id),
  payee_id        UUID NOT NULL REFERENCES users(id),
  
  amount          DECIMAL(12,2) NOT NULL,
  currency        VARCHAR(10) NOT NULL DEFAULT 'XAF',
  
  status          payment_status NOT NULL DEFAULT 'pending',
  channel         payment_channel,
  
  transaction_ref VARCHAR(100), -- external provider ref
  metadata        JSONB NOT NULL DEFAULT '{}',
  
  paid_at         TIMESTAMPTZ,
  escrow_held_at  TIMESTAMPTZ,
  released_at     TIMESTAMPTZ,
  refunded_at     TIMESTAMPTZ,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);

DROP TRIGGER IF EXISTS payments_updated_at ON payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
