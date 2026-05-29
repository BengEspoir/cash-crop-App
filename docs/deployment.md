# AgriculNet Deployment Guide

## Frontend freeze recovery

The frontend should now run with dictionary-based localization only.

1. Keep supported locales to `en` and `fr`.
2. Do not use any DOM-wide translation observer or phrase rewriter.
3. If a browser previously saved `agriculnet_locale_v1=es`, the app should fall back to `en`.
4. Validate these routes locally after restart:
   - `/`
   - `/sign-in`
   - `/browse`
   - `/buyer/dashboard`
   - `/farmer/dashboard`
   - `/admin/dashboard`

Success criteria:
- scrolling stays responsive
- route navigation renders the target page
- refreshing the page does not hang the browser

## Railway backend cutover

This project keeps:
- frontend on Vercel
- backend on Railway
- database and storage on Supabase

### 1. Create the Railway service

1. Create a new Railway project.
2. Add an empty service or connect the GitHub repository.
3. Set the service root directory to `server`.
4. Set the start command to `npm start`.
5. Confirm the backend health route is `/api/health`.

### 2. Configure Railway environment variables

Copy the production values from `server/.env` into Railway.

Required production variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_USER`
- `SMTP_PASS`
- `AT_API_KEY`
- `AT_USERNAME`

Also set these app variables:
- `PORT=5000`
- `NODE_ENV=production`
- `CLIENT_URL=https://<your-vercel-frontend-domain>`
- `BASE_URL=https://<your-railway-public-domain>`
- `EMAIL_VERIFY_URL=https://<your-vercel-frontend-domain>/verify-email`
- `PASSWORD_RESET_URL=https://<your-vercel-frontend-domain>/reset-password`
- `ADMIN_ROUTE_SECRET=<same-admin-secret>`
- `SUPABASE_VERIFICATION_BUCKET=farmer-verifications`
- `SUPABASE_ASSETS_BUCKET=agriculnet-assets`

Set any other existing email, SMS, Cloudinary, and admin variables your current backend already depends on.

### 3. Deploy and verify Railway

1. Trigger the Railway deployment.
2. Open the generated Railway public domain.
3. Verify:

```text
https://<railway-domain>/api/health
```

Expected result: JSON success response from the AgriculNet API.

If Railway fails to boot, first check:
- missing production env vars
- wrong root directory
- wrong start command
- CORS mismatch on `CLIENT_URL`

### 4. Point Vercel frontend to Railway

In the Vercel project settings, update:

```text
NEXT_PUBLIC_API_URL=https://<railway-domain>/api/v1
```

Redeploy the Vercel frontend after saving the variable.

### 5. Post-cutover smoke test

After the Vercel redeploy, test:

1. open the home page and `/sign-in`
2. sign in with an existing account
3. open one buyer, farmer, and admin dashboard route
4. verify one authenticated API-backed list loads
5. verify one upload-backed flow if it is part of the presentation

Minimum backend checks:
- sign-in request reaches Railway
- dashboard data loads from Railway
- support routes respond
- uploads still write to Supabase storage

## Rollback

If Railway is not stable before the presentation:

1. restore `NEXT_PUBLIC_API_URL` in Vercel to the previous Render backend URL
2. redeploy the Vercel frontend
3. confirm `/api/health` on the Render backend
4. retest sign-in and one dashboard route

## Notes

- Railway public domain is enough for the presentation; do not move a custom backend domain in this pass.
- The backend currently enforces strict production env validation through `server/src/config/env.js`, so missing provider credentials will prevent boot.
