# Authentication Diagnostic Guide

This document describes safe, repeatable authentication checks. It intentionally contains no live project identifiers, credentials, tokens, administrator accounts, password hashes, or provider response bodies.

## Current boundary

Implemented authentication capabilities include:

- native Supabase password registration and login for supported roles;
- canonical administrator login through `/auth/login`;
- Supabase access/refresh sessions, account status checks, and audit events;
- email and phone verification;
- password reset with rate limiting and OTP attempt enforcement;
- profile, contact-change, recovery-contact, and seller identity-review flows.

Administrator OAuth exchange is intentionally unavailable. Marketplace order, payment, logistics, inspection, and settlement areas remain prototype workflows until their migrations, provider configuration, authorization checks, and end-to-end tests have been completed in the target environment.

## Environment validation

Start from the tracked example files:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.local.example client/.env.local
```

Replace placeholders only in the untracked local files or hosting-provider dashboards. Never paste real values into documentation, issues, screenshots, Postman collections, or `NEXT_PUBLIC_` variables unless the value is explicitly designed to be public.

The backend requires Supabase and `SUPABASE_SERVICE_ROLE_KEY` configuration to boot in every environment. Production deployments additionally require the configured email/SMS providers. Provider credentials must remain server-side.

## Database prerequisites

Apply `server/database/migrations/001_enums_and_extensions.sql` through `039_supabase_auth_and_rls_alignment.sql` in numeric order. Migration 039 links `public.users` to `auth.users`, adds JWT claims support, and restores least-privilege role-aware RLS.

Run the repository verifier after applying the migrations:

```powershell
Set-Location server
node verify-db-init.js
```

The verifier performs read-only checks for representative tables, columns, enum values, and RPCs through migration 038. It does not prove that a live payment, logistics, or settlement workflow is production-ready.

## Safe authentication checks

1. Start the API and request `GET /api/health`.
2. Register a non-admin test account with private, disposable details.
3. Complete email and phone verification using configured providers or development hints in local development only.
4. Test normal sign-in at `/auth/login`.
5. For an administrator, use the same page and confirm the linked domain role is `admin` or `super_admin` without printing tokens.
6. Run diagnostic scripts only with local environment variables and review their generic exit status.

## Fapshi configuration boundary

For a deployed payment prototype, configure these values only on the backend:

- `FAPSHI_BASE_URL`;
- `FAPSHI_API_USER`;
- `FAPSHI_API_KEY`;
- `FAPSHI_WEBHOOK_SECRET`;
- `FAPSHI_REQUEST_TIMEOUT_MS` (the tracked example uses 10000 milliseconds).

A webhook secret and migrations 031 and 033 are required before treating callbacks as eligible for atomic reconciliation. Before 031, resolve duplicate non-null payment references, commissions per order, or shipments per order reported by the three `MIGRATION_031_*_RECONCILIATION_REQUIRED` codes documented in `server/database/MIGRATION_GUIDE.md`; reconcile duplicate order payments before 033. Sandbox/provider success alone is not evidence of live settlement, escrow, payout, or logistics completion.

## Credential incident response

If a usable credential has ever been committed:

1. rotate or revoke it at the provider;
2. invalidate related sessions where applicable;
3. replace local and hosted environment values;
4. inspect Git history and published artifacts;
5. document the rotation without copying the old or new value.

Sanitizing the current branch does not erase repository history or external copies.
