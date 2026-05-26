-- AgriculNet - editable profile contacts and public dashboard assets
-- Run after 028_dashboard_operations_foundation.sql.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(700);

CREATE TABLE IF NOT EXISTS account_recovery_contacts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(20) NOT NULL,
  value             CITEXT NOT NULL,
  normalized_value  CITEXT NOT NULL,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at       TIMESTAMPTZ,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT account_recovery_contacts_type_check
    CHECK (type IN ('email', 'phone')),
  UNIQUE(normalized_value)
);

CREATE TABLE IF NOT EXISTS account_contact_changes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(20) NOT NULL,
  old_value         CITEXT,
  new_value         CITEXT NOT NULL,
  normalized_value  CITEXT NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT account_contact_changes_type_check
    CHECK (type IN ('email', 'phone')),
  CONSTRAINT account_contact_changes_status_check
    CHECK (status IN ('pending', 'verified', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_account_recovery_contacts_user_id
  ON account_recovery_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_recovery_contacts_lookup
  ON account_recovery_contacts(normalized_value);
CREATE INDEX IF NOT EXISTS idx_account_contact_changes_user_id
  ON account_contact_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_account_contact_changes_pending
  ON account_contact_changes(user_id, type, status);

DROP TRIGGER IF EXISTS account_recovery_contacts_updated_at ON account_recovery_contacts;
CREATE TRIGGER account_recovery_contacts_updated_at
  BEFORE UPDATE ON account_recovery_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS account_contact_changes_updated_at ON account_contact_changes;
CREATE TRIGGER account_contact_changes_updated_at
  BEFORE UPDATE ON account_contact_changes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE account_recovery_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_contact_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS account_recovery_contacts_service_role ON account_recovery_contacts;
CREATE POLICY account_recovery_contacts_service_role ON account_recovery_contacts
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS account_contact_changes_service_role ON account_contact_changes;
CREATE POLICY account_contact_changes_service_role ON account_contact_changes
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agriculnet-assets',
  'agriculnet-assets',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON TABLE account_recovery_contacts IS 'Verified or pending recovery contacts for account access and recovery.';
COMMENT ON TABLE account_contact_changes IS 'Pending primary email and phone changes that require verification before replacing primary values.';
COMMENT ON COLUMN users.profile_image_url IS 'Public profile image URL stored in the agriculnet-assets bucket or compatible legacy provider.';
