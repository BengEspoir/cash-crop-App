# AgriculNet Migration Guide

This guide covers the auth-backed schema required by the current local app.

## Required auth migrations
Run these files in Supabase SQL Editor, in this exact order:
1. `001_enums_and_extensions.sql`
2. `002_users_table.sql`
3. `003_farmer_profiles.sql`
4. `004_buyer_profiles.sql`
5. `005_tokens_and_otps.sql`
6. `021_audit_logs.sql`
7. `022_profile_extensions.sql`
8. `023_auto_approval_setup.sql`
9. `024_enhanced_verification.sql`
10. `025_activity_events.sql`

These migrations support:
- Farmer registration and sign-in
- Local buyer registration and sign-in
- International buyer registration and sign-in
- OTP verification
- Email verification
- Password reset
- Seeded admin login
- Farmer identity verification and review evidence
- Live dashboard/admin activity tracking

## Optional seeds
Run these after migrations if needed:
- `seeds/001_seed_admin.sql` for local admin login
- `seeds/002_seed_regions.sql` for marketplace region data
- `seeds/003_seed_crops.sql` for marketplace crop data

## How to run them
1. Open `https://app.supabase.com`
2. Open your project
3. Open `SQL Editor`
4. Create a new query
5. Paste one migration file at a time
6. Click `Run`

## Verify the result
```bash
cd server
node verify-db-init.js
```

Expected result:
- Required tables present: `users`, `farmer_profiles`, `buyer_profiles`, `tokens`, `otps`, `audit_logs`, `activity_events`
- Required extension and identity-review columns present from `022`, `023`, and `024`
- `pending_identity_verification` exists in the `users.status` enum

## Seeded admin
After running `seeds/001_seed_admin.sql`:
- Email: `mbengespoir@gmail.com`
- Password: set your own private admin password before seeding production data.

## Current auth behavior
- Buyers become `active` after both phone and email verification.
- Farmers become `pending_identity_verification` after phone and email verification.
- Farmers submit identity evidence, then become `pending_review`.
- Farmers still need manual admin approval before dashboard access.

## Common problems
- Missing `countryCode` support means the frontend and backend builds are out of sync.
- Missing `022_profile_extensions.sql` causes richer onboarding fields to fail persistence.
- Missing `023_auto_approval_setup.sql` leaves out `users.reviewed_at`, which the legacy approval job still references.
- Missing `024_enhanced_verification.sql` blocks farmer identity evidence and the `pending_identity_verification` status.
- Missing `025_activity_events.sql` leaves dashboard/admin analytics without live traffic capture.
- Missing `SUPABASE_SERVICE_ROLE_KEY` can block inserts and updates even if reads work.
