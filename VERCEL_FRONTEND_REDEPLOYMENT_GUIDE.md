# AgriculNet Vercel Frontend Clean Redeployment

This guide rebuilds the frontend configuration while keeping the working
Railway backend and the production domain `https://agriculnet.farm`.

## Production connection contract

```text
Browser -> https://agriculnet.farm/api/v1/*
        -> Vercel external rewrite
        -> https://cash-crop-app-production-9f79.up.railway.app/api/v1/*
```

The rewrite lives in `client/next.config.js`. Because `agriculnet.farm` is
attached to Vercel, DNS cannot route only the `/api` path to Railway. Vercel
must proxy that path.

## Required Vercel variables

In **Vercel > Project > Settings > Environment Variables**, delete obsolete
user-defined values and create these for **Production**:

```env
API_PROXY_TARGET=https://cash-crop-app-production-9f79.up.railway.app
NEXT_PUBLIC_API_URL=https://agriculnet.farm/api/v1
NEXT_PUBLIC_APP_URL=https://agriculnet.farm
NEXT_PUBLIC_SITE_URL=https://agriculnet.farm
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_LEGACY_ANON_KEY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=YOUR_UNSIGNED_UPLOAD_PRESET
```

Use the real project URL and browser-safe publishable or legacy anon key from
**Supabase > Project Settings > API**. Use the cloud name and an unsigned upload
preset from Cloudinary.

`API_PROXY_TARGET` is read by Next.js while building the rewrite. It is not a
secret. Every `NEXT_PUBLIC_*` value is exposed to browsers by design.

Never add these backend-only values to Vercel:

- `SUPABASE_SERVICE_ROLE_KEY`
- administrator credentials or password hashes
- JWT secrets
- Resend, SMTP, SMS, Twilio, WhatsApp, or AI provider secrets
- Fapshi API keys or webhook secrets

## Recommended clean reset inside the existing Vercel project

This preserves the Git connection and avoids disconnecting the custom domain.

1. Confirm Railway is healthy:
   `https://cash-crop-app-production-9f79.up.railway.app/api/health`.
2. Push the current repository changes so Vercel can build the API rewrite.
3. Open **Vercel > Project > Settings > Environment Variables**.
4. Record the current real Supabase and Cloudinary public values.
5. Delete the old user-defined frontend variables. Do not delete Vercel's
   automatically supplied system variables.
6. Add the eight variables in the matrix above and select **Production**.
   Add them to **Preview** only if preview deployments should use this backend.
7. Under **Settings > Build and Deployment**, configure:
   - Framework Preset: **Next.js**
   - Root Directory: `client`
   - Install Command: leave at the detected default
   - Build Command: `npm run build`
   - Output Directory: leave empty
8. Under **Settings > Domains**, keep `agriculnet.farm` as the production
   domain. Redirect `www.agriculnet.farm` to it if the `www` host is enabled.
9. Open **Deployments**, choose the latest production deployment, select
   **Redeploy**, and disable the build cache for this clean rebuild.
10. Wait for the production deployment to become Ready before testing.

Changing a `NEXT_PUBLIC_*` value requires a new frontend build. Restarting an
old deployment without rebuilding will continue using the values embedded in
that old build.

## Full new-project rebuild

Use this only if the Vercel project itself must be recreated.

1. Do not delete the old project first. Keep it online while preparing the new
   project.
2. Import the GitHub repository into a new Vercel project.
3. Set Root Directory to `client`, use the Next.js preset, and add the eight
   production variables above.
4. Deploy and test the new project's generated `vercel.app` URL.
5. Remove `agriculnet.farm` from the old project's Domains settings, then add
   it immediately to the new project. A short interruption is possible.
6. Make `agriculnet.farm` the production domain and verify it.
7. Delete the old Vercel project only after the custom domain and API proxy pass
   the smoke tests below.

Deleting the old project before validating the new one creates unnecessary
downtime and can temporarily detach the custom domain.

## Supabase Auth production URL configuration

In **Supabase > Authentication > URL Configuration**, set:

```text
Site URL
https://agriculnet.farm

Redirect URLs
https://agriculnet.farm/oauth/callback
https://agriculnet.farm/reset-password
```

Keep `http://localhost:3000/**` only if local authentication is needed. Add a
Vercel preview wildcard only when preview authentication is intentionally
supported. Exact production redirect paths are preferred.

## Railway cross-check

The backend service must keep these values:

```env
CLIENT_URL=https://agriculnet.farm
BASE_URL=https://cash-crop-app-production-9f79.up.railway.app
```

Do not add a Railway `PORT` variable; Railway injects it. If either value above
changes, deploy Railway's staged changes.

## Smoke test after redeployment

Open these URLs in order:

```text
https://cash-crop-app-production-9f79.up.railway.app/api/health
https://agriculnet.farm/
https://agriculnet.farm/api
https://agriculnet.farm/api/health
https://agriculnet.farm/api/v1
```

The final three URLs must return Railway JSON through Vercel while the browser
address remains on `agriculnet.farm`.

Then open browser developer tools and verify:

1. Application requests start with
   `https://agriculnet.farm/api/v1`.
2. No request targets `localhost:5000`, an old `vercel.app` domain, or an old
   Render host.
3. API responses are not blocked by CORS.
4. Sign-in, session refresh, OAuth callback, password reset, one authenticated
   dashboard request, and one image upload behave as expected.

If the direct Railway health URL works but
`https://agriculnet.farm/api/health` does not, the deployed frontend does not
yet contain the rewrite or `API_PROXY_TARGET` was not present at build time.
If the proxied health route works but application calls still target another
host, correct `NEXT_PUBLIC_API_URL` and perform another production rebuild.
