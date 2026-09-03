# AgriculNet — Payment Release Fix, Role-Based Access, Maintenance Controls, Database Backup/Restore & Cloudflare Bot Protection

> **Purpose**
>
> This is a **new standalone Codex CLI task**.  
> The previous UI/icon/search/AI-response refactor has already been completed.  
> Do **not** repeat or re-run that previous work unless a change in this task requires touching a related file.

## Codex CLI instruction

From the **root of the AgriculNet repository**, read this file completely and implement the requirements.

Suggested command prompt:

```text
Read docs/AGRICULNET_CODEX_SECURITY_ROLES_MAINTENANCE_PAYMENTS.md completely.
Inspect the current repository first, identify the real existing architecture and role names,
then implement every requirement carefully without breaking completed work from earlier sessions.
Fix the payment release 500 error at the root cause, correct post-login role routing and marketplace access,
add secure admin maintenance controls with backup/restore support, and implement Cloudflare bot protection
appropriately for the deployed application. Install only missing dependencies. Run relevant tests/builds,
review git diff, and provide the final implementation report requested in the document.
```

---

# 1. General Rules Before Editing

Before modifying code:

1. Inspect the repository structure.
2. Identify:
   - frontend framework and routing
   - backend framework and middleware structure
   - package manager
   - existing role constants/enums
   - authentication flow
   - post-login redirect logic
   - marketplace routes
   - admin settings implementation
   - database layer and migrations
   - payment/order/ledger architecture
   - Fapshi integration
   - audit logging
   - rate limiting/security middleware
   - deployment configuration
3. Reuse existing architecture and conventions.
4. Do not invent duplicate systems where one already exists.
5. Preserve all earlier completed UI, icon, AI rendering, and mobile-responsiveness improvements.
6. Do not make unrelated redesign changes.

---

# 2. Fix Current Payment Release 500 Error

A current console/backend failure appears similar to:

```text
Failed to load resource: the server responded with a status of 500 (Internal Server Error)

:5000/api/v1/payments/512c9fed-8966-4eac-86ce-da7218717eda/release
```

The endpoint involved is:

```text
POST/PUT/PATCH /api/v1/payments/:paymentId/release
```

Use the actual route method defined in the repository.

## 2.1 Diagnose the Root Cause

Do not hide the 500 only in the frontend.

Trace the full release flow:

```text
Frontend release action
→ API client/service
→ Express route
→ authentication middleware
→ role/permission middleware
→ controller
→ payment service
→ order/payment repository/database operation
→ ledger/settlement logic
→ Fapshi/provider integration if involved
→ state transition
→ response/error middleware
```

Check for:

- payment does not exist
- payment ID lookup failure
- malformed UUID handling
- payment/order relationship mismatch
- seller/payee record missing
- order does not exist
- payment is not in a releasable state
- payment already released
- release triggered twice
- null/undefined provider reference
- provider transaction not found
- missing environment variables
- invalid Fapshi/provider credentials
- Fapshi/provider API failure
- database constraint violation
- incorrect Supabase result handling
- transaction/rollback failure
- ledger inconsistency
- duplicate settlement attempt
- unsupported payment status
- authorization problem incorrectly converted into 500
- async error not caught
- frontend sending wrong payload or HTTP method

Find the actual cause and fix it.

---

# 3. Payment Release Must Be Safe and Idempotent

A release operation must **never settle the same payment twice**.

Protect against:

- double-click
- browser retry
- slow network
- duplicate request
- page refresh
- two admin actions occurring close together

Where the existing architecture permits:

- validate current payment state before release
- perform the status transition atomically
- use a DB transaction or equivalent safe mechanism
- use provider idempotency/reference protection when available
- disable the frontend release button while processing
- avoid duplicate ledger entries
- avoid duplicate seller settlement
- return a safe conflict/result if already completed

Do not simply change the error from 500 to 200.

---

# 4. Correct HTTP Status Codes for Payment Release

Expected business errors should not become generic HTTP 500 errors.

Use appropriate status codes such as:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
502 Bad Gateway
503 Service Unavailable
```

Examples:

```text
Payment not found                  → 404
User cannot release payment        → 403
Payment already released           → 409
Payment cannot be released yet     → 409 or 422
External provider failed           → 502
Provider temporarily unavailable   → 503
Unexpected internal exception      → 500
```

Return structured errors consistent with the existing API convention.

Example only:

```json
{
  "success": false,
  "code": "PAYMENT_ALREADY_RELEASED",
  "message": "This payment has already been released."
}
```

Do not expose:

- stack traces
- SQL errors
- service-role credentials
- API secrets
- raw provider secrets

---

# 5. Improve Frontend Payment Error Handling

The frontend must show useful feedback.

Examples:

```text
This payment has already been released.
```

```text
This payment is not yet eligible for release.
```

```text
Payment release could not be completed. Please try again or contact an administrator.
```

Requirements:

- disable action while request is in progress
- prevent duplicate submissions
- show success state after completion
- update/refetch relevant payment/order data
- do not require a full browser reload if React Query/cache invalidation can update the screen
- do not leave the UI showing a stale payment status

---

# 6. Payment Release Logging

Add or improve server-side logging around release operations.

Useful fields:

```text
request/correlation ID
payment ID
order ID
acting user ID
acting role
previous payment status
requested transition
new status
provider response category
timestamp
success/failure
```

Never log:

```text
passwords
JWT tokens
refresh tokens
service-role keys
payment secrets
full private credentials
```

---

# 7. Payment Release Regression Tests

Test at minimum:

```text
valid release
payment not found
unauthorized user
already released payment
invalid payment state
provider failure
database failure
duplicate click/request
maintenance mode enabled
page refresh after successful release
```

If automated tests already exist, extend them.

If no test harness covers this area, add targeted tests according to project conventions.

---

# 8. Correct Post-Login Role Experience

The current role experience must be corrected.

The intended product behavior is:

## 8.1 Buyers

Authenticated buyers are the primary users of the general marketplace.

Buyer roles may include:

```text
LOCAL_BUYER
INTERNATIONAL_BUYER
BUYER
```

Use the real role names in the repository.

After login, buyers may:

- land on the marketplace or buyer home
- browse/search the marketplace
- view sellers/listings
- request quotations
- message sellers
- place orders
- continue buyer-specific workflows

Do not remove normal marketplace access from buyers.

---

# 9. Farmer Post-Login Behavior

When a **farmer** is logged in:

- land directly on the farmer dashboard
- do not land on the general marketplace
- do not expose the normal buyer-style marketplace search as the main logged-in experience
- show farmer-specific operations from the dashboard
- show/manage only the farmer's own posted crops/listings in farmer listing management views
- preserve quotations, messages, orders, payments, logistics, verification, notifications, profile, etc. as applicable

Farmers may still view the public/general marketplace when **logged out**, just like normal visitors.

Do not let a logged-in farmer manage another farmer's listing.

---

# 10. Reseller / Aggregator Post-Login Behavior

When a **reseller/aggregator** is logged in:

- land directly on the reseller dashboard
- do not land on the general marketplace
- do not expose general marketplace search as the main logged-in workflow
- manage reseller-specific listings from the dashboard
- show only their own posted listings in seller-management views
- preserve quotations, orders, messages, payments, logistics, notifications, etc.

A reseller may view the public/general marketplace when logged out.

Use the real role name(s) defined by the project.

---

# 11. Admin Post-Login Behavior

When an **administrator** logs in:

- land directly on the admin dashboard
- do not land on the general marketplace
- do not expose normal buyer-style marketplace search as the admin's main navigation
- use admin-specific screens to inspect all relevant marketplace information

The admin dashboard should provide appropriate administrative visibility over:

- users
- farmers
- resellers
- buyers
- verification
- listings
- crops
- quotations where applicable
- conversations where policy permits
- orders
- payments
- logistics
- notifications
- disputes
- support
- system/audit activity

Admin should monitor the marketplace through administrative views, not through the ordinary buyer browsing experience.

---

# 12. Do Not Only Hide Links — Protect Routes

Do not solve the role issue by simply hiding navigation links.

Implement route-level authorization/redirect logic.

If a logged-in:

```text
ADMIN
FARMER
RESELLER / AGGREGATOR
```

tries to manually navigate to the authenticated general marketplace route, redirect them to their appropriate dashboard unless the exact route is necessary for a legitimate role workflow.

Avoid:

- redirect loops
- hydration loops
- repeated router pushes
- client/server role mismatch

Public marketplace access should remain available for logged-out visitors if that is the existing intended design.

---

# 13. Centralize Role Home Routing

Avoid scattering role redirects through many unrelated components.

Reuse existing auth/role helpers if available.

Otherwise create a centralized role-to-home mapping.

Example only:

```js
const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  FARMER: "/farmer/dashboard",
  RESELLER: "/reseller/dashboard",
  LOCAL_BUYER: "/marketplace",
  INTERNATIONAL_BUYER: "/marketplace",
};
```

Use actual role names and actual route paths from the repository.

Do not invent enums that conflict with the backend.

---

# 14. Role-Based Navigation Tests

Test the following.

## Logged out visitor

```text
can access public marketplace
can browse/search if public search is intended
cannot access protected dashboards
```

## Farmer logged in

```text
lands on farmer dashboard
does not land on buyer marketplace
does not see normal marketplace as primary authenticated navigation
can view/manage own listings
cannot manage another seller's listing
```

## Reseller logged in

```text
lands on reseller dashboard
does not land on buyer marketplace
can view/manage own listings
cannot manage another reseller/farmer listing
```

## Admin logged in

```text
lands on admin dashboard
does not land on normal buyer marketplace
can monitor platform using admin screens
```

## Buyer logged in

```text
can access marketplace
can search marketplace
can continue normal transaction workflow
```

---

# 15. Add Admin "System & Maintenance" Settings Section

Create a secure section in **Admin Settings** for system-level operations.

Recommended grouping:

```text
System & Maintenance
```

It should contain:

1. Current system status
2. Maintenance message
3. Enable Maintenance Mode
4. Disable Maintenance Mode / Resume Normal Operation
5. Create Database Backup
6. View Backup Status / available backups if implemented
7. Restore Database from an approved backup

Use existing AgriculNet UI conventions and real icon-library icons.

Do not add AI-generated icons.

Possible Lucide icons, only if they exist in the installed version:

```text
Wrench
Construction
CircleAlert
Power
Database
DatabaseBackup
RefreshCw
ShieldAlert
```

Verify imports before use.

---

# 16. Maintenance Mode Must Be Persisted Centrally

Do not implement maintenance mode as local React state.

All application instances must see the same system state.

Use an appropriate centralized persistent configuration mechanism, preferably the existing database/configuration architecture.

A system-setting record may contain fields such as:

```text
maintenance_enabled
maintenance_message
maintenance_started_at
maintenance_started_by
maintenance_updated_at
```

Adapt naming and migration style to the existing database.

---

# 17. Enabling Maintenance Mode

The admin must receive a confirmation before enabling maintenance.

Example meaning:

```text
Enabling maintenance mode will temporarily pause normal platform operations for users. Continue?
```

When enabled:

- normal dashboard mutations should be blocked
- new listing creation/editing should be blocked
- order changes should be blocked
- quotation mutations should be blocked
- payment release should be blocked
- logistics mutations should be blocked
- other transaction-changing operations should be blocked

The intent is to safely pause platform operations while maintenance or restore work occurs.

---

# 18. Admin Must Never Be Locked Out of Maintenance Controls

Maintenance mode must **not** make it impossible for an admin to disable maintenance.

Keep required administrative endpoints available, including:

```text
admin login/authentication
admin maintenance settings
maintenance status endpoint
maintenance disable endpoint
health/readiness endpoint where applicable
logout
```

Do not create a situation where maintenance can only be disabled by manually editing the database.

---

# 19. Centralized Backend Maintenance Middleware

Implement maintenance enforcement centrally.

Do not manually add a check to every controller.

Create middleware/service logic that:

1. checks the centrally stored maintenance state
2. permits explicit whitelist routes
3. blocks normal operations while maintenance is enabled
4. returns a structured `503 Service Unavailable`

Example only:

```json
{
  "success": false,
  "code": "SYSTEM_MAINTENANCE",
  "message": "AgriculNet is currently under maintenance. Some functionalities may be temporarily unavailable."
}
```

The frontend should recognize this code/status and display a maintenance state instead of generic request errors.

If maintenance state is cached, use a short TTL so enabling/disabling takes effect quickly.

---

# 20. Maintenance Message on Frontend

When maintenance is active, show a clear user-facing notice.

Default message:

```text
AgriculNet is currently under maintenance. Some functionalities may be temporarily unavailable. Please try again shortly.
```

Allow an admin-customized maintenance message if appropriate.

The maintenance experience should be:

- mobile responsive
- accessible
- visually consistent
- clear
- not frightening
- not styled like a fatal system crash

For logged-in non-admin users, prefer a dedicated maintenance state/page for blocked operations instead of allowing every button to fail independently.

---

# 21. Disable Maintenance / Resume Normal Operation

Admin Settings must contain a clear action to:

```text
Resume Normal Operation
```

or:

```text
Disable Maintenance Mode
```

After disabling:

- maintenance middleware should stop blocking normal operations
- users should regain access without needing a deployment
- the status banner/page should disappear appropriately
- role routing must continue to work

Create an audit record for enable and disable events.

---

# 22. Database Backup Button

Add a database backup action to Admin Settings.

This is a high-risk administrative operation.

## 22.1 Security Rules

The frontend must **not**:

- receive database credentials
- run `pg_dump` directly
- execute shell commands
- access Supabase service-role credentials
- build raw SQL backup commands

The frontend only triggers a protected backend operation/job.

The backend must:

- verify admin authorization
- use server-side credentials only
- audit the action
- prevent unnecessary duplicate backup jobs
- return backup/job status safely

---

# 23. Choose a Real Backup Mechanism

Inspect the actual PostgreSQL/Supabase hosting and deployment environment before implementing.

Prefer provider-supported backup capabilities when they are accessible and appropriate.

If an application-managed logical backup is required, a mechanism such as:

```text
pg_dump
```

may be used **only from a secure backend/server environment** where the executable and credentials are available.

Do not assume a serverless/free hosting environment contains `pg_dump`.

If the current deployment environment cannot safely perform true automatic database backups:

- do not fake success
- implement the secure backend/job interface as far as possible
- clearly document the infrastructure requirement
- return an honest unavailable/not-configured state

---

# 24. Backup UX

Admin should be able to see useful metadata such as:

```text
backup ID
created timestamp
created by
backup type
status
size, if available
failure reason, if failed
```

Before starting:

```text
Create a new database backup now?
```

Disable the button while a backup is running.

Prevent accidental repeated creation.

---

# 25. Database Restore

Database restore is destructive and must be much more strongly protected than an ordinary settings action.

Requirements:

- admin only
- backend-only execution
- audit logged
- maintenance mode required
- selected backup clearly displayed
- destructive warning
- protection against duplicate submission
- job/progress status
- safe error handling

Prefer recent authentication/re-authentication if the existing auth architecture supports it.

---

# 26. Strong Restore Confirmation

Do not use only a simple "OK" confirmation.

Require the admin to type a confirmation phrase such as:

```text
RESTORE AGRICULNET
```

before enabling the final restore action.

Do not accept:

- arbitrary server file paths
- arbitrary SQL pasted into the browser
- arbitrary shell commands
- untrusted dump files without validation

---

# 27. Safe Restore Workflow

Recommended workflow:

```text
Admin enables maintenance
→ Admin creates or selects a known valid backup
→ Admin chooses restore
→ UI shows backup ID/date
→ Admin types destructive confirmation phrase
→ Backend validates backup
→ Restore job begins
→ Normal writes remain blocked
→ Restore completes
→ Backend performs integrity/health checks
→ Admin reviews result
→ Admin manually disables maintenance
→ System resumes normal operation
```

Do not automatically disable maintenance immediately after restore.

The admin should first see that restore/health checks completed successfully.

---

# 28. Audit All High-Risk Admin Actions

Use the project's existing audit-log architecture where possible.

Audit actions such as:

```text
MAINTENANCE_ENABLED
MAINTENANCE_DISABLED
DATABASE_BACKUP_STARTED
DATABASE_BACKUP_COMPLETED
DATABASE_BACKUP_FAILED
DATABASE_RESTORE_STARTED
DATABASE_RESTORE_COMPLETED
DATABASE_RESTORE_FAILED
```

Include appropriate metadata:

```text
admin user ID
timestamp
request/correlation ID
previous maintenance state
new maintenance state
backup ID
success/failure
```

Do not log secrets.

---

# 29. Cloudflare Bot Protection — Important Architecture Choice

The goal is to add **automatic bot/security checks when visitors access and use AgriculNet** without unnecessarily making every real visitor solve a visible CAPTCHA.

Use Cloudflare's protections in layers.

There are two distinct requirements:

## Layer A — Domain / Site-Wide Bot Protection

For broad bot protection at the Cloudflare edge, use the appropriate Cloudflare domain-level feature such as:

```text
Bot Fight Mode
```

where supported by the user's Cloudflare plan.

Cloudflare Bot Fight Mode is intended to identify and challenge known malicious bot traffic across the domain.

This is configured primarily in the **Cloudflare dashboard**, not solely in React/Node source code.

Do not pretend Codex configured the dashboard unless Cloudflare API credentials and an explicit automation path are actually available.

Codex should create deployment documentation containing the exact Cloudflare dashboard steps still required.

Important:

- test API behavior after enabling it
- bot protection should not unintentionally break legitimate API calls
- do not enable "Under Attack" style interstitial behavior globally unless specifically necessary
- preserve legitimate browser traffic

---

# 30. Cloudflare Turnstile for Sensitive Public Actions

Use **Cloudflare Turnstile** for abuse-prone public forms/actions.

Appropriate candidates include:

- login
- registration
- forgot password
- password reset/recovery request
- public support/contact forms
- other unauthenticated forms vulnerable to automated abuse

Do not force Turnstile on every internal authenticated dashboard action.

Turnstile should normally operate as a low-friction bot check and only require extra user interaction when necessary.

---

# 31. Turnstile Frontend Integration

Integrate Turnstile into the selected public forms.

Before installing a React wrapper:

1. inspect current dependencies
2. determine whether a suitable wrapper already exists
3. determine whether official widget integration is cleaner

Install only what is required.

Requirements:

- responsive on mobile
- keyboard accessible
- works with existing form validation
- clear loading/error state
- form cannot submit without a valid token when protection is required
- reset/retry behavior after failed form submission where necessary

The public site key may be exposed to the frontend.

Example environment variable:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Use existing naming conventions if different.

---

# 32. Turnstile Server-Side Verification Is Mandatory

Do **not** trust the frontend Turnstile token by itself.

For each protected action, the backend must validate the token with Cloudflare's **Siteverify** API before processing the sensitive request.

The secret must stay server-side.

Example environment variable:

```text
TURNSTILE_SECRET_KEY
```

Never expose it in:

- frontend bundle
- client env
- API response
- logs

If verification fails, reject the request with an appropriate structured error.

A frontend-only Turnstile implementation is incomplete and insecure.

---

# 33. Cloudflare Turnstile Token Handling

Treat Turnstile tokens as short-lived single-use verification artifacts.

Do not:

- store them permanently
- reuse old tokens
- log full tokens
- trust tokens from another hostname/action when the verification response does not match expectations

Where supported by the implementation, validate relevant fields from Siteverify such as:

- success
- hostname
- action
- error codes

Use the real Cloudflare response format.

---

# 34. Local Development for Turnstile

Provide a deliberate development setup.

Do not silently disable bot verification in production.

Use Cloudflare-supported testing keys or an explicit environment-controlled development mode according to current Cloudflare guidance.

Document:

```text
local environment setup
development/test behavior
production site key
production secret
allowed hostnames
```

Never commit real production secrets.

---

# 35. Content Security Policy Compatibility

Inspect whether AgriculNet has a CSP.

If Turnstile is blocked by CSP, update the CSP correctly.

Cloudflare Turnstile may require allowing:

```text
https://challenges.cloudflare.com
```

for the required script/frame directives.

Do not add broad unsafe CSP permissions such as `unsafe-inline` simply to make Turnstile work unless absolutely required and justified.

Preserve the existing security posture.

---

# 36. Cloudflare Deployment Documentation

Create a deployment document such as:

```text
docs/CLOUDFLARE_SECURITY_SETUP.md
```

It should explain what the developer/admin must configure outside the codebase.

Include:

## DNS / Proxy

- domain must be added to Cloudflare
- correct DNS records
- proxy status where appropriate
- SSL/TLS configuration appropriate for the deployment

## Bot Protection

Explain how to enable the selected bot-protection feature in the Cloudflare dashboard.

For example:

```text
Security → Settings → Bot traffic → Bot Fight Mode
```

Use current Cloudflare dashboard terminology as accurately as possible.

## Turnstile

Explain:

- create Turnstile widget
- configure AgriculNet hostname(s)
- copy site key
- copy secret key
- set deployment environment variables
- redeploy frontend/backend as necessary

## Optional Cloudflare Hardening

Document—not necessarily automatically enable—additional infrastructure protections such as:

```text
WAF custom rules
rate limiting rules
DDoS protections
Managed Challenge rules
Super Bot Fight Mode where plan supports it
```

Do not claim dashboard-level features are active unless they were actually configured.

---

# 37. Cloudflare Protection Must Not Replace Application Security

Keep and review existing application protections:

- backend authentication
- role authorization
- rate limits
- login throttling
- password-reset throttling
- AI request limits
- Joi/Zod validation
- Helmet
- strict CORS
- request-size limits
- audit logs
- private secrets
- safe error handling

Cloudflare is an additional layer.

It is not a replacement for secure backend code.

---

# 38. Maintenance Mode + Cloudflare Interaction

Do not use Cloudflare as the primary maintenance-mode system.

Maintenance mode should remain an **application-level persisted state** so that Admin Settings can control it directly.

Cloudflare can continue protecting the domain while AgriculNet is in maintenance.

Ensure:

- maintenance page can still load
- Turnstile/security scripts do not crash the maintenance page
- administrators can still authenticate and disable maintenance
- backup/restore endpoints remain restricted to admin
- public users receive the maintenance message clearly

---

# 39. Mobile Friendliness Must Be Preserved

All new UI must be mobile friendly.

Check at least:

```text
320px
360px
375px
390px
414px
768px
1024px+
```

Specifically test:

- Admin Settings system/maintenance cards
- maintenance confirmation dialog
- backup list/status
- restore confirmation UI
- long maintenance message
- Turnstile widget
- login form with Turnstile
- registration with Turnstile
- role redirects on mobile
- payment release action on mobile admin screens

Do not introduce horizontal overflow.

---

# 40. Admin Settings Safety UX

High-risk actions must be visually separated from ordinary preferences.

Use a section such as:

```text
System & Maintenance
```

and, where appropriate:

```text
Danger Zone
```

Use clear labels.

Avoid ambiguous buttons such as:

```text
Run
Do It
Reset
```

Prefer:

```text
Enable Maintenance Mode
Resume Normal Operation
Create Database Backup
Restore Database
```

Restore must have the strongest warning.

---

# 41. Required End-to-End Test Matrix

After implementation, test these scenarios.

## Payment

```text
valid release
already released
unauthorized release
invalid payment
provider error
duplicate request
maintenance blocks release
```

## Farmer

```text
login → farmer dashboard
cannot use normal authenticated buyer marketplace route
can manage own listings
```

## Reseller

```text
login → reseller dashboard
cannot use normal authenticated buyer marketplace route
can manage own listings
```

## Admin

```text
login → admin dashboard
normal marketplace not primary logged-in route
can enable maintenance
can disable maintenance
can trigger backup
restore requires maintenance
```

## Buyer

```text
login → buyer/marketplace experience
marketplace remains accessible
search remains functional
```

## Visitor

```text
logged out → public marketplace available where intended
```

## Maintenance

```text
non-admin dashboard writes blocked
structured 503 returned
maintenance UI displayed
admin not locked out
logout works
resume operation restores functionality
```

## Turnstile

```text
valid token accepted
missing token rejected
invalid token rejected
expired/reused token handled
mobile layout works
backend verification required
```

---

# 42. Validation Commands

Inspect `package.json` and repository scripts.

Run available commands such as:

```text
lint
typecheck
test
build
```

Use the repository's actual package manager.

Also run relevant backend tests.

Do not invent scripts that do not exist.

Fix any issue introduced by this task.

Clearly separate pre-existing errors from new errors.

---

# 43. Runtime / Console Verification

Run the application locally where practical.

Verify that the original error:

```text
/api/v1/payments/:id/release → 500
```

is resolved for the relevant valid workflow.

Inspect:

- frontend browser console
- frontend network requests
- backend logs

Look for:

- uncaught exceptions
- React errors
- invalid redirects
- 401/403 loops
- maintenance redirect loops
- missing Turnstile scripts
- CSP violations
- duplicate requests
- broken admin settings
- stale query/cache state

---

# 44. Git Diff Review

Before completing:

```bash
git diff
```

Review all changes.

Look specifically for:

- accidental removal of previous completed UI work
- incorrect role names
- overly permissive admin routes
- buyer access accidentally blocked
- maintenance middleware blocking its own disable endpoint
- secrets added to source control
- database credentials exposed client-side
- restore endpoint accepting arbitrary input
- backup reporting success when none occurred
- Turnstile implemented only client-side
- Cloudflare dashboard configuration falsely claimed as completed
- payment release still non-idempotent
- duplicate settlement risk
- mobile regressions

Fix problems before declaring completion.

---

# 45. Final Codex Implementation Report

Return a detailed final report with these sections.

## A. Payment 500 Error

State:

- exact root cause
- files changed
- backend fix
- frontend fix
- status-code improvements
- idempotency implementation
- test results

## B. Role Routing

Provide:

```text
Role | Login destination | Marketplace access while logged in
```

Explain route guards and navigation changes.

## C. Farmer/Reseller Listing Access

Explain how each seller role now views/manages only its own listings from its dashboard.

## D. Admin Marketplace Visibility

Explain how admin now monitors all marketplace activity through admin screens instead of the normal buyer marketplace.

## E. Maintenance Mode

Explain:

- persistence model
- DB migration
- API endpoints
- middleware
- frontend behavior
- whitelist
- admin controls
- audit logs

## F. Database Backup

Explain:

- actual backup mechanism
- where it runs
- security controls
- storage/status behavior
- deployment requirements
- whether a real backup was actually tested

Do not claim a successful backup if none was executed.

## G. Database Restore

Explain:

- restore safeguards
- maintenance requirement
- confirmation mechanism
- backend mechanism
- integrity checks
- whether a real restore was actually tested

## H. Cloudflare

Explain separately:

### Code implemented

- Turnstile frontend
- Siteverify backend
- environment variables
- forms protected
- CSP changes if any

### Dashboard/deployment steps still required

- DNS/proxy
- Bot Fight Mode
- Turnstile widget creation
- keys/secrets
- optional WAF/rate limiting

Do not combine these into a false claim of completion.

## I. Security

Report any additional:

- rate-limit improvements
- authorization fixes
- audit changes
- secret-handling improvements

## J. Mobile Verification

List tested widths and UI fixes.

## K. Tests and Build

Report:

```text
frontend lint
frontend test
frontend build
backend test
backend startup/runtime test
```

Use actual commands and actual outcomes.

## L. Files Changed

List every modified/new file.

---

# 46. Success Criteria

This task is complete only when:

- the payment release 500 error is root-cause fixed
- expected payment-state errors return meaningful statuses
- release is protected against duplicate execution
- farmers land on farmer dashboard
- resellers land on reseller dashboard
- admins land on admin dashboard
- buyers retain marketplace access
- logged-in farmers/resellers/admins are not using the buyer marketplace as their normal authenticated experience
- farmer/reseller own-listing management remains functional
- admin can monitor platform activity from admin views
- maintenance mode is centrally persisted
- backend centrally enforces maintenance
- admin can always disable maintenance
- normal writes are paused during maintenance
- users see a clear maintenance message
- backup operation is protected and backend-only
- restore is strongly protected
- restore requires maintenance mode
- high-risk actions are audited
- database secrets are never exposed to frontend
- Cloudflare Turnstile is verified server-side for selected public forms
- Cloudflare domain-wide bot protection setup is documented
- Cloudflare is treated as an additional layer, not a replacement for backend security
- mobile responsiveness is preserved
- tests/build are run
- git diff is reviewed

---

# 47. Final Instruction

Do **not** merely provide recommendations.

Inspect the current AgriculNet codebase and implement the changes that are possible from source code.

For Cloudflare features that require external dashboard configuration, implement the application-side integration and create accurate deployment documentation, but clearly state which dashboard actions remain for the owner to perform.

Do not expose secrets.

Do not fake successful backups, restores, payment releases, or Cloudflare activation.

Finish by reviewing all changes and reporting the actual results.
