-- AgriculNet - First-class reseller marketplace foundation
-- Run after 026_marketplace_verification_gating.sql.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'reseller';

CREATE TABLE IF NOT EXISTS reseller_profiles (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  business_name                   VARCHAR(200),
  about                           TEXT,
  primary_crop                    VARCHAR(120),
  crops_sold                      TEXT[],

  identity_verification_status    VARCHAR(30) NOT NULL DEFAULT 'not_started',
  id_front_storage_path           VARCHAR(500),
  id_back_storage_path            VARCHAR(500),
  selfie_storage_path             VARCHAR(500),
  id_front_url                    VARCHAR(500),
  id_back_url                     VARCHAR(500),
  selfie_url                      VARCHAR(500),
  verification_submitted_at       TIMESTAMPTZ,
  verified_by                     UUID REFERENCES users(id),
  verified_at                     TIMESTAMPTZ,
  rejection_reason                TEXT,

  payout_method                   VARCHAR(120),
  payout_account_name             VARCHAR(160),
  payout_phone                    VARCHAR(30),
  notification_opt_in             BOOLEAN DEFAULT TRUE,

  total_listings                  INTEGER NOT NULL DEFAULT 0,
  total_sales                     INTEGER NOT NULL DEFAULT 0,
  average_rating                  DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews                   INTEGER NOT NULL DEFAULT 0,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id),
  CONSTRAINT reseller_profiles_identity_verification_status_check
    CHECK (identity_verification_status IN ('not_started', 'pending_review', 'verified', 'rejected'))
);

DROP TRIGGER IF EXISTS reseller_profiles_updated_at ON reseller_profiles;
CREATE TRIGGER reseller_profiles_updated_at
  BEFORE UPDATE ON reseller_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reseller_profiles_user_id ON reseller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reseller_profiles_identity_status ON reseller_profiles(identity_verification_status);

ALTER TABLE listings
  ALTER COLUMN farmer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES reseller_profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_exactly_one_seller_check'
  ) THEN
    ALTER TABLE listings
      ADD CONSTRAINT listings_exactly_one_seller_check
      CHECK (
        (farmer_id IS NOT NULL AND reseller_id IS NULL)
        OR
        (farmer_id IS NULL AND reseller_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_reseller_id ON listings(reseller_id);

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES reseller_profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inquiries_exactly_one_seller_check'
  ) THEN
    ALTER TABLE inquiries
      ADD CONSTRAINT inquiries_exactly_one_seller_check
      CHECK (
        (farmer_id IS NOT NULL AND reseller_id IS NULL)
        OR
        (farmer_id IS NULL AND reseller_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inquiries_reseller_id ON inquiries(reseller_id);

ALTER TABLE orders
  ALTER COLUMN farmer_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES reseller_profiles(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_exactly_one_seller_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_exactly_one_seller_check
      CHECK (
        (farmer_id IS NOT NULL AND reseller_id IS NULL)
        OR
        (farmer_id IS NULL AND reseller_id IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_reseller_id ON orders(reseller_id);

COMMENT ON TABLE reseller_profiles IS 'Seller profile table for reseller accounts. Resellers share verification and commerce gates with farmers.';
COMMENT ON COLUMN reseller_profiles.identity_verification_status IS 'not_started, pending_review, verified, or rejected. Never set to verified without admin review.';
