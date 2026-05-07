-- AgriculNet — Buyer Inquiries

CREATE TABLE IF NOT EXISTS inquiries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  
  message         TEXT NOT NULL,
  requested_qty   DECIMAL(12,2),
  status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, converted_to_order
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id   ON inquiries(buyer_id);

DROP TRIGGER IF EXISTS inquiries_updated_at ON inquiries;
CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
