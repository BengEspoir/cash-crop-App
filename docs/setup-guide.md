# AgriculNet Setup Guide

## Prerequisites
- Node.js 20+
- npm
- Access to the target Supabase project

## 1. Install dependencies
```bash
cd client
cmd /c npm install

cd ../server
cmd /c npm install
```

## 2. Configure environment files
```bash
copy server\.env.example server\.env
copy client\.env.local.example client\.env.local
```

Backend notes:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` must be valid.
- `SUPABASE_SERVICE_ROLE_KEY` is strongly recommended for all backend writes.
- `ADMIN_ROUTE_SECRET` must match `NEXT_PUBLIC_ADMIN_KEY`.
- Development fallback is controlled by:
  - `ALLOW_DEV_DELIVERY_FALLBACK=true`
  - `EXPOSE_DEV_AUTH_HINTS=true`

## 3. Run auth-critical Supabase migrations
Run these files in order from the Supabase SQL editor:
- `001_enums_and_extensions.sql`
- `002_users_table.sql`
- `003_farmer_profiles.sql`
- `004_buyer_profiles.sql`
- `005_tokens_and_otps.sql`
- `021_audit_logs.sql`
- `022_profile_extensions.sql`
- `023_auto_approval_setup.sql`
- `024_enhanced_verification.sql`
- `025_activity_events.sql`

Then run:
- `server/database/seeds/001_seed_admin.sql`

Optional marketplace seeds:
- `server/database/seeds/002_seed_regions.sql`
- `server/database/seeds/003_seed_crops.sql`

## 4. Verify the schema
```bash
cd server
node verify-db-init.js
```

The verifier checks the real auth tables (`users`, `farmer_profiles`, `buyer_profiles`, `tokens`, `otps`, `audit_logs`, `activity_events`) plus the identity-review fields added by migrations `022` through `025`.

## 5. Start local servers
```bash
cd server
cmd /c npm start

cd ../client
cmd /c npm start
```

## 6. Local URLs
- Frontend: `http://localhost:3000`
- API health: `http://localhost:5000/api/health`
- Admin portal: `http://localhost:3000/admin-portal`

## 7. Local auth behavior
- Buyers become `active` after phone and email verification.
- Farmers become `pending_identity_verification` after phone and email verification.
- Farmers submit identity evidence before moving to `pending_review` for manual admin approval.
- Local fallback `devHints` can supply OTP codes and verification links when SMS or email providers are not configured.

Typical local flow:
1. Register a buyer or farmer.
2. Use the OTP shown in `devHints` on `/verify-phone`.
3. Use the verification link shown in `devHints` on `/verify-email`.
4. Farmers complete `/farmer/verify-identity`; buyers go straight to the dashboard once active.
5. Admins review pending farmers from the live admin queue.

## 8. Seeded admin
`server/database/seeds/001_seed_admin.sql` seeds:
- Email: `mbengespoir@gmail.com`
- Password: set your own private admin password before seeding production data.

## 9. Troubleshooting
- If buyer registration fails on `countryCode`, the backend and frontend builds are out of sync.
- If auth writes fail, verify `SUPABASE_SERVICE_ROLE_KEY`.
- If `verify-db-init.js` reports missing columns, apply `022_profile_extensions.sql`, `023_auto_approval_setup.sql`, `024_enhanced_verification.sql`, and `025_activity_events.sql`.
- Check `server/logs/error.log` for backend runtime failures.
