# Migration Quick Reference

## Auth-critical migration order
```text
001_enums_and_extensions.sql
002_users_table.sql
003_farmer_profiles.sql
004_buyer_profiles.sql
005_tokens_and_otps.sql
021_audit_logs.sql
022_profile_extensions.sql
023_auto_approval_setup.sql
024_enhanced_verification.sql
025_activity_events.sql
```

## Optional seeds
```text
001_seed_admin.sql
002_seed_regions.sql
003_seed_crops.sql
```

## Verify
```bash
cd server
node verify-db-init.js
```

## Seeded admin
- Email: `mbengespoir@gmail.com`
- Password: set your own private admin password before seeding production data.

## Notes
- `001_seed_admin.sql` is needed for local admin login.
- `002_seed_regions.sql` and `003_seed_crops.sql` are optional marketplace data seeds.
- Buyers become active after phone and email verification.
- Farmers become pending identity verification after phone and email verification.
- Farmers move to pending review only after identity evidence is submitted.
