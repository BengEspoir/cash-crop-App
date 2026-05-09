-- AgriculNet - Marketplace verification normalization and quote extensions

ALTER TABLE farmer_profiles
  ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS id_front_storage_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS id_back_storage_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS selfie_storage_path VARCHAR(500);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'farmer_profiles_identity_verification_status_check'
  ) THEN
    ALTER TABLE farmer_profiles
      ADD CONSTRAINT farmer_profiles_identity_verification_status_check
      CHECK (identity_verification_status IN ('not_started', 'pending_review', 'verified', 'rejected'));
  END IF;
END $$;

UPDATE farmer_profiles
SET identity_verification_status = CASE
  WHEN verified_at IS NOT NULL THEN 'verified'
  WHEN rejection_reason IS NOT NULL THEN 'rejected'
  WHEN verification_submitted_at IS NOT NULL THEN 'pending_review'
  ELSE identity_verification_status
END;

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_identity_status
  ON farmer_profiles(identity_verification_status);

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES farmer_profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS requested_price DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'XAF';

UPDATE inquiries i
SET farmer_id = l.farmer_id
FROM listings l
WHERE i.listing_id = l.id
  AND i.farmer_id IS NULL;

UPDATE inquiries
SET status = 'completed'
WHERE status = 'converted_to_order';

CREATE INDEX IF NOT EXISTS idx_inquiries_farmer_id ON inquiries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
