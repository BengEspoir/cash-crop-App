# Migration Quick Reference

## Apply

```text
server/database/migrations/001_enums_and_extensions.sql
...
server/database/migrations/030_logistics_tracking_and_monetization.sql
server/database/migrations/031_atomic_fapshi_settlement.sql
server/database/migrations/032_atomic_order_creation.sql
server/database/migrations/033_atomic_payment_intents.sql
server/database/migrations/034_auth_proof_hardening.sql
server/database/migrations/035_order_inventory_and_quote_guards.sql
server/database/migrations/036_atomic_logistics_transitions.sql
server/database/migrations/037_core_rls_lockdown.sql
server/database/migrations/038_uuid_generation_compatibility.sql
```

Run every intermediate file in numeric order.

## Verify

```powershell
Set-Location server
node verify-db-init.js
```

Use the read-only RPC-signature and RLS queries in `MIGRATION_GUIDE.md` after `node verify-db-init.js`.

Existing-database prerequisites: before 031, reconcile duplicate non-null payment references, commissions per order, and logistics rows per order reported by `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, or `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED`. Also reconcile duplicate order payments before 033, reissue proofs after 034, audit stock for 035, normalize shipment statuses before 036, configure the service-role key before 037, and apply the UUID compatibility repair in 038.

## Optional seeds

```text
001_seed_admin.sql
002_seed_regions.sql
003_seed_crops.sql
004_seed_marketplace_cameroon_sellers.sql
```

The administrator seed requires private session settings at execution time and contains no tracked account or reusable hash.

## Runtime boundary

- Administrator login: `/auth/login` (native Supabase Auth)
- Fapshi callback: `POST /api/webhooks/fapshi`
- Required private callback setting: `FAPSHI_WEBHOOK_SECRET`
- Provider request bound: `FAPSHI_REQUEST_TIMEOUT_MS`
- Required API database credential in every environment: `SUPABASE_SERVICE_ROLE_KEY`

The schema and seeds support a prototype; they do not prove live settlement or physical marketplace operations.
