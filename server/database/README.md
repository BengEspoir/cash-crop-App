# Database Setup Docs

Use these files for local auth-backed setup:
- `MIGRATION_GUIDE.md` for the full auth migration order
- `QUICK_REFERENCE.md` for the short checklist
- `STEP_BY_STEP_GUIDE.md` for the click-by-click Supabase flow

## Current local scope
The local app uses a real backend for auth, admin-auth, farmer identity review, activity tracking, and authenticated dashboard data. Public browse pages may still use preview-oriented data.

## Required migrations for auth
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

## Optional seeds
- `seeds/001_seed_admin.sql`
- `seeds/002_seed_regions.sql`
- `seeds/003_seed_crops.sql`

## Verification
```bash
cd server
node verify-db-init.js
```
