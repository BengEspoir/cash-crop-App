# AgriculNet Database Restoration Guide

This guide provides a comprehensive path to restoring your entire database schema and seed data on Supabase.

## ⚠️ WARNING: Clean Slate Required
If you haven't already, ensure your database is empty. You can run this script in the Supabase SQL Editor to drop everything before starting:

```sql
-- DANGER: This will drop ALL tables and types in the public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;
```

---

## Step 1: Run Migrations (Sequential Order)
Open the Supabase SQL Editor and run these files **one by one** in this exact order. Copy and paste the content of each file into a new query.

### Phase 1: Core Identity
1.  `001_enums_and_extensions.sql` (Creates all types and UUID support)
2.  `002_users_table.sql` (The central identity table)
3.  `003_farmer_profiles.sql` (Farmer-specific data)
4.  `004_buyer_profiles.sql` (Buyer-specific data)
5.  `005_tokens_and_otps.sql` (Auth tokens and SMS codes)

### Phase 2: Marketplace Infrastructure
6.  `006_listings.sql` (Crops, Regions, and Listing tables)
7.  `007_listing_images.sql` (Media for listings)
8.  `008_inquiries.sql` (Buyer expressions of interest)
9.  `009_conversations_messages.sql` (Real-time chat engine)

### Phase 3: Transactional Engine
10. `010_orders.sql` (The core transaction table)
11. `011_payments.sql` (Payment and Escrow management)
12. `012_inspections.sql` (Quality control and field checks)
13. `013_logistics.sql` (Tracking and delivery status)
14. `014_export_documents.sql` (Documentation for international trade)

### Phase 4: Operations & Governance
15. `015_disputes.sql` (Conflict resolution)
16. `016_reviews.sql` (Trust and rating system)
17. `017_notifications.sql` (System and user alerts)
18. `018_commissions.sql` (Marketplace revenue tracking)
19. `019_saved_listings.sql` (User favorites)
20. `020_field_agents.sql` (Ground operation assignments)

### Phase 5: Extensions
21. `021_audit_logs.sql` (Security and event tracking)
22. `022_profile_extensions.sql` (Additional onboarding fields)
23. `023_auto_approval_setup.sql` (Automation logic for account reviews)
24. `024_enhanced_verification.sql` (Farmer identity evidence and status)
25. `025_activity_events.sql` (Live dashboard and admin activity tracking)

---

## Step 2: Seed Initial Data
Once all migrations are complete, run the seeds to populate the platform:

1.  `001_seed_admin.sql`
    - Creates/Updates the Super Admin account.
    - **Email**: `mbengespoir@gmail.com`
    - **Phone**: `683077263`
    - **Password**: set your own private admin password before seeding production data.
2.  `002_seed_regions.sql` (Populates the 10 regions of Cameroon)
3.  `003_seed_crops.sql` (Populates the marketplace with core crops like Cocoa and Coffee)

---

## Step 3: Verification
To ensure everything is working correctly:

1.  **Verify Tables**:
    ```bash
    cd server
    node verify-db-init.js
    ```
2.  **Test Admin Login**:
    - Go to `http://localhost:3000/sign-in`
    - Log in with your private admin email and password.
3.  **Check Marketplace**:
    - Browse listings and verify that the seeded regions and crops appear in the filters.

---

## Troubleshooting
- **Foreign Key Errors**: Ensure you run the files in the numerical order provided.
- **Type Errors**: If you see "type already exists", you may have run `001` twice. Use the "Clean Slate" script above to start over.
- **Permission Errors**: Ensure your Supabase user has `postgres` or `admin` role access to create extensions and tables.
