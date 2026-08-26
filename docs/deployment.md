# AgriculNet Render/Vercel Deployment Notes

Use Vercel for `client/`, one Render Web Service for `server/`, and the existing Supabase project for PostgreSQL and Storage. See `../RENDER_BACKEND_DEPLOYMENT_GUIDE.md` for the complete walkthrough.

## Backend cutover

1. Create a Git-backed Render Web Service with Root Directory `server`.
2. Set Build Command to `npm ci --omit=dev` and Start Command to `npm start`.
3. Select the Free instance and let Render provide `PORT` automatically.
4. Leave Health Check Path blank so Render uses its default TCP probe; test `GET /api/health` manually.
5. Add private values from `server/.env.example` through Render's Environment settings.
6. Set `NODE_ENV=production`, `CLIENT_URL`, `BASE_URL`, verification URLs, and storage bucket names.
7. Confirm `GET /api/health` on the generated `onrender.com` domain.

Do not configure an administrator route secret. Administrators use `/auth/login`, Supabase sessions, and the same JWT/RLS role boundary as other users.

## Database cutover

For the existing Supabase project, identify the applied versions and run only missing migrations through `039_supabase_auth_and_rls_alignment.sql`, always in numeric order. Do not rerun the full schema blindly. Then run:

```powershell
Set-Location server
node verify-db-init.js
```

Before 031, reconcile duplicate non-null payment references, commissions per order, and logistics rows per order. The explicit failures are `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, and `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED`. Then reconcile duplicate order payments for 033, reissue proofs invalidated by 034, audit legacy stock for 035, and normalize unknown shipment statuses for 036. Migration 037 forces RLS and requires `SUPABASE_SERVICE_ROLE_KEY` in every API environment; migration 038 repairs UUID resolution in restricted RPCs. Schema verification does not prove live provider operation.

## Fapshi backend values

Configure provider credentials privately and include:

```env
FAPSHI_WEBHOOK_SECRET=<private-random-hmac-secret>
FAPSHI_REQUEST_TIMEOUT_MS=10000
```

The callback route is `POST /api/webhooks/fapshi`. Keep `FAPSHI_MODE=sandbox` until callback authentication, amount/currency checks, duplicate delivery, timeout, retry, refund, and reconciliation behavior are validated.

## Point Vercel to the backend

Set:

```text
NEXT_PUBLIC_API_URL=https://<backend-domain>/api/v1
```

Redeploy the frontend after changing the value. No server credential belongs in Vercel's public environment variables.

## Post-cutover smoke test

- open the home and sign-in pages;
- sign in with a disposable non-admin account;
- test administrator login through the canonical endpoint;
- load one authenticated dashboard/profile request;
- verify one upload boundary if used in the demonstration;
- exercise Fapshi only in the intended provider environment.

## Rollback

Keep the previous backend deployment and configuration available until smoke tests pass. To roll back, restore the prior `NEXT_PUBLIC_API_URL`, redeploy the frontend, and re-run health/auth checks.

Render's Free instance sleeps after 15 minutes without inbound traffic and can take about one minute to wake. It is suitable for prototype testing, but the server's in-process scheduler cannot run while the instance is sleeping.

## Scope statement

AgriculNet remains a prototype. Authentication and selected persisted workflows are implemented, while live settlement, payouts, carrier operations, inspection/certification, export documentation, and impact claims require further implementation and operational validation.
