# AgriculNet Database Restoration Guide

Restore into a new or explicitly approved target. Back up existing data first. This guide does not instruct operators to drop an unknown or shared schema.

## 1. Apply migrations sequentially

### Phase 1: identity

1. `001_enums_and_extensions.sql`
2. `002_users_table.sql`
3. `003_farmer_profiles.sql`
4. `004_buyer_profiles.sql`
5. `005_tokens_and_otps.sql`

### Phase 2: marketplace foundations

6. `006_listings.sql`
7. `007_listing_images.sql`
8. `008_inquiries.sql`
9. `009_conversations_messages.sql`

### Phase 3: transaction records

10. `010_orders.sql`
11. `011_payments.sql`
12. `012_inspections.sql`
13. `013_logistics.sql`
14. `014_export_documents.sql`

### Phase 4: governance and engagement

15. `015_disputes.sql`
16. `016_reviews.sql`
17. `017_notifications.sql`
18. `018_commissions.sql`
19. `019_saved_listings.sql`
20. `020_field_agents.sql`
21. `021_audit_logs.sql`

### Phase 5: account and marketplace extensions

22. `022_profile_extensions.sql`
23. `023_auto_approval_setup.sql`
24. `024_enhanced_verification.sql`
25. `025_activity_events.sql`
26. `026_marketplace_verification_gating.sql`
27. `027_reseller_marketplace_foundation.sql`
28. `028_dashboard_operations_foundation.sql`
29. `029_profile_contacts_and_assets.sql`

### Phase 6: logistics and settlement safeguards

30. `030_logistics_tracking_and_monetization.sql`
31. `031_atomic_fapshi_settlement.sql`

### Phase 7: atomicity and access safeguards

32. `032_atomic_order_creation.sql`
33. `033_atomic_payment_intents.sql`
34. `034_auth_proof_hardening.sql`
35. `035_order_inventory_and_quote_guards.sql`
36. `036_atomic_logistics_transitions.sql`
37. `037_core_rls_lockdown.sql`
38. `038_uuid_generation_compatibility.sql`

When restoring existing data rather than an empty target, migration 031 requires unique non-null payment references and one commission and logistics row per order. Resolve `MIGRATION_031_DUPLICATE_PAYMENT_REFERENCE_RECONCILIATION_REQUIRED`, `MIGRATION_031_DUPLICATE_COMMISSION_RECONCILIATION_REQUIRED`, or `MIGRATION_031_DUPLICATE_SHIPMENT_RECONCILIATION_REQUIRED` before retrying. Then reconcile duplicate order payments for 033, reissue proofs after 034, audit legacy stock for 035, and normalize shipment statuses for 036. Migration 037 requires `SUPABASE_SERVICE_ROLE_KEY` in every API environment, and migration 038 repairs UUID resolution for the restricted RPCs.

## 2. Apply optional seeds

Use region/crop/demo seeds only when the target is intended to contain demonstration data. The administrator seed requires private session settings in the same explicit transaction and contains no tracked identifier or reusable hash.

Do not restore historical administrator credentials from documentation, Git history, screenshots, or old environment files. Provision a new unique credential and rotate any value that may have been exposed.

## 3. Verify

```powershell
Set-Location server
node verify-db-init.js
```

Run the read-only RPC-signature and RLS checks from `MIGRATION_GUIDE.md`, then verify the hosting environment contains `SUPABASE_SERVICE_ROLE_KEY`, `FAPSHI_WEBHOOK_SECRET`, and `FAPSHI_REQUEST_TIMEOUT_MS` before sandbox callback tests.

## 4. Smoke test

- API health
- disposable registration and verification
- canonical Supabase login at `/auth/login`
- administrator role authorization
- representative profile/dashboard reads
- authenticated webhook rejection and sandbox reconciliation tests

## Scope warning

A successful restoration reconstructs the prototype schema. It does not demonstrate live funds movement, settlement, payout, physical logistics, inspection/certification, export completion, or marketplace impact.
