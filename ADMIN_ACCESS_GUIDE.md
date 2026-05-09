# Admin Dashboard Access Guide

## URL
- Admin portal: `http://localhost:3000/admin-portal`

## Required roles
The account must have one of these roles in the `users` table:
- `admin`
- `super_admin`

## Required environment variables
In `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ADMIN_KEY=agriculnet-admin-secret-2025
```

In `server/.env`:
```env
ADMIN_ROUTE_SECRET=agriculnet-admin-secret-2025
```

## Seeded admin account
If you run `server/database/seeds/001_seed_admin.sql`, the seeded admin is:
- Email: `mbengespoir@gmail.com`
- Password: `Admin@AgriculNet2025!`
- Role: `super_admin`

## Auth status rules
- Buyers become `active` immediately after phone and email verification.
- Farmers move to `pending_review` and need manual admin approval.
- Admin accounts must already be `active` to sign in.

## Troubleshooting
- If admin login returns `Authentication failed`, confirm `NEXT_PUBLIC_ADMIN_KEY` matches `ADMIN_ROUTE_SECRET`.
- If admin login returns `Invalid credentials`, confirm the seeded email or phone matches the database row and the password hash is current.
- If admin login succeeds but `/admin/dashboard` redirects away, confirm the stored user role is `admin` or `super_admin`.
- If the backend cannot find the admin route, confirm the API is running on `http://localhost:5000` and the client uses `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`.
