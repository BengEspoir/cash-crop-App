# AgriculNet Marketplace Supabase Guide

## Execution order

Apply all migrations from 001 through `038_uuid_generation_compatibility.sql` in numeric order. Marketplace-specific checkpoints include:

- 026: seller verification gating;
- 027: reseller marketplace foundation;
- 028: dashboard/support operations;
- 029: profile assets and recovery/contact changes;
- 030: logistics tracking and monetary fields;
- 031: atomic Fapshi reconciliation with cancelled-order refund guards;
- 032: atomic server-authoritative order creation;
- 033: authoritative payment intent, checkout persistence, and escrow release per order;
- 034: operation-bound authentication proofs;
- 035: idempotent orders, guarded quotes, and stock settlement;
- 036: atomic shipment/GPS/order transitions;
- 037: forced RLS and service-role-only table access.
- 038: UUID resolution for restricted payment, order, and logistics RPCs.

For existing data, first resolve migration 031's duplicate non-null payment references, commissions per order, or logistics rows per order using `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, or `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED`. Then reconcile duplicate order payments before 033, reissue proofs after 034, audit inventory for 035, and normalize shipment statuses before 036.

Optional seeds provide bootstrap or removable demonstration data. They are not evidence of a live marketplace.

## Storage boundary

Create a private bucket named by `SUPABASE_VERIFICATION_BUCKET` for National ID and selfie evidence. Only the backend service role should upload or sign access to those files. Do not expose verification paths through public APIs or policies.

Use `SUPABASE_ASSETS_BUCKET` for the intended public asset boundary and validate image content before upload.

## Authorization and RLS

Migration 037 enables and forces RLS on every AgriculNet application table and revokes all table privileges from `PUBLIC`, `anon`, and `authenticated`. The Express API is the marketplace data boundary and requires `SUPABASE_SERVICE_ROLE_KEY` in every environment. Never expose that key to the browser. Supabase browser usage is limited to OAuth; marketplace reads and writes go through the API.

Application authorization remains enforced in API middleware/services:

- users access their own account; administrators review through authorized APIs;
- owners and administrators control seller profiles and verification metadata;
- public listing reads expose only intended non-sensitive fields;
- inquiry, conversation, message, order, and payment access is limited to participants/administrators;
- mutation of payment, settlement, and logistics state remains server-mediated.

## Fapshi boundary

Migration 031 exposes `reconcile_fapshi_payment` only to the service role. Migration 033 likewise restricts payment-intent, checkout-persistence, and escrow-release RPCs to the service role. Both use order-before-payment locking; a late success or cancellation marks funds for refund/reconciliation and cancels commission instead of reopening the order. Configure provider secrets only on the backend and test authenticated callbacks, amount/currency validation, duplicate delivery, cancellation races, timeouts, and retries in sandbox.

## Verification

```powershell
Set-Location server
node verify-db-init.js
```

Use the read-only function-signature and RLS queries in `MIGRATION_GUIDE.md` to confirm representative migrations through 038.

## Prototype statement

The schema supports implementation and evaluation of marketplace workflows. It does not establish operational payments, escrow, payouts, carrier tracking, inspection/certification, export processing, or measured farmer/buyer outcomes.
