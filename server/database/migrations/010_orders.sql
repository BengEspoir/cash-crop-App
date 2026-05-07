-- AgriculNet — Orders

CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number        VARCHAR(20) UNIQUE NOT NULL, -- e.g. ORD-24001
  
  listing_id          UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id            UUID NOT NULL REFERENCES buyer_profiles(id) ON DELETE CASCADE,
  farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  
  quantity            DECIMAL(12,2) NOT NULL,
  quantity_unit       VARCHAR(20) NOT NULL DEFAULT 'kg',
  
  unit_price          DECIMAL(12,2) NOT NULL,
  total_amount        DECIMAL(12,2) NOT NULL,
  currency            VARCHAR(10) NOT NULL DEFAULT 'XAF',
  
  status              order_status NOT NULL DEFAULT 'pending_payment',
  
  shipping_address    TEXT,
  billing_address     TEXT,
  notes               TEXT,
  
  timeline            JSONB NOT NULL DEFAULT '[]', -- Array of events: {event, status, date}
  
  eta                 TIMESTAMPTZ,
  confirmed_at        TIMESTAMPTZ,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id   ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id  ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number     ON orders(order_number);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
