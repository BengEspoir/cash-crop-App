# AgriculNet Marketplace Supabase Guide

## Execution Order

Run migrations in `server/database/migrations` in numeric order. For this marketplace batch, the required new file is:

1. `026_marketplace_verification_gating.sql`
2. `027_reseller_marketplace_foundation.sql`

Then run optional data seeds:

1. `001_seed_admin.sql`
2. `002_seed_regions.sql`
3. `003_seed_crops.sql`
4. `004_seed_marketplace_cameroon_sellers.sql`

The Cameroon marketplace seed is removable demo/investor data. It intentionally creates only unverified sellers.

## Private Verification Storage

Create a private Supabase Storage bucket named by `SUPABASE_VERIFICATION_BUCKET` in `server/.env`.

Recommended bucket settings:

- Public bucket: off
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max file size: 8 MB

Only the backend service role should upload and sign verification evidence. Do not expose National ID or selfie paths to public clients.

## RLS Recommendations

The current Express API uses the Supabase service role on the server, so API authorization must remain enforced in Express middleware and services. If tables are exposed through Supabase Data API, enable RLS before granting access.

Recommended policy shape:

- `users`: users can read their own account; admins can review all users.
- `farmer_profiles` and `reseller_profiles`: public can read non-sensitive profile fields through server APIs; only owners/admins can read verification storage paths.
- `listings`: public can read active listings; seller owners can create/update/archive their listings.
- `inquiries`: buyers and matching sellers can read their quote requests; sellers can accept or complete only when verified.
- `conversations` and `messages`: only participants can read/write.
- `orders` and `payments`: only buyer, seller, and admins can read; mutation stays server-mediated.

Never create public SELECT policies that expose `id_front_storage_path`, `id_back_storage_path`, `selfie_storage_path`, legacy ID URLs, or rejection/admin metadata.

## Verification Check

After running SQL, from `server/` run:

```powershell
node verify-db-init.js
```

Expected result: all required tables, columns, and enum values pass, including `reseller_profiles`, `users.role = reseller`, and `listings/inquiries/orders.reseller_id`.
