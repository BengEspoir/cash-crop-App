# AgriculNet Deployment Guide

This guide describes a prototype deployment with a Next.js frontend, Express backend, and Supabase database/storage. It does not certify the marketplace or its external payment, logistics, inspection, or export workflows for production use.

## Recommended topology

- Frontend: Vercel, rooted at `client/`
- Backend: one Railway service, with Root Directory `/server`
- Database and storage: Supabase
- Optional media/provider services: configure only when the related flow is being tested

Follow the backend section below for the Railway preset. For WhatsApp relay variables, webhook construction, and end-to-end validation, follow `WHATSAPP_RELAY_API_SETUP.md`.

## Frontend deployment

1. Connect the repository to Vercel.
2. Set the project root to `client`.
3. Run `npm run build`.
4. Set `NEXT_PUBLIC_API_URL` to the backend URL ending in `/api/v1`.
5. Copy only explicitly public values from `client/.env.local.example`.

Never expose administrator credentials, service-role credentials, JWT secrets, AI/provider keys, or Fapshi values through `NEXT_PUBLIC_` variables.

## Backend deployment

1. In Railway, create a service from the GitHub repository and set Root Directory to `/server`.
2. Keep the default Railpack builder. Set Start Command to `npm start` only if it is not detected from `server/package.json`.
3. Do not add a persistent volume; this API stores durable data in Supabase.
4. Let Railway inject `PORT`; do not create it manually. The API already listens on `process.env.PORT`.
5. Set Healthcheck Path to `/api/health`. Railway uses it while activating a new deployment.
6. Under **Settings > Networking**, generate a public Railway domain.
7. Set `NODE_ENV=production`, `CLIENT_URL=https://agriculnet.farm`, and `BASE_URL=https://<service>.up.railway.app`.
8. Add required private values from `server/.env.example` through the Railway service's **Variables** tab, review the staged changes, and deploy.
9. Confirm `GET /api/health` on the generated `up.railway.app` domain before setting Vercel's `NEXT_PUBLIC_API_URL=https://<service>.up.railway.app/api/v1`.

Every environment requires `SUPABASE_SERVICE_ROLE_KEY`; the API does not fall back to an anonymous key. Production configuration also includes private Supabase, delivery-provider, storage, and enabled integration credentials. There is no administrator route secret or public administrator key. Administrators use `/auth/login` and native Supabase sessions.

The in-process account-review scheduler runs only while the Railway service is active. Use a Railway plan and restart policy appropriate for continuously scheduled execution, or move critical scheduled work to a durable job mechanism before production reliance.

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

For a new database, apply `server/database/migrations/001_enums_and_extensions.sql` through `040_whatsapp_relay_and_message_realtime.sql` in numeric order. For the existing Supabase project, record what is already applied and run only missing migrations; do not recreate or rerun the schema blindly. The final safeguards are:

- 032: atomic, server-authoritative order creation;
- 033: one durable payment intent, serialized provider checkout persistence, and guarded escrow release per order;
- 034: operation-bound authentication proofs with atomic attempt/consumption handling;
- 035: idempotent orders, guarded quotes, and stock reservation settlement;
- 036: atomic shipment, GPS/history, and order transitions;
- 037: forced RLS and service-role-only table access.
- 038: UUID resolution for restricted payment, order, and logistics RPCs.
- 039: Supabase Auth identity alignment and least-privilege browser RLS.
- 040: server-only WhatsApp thread routing and message Realtime publication.

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
- Migrations 001-040 are recorded as applied in exact order.
- Legacy payment-reference, commission, shipment, payment-intent, proof, inventory, and shipment-status prerequisites were reconciled before 031 and 033-036.
- `SUPABASE_SERVICE_ROLE_KEY` is configured only on the backend in every environment.
- Production delivery hints are disabled.
- CORS and frontend API URLs match the deployed domains.
- The Fapshi webhook secret is configured server-side.
- WhatsApp relay remains disabled until migration 040, the signed Meta webhook, WABA subscription, and approved inquiry template are validated.
- Provider timeouts, retry behavior, and monitoring are documented.
- Frontend and backend test/build checks pass.
- A rollback path is documented before provider cutover.
