# AgriculNet

AgriculNet is a research and demonstration prototype for reducing information asymmetry and trust barriers in Cameroon's cash-crop trade. It combines public discovery screens with authenticated role-based workflows backed by an Express API and Supabase.

## Implementation status

Implemented and testable in the repository:

- password authentication, verification, recovery, and role-based access;
- buyer, farmer, reseller, and administrator account/profile flows;
- seller identity submission and administrator review;
- persisted marketplace domain foundations and dashboard APIs;
- sandbox-oriented Fapshi integration with an atomic reconciliation migration.

Prototype or deployment-dependent areas:

- live payment collection, escrow, release, refunds, and payouts;
- real carrier dispatch, GPS tracking, inspections, certification, and export processing;
- production-grade provider monitoring, reconciliation operations, and measured marketplace impact.

A rendered dashboard or seeded record is not evidence that an external service or end-to-end transaction is operational.

## Stack

- Next.js App Router frontend in `client/`
- Express API in `server/`
- Supabase PostgreSQL and Storage
- Jest backend tests and Vitest frontend tests

## Quick start

```powershell
npm --prefix client install
npm --prefix server install
Copy-Item server/.env.example server/.env
Copy-Item client/.env.local.example client/.env.local
```

Replace placeholders only in the untracked environment files. Never commit live credentials, reusable password hashes, access tokens, or administrator identifiers.

Start the services in separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

Local endpoints:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:5000/api/health`
- Canonical sign-in: `http://localhost:3000/auth/login`

## Database setup

Apply every file in `server/database/migrations/` in numeric order, from `001_enums_and_extensions.sql` through `039_supabase_auth_and_rls_alignment.sql`. Migrations 032-036 add atomic order, payment, authentication-proof, inventory/quote, and logistics operations. Migration 037 forces RLS, migration 038 repairs UUID resolution, and migration 039 links domain users to Supabase Auth identities and installs role-aware policies/hooks.

Before migration 031, reconcile duplicate non-null `payments.transaction_ref` values, duplicate `commissions.order_id` rows, and duplicate `logistics.order_id` rows; the migration fails with the corresponding `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, or `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED` code. Also reconcile duplicate order payments before 033, reissue credentials invalidated by 034, audit legacy inventory for 035, and normalize unknown shipment statuses for 036. Every API environment must use `SUPABASE_SERVICE_ROLE_KEY`.

Verify representative schema checkpoints:

```powershell
Set-Location server
node verify-db-init.js
```

Seeds are optional. The administrator seed contains no tracked account or reusable hash; it requires private session settings at execution time. The other seeds are demonstration data and do not establish production readiness.

## Authentication boundary

All password users, including administrators, sign in through the client’s native Supabase flow:

```text
http://localhost:3000/auth/login
```

There is no backend password-login endpoint, hidden administrator route, public administrator key, or custom session token. Express validates Supabase access tokens; administrator accounts must already be linked to Supabase Auth with an `admin` or `super_admin` domain role.

Development delivery hints may be enabled locally. Disable them in production and configure real email/SMS providers.

## Fapshi configuration

Keep all Fapshi values on the backend. In addition to the provider base URL and API credentials, configure:

```env
FAPSHI_WEBHOOK_SECRET=<private-random-hmac-secret>
FAPSHI_REQUEST_TIMEOUT_MS=10000
```

The webhook endpoint is `POST /api/webhooks/fapshi`. Its signed `externalId` is validated with the HMAC secret, then the transaction is fetched from Fapshi and reconciled atomically through migrations 031 and 033.

## Documentation

- `docs/setup-guide.md`
- `DEPLOYMENT_GUIDE.md`
- `RENDER_BACKEND_DEPLOYMENT_GUIDE.md`
- `ADMIN_ACCESS_GUIDE.md`
- `server/database/MIGRATION_GUIDE.md`
- `server/database/RESTORATION_GUIDE.md`
