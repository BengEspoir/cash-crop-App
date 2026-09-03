# Step-by-Step Supabase Setup

## 1. Prepare the target

1. Create or select the intended Supabase project.
2. Back up any existing data before applying changes.
3. Open SQL Editor with an account authorized to run migrations.

## 2. Apply migrations

Run all files in `server/database/migrations/` one at a time in numeric order, starting with 001 and ending with:

```text
029_profile_contacts_and_assets.sql
030_logistics_tracking_and_monetization.sql
031_atomic_fapshi_settlement.sql
032_atomic_order_creation.sql
033_atomic_payment_intents.sql
034_auth_proof_hardening.sql
035_order_inventory_and_quote_guards.sql
036_atomic_logistics_transitions.sql
037_core_rls_lockdown.sql
038_uuid_generation_compatibility.sql
039_supabase_auth_and_rls_alignment.sql
040_whatsapp_relay_and_message_realtime.sql
041_system_maintenance_and_operation_jobs.sql
```

Do not skip the earlier marketplace migrations merely because an authentication-only flow starts successfully.

For an existing database, complete migration 031's payment-reference, commission, and shipment uniqueness preflight plus the 033 duplicate-payment, 034 proof-reissue, 035 inventory-audit, and 036 shipment-status prerequisites in `MIGRATION_GUIDE.md`. Resolve its exact `MIGRATION_031_*_RECONCILIATION_REQUIRED` failure before retrying. Migration 037 requires a backend-only service-role key in every environment; migration 038 repairs UUID resolution in already-installed restricted RPCs; migrations 039-040 align Auth and messaging; and migration 041 adds protected maintenance/operation metadata.

## 3. Run optional seeds

Reference and demonstration seeds are optional. For `001_seed_admin.sql`:

1. generate a unique administrator password outside the repository;
2. generate its bcrypt hash locally;
3. open a private, disposable SQL Editor query;
4. begin an explicit transaction;
5. set the two private session settings documented in the seed;
6. execute the seed `DO` block in the same transaction;
7. commit, close, and discard the query.

Do not paste the email or hash into the tracked seed.

## 4. Verify

```powershell
Set-Location server
node verify-db-init.js
```

Then run the read-only RPC-signature and RLS checks from `MIGRATION_GUIDE.md`.

## 5. Configure the API

Copy `server/.env.example` to an ignored local file and provide private values. `SUPABASE_SERVICE_ROLE_KEY` is required in every API environment. Fapshi testing also requires the provider settings plus `FAPSHI_WEBHOOK_SECRET` and `FAPSHI_REQUEST_TIMEOUT_MS`.

## 6. Test safely

- check `GET /api/health`;
- register and verify a disposable non-admin account;
- use `/auth/login` for both regular and administrator Supabase login;
- test provider workflows in sandbox;
- keep production delivery hints disabled.

## Expected scope

Authentication and selected database-backed workflows should be testable. Live payments, settlement, payouts, carrier dispatch, inspections, certification, export processing, and impact outcomes remain prototype/planned until validated in the target operating environment.
