# AgriculNet Deployment Guide

This guide describes a prototype deployment with a Next.js frontend, Express backend, and Supabase database/storage. It does not certify the marketplace or its external payment, logistics, inspection, or export workflows for production use.

## Recommended topology

- Frontend: Vercel, rooted at `client/`
- Backend: one Render Web Service, with Root Directory `server/`
- Database and storage: Supabase
- Optional media/provider services: configure only when the related flow is being tested

Follow `RENDER_BACKEND_DEPLOYMENT_GUIDE.md` for the complete control-panel procedure, environment-variable inventory, Vercel cutover, custom domain, troubleshooting, and rollback steps.

## Frontend deployment

1. Connect the repository to Vercel.
2. Set the project root to `client`.
3. Run `npm run build`.
4. Set `NEXT_PUBLIC_API_URL` to the backend URL ending in `/api/v1`.
5. Copy only explicitly public values from `client/.env.local.example`.

Never expose administrator credentials, service-role credentials, JWT secrets, AI/provider keys, or Fapshi values through `NEXT_PUBLIC_` variables.

## Backend deployment

1. In Render, create a Git-backed Web Service with Root Directory `server`.
2. Set Build Command to `npm ci --omit=dev` and Start Command to `npm start`.
3. Select the Free instance for testing and do not add a persistent disk.
4. Let Render supply `PORT`; do not create it manually.
5. Leave Health Check Path blank so Render uses its default TCP probe; test `GET /api/health` manually.
6. Set `NODE_ENV=production`, `CLIENT_URL=https://agriculnet.farm`, and the correct `BASE_URL`.
7. Add required private values from `server/.env.example` through Render's Environment settings.
8. Confirm `GET /api/health` on the generated `onrender.com` domain before updating Vercel.

Every environment requires `SUPABASE_SERVICE_ROLE_KEY`; the API does not fall back to an anonymous key. Production configuration also includes private Supabase, delivery-provider, storage, and enabled integration credentials. There is no administrator route secret or public administrator key. Administrators use `/auth/login` and native Supabase sessions.

The Free instance sleeps after 15 minutes without inbound traffic and can take about one minute to wake. The in-process account-review scheduler does not run while the service is sleeping, so use an always-on instance when reliable scheduled execution is required.

## Fapshi deployment settings

Keep all values on the backend service:

```env
FAPSHI_BASE_URL=<provider-environment-url>
FAPSHI_MODE=sandbox
FAPSHI_API_USER=<private-provider-user>
FAPSHI_API_KEY=<private-provider-key>
FAPSHI_WEBHOOK_SECRET=<private-random-hmac-secret>
FAPSHI_REQUEST_TIMEOUT_MS=10000
```

Configure the provider callback for `POST /api/webhooks/fapshi`. Use the sandbox environment until callback authenticity, amount/currency validation, retries, reconciliation, and operational monitoring have been verified.

## Supabase migration order

For a new database, apply `server/database/migrations/001_enums_and_extensions.sql` through `039_supabase_auth_and_rls_alignment.sql` in numeric order. For the existing Supabase project, record what is already applied and run only missing migrations; do not recreate or rerun the schema blindly. The final safeguards are:

- 032: atomic, server-authoritative order creation;
- 033: one durable payment intent, serialized provider checkout persistence, and guarded escrow release per order;
- 034: operation-bound authentication proofs with atomic attempt/consumption handling;
- 035: idempotent orders, guarded quotes, and stock reservation settlement;
- 036: atomic shipment, GPS/history, and order transitions;
- 037: forced RLS and service-role-only table access.
- 038: UUID resolution for restricted payment, order, and logistics RPCs.

For an existing database, migration 031 first requires unique non-null payment references and one commission and logistics row per order. Resolve `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, or `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED` before retrying. Then reconcile duplicate order payments before 033, reissue existing verification/reset proofs after 034, audit legacy order/listing inventory before relying on 035, and normalize unknown shipment statuses before 036. Migration 037 requires `SUPABASE_SERVICE_ROLE_KEY` in every environment; migration 038 repairs UUID resolution in the restricted RPCs.

Run `node verify-db-init.js` from `server/` after migration. Keep a separate, audited migration record for each deployed environment.

Seeds are optional demonstration/bootstrap material. The administrator seed requires private runtime inputs and must not be edited to contain a reusable account or hash.

## Smoke tests

Minimum deployment checks:

1. API health responds.
2. Registration and password login work with a disposable account.
3. Email/phone verification works through the configured provider.
4. Administrator password login uses the canonical endpoint and role authorization.
5. Authenticated profile/dashboard requests return the standard API envelope.
6. Uploads stay within the intended private/public storage boundary.
7. Fapshi sandbox initiation and authenticated webhook rejection/acceptance cases behave as expected.

Do not run a real payment merely to prove deployment unless the provider account, authorization, reconciliation, refund, support, and accounting procedures are ready.

## Readiness boundary

The repository contains implemented authentication and several persisted marketplace workflows, but the overall marketplace remains a prototype. In particular, do not describe sandbox payments, generated tracking records, seeded inspections, or dashboard states as live settlement, physical delivery, certification, or measured economic impact.

## Production checklist

- No real environment files or credentials are committed.
- Previously exposed credentials have been rotated.
- Migrations 001-038 are recorded as applied in exact order.
- Legacy payment-reference, commission, shipment, payment-intent, proof, inventory, and shipment-status prerequisites were reconciled before 031 and 033-036.
- `SUPABASE_SERVICE_ROLE_KEY` is configured only on the backend in every environment.
- Production delivery hints are disabled.
- CORS and frontend API URLs match the deployed domains.
- The Fapshi webhook secret is configured server-side.
- Provider timeouts, retry behavior, and monitoring are documented.
- Frontend and backend test/build checks pass.
- A rollback path is documented before provider cutover.
