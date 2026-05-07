# Step-By-Step Supabase Setup

## 1. Open Supabase
1. Go to `https://app.supabase.com`
2. Open your AgriculNet project
3. Open `SQL Editor`

## 2. Run the auth migrations
Create a new query for each file and run them in this order:
1. `001_enums_and_extensions.sql`
2. `002_users_table.sql`
3. `003_farmer_profiles.sql`
4. `004_buyer_profiles.sql`
5. `005_tokens_and_otps.sql`
6. `021_audit_logs.sql`
7. `022_profile_extensions.sql`
8. `023_auto_approval_setup.sql`
9. `024_enhanced_verification.sql`
10. `025_activity_events.sql`

## 3. Run seeds
Run `001_seed_admin.sql` if you need the default admin login.

Run `002_seed_regions.sql` and `003_seed_crops.sql` only if you want local marketplace data.

## 4. Verify from the repo
```bash
cd server
node verify-db-init.js
```

## 5. Start the app
```bash
cd server && npm run dev
cd client && npm run dev
```

## 6. Test the auth flows
- Frontend: `http://localhost:3000`
- Farmer register: `http://localhost:3000/register/farmer`
- Buyer register: `http://localhost:3000/register/buyer`
- Admin portal: `http://localhost:3000/admin-portal`

## Expected behavior
- Buyers become active after phone and email verification.
- Farmers become pending identity verification after phone and email verification.
- Farmers become pending review after identity evidence is submitted.
- Seeded admin login must use your private admin email and password.
