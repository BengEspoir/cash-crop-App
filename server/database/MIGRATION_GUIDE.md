# AgriculNet Migration Guide

## Migration order

Run each file separately in the Supabase SQL Editor, in this exact order:

1. `001_enums_and_extensions.sql` — enums and UUID/CITEXT prerequisites
2. `002_users_table.sql` — core accounts
3. `003_farmer_profiles.sql` — farmer profiles
4. `004_buyer_profiles.sql` — buyer profiles
5. `005_tokens_and_otps.sql` — authentication tokens and OTPs
6. `006_listings.sql` — crops, regions, and listings
7. `007_listing_images.sql` — listing media
8. `008_inquiries.sql` — buyer inquiries
9. `009_conversations_messages.sql` — conversations and messages
10. `010_orders.sql` — orders
11. `011_payments.sql` — payment records
12. `012_inspections.sql` — inspection records
13. `013_logistics.sql` — logistics records
14. `014_export_documents.sql` — export-document records
15. `015_disputes.sql` — disputes
16. `016_reviews.sql` — reviews
17. `017_notifications.sql` — notifications
18. `018_commissions.sql` — commissions
19. `019_saved_listings.sql` — saved listings
20. `020_field_agents.sql` — field-agent records
21. `021_audit_logs.sql` — audit logs
22. `022_profile_extensions.sql` — onboarding/profile extensions
23. `023_auto_approval_setup.sql` — review metadata and legacy automation support
24. `024_enhanced_verification.sql` — seller identity evidence and status
25. `025_activity_events.sql` — dashboard activity events
26. `026_marketplace_verification_gating.sql` — seller verification gates
27. `027_reseller_marketplace_foundation.sql` — reseller marketplace support
28. `028_dashboard_operations_foundation.sql` — support, preferences, and operational metadata
29. `029_profile_contacts_and_assets.sql` — profile images, recovery contacts, and contact changes
30. `030_logistics_tracking_and_monetization.sql` — logistics tracking and monetary breakdowns
31. `031_atomic_fapshi_settlement.sql` — atomic Fapshi reconciliation with cancelled-order refund guards
32. `032_atomic_order_creation.sql` — server-authoritative atomic order creation
33. `033_atomic_payment_intents.sql` — authoritative payment intent, provider checkout, and escrow release operations
34. `034_auth_proof_hardening.sql` — operation-bound, atomically consumed authentication proofs
35. `035_order_inventory_and_quote_guards.sql` — idempotent orders, guarded quotes, and stock settlement
36. `036_atomic_logistics_transitions.sql` — atomic shipment, GPS/history, and order transitions
37. `037_core_rls_lockdown.sql` — forced RLS and service-role-only application tables
38. `038_uuid_generation_compatibility.sql` — UUID resolution for restricted payment, order, and logistics RPCs

Migration files are ordered dependencies, not optional feature flags. Record the applied version per environment.

## Upgrade prerequisites for migrations 033-038

- Before 031, reconcile duplicate non-null `payments.transaction_ref` values (`MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`), duplicate `commissions.order_id` rows (`MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`), and duplicate `logistics.order_id` rows (`MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED`). The migration deliberately fails before creating its unique indexes.
- Before 033, reconcile legacy duplicate `payments.order_id` rows; its unique index deliberately fails closed. Migrations 031/033 use order-before-payment locking. Cancellation or late provider success marks affected funds `reconciliation_required`/refund-required and cancels commission rather than reopening the order. Escrow release is service-role mediated, admin-authorized, and limited to delivered/completed orders.
- Migration 034 invalidates existing unbound verification/reset credentials. Reissue those proofs rather than attempting to reuse them.
- Before relying on 035, audit legacy listing stock and order reservations, especially cancelled orders whose stock-restoration history is uncertain. Resolve any `MIGRATION_035_STOCK_RECONCILIATION_REQUIRED` failure before retrying.
- Migration 036 adds no columns and depends on the logistics/truck/position fields from 030 plus the order guards from 035. Before applying it, normalize unknown historical shipment statuses. It fails with `MIGRATION_036_LOGISTICS_STATUS_RECONCILIATION_REQUIRED`; historical invalid GPS rows do not block installation because the coordinate constraint is initially `NOT VALID`. Its service-role-only `transition_logistics_shipment` RPC applies shipment, GPS/history, and related order changes atomically.
- Migration 037 forces RLS and revokes table privileges from `PUBLIC`, `anon`, and `authenticated`. Configure `SUPABASE_SERVICE_ROLE_KEY` in every API environment; no anonymous-key fallback is supported.
- Migration 038 must follow 031, 035, and 036. It repairs already-installed restricted RPCs when Supabase keeps `uuid-ossp` outside the `public` search path.

## Administrator bootstrap

The optional `seeds/001_seed_admin.sql` file contains no administrator email, password, phone, route key, or reusable hash. It reads two private PostgreSQL session settings and aborts when either is missing.

In a private, one-off SQL Editor query, execute an explicit transaction that sets:

- `agriculnet.seed_admin_email` to the private administrator email;
- `agriculnet.seed_admin_password_hash` to a locally generated bcrypt hash.

Then execute the seed's `DO` block in that same transaction and discard the query. Never edit the tracked seed to insert the values.

Administrators sign in through `/auth/login` using Supabase Auth; no API password endpoint, hidden path, or custom administrator header is supported.

## Repository verification

```powershell
Set-Location server
node verify-db-init.js
```

The script performs read-only representative schema checks through migration 038. It reads tables/columns and the service-role OpenAPI description; it does not invoke mutating RPCs. Independently verify representative function signatures in SQL Editor:

```sql
SELECT
  to_regprocedure('public.reconcile_fapshi_payment(uuid,text,text,numeric,text,timestamptz,jsonb)') IS NOT NULL AS migration_031_rpc,
  to_regprocedure('public.get_or_create_payment_intent(uuid,uuid,uuid,numeric,text,text,jsonb)') IS NOT NULL AS migration_033_rpc,
  to_regprocedure('public.save_payment_provider_checkout(uuid,text,text,text,jsonb)') IS NOT NULL AS migration_033_checkout_rpc,
  to_regprocedure('public.release_marketplace_escrow(uuid,uuid,timestamptz)') IS NOT NULL AS migration_033_release_rpc,
  to_regprocedure('public.consume_auth_token(text,token_type,text,text,uuid)') IS NOT NULL AS migration_034_rpc,
  to_regprocedure('public.create_marketplace_order(uuid,uuid,uuid,numeric,text,boolean,numeric,text,text,text,jsonb,uuid)') IS NOT NULL AS migration_035_rpc,
  to_regprocedure('public.transition_marketplace_quote(uuid,uuid,text,text)') IS NOT NULL AS migration_035_quote_rpc,
  to_regprocedure('public.transition_logistics_shipment(uuid,text,text,text,uuid,text,text,timestamptz,jsonb,jsonb,timestamptz)') IS NOT NULL AS migration_036_rpc;
```

All values should be true. Confirm representative migration-037 controls:

```sql
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE oid IN ('public.users'::regclass, 'public.orders'::regclass,
              'public.payments'::regclass, 'public.logistics'::regclass);

SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND table_name IN ('users', 'orders', 'payments', 'logistics');
```

Every first-query row should have both RLS flags true; the second query should return no rows. These checks do not validate provider credentials, webhook authenticity, live money movement, refunds, payouts, or carrier operations.

## Fapshi prerequisites

Migrations 031 and 033 must be applied before callback reconciliation and durable payment-intent behavior are tested. The backend also requires private provider credentials, `FAPSHI_WEBHOOK_SECRET`, and a bounded `FAPSHI_REQUEST_TIMEOUT_MS` value. Keep all of them server-side.

## Troubleshooting

- Missing profile or verification fields: confirm migrations 022-024.
- Missing reseller relationships: confirm migrations 026-027.
- Missing support/preferences/contact tables: confirm migrations 028-029.
- Missing monetary/logistics fields: confirm migration 030.
- Migration-031 duplicate-reference, commission, or shipment failure: reconcile the reported legacy rows using the exact `MIGRATION_031_*_RECONCILIATION_REQUIRED` code before retrying; do not remove the guard or unique index.
- Missing `reconcile_fapshi_payment`: confirm migration 031 and refresh the Supabase API schema cache.
- Duplicate-payment failure in 033: reconcile the existing order payments before retrying.
- Invalid old verification/reset proof after 034: request a new proof.
- Stock-reconciliation failure in 035: audit order reservations and listing quantities before retrying.
- Shipment-status reconciliation failure in 036: map every historical status to a canonical value before retrying.
- Browser table access after 037: verify forced RLS, revoked grants, and that the browser is not using the service-role key.
- UUID generation failure after 035: apply migration 038; do not expose or move the managed `uuid-ossp` extension to work around the restricted function search path.
- An administrator seed that aborts is behaving safely when private session settings were not supplied in the same transaction.

## Readiness boundary

The migrations establish a prototype data model and database safeguards. They do not establish that external payments, escrow, payout, logistics, inspection, certification, or export operations are fully operational.
