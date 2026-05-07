-- AgriculNet - Enhanced Verification Fields for Farmers

-- Add new status to user_status enum
-- Note: In a real environment, we'd check if it exists first, but for migration scripts we assume it's running once.
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'pending_identity_verification' AFTER 'pending_verification';

ALTER TABLE farmer_profiles
  ADD COLUMN IF NOT EXISTS id_front_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS id_back_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS selfie_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ;

-- Add banning support to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT;
