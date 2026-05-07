-- AgriculNet — Seed default super admin account
-- Password: set a private admin password and paste its bcrypt hash below.
-- Generate a hash with your preferred bcrypt tooling before running this seed.
-- Run AFTER running all migration files

-- Update admin password if exists
UPDATE users 
SET 
  password_hash = 'replace-with-bcrypt-hash',
  phone = '683077263',
  status = 'active',
  phone_verified = TRUE,
  email_verified = TRUE
WHERE email = 'mbengespoir@gmail.com';

-- Or if the user doesn't exist, insert fresh:
INSERT INTO users (
  id, 
  role, 
  status, 
  first_name, 
  last_name, 
  phone, 
  email, 
  password_hash, 
  phone_verified, 
  email_verified, 
  country,
  region,
  city
) VALUES (
  uuid_generate_v4(),
  'super_admin',
  'active',
  'Espoir',
  'Mbeng',
  '683077263',
  'mbengespoir@gmail.com',
  'replace-with-bcrypt-hash',
  TRUE,
  TRUE,
  'Cameroon',
  'Littoral',
  'Douala'
) ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  phone_verified = EXCLUDED.phone_verified,
  email_verified = EXCLUDED.email_verified;

-- NOTE: Never commit a real production admin password or reusable admin hash.
