-- AgriculNet optional administrator seed.
--
-- This tracked file intentionally contains no administrator identifier, password,
-- phone number, reusable password hash, or route key.
--
-- Before executing the DO block, prepend private session settings in the SAME
-- explicit transaction in your SQL editor. Use values generated outside the
-- repository and do not save the resulting query:
--
-- BEGIN;
-- SELECT set_config('agriculnet.seed_admin_email', '<private-admin-email>', true);
-- SELECT set_config('agriculnet.seed_admin_password_hash', '<private-bcrypt-hash>', true);
-- [paste or execute the DO block below]
-- COMMIT;
--
-- Running this file without both settings fails safely.

DO $seed_admin$
DECLARE
  v_admin_email TEXT := NULLIF(
    BTRIM(current_setting('agriculnet.seed_admin_email', TRUE)),
    ''
  );
  v_admin_password_hash TEXT := NULLIF(
    current_setting('agriculnet.seed_admin_password_hash', TRUE),
    ''
  );
BEGIN
  IF v_admin_email IS NULL OR POSITION('@' IN v_admin_email) < 2 THEN
    RAISE EXCEPTION 'A private administrator email must be supplied through the session setting.';
  END IF;

  IF v_admin_password_hash IS NULL
    OR LENGTH(v_admin_password_hash) < 50
    OR LEFT(v_admin_password_hash, 2) <> '$2'
  THEN
    RAISE EXCEPTION 'A privately generated bcrypt password hash must be supplied through the session setting.';
  END IF;

  INSERT INTO users (
    id,
    role,
    status,
    first_name,
    last_name,
    email,
    password_hash,
    phone_verified,
    email_verified,
    country
  ) VALUES (
    uuid_generate_v4(),
    'super_admin',
    'active',
    'Platform',
    'Administrator',
    LOWER(v_admin_email),
    v_admin_password_hash,
    FALSE,
    TRUE,
    'Cameroon'
  )
  ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    password_hash = EXCLUDED.password_hash,
    email_verified = TRUE,
    updated_at = NOW();
END;
$seed_admin$;
