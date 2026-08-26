# AgriculNet Setup Guide

## Prerequisites

- Node.js 20 or later
- npm
- a target Supabase project
- provider accounts only for the integrations you intend to test

## 1. Install dependencies

```powershell
npm --prefix client install
npm --prefix server install
```

## 2. Create local environment files

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.local.example client/.env.local
```

Use private values only in those ignored files or a hosting-provider dashboard. Do not add administrator secrets or provider credentials to any `NEXT_PUBLIC_` variable.

Backend configuration groups include Supabase, email, SMS, storage, AI providers, and Fapshi. For Fapshi sandbox checkout, configure the provider credentials plus:

```env
FAPSHI_WEBHOOK_SECRET=<private-random-hmac-secret>
FAPSHI_REQUEST_TIMEOUT_MS=10000
```

Development delivery fallback is controlled by `ALLOW_DEV_DELIVERY_FALLBACK` and `EXPOSE_DEV_AUTH_HINTS`. Both must be disabled in production.

## 3. Apply database migrations

Run all SQL files in `server/database/migrations/` in numeric order:

```text
001_enums_and_extensions.sql
...
030_logistics_tracking_and_monetization.sql
031_atomic_fapshi_settlement.sql
032_atomic_order_creation.sql
033_atomic_payment_intents.sql
034_auth_proof_hardening.sql
035_order_inventory_and_quote_guards.sql
036_atomic_logistics_transitions.sql
037_core_rls_lockdown.sql
038_uuid_generation_compatibility.sql
```

Do not skip intermediate files. Before 031, reconcile duplicate non-null payment references, duplicate commissions per order, and duplicate logistics rows per order; failures use `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, and `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED`. Before later migrations, reconcile duplicate order payments for 033, reissue proofs invalidated by 034, audit inventory for 035, and normalize unknown shipment statuses for 036. Migration 037 makes application tables service-role-only, so `SUPABASE_SERVICE_ROLE_KEY` is required in every API environment. Migration 038 repairs UUID resolution in restricted RPCs.

Optional seeds live in `server/database/seeds/`. The administrator seed must be supplied private session settings in the same explicit SQL transaction; the tracked file contains no account or password hash.

## 4. Verify the schema

```powershell
Set-Location server
node verify-db-init.js
```

The verifier uses read-only table/column queries and the Supabase schema description to check representative tables, enums, and RPCs through migration 038. Run the SQL checks in `server/database/MIGRATION_GUIDE.md` separately to confirm RLS and grants. Verification does not validate live providers or prove end-to-end marketplace operation.

## 5. Start local services

From two terminals at the repository root:

```powershell
npm run dev:server
npm run dev:client
```

Useful URLs:

- API health: `http://localhost:5000/api/health`
- Farmer registration: `http://localhost:3000/register/farmer`
- Buyer registration: `http://localhost:3000/register/buyer`
- Sign-in: `http://localhost:3000/auth/login`

## 6. Authentication checks

Typical local flow:

1. Register a disposable buyer or seller account.
2. Complete phone and email verification.
3. Sellers submit identity evidence and await manual administrator review.
4. Sign in at `/auth/login` through Supabase Auth.
5. Use the Supabase access token as the bearer token for authenticated API requests.

Administrators use the same Supabase login pipeline. Do not send a custom administrator header.

## 7. Prototype checks

Seed data and sandbox responses are useful for demonstrations, but keep these boundaries explicit:

- order/payment/logistics records can exercise prototype workflows;
- provider callbacks require the webhook secret and migrations 031 and 033;
- live settlement, payouts, carrier operations, certification, and impact results remain deployment-dependent or planned.

## Troubleshooting

- A missing table or column usually means one or more migrations were skipped.
- A missing RPC means its migration was not applied or the Supabase schema cache has not refreshed. Refresh the cache after applying the missing file; migrations 035 and 036 also request a reload.
- A rejected administrator login should be tested through `/auth/login`, not an API password endpoint or older hidden path.
- Provider timeouts should be adjusted with `FAPSHI_REQUEST_TIMEOUT_MS` on the backend, within the documented bounds.
- Review `server/logs/error.log` without copying credentials or provider response bodies into tickets.
