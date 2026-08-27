# AgriculNet Backend Deployment on Render

> Legacy alternative: the repository's current deployment preset is Railway. Use [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for the active backend preset and [`WHATSAPP_RELAY_API_SETUP.md`](WHATSAPP_RELAY_API_SETUP.md) for the WhatsApp webhook configuration. Keep this document only if you intentionally choose Render instead.

This guide moves only the AgriculNet Express API from Railway to one Render Web Service. The Next.js frontend remains on Vercel at `https://agriculnet.farm`, while the existing Supabase project remains the database and file-storage provider.

> Use Render as the single backend host. First make the API work on its generated `onrender.com` address, connect Vercel to it, and test the platform. Add `api.agriculnet.farm` only after the generated address works.

The provider details in this guide were rechecked against Render's official documentation on 5 August 2026. Render currently allows new users to create Free Web Services. Confirm that **Free** appears as the selected instance before creating the service. See [Render Free services](https://render.com/docs/free).

## 1. Understand the deployment

The repository is a monorepo:

- `client/` — Next.js frontend already deployed on Vercel;
- `server/` — Express backend to deploy as a Render **Web Service**;
- `server/server.js` — backend entry point;
- `server/.env.example` — complete environment-variable inventory;
- `server/database/` — Supabase migrations and verification guidance.

The backend starts with `npm start`, reads `process.env.PORT`, and exposes `GET /api/health`. Render provides each Web Service with an HTTPS `onrender.com` address and expects the application to listen on its supplied port. See [Render Web Services](https://render.com/docs/web-services).

## 2. Know the Free-instance limits

Render Free Web Services:

- spin down after 15 minutes without inbound traffic;
- take about one minute to wake after a new request;
- receive 750 Free instance hours per workspace each month;
- use an ephemeral filesystem;
- cannot use persistent disks, shell access, one-off jobs, or multiple instances;
- cannot send outbound SMTP traffic on ports 25, 465, or 587.

The frontend's AI request timeout can expire during a cold start. Open the API health URL and wait for it to respond before an important demonstration. This is only a workaround; use a paid always-on instance when immediate availability is required.

The account-review scheduler also runs inside the Express process, so it stops while a Free service is asleep. Do not scale the application to multiple replicas later without first extracting that job, because every replica would run its own scheduler.

Use Resend's HTTP API for email rather than Gmail SMTP. Durable data and uploads remain in Supabase, not Render's local filesystem. Read the complete [Render Free limitations](https://render.com/docs/free).

## 3. Preserve the Railway configuration

Before deleting the old Railway project:

1. Copy its environment-variable names and values into a private password manager or another secure location.
2. Record the connected Supabase project URL and bucket names.
3. Record Resend, Africa's Talking, AI, Cloudinary, and Fapshi configuration that is still valid.
4. Never paste secrets into this guide, Git, screenshots, Vercel public variables, or chat messages.
5. Rotate any credential that was committed, publicly shared, or exposed. Moving an exposed value to Render does not make it safe.

No database transfer is needed if Railway used the current Supabase project. Continue using that project; do not create a Render Postgres database for this migration.

## 4. Verify and push the backend

Render deploys the selected Git branch, not uncommitted files on your computer. From PowerShell in the repository root:

```powershell
Set-Location C:\path\to\cash-crop-App
npm --prefix server ci
npm run verify:server
git status
```

Review all changes, commit only the intended work, and confirm no local `.env` file or credential is staged:

```powershell
git diff --cached
git push origin main
```

Replace `main` if a different tested branch will be deployed. Fix verification failures before hosting that commit.

## 5. Verify the existing Supabase project

This is a hosting migration, not a database migration. Do **not** rerun every SQL file blindly against an existing database.

1. Confirm the original Supabase project is active.
2. Confirm the private `farmer-verifications` bucket and the `agriculnet-assets` bucket exist. Create the private verification bucket manually if it is absent.
3. Compare the applied schema with `server/database/MIGRATION_GUIDE.md`.
4. Apply only missing migrations, in numeric order from 001 through 040.
5. Follow the reconciliation prerequisites for migrations 031 and 033–038 before applying them.
6. Follow `WHATSAPP_RELAY_API_SETUP.md` before applying migration 040 or enabling the relay.
7. With the real Supabase values in the ignored `server/.env`, run the read-only checker:

```powershell
Set-Location server
node verify-db-init.js
```

Migration 037 requires the service-role key. The API intentionally does not fall back to the anonymous key.

## 6. Create the Render Web Service

1. Sign in at [dashboard.render.com](https://dashboard.render.com/).
2. Select **New + > Web Service**.
3. Choose the Git provider containing AgriculNet and authorize access to the repository.
4. Select the repository and tested branch, normally `main`.
5. Enter the following configuration:

| Setting | AgriculNet value |
| --- | --- |
| Name | `agriculnet-api` or another available name |
| Region | The closest available region to the users and Supabase project |
| Branch | Tested deployment branch, normally `main` |
| Root Directory | `server` |
| Language | Node |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | Leave blank; use Render's default TCP probe |
| Auto-Deploy | Disable until the first deployment passes; enable afterward if desired |
| Instance Type | Free |

The Root Directory is essential. Build and start commands become relative to `server`, and changes outside it do not trigger an automatic backend deployment. See [Render monorepo root directories](https://render.com/docs/monorepo-support).

Do not add a persistent disk. AgriculNet stores durable data and uploads in Supabase.

Leave the Health Check Path blank for this deployment. Render sends HTTP health checks every few seconds, but AgriculNet's `/api/health` route currently sits behind the general API rate limiter. Configuring it as Render's HTTP probe could eventually produce `429` responses and unnecessary restarts. Render's default TCP check safely verifies that the API port accepts connections; use `/api/health` manually during smoke tests. See [Render Health Checks](https://render.com/docs/health-checks).

## 7. Configure Node and the Render port

Add this environment variable to pin the currently documented Render Node runtime:

```env
NODE_VERSION=24.14.1
```

Pinning prevents an unexpected major-version change. Recheck [Render's Node version documentation](https://render.com/docs/node-version) before deliberately changing it later.

Do **not** create a `PORT` variable. Render supplies it—currently `10000` by default—and `server/server.js` already reads `process.env.PORT`. Node's `app.listen(PORT)` accepts public traffic correctly when no host restriction is specified.

## 8. Add environment variables and secrets

During service creation, open **Advanced**, or later open the service's **Environment** page. Add real values individually or use Render's bulk `.env` editor. Store private values only in Render's environment settings. See [Render Environment Variables and Secrets](https://render.com/docs/configure-environment-variables).

### Required for production startup

| Variable | Source |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `24.14.1` |
| `SUPABASE_URL` | Existing Supabase project URL |
| `SUPABASE_ANON_KEY` | Existing Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Existing service-role key; backend only |
| `JWT_ACCESS_SECRET` | Strong independent random secret |
| `JWT_REFRESH_SECRET` | Different strong random secret |
| `RESEND_API_KEY` | Real Resend API key |
| `AT_API_KEY` | Real Africa's Talking API key |
| `AT_USERNAME` | Matching Africa's Talking username |

Generate the two JWT secrets separately in PowerShell:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(64)).ToLower()
```

Run it twice and store each result immediately. Changing either JWT secret later signs existing users out.

Production startup currently requires real Resend and Africa's Talking values. Do not enter fake placeholders. If those providers are intentionally unavailable, the production validation must be changed and tested in code before deployment.

### URLs and production behavior

Replace `<render-service>` with the exact hostname Render assigns:

```env
NODE_ENV=production
API_VERSION=v1
BASE_URL=https://<render-service>.onrender.com
CLIENT_URL=https://agriculnet.farm
EMAIL_VERIFY_URL=https://agriculnet.farm/verify-email
PASSWORD_RESET_URL=https://agriculnet.farm/reset-password
EMAIL_PROVIDER=resend
EMAIL_FROM="AgriculNet <your-verified-sender@agriculnet.farm>"
SMS_PRIMARY_PROVIDER=africastalking
AT_SANDBOX=true
SUPABASE_VERIFICATION_BUCKET=farmer-verifications
SUPABASE_ASSETS_BUCKET=agriculnet-assets
ALLOW_DEV_DELIVERY_FALLBACK=false
EXPOSE_DEV_AUTH_HINTS=false
```

Important details:

- `BASE_URL` has no `/api/v1` suffix.
- `CLIENT_URL` has no path or trailing slash.
- `EMAIL_FROM` must use a sender/domain verified by Resend.
- Keep `AT_SANDBOX=true` until live SMS credentials and sender approval are ready.
- Never expose service-role, JWT, payment, email, SMS, or AI keys through a `NEXT_PUBLIC_` variable.

### Feature-specific variables

Configure only features that will be tested:

- AI assistant: add at least one real `OPENROUTER_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, or `CEREBRAS_API_KEY`. Missing providers are skipped.
- Cloudinary: add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` only if that integration is used.
- Fapshi: keep sandbox values until payment operations are validated. Set `FAPSHI_BASE_URL`, `FAPSHI_API_USER`, `FAPSHI_API_KEY`, and `FAPSHI_WEBHOOK_SECRET` together.
- WhatsApp supplier relay: follow `WHATSAPP_RELAY_API_SETUP.md`. Apply migration 040, configure the Meta system-user token, Phone Number ID, App Secret, verify token, approved Utility template, and webhook before setting `WHATSAPP_RELAY_ENABLED=true`.

When Fapshi is enabled, its webhook must send the matching secret in the `x-wh-secret` request header. Leaving every AI key empty does not stop the API, but chat returns an unavailable/not-configured response. Leaving Fapshi unconfigured keeps its callback closed.

## 9. Deploy and verify the generated domain

1. Review the service and ensure the instance type is explicitly **Free**.
2. Select **Create Web Service**.
3. Watch **Events** and **Logs** until the deployment becomes live.
4. A healthy startup should include `AgriculNet API running on port ...`.
5. Copy the exact generated hostname, for example `agriculnet-api.onrender.com`.
6. Open:

```text
https://<render-service>.onrender.com/api/health
```

Or test it in PowerShell:

```powershell
Invoke-RestMethod https://<render-service>.onrender.com/api/health
```

Do not update Vercel until the health endpoint returns successful JSON. On Free, allow about one minute for a cold start.

## 10. Point Vercel to Render

1. Open the AgriculNet project in Vercel.
2. Go to **Settings > Environment Variables**.
3. Edit or create `NEXT_PUBLIC_API_URL` for **Production**:

```text
https://<render-service>.onrender.com/api/v1
```

4. Add it to Preview only if preview deployments should use the same API.
5. Save the value.
6. Open **Deployments** and redeploy the latest production deployment, or push a new commit.

`NEXT_PUBLIC_` values are embedded into the Next.js client build. Saving the variable without creating a new Vercel deployment leaves the old Railway URL in the existing frontend bundle. See [Vercel Environment Variables](https://vercel.com/docs/environment-variables).

After redeployment, open `https://agriculnet.farm` and use the browser Network panel to confirm requests go to `onrender.com`, not Railway or `localhost:5000`.

## 11. Run post-deployment smoke tests

Test in this order with disposable data where possible:

1. Open `/`, `/browse`, and `/sign-in` on `https://agriculnet.farm`.
2. Register or sign in with a non-admin test account.
3. Refresh and confirm the session remains valid.
4. Load the appropriate buyer/farmer dashboard and a listing.
5. Test email verification/reset links and sandbox SMS delivery.
6. Open AgriculNet AI and send one harmless test question.
7. Confirm an admin can use `/auth/login` with a native Supabase session and role checks.
8. Verify an upload reaches the intended Supabase bucket.
9. Test Fapshi only in sandbox; ensure a callback with the wrong secret is rejected.
10. Review Render logs and confirm no line exposes credentials or provider bodies.

Do not use real money just to prove deployment. Live settlement, refunds, payouts, logistics, inspection, certification, and export operations require separate operational validation.

## 12. Optional: connect `api.agriculnet.farm`

Keep the working generated Render domain until this stage succeeds. The apex `agriculnet.farm` and `www` records must remain pointed to Vercel.

1. Open the Render service's **Settings > Custom Domains**.
2. Add `api.agriculnet.farm`.
3. At the DNS provider managing `agriculnet.farm`, create exactly the record Render displays. A subdomain normally uses a CNAME from `api` to the service's `onrender.com` hostname.
4. Remove only conflicting DNS records for the `api` host. Do not change the apex or `www` records used by Vercel.
5. Return to Render and select **Verify**. Wait for DNS propagation and managed TLS issuance.
6. Confirm `https://api.agriculnet.farm/api/health` works.
7. Change Render's `BASE_URL` to `https://api.agriculnet.farm` and redeploy.
8. Change Vercel's `NEXT_PUBLIC_API_URL` to `https://api.agriculnet.farm/api/v1` and redeploy the frontend.
9. If Fapshi is enabled, confirm its callback is:

```text
https://api.agriculnet.farm/api/webhooks/fapshi
```

Keep the generated Render subdomain enabled until the custom domain is stable. Render automatically manages TLS certificates after validation. See [Render Custom Domains](https://render.com/docs/custom-domains).

## 13. Troubleshooting

### Build cannot find `package.json`

Set Root Directory to `server`. Use Build Command `npm ci --omit=dev` and Start Command `npm start`.

### Render reports no open port or returns 502

Remove a manually configured `PORT` so Render supplies it. Check startup logs for an earlier missing-environment or database error. Confirm the process reaches `AgriculNet API running on port ...`.

### Render reports missing environment variables

Read the exact names in the startup log and add real values. Production commonly fails when `RESEND_API_KEY`, `AT_API_KEY`, or `AT_USERNAME` is missing. Redeploy afterward.

### Manual health request returns 404 or 429

Use `/api/health`, not `/health` or `/api/v1/health`. The frontend API base must end in `/api/v1`. Leave Render's Health Check Path blank until the route is exempted from the general limiter in tested application code.

### Browser shows a CORS error

Set `CLIENT_URL=https://agriculnet.farm` exactly, with no trailing slash, then redeploy Render. The backend derives the matching `www` variant automatically.

### Browser still calls Railway or localhost

Correct `NEXT_PUBLIC_API_URL` in Vercel and create a new production deployment. Existing frontend builds retain the old public value.

### AI says it is temporarily unavailable

First open `/api/health`. If the Free service was asleep, wait for it to wake and retry. If health works, inspect Render logs and the configured AI keys, quotas, models, and rate limits. A healthy API and failed AI provider are separate conditions.

### Email does not send

Use `EMAIL_PROVIDER=resend`, a valid `RESEND_API_KEY`, and a verified `EMAIL_FROM`. Free Render services block common SMTP ports, so Gmail SMTP is not a reliable fallback.

### Database/table/RPC errors occur

Confirm Render uses the correct Supabase project and service-role key. Apply only missing migrations according to `server/database/MIGRATION_GUIDE.md`, then rerun `node verify-db-init.js` locally.

### Requests are slow after inactivity

That is expected when a Free instance sleeps after 15 idle minutes. Waking can take about one minute. Upgrade to an always-on instance if background jobs or immediate response times are required.

### Custom domain remains pending

Verify that `api` has the exact DNS target Render displayed and remove only conflicting `api` records. Do not point the apex domain away from Vercel.

## 14. Rollback and Railway cleanup

1. Keep the exported Railway configuration until all smoke tests pass.
2. Keep the generated `onrender.com` address active after adding the custom domain.
3. If a new Render deployment breaks the API, use Render's rollback/previous-deploy feature and rerun health and authentication tests.
4. If Railway is still available, restore its former `NEXT_PUBLIC_API_URL` in Vercel and redeploy only as a temporary rollback.
5. Delete Railway only after Render, Vercel, authentication, providers, and Supabase storage are verified.
6. Revoke obsolete Railway tokens and replace Railway webhook URLs after cutover.

## Final go-live checklist

- [ ] Tested server commit pushed to the selected Git branch
- [ ] Render Root Directory is `server`
- [ ] Build Command is `npm ci --omit=dev`; Start Command is `npm start`
- [ ] Free instance is explicitly selected
- [ ] Health Check Path is blank so Render uses its default TCP probe
- [ ] Manual `GET /api/health` responds successfully
- [ ] `PORT` is not manually configured
- [ ] All boot-required secrets contain real values
- [ ] `CLIENT_URL` is `https://agriculnet.farm`
- [ ] Generated Render health URL responds successfully
- [ ] Vercel `NEXT_PUBLIC_API_URL` ends in `/api/v1`
- [ ] Vercel was redeployed after changing the public API URL
- [ ] Supabase migrations and buckets were verified without recreating data blindly
- [ ] WhatsApp migration 040 and API setup were completed before enabling the relay
- [ ] Authentication, dashboards, email/SMS, uploads, and AI were smoke-tested
- [ ] Fapshi remains in sandbox unless live operations are separately ready
- [ ] Free sleep behavior is acceptable, or the service was upgraded
- [ ] Railway remains available until the Render cutover is proven

## Readiness boundary

AgriculNet remains a prototype. A successful Render deployment proves that the API is hosted and reachable; it does not prove live payment settlement, refunds, payouts, physical logistics, inspection, certification, exports, or measured economic impact.
