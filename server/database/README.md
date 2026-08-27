# AgriculNet Database Guide

The database directory contains ordered migrations, optional bootstrap/demo seeds, and setup references for the AgriculNet prototype.

## Required order

Apply every file in `migrations/` in numeric order from 001 through 040. Later migrations extend tables and functions created earlier; do not treat the shorter authentication subset as a complete marketplace schema. Migration 040 adds server-only WhatsApp relay bindings and publishes authorized message inserts through Supabase Realtime.

Before 031, reconcile duplicate non-null payment references, duplicate commissions per order, and duplicate logistics rows per order; its exact `MIGRATION_031_*_RECONCILIATION_REQUIRED` codes are documented in `MIGRATION_GUIDE.md`. Migrations 032-036 make order, payment, authentication-proof, inventory/quote, and logistics changes atomic. Payment migrations 031/033 use order-before-payment locking; cancelled-order funds are marked for refund/reconciliation and related commission is cancelled. Migration 037 forces RLS and revokes application-table access from browser roles. Migration 038 repairs UUID resolution in the restricted payment, order, and logistics RPCs.

## Optional seeds

- `seeds/001_seed_admin.sql` provisions an administrator only when private email and bcrypt-hash session settings are supplied at execution time. The tracked seed contains no usable account.
- `seeds/002_seed_regions.sql` and `003_seed_crops.sql` provide reference/demo data.
- `seeds/004_seed_marketplace_cameroon_sellers.sql` provides removable demonstration marketplace data.

Seeds are not migrations and are not proof of production readiness.

## Verification

```powershell
Set-Location server
node verify-db-init.js
```

Also run the read-only RPC and RLS SQL checks in `MIGRATION_GUIDE.md`.

## Scope

Authentication, profile, verification, and selected persisted marketplace workflows are implemented. Payment, logistics, inspection, certification, export, and settlement capabilities remain prototype or deployment-dependent until their provider and operational paths are validated end to end.
