# AgriculNet WhatsApp Relay and Supabase Realtime Setup

This guide explains how to obtain and configure every external value used by the new privacy-protected supplier messaging relay.

The intended deployment is:

- Next.js frontend: Vercel, rooted at `client/`;
- Express API and WhatsApp webhook: Railway, rooted at `/server`;
- database, authentication, storage, and message Realtime: Supabase;
- supplier message delivery: Meta WhatsApp Cloud API.

Do not put WhatsApp access tokens, Meta App Secrets, Supabase secret/service-role keys, or any other private provider credential in Vercel `NEXT_PUBLIC_*` variables. Values beginning with `NEXT_PUBLIC_` are embedded in the browser bundle.

## 1. Values required by the implementation

The authoritative template is [`server/.env.example`](server/.env.example). The WhatsApp section contains:

| Variable | Secret? | Where it belongs | Where it comes from |
| --- | --- | --- | --- |
| `WHATSAPP_RELAY_ENABLED` | No | Railway/server | Set manually to `false` during setup, then `true` after validation |
| `WHATSAPP_ACCESS_TOKEN` | **Yes** | Railway/server only | Meta system-user access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Usually treat as private configuration | Railway/server only | Meta App Dashboard, WhatsApp API Setup |
| `WHATSAPP_VERIFY_TOKEN` | **Yes** | Railway/server only and Meta webhook form | You generate this value yourself |
| `WHATSAPP_APP_SECRET` | **Yes** | Railway/server only | Meta App Dashboard, App settings, Basic |
| `WHATSAPP_API_VERSION` | No | Railway/server | A currently supported Graph API version; code currently defaults to `v23.0` |
| `WHATSAPP_INQUIRY_TEMPLATE_NAME` | No | Railway/server | Name of the approved Meta Utility template |
| `WHATSAPP_TEMPLATE_LANGUAGE_CODE` | No | Railway/server | Language approved with the template, currently `en_US` |
| `WHATSAPP_REQUEST_TIMEOUT_MS` | No | Railway/server | Local timeout setting; keep `10000` initially |

The repository deliberately does **not** contain real values. Never edit `server/.env.example` to insert real credentials. Copy it to the ignored `server/.env` for local work and add the same real values through the Railway service's **Variables** tab for deployment.

## 2. Apply the Supabase database migration first

The relay requires [`server/database/migrations/040_whatsapp_relay_and_message_realtime.sql`](server/database/migrations/040_whatsapp_relay_and_message_realtime.sql). It:

- adds delivery metadata to `messages`;
- creates the server-only `whatsapp_relay_threads` mapping;
- adds `messages` to the `supabase_realtime` publication;
- keeps WhatsApp phone-routing metadata unavailable to browser roles.

For the existing AgriculNet Supabase project:

1. Sign in to [Supabase](https://supabase.com/dashboard).
2. Open the exact project already used by AgriculNet.
3. Open **SQL Editor**.
4. Create a new query.
5. Copy the complete contents of migration `040_whatsapp_relay_and_message_realtime.sql` into the editor.
6. Review that the active project is correct.
7. Select **Run** once.
8. Record migration `040` as applied in the project's deployment notes.

Do not rerun all migrations against an existing populated project. Apply only migrations that have not already been recorded.

Use these read-only checks afterward:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'messages'
  AND column_name IN (
    'delivery_channel',
    'external_message_id',
    'external_sender_phone'
  )
ORDER BY column_name;

SELECT to_regclass('public.whatsapp_relay_threads') AS relay_table;

SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename = 'messages';
```

The expected result is three message columns, a non-null relay-table name, and one `messages` publication row. Supabase documents Postgres Changes and publication setup in its [Realtime guide](https://supabase.com/docs/guides/realtime/postgres-changes).

## 3. Confirm the existing Supabase keys

These are not new WhatsApp keys, but the Realtime client and Express API require them.

Open the Supabase project and use either the project's **Connect** dialog or **Settings > API Keys**. Supabase documents the current key types in [Understanding API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### Vercel/frontend values

Set these in Vercel under **Project > Settings > Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_LEGACY_ANON_KEY
```

The variable name remains `NEXT_PUBLIC_SUPABASE_ANON_KEY` for compatibility, but it can hold Supabase's current publishable key or the project's legacy `anon` key. It must be a low-privilege browser-safe key.

### Railway/backend values

Set these in Railway under the API service's **Variables** tab:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_LEGACY_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_OR_LEGACY_SERVICE_ROLE_KEY
```

The value assigned to `SUPABASE_SERVICE_ROLE_KEY` is backend-only and bypasses Row Level Security. Never copy it into Vercel, client environment files, browser code, screenshots, tickets, or chat messages.

After changing a `NEXT_PUBLIC_*` variable, redeploy the Vercel frontend. Existing frontend builds retain the old values.

## 4. Create the Meta developer assets

Meta's official [WhatsApp Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api) lists the required assets: a Meta Business Portfolio, a WhatsApp Business Account, a business phone number, and an access token.

1. Open [Meta for Developers](https://developers.facebook.com/apps/).
2. Sign in using the account authorized to manage the AgriculNet business.
3. Select **Create App**.
4. Choose the Business use case/type offered by the current dashboard.
5. Connect or create the AgriculNet Meta Business Portfolio.
6. Open the new app and add the **WhatsApp** product.
7. Complete **WhatsApp > API Setup** or **Getting Started**.
8. Meta will create or connect a WhatsApp Business Account (WABA).
9. Start with Meta's test phone number while validating the integration.
10. Add a real business number only when the test-number flow works end to end.

Meta requires two-factor verification when registering a Cloud API phone number. Do not use a producer's personal phone as AgriculNet's sending number. The sending number represents the platform; farmer numbers are recipients and remain hidden from buyers.

## 5. Obtain `WHATSAPP_PHONE_NUMBER_ID`

In the Meta App Dashboard:

1. Open **WhatsApp > API Setup**.
2. Locate **From** or **Phone number**.
3. Copy the displayed **Phone number ID**.
4. Do not copy the human-readable phone number itself.
5. Save the numeric ID as:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

Meta's [Phone Numbers reference](https://www.postman.com/meta/whatsapp-business-platform/folder/ypba0gk/phone-numbers) explains that `/{Phone-Number-ID}` calls use this ID.

If the dashboard does not show it, an authorized token can retrieve connected numbers:

```text
GET https://graph.facebook.com/{VERSION}/{WABA_ID}/phone_numbers
Authorization: Bearer {ACCESS_TOKEN}
```

Do not paste a real access token into a shared terminal transcript or Git-tracked file.

## 6. Obtain `WHATSAPP_ACCESS_TOKEN`

### Temporary testing token

Meta's **WhatsApp > API Setup** page provides a temporary user token. It is suitable only for the initial Meta test-number smoke test and normally expires quickly.

Set it locally or in a temporary Railway test environment as:

```env
WHATSAPP_ACCESS_TOKEN=EAAG...
```

Do not enable production relay using the temporary token.

### Production system-user token

For a durable deployment:

1. Open [Meta Business Settings](https://business.facebook.com/settings/).
2. Select the AgriculNet Business Portfolio.
3. Go to **Users > System users**.
4. Create an AgriculNet server system user with the least access needed.
5. Assign the Meta app and WhatsApp Business Account as assets.
6. Generate a token for the AgriculNet app.
7. Grant:
   - `whatsapp_business_messaging`;
   - `whatsapp_business_management`.
8. Add `business_management` only if the selected Meta workflow explicitly requires business-portfolio operations.
9. Store the token immediately in a password manager and Railway service variables.

Meta's official collection confirms that sending and management use `whatsapp_business_messaging` and `whatsapp_business_management`. It also distinguishes temporary user tokens from longer-lived system-user tokens.

If the token is rotated, update Railway's service variable and deploy the staged change. Never commit it to `server/.env.example`.

## 7. Obtain `WHATSAPP_APP_SECRET`

1. Return to [Meta for Developers](https://developers.facebook.com/apps/).
2. Open the AgriculNet app.
3. Open **App settings > Basic**.
4. Find **App secret**.
5. Select **Show**, complete Meta's security confirmation, and copy it privately.
6. Store it as:

```env
WHATSAPP_APP_SECRET=YOUR_META_APP_SECRET
```

The server uses this value to validate the `x-hub-signature-256` signature on incoming webhook POST requests. If it is wrong, authentic Meta callbacks receive HTTP `401`. Leaving it empty disables POST signature validation and is not recommended for a live relay.

## 8. Generate `WHATSAPP_VERIFY_TOKEN`

The webhook verify token is **not downloaded from Meta**. You create it, put the same value in Railway, and enter it in Meta's webhook form.

Generate a random 32-byte value in PowerShell:

```powershell
[Convert]::ToHexString(
  [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
).ToLower()
```

Store the result privately:

```env
WHATSAPP_VERIFY_TOKEN=YOUR_GENERATED_RANDOM_VALUE
```

This value must match character for character in Railway and Meta. Do not use `123456`, the app name, a password, or the App Secret as the verify token.

## 9. Select `WHATSAPP_API_VERSION`

The code currently defaults to:

```env
WHATSAPP_API_VERSION=v23.0
```

The originally proposed `v19.0` expired and should not be used. Before production activation, check Meta's current [Graph API version schedule](https://developers.facebook.com/docs/graph-api/changelog/versions), select a version supported by WhatsApp Cloud API, and test it with the AgriculNet app.

The server builds this endpoint automatically:

```text
https://graph.facebook.com/{WHATSAPP_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages
```

Do not put the full endpoint into an environment variable.

## 10. Create the inquiry message template

Business-initiated free-form WhatsApp messages are restricted outside the customer-service window. A production supplier notification should therefore use an approved template.

1. Open [WhatsApp Manager](https://business.facebook.com/wa/manage/home/).
2. Choose the AgriculNet WhatsApp Business Account.
3. Open **Account tools > Message templates**. Meta may move this label in later dashboard versions.
4. Select **Create template**.
5. Choose **Utility** if Meta accepts the buyer-inquiry use case in that category.
6. Set the name to:

```text
agriculnet_buyer_inquiry
```

7. Choose English (`en_US`) initially.
8. Use this body, preserving the variable order:

```text
📩 New Buyer Inquiry on AgriculNet
Buyer: {{1}}
Crop: {{2}}
Message: '{{3}}'
--------------------
Reply directly to this WhatsApp text to respond to the buyer. (Buyer cannot see your phone number).
AgriculNet thread: {{4}}
```

9. Enter harmless examples when Meta asks for variable samples:

| Variable | Meaning | Safe example |
| --- | --- | --- |
| `{{1}}` | Buyer display name | `Amina Buyer` |
| `{{2}}` | Crop name | `Cocoa` |
| `{{3}}` | Buyer inquiry | `Is inspection available this week?` |
| `{{4}}` | AgriculNet conversation UUID | A disposable test thread UUID |

10. Submit the template for approval.
11. Do not enable the live relay until its status is **Approved**.

Then configure:

```env
WHATSAPP_INQUIRY_TEMPLATE_NAME=agriculnet_buyer_inquiry
WHATSAPP_TEMPLATE_LANGUAGE_CODE=en_US
```

The configured name and language must exactly match the approved template. Meta's official [Templates collection](https://www.postman.com/meta/whatsapp-business-platform/folder/lczy75a/templates) contains current template operations and examples.

For a short test inside an already-open customer-service window, leaving `WHATSAPP_INQUIRY_TEMPLATE_NAME` empty makes the service send the formatted text directly. Do not depend on that mode for unsolicited production notifications.

## 11. Enter the server variables locally

From the repository root:

```powershell
Copy-Item server/.env.example server/.env
```

Open the ignored `server/.env` locally and replace only the WhatsApp placeholders:

```env
WHATSAPP_RELAY_ENABLED=false
WHATSAPP_ACCESS_TOKEN=YOUR_REAL_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_REAL_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN=YOUR_GENERATED_VERIFY_TOKEN
WHATSAPP_APP_SECRET=YOUR_REAL_META_APP_SECRET
WHATSAPP_API_VERSION=v23.0
WHATSAPP_INQUIRY_TEMPLATE_NAME=agriculnet_buyer_inquiry
WHATSAPP_TEMPLATE_LANGUAGE_CODE=en_US
WHATSAPP_REQUEST_TIMEOUT_MS=10000
```

Keep `WHATSAPP_RELAY_ENABLED=false` until the database migration, webhook verification, WABA subscription, and template approval are complete.

Before committing anything:

```powershell
git status --short
git diff -- server/.env.example
```

`server/.env` must not appear as a staged file.

## 12. Deploy and configure the API service in Railway

AgriculNet is an isolated monorepo: the frontend and backend have independent package files. Railway must therefore build the backend from `/server`, not from the repository root.

1. Open [Railway](https://railway.com/dashboard).
2. Select **New Project > Deploy from GitHub repo** and connect `BengEspoir/cash-crop-App`.
3. Open the new backend service and select **Settings**.
4. Under **Source**, set **Root Directory** to `/server`.
5. Keep Railway's default Railpack builder. Set **Start Command** to `npm start` only if Railway did not detect it from `server/package.json`.
6. Do **not** create a `PORT` variable. Railway injects `PORT`, and the Express server already listens on `process.env.PORT`.
7. Under **Deploy**, set **Healthcheck Path** to `/api/health`. Railway checks it during deployment and expects HTTP `200` before switching traffic.
8. Under **Networking**, select **Generate Domain**. Railway will create a hostname similar to `agriculnet-api-production.up.railway.app`.
9. Open the service's **Variables** tab.
10. Add every required backend value from `server/.env.example`, including the private Supabase values and all `WHATSAPP_*` values. Use **New Variable** or **RAW Editor**.
11. Start with `WHATSAPP_RELAY_ENABLED=false`.
12. Set the deployment URLs using the generated Railway domain:

```env
NODE_ENV=production
CLIENT_URL=https://agriculnet.farm
BASE_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app
```

13. Review Railway's staged changes and select **Deploy**.
14. Confirm the deployment logs show the API listening successfully.
15. Confirm this endpoint returns healthy JSON:

```text
https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/health
```

Then set this Vercel frontend variable and redeploy the frontend:

```env
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/v1
```

Do not add WhatsApp secrets to the Vercel project. The browser calls the Railway-hosted Express API; only the API contacts Meta.

## 13. Configure the Meta webhook

The implemented public route is:

```text
GET  /api/webhook/whatsapp
POST /api/webhook/whatsapp
```

For the generated Railway domain, the callback is:

```text
https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/webhook/whatsapp
```

For the custom API domain, it is:

```text
https://api.agriculnet.farm/api/webhook/whatsapp
```

Do not append `/api/v1`; the webhook intentionally lives outside the versioned authenticated API routes.

In the Meta App Dashboard:

1. Open **WhatsApp > Configuration** or the current Webhooks configuration screen.
2. Select **Edit callback URL**.
3. Paste the public HTTPS callback URL.
4. Paste the exact value used for `WHATSAPP_VERIFY_TOKEN`.
5. Select **Verify and save**.
6. Under webhook fields, subscribe to **messages**.
7. Confirm the app is subscribed to the correct WABA.

Meta requires the webhook to be publicly reachable over HTTPS with a valid certificate. Its [Webhook reference](https://www.postman.com/meta/whatsapp-business-platform/folder/vzaxn16/webhook-payload-reference) and [Webhook Subscriptions collection](https://www.postman.com/meta/whatsapp-business-platform/folder/ozgs3jn/webhook-subscriptions) describe those requirements.

If dashboard subscription is unavailable, an authorized system-user token can subscribe the app to the WABA:

```text
POST https://graph.facebook.com/{VERSION}/{WABA_ID}/subscribed_apps
Authorization: Bearer {SYSTEM_USER_ACCESS_TOKEN}
```

Use Meta's dashboard or a private API client such as Postman Vault so the token is not stored in shell history.

## 14. Verify the webhook handshake manually

This test checks only the GET verification handshake. Run it with the same token stored in Railway:

```powershell
$callback = "https://YOUR_RAILWAY_DOMAIN.up.railway.app/api/webhook/whatsapp"
$verifyToken = "YOUR_GENERATED_VERIFY_TOKEN"
$challenge = "agriculnet-test-challenge"
$uri = "$callback`?hub.mode=subscribe&hub.verify_token=$([Uri]::EscapeDataString($verifyToken))&hub.challenge=$challenge"
(Invoke-WebRequest -Uri $uri).Content
```

Expected output:

```text
agriculnet-test-challenge
```

Expected failures:

- HTTP `403`: `WHATSAPP_VERIFY_TOKEN` does not match;
- HTTP `404`: wrong path, commonly `/api/v1/webhook/whatsapp` instead of `/api/webhook/whatsapp`;
- HTTP `502` or `503`: the Railway deployment is inactive or failed startup because a required production variable is missing;
- timeout: a Railway public domain has not been generated, custom DNS is not ready, or the service failed to bind to Railway's injected `PORT`.

## 15. Test with Meta's test phone number

Before registering the production number:

1. In **WhatsApp > API Setup**, keep Meta's test sending number selected.
2. Add a phone you control as an allowed recipient.
3. Complete Meta's recipient verification.
4. Ensure the matching farmer test account stores that phone in international form, for example `+237699123456`.
5. For an initial free-form test, have that recipient send a message to the Meta test number to open a customer-service window, or use an approved template.
6. Set `WHATSAPP_RELAY_ENABLED=true` on Railway, review the staged change, and deploy it.
7. Sign in to AgriculNet using a disposable buyer account.
8. Open a crop listing and select **Message Supplier**.
9. Send a harmless test inquiry.
10. Confirm the inquiry exists immediately in the AgriculNet buyer conversation.
11. Confirm the farmer test phone receives the WhatsApp notification.
12. On WhatsApp, use **Reply** on that exact notification. Reply context helps the webhook select the correct AgriculNet thread.
13. Confirm the reply appears in the buyer's web chat without refreshing.
14. Sign in as the farmer and confirm the same conversation is visible and can be answered from the web dashboard.

The buyer must never see the farmer's phone number, and the farmer should see AgriculNet's business number rather than the buyer's phone number.

## 16. Confirm relay persistence without exposing phone data

Run these checks in Supabase SQL Editor using disposable test data:

```sql
SELECT
  conversation_id,
  farmer_user_id,
  last_outbound_message_id,
  last_outbound_at,
  last_inbound_at
FROM public.whatsapp_relay_threads
ORDER BY updated_at DESC
LIMIT 10;

SELECT
  conversation_id,
  sender_id,
  delivery_channel,
  external_message_id,
  created_at
FROM public.messages
WHERE delivery_channel = 'whatsapp'
ORDER BY created_at DESC
LIMIT 10;
```

Do not copy `normalized_phone` or `external_sender_phone` into public screenshots, bug reports, analytics, or frontend DTOs.

## 17. Activation order

Use this order to avoid losing or misrouting messages:

1. Apply migration `040`.
2. Confirm the existing Supabase keys and Realtime publication.
3. Create the Meta Business app, WABA, and test number.
4. Obtain the Phone Number ID.
5. Generate a temporary test access token.
6. Copy the Meta App Secret.
7. Generate a separate webhook verify token.
8. Add the server variables with `WHATSAPP_RELAY_ENABLED=false`.
9. Deploy the API and confirm `/api/health`.
10. Configure and verify the HTTPS callback.
11. Subscribe the app/WABA to the `messages` field.
12. Create and obtain approval for `agriculnet_buyer_inquiry`.
13. Run the Meta test-number flow.
14. Change `WHATSAPP_RELAY_ENABLED=true`.
15. Run the buyer-to-farmer-to-buyer end-to-end test.
16. Only then register and activate the production WhatsApp business number.

## 18. Troubleshooting

### Web message is saved but no WhatsApp arrives

The AgriculNet message is intentionally saved even if Meta delivery fails. Check:

- `WHATSAPP_RELAY_ENABLED` is `true`;
- the farmer account contains a valid phone number;
- the Phone Number ID is an ID, not the display number;
- the access token has not expired;
- the token has `whatsapp_business_messaging`;
- the template name and language exactly match an approved template;
- the recipient is allowed when using Meta's test number;
- Railway deployment logs contain the Meta error message.

### Meta returns template errors

Confirm:

- template status is **Approved**;
- category and language match;
- `WHATSAPP_INQUIRY_TEMPLATE_NAME` uses lowercase underscores exactly;
- the template contains four body variables in the documented order;
- message content does not violate Meta policy.

### Webhook verification returns `403`

Railway and Meta contain different `WHATSAPP_VERIFY_TOKEN` values. Copy neither from the App Secret nor the access token; generate and use one dedicated verify token.

### Webhook POST returns `401`

`WHATSAPP_APP_SECRET` does not match the Meta app signing the callback, or a non-Meta caller sent an invalid `x-hub-signature-256` header.

### Meta says the callback is unreachable

- use the Railway API hostname, not the Vercel frontend hostname;
- use HTTPS;
- use `/api/webhook/whatsapp` exactly;
- confirm **Settings > Networking** contains a generated or custom public domain;
- confirm the deployment is active and `/api/health` returns HTTP `200`;
- inspect Railway deployment logs for missing required production variables or a `PORT` binding failure.

### Inbound WhatsApp reply does not appear in chat

- subscribe the WABA to the `messages` webhook field;
- use WhatsApp's **Reply** action on the AgriculNet notification;
- confirm migration `040` added `messages` to `supabase_realtime`;
- confirm the Vercel frontend has the correct Supabase URL and browser-safe key;
- confirm the user has an active Supabase Auth session so RLS permits the Realtime event;
- inspect Railway deployment logs for `Ignored unmatched WhatsApp reply`.

When reply context is absent, the backend can only fall back to the most recent relay thread for that farmer phone within 30 days. Farmers should therefore reply to the specific notification instead of composing an unrelated new message.

### Realtime WebSocket connects but no message event arrives

Use the Supabase SQL publication check from Section 2, then verify the authenticated user can select that conversation's message rows under RLS. A connected WebSocket alone does not prove the row is authorized.

## 19. Rotation and shutdown

To stop external delivery immediately without deleting conversation history:

```env
WHATSAPP_RELAY_ENABLED=false
```

Review and deploy the Railway variable change. Web chat continues to work because messages are stored before relay delivery.

Rotate a compromised credential in this order:

1. disable the relay;
2. revoke/regenerate the credential in Meta;
3. update Railway service variables;
4. redeploy;
5. test webhook verification and one disposable thread;
6. re-enable the relay.

Changing `WHATSAPP_VERIFY_TOKEN` also requires updating and re-verifying the callback in Meta. Changing `WHATSAPP_APP_SECRET` requires a Railway variable update and deployment so signature verification continues to pass.

## 20. Final production checklist

- [ ] Migration `040` is recorded as applied.
- [ ] `messages` appears in the `supabase_realtime` publication.
- [ ] The relay table is inaccessible to browser roles.
- [ ] Vercel contains only browser-safe Supabase values.
- [ ] Railway contains all private WhatsApp and Supabase values.
- [ ] The access token is a production system-user token.
- [ ] The access token has the required WhatsApp permissions.
- [ ] `WHATSAPP_APP_SECRET` is configured.
- [ ] The verify token is independently generated and matches Meta.
- [ ] The Graph API version is currently supported.
- [ ] The inquiry template is approved and its language matches.
- [ ] The public HTTPS callback uses `/api/webhook/whatsapp` exactly.
- [ ] The WABA is subscribed to the `messages` field.
- [ ] Buyer phone details are not sent to the farmer.
- [ ] Farmer phone details are not returned to the browser.
- [ ] Web and WhatsApp replies appear in one AgriculNet conversation.
- [ ] Railway logs do not print tokens, App Secrets, or farmer phone numbers.
- [ ] `npm run verify` passes before deployment.

