-- AgriculNet — Marketplace Listings
-- Crops and Regions tables for categorization

CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crops (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  category    VARCHAR(100),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id           UUID NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  
  crop_id             UUID REFERENCES crops(id) ON DELETE SET NULL,
  crop_name_fallback  VARCHAR(100), -- Used if crop_id is null
  
  quantity            DECIMAL(12,2) NOT NULL,
  quantity_unit       VARCHAR(20) NOT NULL DEFAULT 'kg',
  
  price_per_unit      DECIMAL(12,2) NOT NULL,
  currency            VARCHAR(10) NOT NULL DEFAULT 'XAF',
  
  status              listing_status NOT NULL DEFAULT 'draft',
  
  grade               VARCHAR(100),
  delivery_window     VARCHAR(100),
  summary             VARCHAR(300),
  description         TEXT,
  
  region_id           UUID REFERENCES regions(id) ON DELETE SET NULL,
  location_name       VARCHAR(200), -- e.g. "Kumba, South West"
  
  specs               JSONB NOT NULL DEFAULT '{}', -- e.g. {"moisture": "7.1%", "bag_type": "Jute"}
  
  is_export_ready     BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  
  view_count          INTEGER NOT NULL DEFAULT 0,
  inquiry_count       INTEGER NOT NULL DEFAULT 0,
  
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_crop_id   ON listings(crop_id);
CREATE INDEX IF NOT EXISTS idx_listings_status    ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_region_id ON listings(region_id);

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
