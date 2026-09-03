# AgriculNet — PWA, Push Notifications, Offline Sync, Verified Farmer Badge, Profiles, Account Controls, Fees & Protected Payout Flow

> **Standalone Codex CLI task**
>
> This task begins **after the previous Codex sessions have already completed** the earlier icon/UI cleanup, AI response formatting, search separation, payment-error/role/maintenance/security work.
>
> Do not repeat previous tasks unless a change here requires touching the same code.
>
> Run Codex from the **root of the AgriculNet repository**.

## Suggested Codex CLI instruction

```text
Read docs/AGRICULNET_CODEX_PWA_VERIFICATION_PAYOUTS_PROFILES.md completely.
Inspect the current repository first and implement the requirements as a new phase without undoing earlier completed work.
Prioritize a real installable PWA at app.agriculnet.farm, browser caching, safe semi-offline farmer workflows,
Web Push notifications, verified-farmer badge usage, improved farmer-profile UX, editable user settings,
admin suspension/restoration controls, a centralized progressive transaction-fee engine,
and the protected delivery-confirmation/payout flow.
Update Terms, Privacy and related user policies to reflect the implemented behavior.
Install only missing dependencies, use existing architecture where possible, run tests/builds,
review git diff, and provide the final implementation report requested in this document.
```

---

# 1. Product Direction for This Phase

Do **not** spend this phase implementing WhatsApp notifications.

The preferred direction is now:

```text
Installable Progressive Web App
+ Web Push notifications
+ browser caching
+ safe semi-offline/offline farmer workflows
+ automatic synchronization when connectivity returns
```

AgriculNet should feel app-like on low-connectivity/mobile devices while continuing to use the existing web/full-stack architecture.

Do not create a separate native Android/iOS codebase for this task.

---

# 2. Inspect Before Editing

Before changing code, identify the real current implementation of:

- frontend framework/version
- Next.js routing model
- package manager
- existing service worker or PWA configuration
- current caching strategy
- React Query/TanStack Query configuration
- Zustand/local state persistence
- API layer
- authentication/token storage
- notification tables/services
- email/SMS notification infrastructure
- listing creation/editing flow
- farmer dashboard
- reseller dashboard
- buyer dashboard
- admin dashboard
- user settings/profile forms
- seller verification workflow
- identity-document storage
- payments / internal ledger / Fapshi integration
- order delivery states
- shipment/logistics states
- dispute workflow
- transaction-fee logic
- account-status middleware
- Terms, Privacy and other public policy pages

Reuse existing abstractions where appropriate.

Do not create duplicate systems.

---

# 3. Installable PWA at `app.agriculnet.farm`

AgriculNet should have an installable application experience available at:

```text
https://app.agriculnet.farm
```

The main public/marketing/marketplace website may continue at:

```text
https://agriculnet.farm
```

Inspect the real deployment architecture before deciding whether these are:

- two deployments of the same Next.js project
- hostname-aware routing
- public site + authenticated app deployment
- another clean architecture already present

Do not hard-code assumptions that conflict with the existing deployment.

## 3.1 PWA Requirements

Implement a valid web app manifest containing appropriate values such as:

```text
name
short_name
description
start_url
scope
display: standalone
theme_color
background_color
icons
```

Use the actual AgriculNet branding.

Provide at least appropriate install icons, including standard PWA sizes such as:

```text
192x192
512x512
```

and a maskable icon if suitable.

Do not invent a new AgriculNet logo.

Use the existing real AgriculNet logo/assets.

## 3.2 Install Experience

Provide a clean installation experience.

Where supported:

- detect installability
- show an intentional `Install AgriculNet` CTA
- use `beforeinstallprompt` only where the browser supports it
- do not aggressively prompt users immediately on first page load
- remember dismissal for a reasonable period
- provide platform-specific instructions where automatic prompting is unavailable

On mobile, the install CTA should be easy to reach but not obstruct normal workflows.

After installation, the app should launch in standalone mode and start in the authenticated AgriculNet app experience appropriate to the user's role.

## 3.3 `app.agriculnet.farm` Deployment Documentation

Create:

```text
docs/APP_SUBDOMAIN_PWA_SETUP.md
```

Document the external deployment/DNS steps required to make:

```text
app.agriculnet.farm
```

work.

Do not claim DNS or hosting was configured unless Codex actually has the credentials/tools required to configure it.

---

# 4. Choose a Maintained Service-Worker/PWA Strategy

Inspect the Next.js version and current dependencies.

If there is already a good service-worker solution, improve it.

If a dependency is required, use a currently maintained approach compatible with the repository.

For a Next.js application, consider a maintained solution such as Serwist if it is compatible with the actual project, or implement a carefully controlled custom service worker.

Do not install an abandoned package simply because it appears in an old tutorial.

Install only what is required.

---

# 5. Browser Caching Strategy

Implement caching intentionally.

Do **not** use one global `CacheFirst` strategy for everything.

Use different strategies based on resource type.

Recommended conceptual approach:

## Static immutable application assets

Examples:

```text
JS chunks
CSS
fonts
versioned assets
PWA icons
```

Use an appropriate cache-first strategy with versioning and cleanup.

## Public crop images / marketplace media

Use something like:

```text
Stale While Revalidate
```

with sensible expiration limits.

## Public marketplace GET requests

Prefer:

```text
Network First
```

or another strategy that gives fresh data when online but can display a previously loaded result when offline.

Always indicate to the user when displayed data may be cached/stale.

## Farmer's own previously loaded dashboard data

Allow safe cached read access for useful non-critical data.

Examples:

- farmer's own listings
- draft listing state
- previously loaded dashboard summary
- previously loaded order summary
- previously loaded notifications
- basic profile/farm information

Do not silently present cached data as current.

Show:

```text
Offline
Last synced ...
```

or equivalent state.

---

# 6. Data That Must NOT Be Broadly Cached

Be conservative with sensitive data.

Do not indiscriminately cache:

- passwords
- JWTs in service-worker caches
- refresh tokens
- verification ID documents
- facial/selfie verification images
- raw payment credentials
- sensitive provider responses
- admin-only private records
- database backup files
- restore data
- secrets
- private documents from signed URLs
- highly sensitive KYC payloads

Review authentication storage and service-worker cache rules so no sensitive responses are accidentally written to Cache Storage.

---

# 7. Farmer Semi-Offline / Offline Experience

Farmers should be able to return to the app in weak/no connectivity and continue useful work from where they stopped.

The priority is **semi-offline resilience**, not pretending every server feature works offline.

A farmer should be able to:

- open the installed app after it has previously been used online
- see a cached shell
- see previously loaded own-listing information
- continue an unfinished listing draft
- continue entering crop details
- preserve form progress if the connection disappears
- save a new listing as a local draft
- save edits as a local draft when appropriate
- see pending local changes
- sync safe pending changes when connectivity returns

If a form is partially completed and the app is closed/reopened, restore that local progress where safe.

---

# 8. Use IndexedDB for Structured Offline Data

For structured offline data, prefer browser storage designed for larger/structured records such as:

```text
IndexedDB
```

rather than putting everything into `localStorage`.

If useful, install a small maintained IndexedDB wrapper such as:

```text
idb
```

or another appropriate existing dependency.

Do not install a database abstraction if the project already has one.

Possible local stores:

```text
listingDrafts
profileDrafts
pendingMutations
syncMetadata
cachedOwnListings
```

Use versioned schemas/migrations if the library requires them.

---

# 9. Offline Mutation Queue — Only Queue Safe Operations

Do not queue every API mutation.

Safe candidates may include:

- saving a listing draft
- creating a listing draft that is not yet public
- editing non-critical listing fields
- saving non-sensitive profile draft changes

Be more conservative with operations that affect money, inventory ownership, disputes, or order states.

Do **not** automatically queue for later execution:

- payment initiation
- payment release
- database restore
- admin suspension
- refunds
- withdrawals
- escrow/protected-settlement release
- order acceptance if stale data could create a conflict
- dispute decisions
- verification approval

When offline, these should clearly show:

```text
Internet connection required for this action.
```

---

# 10. Sync Engine

Implement a controlled synchronization mechanism.

When connectivity returns:

1. detect online state
2. inspect pending safe mutations
3. sync them in order
4. use idempotency/client mutation IDs where appropriate
5. update local records on success
6. retain failed/conflicted records
7. show user-visible sync status

States should include:

```text
Saved offline
Pending sync
Syncing
Synced
Needs attention
Conflict
```

Do not silently discard local farmer work.

## 10.1 Background Sync

If browser Background Sync is supported and safe, use it.

However, do not rely on Background Sync as the only mechanism.

Implement a fallback such as:

- sync on app launch
- sync when `online` event fires
- sync when dashboard regains focus
- manual `Sync now` button

The app must degrade gracefully on browsers that do not support Background Sync.

---

# 11. Conflict Resolution

Offline edits can conflict with server changes.

Implement simple, understandable conflict handling.

Use server metadata such as:

```text
updated_at
version
etag
```

if available.

Do not automatically overwrite newer server data without checking.

For ordinary listing/profile drafts, show a comparison or clear choice such as:

```text
Use my offline changes
Keep server version
Review differences
```

For critical transaction records, do not offer blind overwrite.

---

# 12. Offline UX Indicators

Add a clear but subtle connectivity/sync indicator.

Examples:

```text
Offline
Back online
2 changes waiting to sync
Last synced 14:32
Syncing...
```

Do not use alarming red error banners for normal connectivity loss.

On reconnect, briefly confirm that pending changes are syncing.

---

# 13. Web Push Notifications — Replace WhatsApp Direction

The notification focus for this phase is:

```text
in-app notifications
+ Web Push notifications
```

Do not implement WhatsApp notifications in this phase.

If unfinished WhatsApp-notification UI/placeholders exist from previous plans, remove or hide them where they would mislead users.

Do not remove stable SMS/email functionality unless it conflicts with the current product requirements.

---

# 14. Web Push Architecture

Use standards-based Web Push with the service worker.

Inspect the backend architecture and install only required packages.

For Node.js, an option may be:

```text
web-push
```

if not already present and if it fits the system.

Generate/use VAPID keys through secure deployment configuration.

Never commit private VAPID keys.

Suggested environment variables:

```text
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PUBLIC_KEY
WEB_PUSH_PRIVATE_KEY
WEB_PUSH_SUBJECT
```

Adapt naming to the current configuration conventions.

---

# 15. Push Subscription Storage

Create or reuse a server-side subscription model.

A subscription should be associated with the authenticated user and device/browser where possible.

Store only what is required, such as:

```text
id
user_id
endpoint
p256dh
auth
user_agent or device label if useful
created_at
last_seen_at
revoked_at
```

Protect subscription endpoints from CSRF/authorization abuse according to the existing auth model.

Handle:

- subscription creation
- duplicate subscription
- unsubscribe
- expired subscription
- push endpoint returning 404/410
- subscription refresh/change

Remove invalid subscriptions safely.

---

# 16. Push Permission UX

Do not request notification permission immediately on the first anonymous page load.

Ask after a meaningful action/context, for example:

```text
Enable notifications for quote requests, order updates and payment status?
```

Provide:

```text
Enable notifications
Not now
```

If permission is denied, do not repeatedly harass the user.

Add notification preferences in Settings.

---

# 17. Recommended Push Events

Support useful transactional events such as:

## Sellers

- new quotation request
- buyer message
- order created/confirmed
- logistics status update
- buyer confirmed receipt
- payout released
- verification approved/rejected
- account suspended/restored

## Buyers

- quote response
- seller message
- order status update
- shipment/delivery update
- package ready/marked delivered
- dispute update
- refund/payment state update

## Admins

Use push sparingly for critical operational events, not every platform action.

Examples:

- high-priority dispute
- payment-release failure
- verification requiring urgent attention

Do not send highly sensitive personal information in notification bodies.

---

# 18. Push Notification Deep Links

When the user taps a push notification, open the relevant route.

Examples:

```text
quotation notification → quotation detail
message notification → conversation
order notification → order detail
verification notification → verification/settings
buyer receipt reminder → specific order
```

Respect role-based route access.

If the user is logged out, route through authentication and then return to the intended safe destination.

---

# 19. Notification Preferences

In user Settings, add a clear notification-preferences area.

Possible controls:

```text
Push notifications
Quotation updates
Messages
Order updates
Delivery updates
Payment/payout updates
Verification updates
Security/account updates
```

Critical security notices may not be fully suppressible if the product requires them.

Do not create meaningless preference switches that backend delivery ignores.

Frontend preferences and backend send logic must stay in sync.

---

# 20. Use the Provided Verified-Farmer Badge Asset

The project owner supplied a specific verified badge image.

Use that exact asset to visually identify verified farmers.

Recommended repository asset name:

```text
verified-farmer-badge.png
```

Recommended frontend location, adapted to the real project:

```text
client/public/brand/verified-farmer-badge.png
```

or:

```text
public/brand/verified-farmer-badge.png
```

Do not redraw it with AI.

Do not substitute it with a generic Lucide check icon.

Do not recolor it.

---

# 21. Replace Visible "Verified" Farmer Chips With the Badge Where Appropriate

On farmer identity UI, use the supplied badge next to the farmer's name instead of repeatedly displaying a visible text chip such as:

```text
Verified
Verified Farmer
```

Good badge placements:

- farmer directory cards
- public farmer profile header
- farmer name on listing cards
- seller identity block on listing detail
- quotation seller identity
- conversation header where seller identity is shown
- order seller identity where useful

Do not clutter every component with the badge.

Use it only where trust/identity matters.

## 21.1 Accessibility

Although visible text may be removed from the compact badge, keep the meaning accessible.

Example:

```jsx
<img
  src="/brand/verified-farmer-badge.png"
  alt=""
  aria-hidden="true"
/>
<span className="sr-only">Verified farmer</span>
```

or use an accessible tooltip.

Tooltip:

```text
Verified farmer
```

Never make verification status discoverable only by color.

## 21.2 Size Recommendation

Suggested approximate sizes:

```text
listing/card name: 16–18px
directory card: 18px
profile header: 22–26px
mobile profile header: 20–22px
```

Do not display the badge as a large decorative illustration.

---

# 22. Verification States

Inspect the existing verification model.

A seller/farmer should have explicit server-side verification states, for example:

```text
unverified
pending
verified
rejected
needs_update
```

Use the real existing enums if already defined.

The public badge is shown **only** when the authoritative backend verification state is verified.

Do not trust a client-side field.

Farmers must not be able to mark themselves verified from profile settings.

---

# 23. Verification Requirements — ID + Facial/Selfie Verification

The desired verified-farmer process comprises:

1. valid identity-document submission
2. facial/selfie verification step
3. admin/provider review and approval

Inspect the existing verification implementation first.

Do not build an untested home-grown biometric face-matching algorithm.

Preferred approach:

- if an existing vetted identity/KYC provider supports liveness/face matching, integrate it according to provider requirements
- otherwise implement a secure selfie/facial-evidence capture/upload step and an admin review workflow
- do not claim automatic biometric face matching/liveness if there is no real provider performing it

Verification documents and facial images are sensitive.

Store them privately.

Use signed/authorized access.

Do not place these files in public buckets or PWA caches.

---

# 24. Farmer Profile UX — Improve Information Hierarchy

Inspect the current farmer profile and improve it without redesigning the whole platform.

The farmer profile should answer these questions quickly for a buyer:

1. Who is this seller?
2. Are they verified?
3. Where are they located?
4. What do they sell?
5. How much can they supply?
6. How reliable have past transactions been?
7. How do I contact/request a quote?
8. What buyer-protection/payment rules apply?

---

# 25. Recommended Farmer Profile Layout — Desktop

## Section A — Identity Header

At the top:

```text
Farmer avatar/photo
Farmer name + verified badge inline
Farmer / cooperative / reseller role
Location
Member since
Short specialty line
```

Primary actions on the right:

```text
Message
Request Quote
```

Do not place too many actions in the header.

## Section B — Trust / Performance Strip

A compact row of metrics:

```text
Completed orders
Buyer rating
On-time delivery
Response rate/time
Verification status/badge
```

Only show metrics backed by real data.

Do not display fabricated trust scores.

## Section C — Main Content Tabs or Sections

Use:

```text
Overview
Listings
Reviews
Trade Information
```

Possible Overview content:

```text
About the farm/business
Main crops
Production/supply capacity
Location/regions served
Harvest seasons
Logistics options
Languages
```

## Section D — Listings

Use a clean listing grid/list showing the farmer's currently active crops.

## Section E — Reviews / History

Show genuine review/order-history aggregates.

Do not expose private transaction details.

## Section F — Buyer Action / Trust Sidebar

On wide desktop layouts, a sticky right-side card may contain:

```text
Request Quote
Message
Verification summary
Buyer protection note
Payment/payout rule summary
```

Keep it compact.

---

# 26. Farmer Profile Layout — Mobile

On mobile:

- identity comes first
- name + verification badge remain on one readable line where possible
- location and role appear below
- primary buttons appear immediately below identity
- trust metrics use compact cards/horizontal scroll if necessary
- tabs may be horizontally scrollable
- listings stack vertically
- avoid wide data tables

Consider a sticky bottom action bar with:

```text
Message
Request Quote
```

only if it does not interfere with browser/PWA navigation or accessibility.

---

# 27. Editable User Details in Dashboard Settings

Users should be able to edit appropriate details from their own Settings page.

Implement role-aware editable profile forms.

Possible fields:

```text
display name
phone number
preferred language
profile photo
location
region
address where appropriate
business/farm name
farm/business description
crop specialties
notification preferences
```

Use actual fields from the database.

Do not invent useless duplicate profile fields.

---

# 28. Sensitive Profile Changes

Some fields must not be freely changed without safeguards.

Examples:

```text
login email
legal name
national ID information
verification document data
verified phone number
role
account status
verification status
payout identity
```

Rules:

- role cannot be changed by ordinary user settings
- verification status cannot be changed by user
- account status cannot be changed by user
- sensitive identity changes may require re-verification
- email/phone changes should use confirmation if the current architecture supports it

If changing a verified seller's legal identity information invalidates prior verification, move the verification state to an appropriate review state instead of silently keeping the verified badge.

---

# 29. Admin Account Suspension and Restoration

Add secure account controls to the admin user-management interface.

For an eligible user account, admins should be able to:

```text
Suspend account
Restore account
```

Use the existing account-status model if one exists.

Do not delete the account when suspending it.

Recommended states may include:

```text
active
suspended
```

Reuse real existing states.

---

# 30. Suspension Flow

When admin clicks Suspend:

1. show the user identity
2. require a reason
3. require confirmation
4. persist the suspension server-side
5. create an audit log
6. invalidate/restrict sessions according to existing auth architecture
7. block subsequent protected operations

If practical, notify the affected user through in-app/push/email mechanisms.

Do not expose private admin notes unnecessarily.

---

# 31. Suspended Account Enforcement

Do not only hide the user's dashboard.

Backend account-status middleware must enforce suspension.

A suspended user should not be able to continue using an old access token for protected operations.

If the current system checks account status on each protected request, extend/reuse that.

If it does not, fix it safely.

When a suspended user attempts access:

```text
Your account has been suspended. Please contact AgriculNet support if you believe this is an error.
```

Use an appropriate HTTP code and existing API conventions.

---

# 32. Restore Account

Admin can restore a suspended account.

Requirements:

- explicit action
- audit log
- optional restore note
- account returns to active state
- user can authenticate/use permitted functions again
- do not automatically restore verification if suspension previously changed verification status for a separate compliance reason unless business rules explicitly require it

Protect against accidentally suspending/restoring the last critical super-admin account if the system has that concept.

---

# 33. Progressive Transaction Fee Engine

Inspect the current fee logic before modifying it.

Current intended baseline:

```text
minimum qualifying transaction/order amount: XAF 2,000
starting platform transaction fee: 5%
```

The requested product behavior is for the percentage to **increase gradually as the order value becomes larger**.

Do not base this directly on raw kilograms/volume.

Use the final monetary transaction/order subtotal because volume is already reflected by:

```text
unit price × quantity
```

---

# 34. Avoid Fee "Cliff" Effects — Use Marginal Progressive Tiers

Do not apply a suddenly higher percentage to the **entire** order the moment it crosses a threshold.

That creates unfair discontinuities.

Use **marginal progressive tiers**, similar to a tax-bracket calculation.

Recommended initial schedule:

| Order value band (XAF) | Marginal platform fee |
|---|---:|
| 2,000 – 50,000 | 5.00% |
| 50,001 – 250,000 | 5.25% |
| 250,001 – 1,000,000 | 5.50% |
| 1,000,001 – 5,000,000 | 5.75% |
| Above 5,000,000 | 6.00% |

Example concept:

For a XAF 300,000 order:

```text
first 50,000    × 5.00%
next 200,000    × 5.25%
remaining 50,000 × 5.50%
```

Do not simply charge 5.50% on all XAF 300,000.

This keeps the fee increase gradual and avoids threshold penalties.

Round XAF fees consistently to whole francs according to a single documented rule.

---

# 35. Centralize Fee Calculation

Implement a single authoritative backend calculation.

Possible conceptual helper:

```text
calculatePlatformFee(orderAmount)
```

Do not duplicate percentages across:

- frontend
- payment controller
- payout controller
- invoice code
- admin UI

Backend calculation is authoritative.

Frontend may use a shared mirrored config/API for display, but server must recalculate before financial state changes.

Store enough transaction detail to know:

```text
gross amount
fee rate/tier breakdown
platform fee
net seller payout
currency
calculation version
```

The calculation version is useful if fee rules change later.

---

# 36. Transaction Fee Display

Before buyer payment is initiated, clearly display applicable fees according to the real business model.

If the fee is deducted from the seller payout, show the seller in order/quote detail:

```text
Gross transaction
AgriculNet fee
Expected net payout
```

If any portion is buyer-paid, show it before buyer confirmation/payment.

Do not surprise users with undisclosed deductions after payment.

Do not alter the payer of the fee unless the current business rule explicitly requires it.

Inspect existing code to determine who currently bears the 5% fee.

---

# 37. Fee Tests

Add unit tests around boundaries:

```text
1,999
2,000
50,000
50,001
250,000
250,001
1,000,000
1,000,001
5,000,000
5,000,001
very large valid order
```

Test:

- correct marginal fee
- correct XAF rounding
- no negative values
- server refuses malformed amount
- stored fee equals final payout calculation

---

# 38. Protected Payment / Payout Model

Inspect the real payment architecture.

Do not call the system legally an "escrow" unless the payment provider/business arrangement actually supports escrow.

If AgriculNet currently uses an internal ledger/protected payment state, use accurate wording such as:

```text
protected payment
held settlement
protected payout
internal settlement hold
```

Use "escrow" in code/UI only if the underlying provider/legal arrangement truly supports it.

---

# 39. Unverified Farmers Can Trade — But Cannot Receive Automatic Payout

Desired behavior:

An unverified farmer may:

- create/use their permitted seller account according to existing listing rules
- discuss with buyers
- receive/send messages
- negotiate
- receive quotation requests
- accept/coordinate an order where allowed
- allow buyer to initiate a protected payment

However:

```text
the system must not automatically release seller payout while the farmer remains unverified
```

The payment remains held/protected in the platform's actual settlement model.

---

# 40. Verification Gate for Seller Payout

Automatic seller payout eligibility requires the farmer/seller to be fully verified.

At minimum, the verification state must represent completed:

```text
ID verification
facial/selfie verification/review
```

and whatever existing business/compliance checks are already required.

Use the authoritative backend verification state.

Never rely on the visible badge as the payout permission check.

Example conceptual rule:

```text
sellerCanReceivePayout =
    seller.verification_status === VERIFIED
    && seller.account_status === ACTIVE
```

Adapt to real enums.

---

# 41. Buyer Delivery / Collection Confirmation

When an order reaches the appropriate logistics/delivery state, show the buyer a clear confirmation action.

The current requested meaning is:

```text
Have you collected your package?
```

Preferred UX wording may be more precise:

```text
Have you received your order?
```

Buttons:

```text
Yes, I received it
Report a problem
```

Using only a bare `YES` button is too ambiguous for a financial release action.

Use clear action text.

---

# 42. When Receipt Confirmation Becomes Available

Do not show the receipt-confirmation button immediately after payment.

Only show it when the server believes the order is in an appropriate state such as:

```text
delivered
ready_for_collection
delivery_attempted / pickup-ready
```

depending on the real logistics state machine.

Inspect current order/shipment statuses.

Do not invent incompatible statuses if equivalents exist.

---

# 43. Buyer Confirmation Is a Financially Important Action

When the buyer confirms:

```text
Yes, I received it
```

show a short confirmation warning.

Example:

```text
Confirm that you received this order in acceptable condition.
This may make the seller's payout eligible for release.
```

Then persist:

```text
buyer_received_at
buyer_received_by
receipt_confirmation_status
```

or equivalent.

The endpoint must be:

- authenticated
- buyer/order-owner restricted
- idempotent
- audited
- protected from duplicate requests

---

# 44. Automatic Payout Eligibility Conditions

Do not release money only because one condition is true.

Automatic payout should require all applicable conditions.

Conceptual rule:

```text
payment is successfully funded/held
AND order belongs to this payment
AND buyer confirmed receipt
AND seller is fully verified
AND seller account is active
AND no blocking dispute exists
AND payment has not already been released/refunded
AND provider/ledger state allows release
```

Only then may the normal automatic release workflow execute.

Perform the final eligibility check on the backend immediately before release.

---

# 45. Buyer Confirms Receipt but Seller Is Not Verified

If buyer confirms delivery but seller remains unverified:

- mark buyer receipt confirmation successfully
- do not release payout automatically
- keep payment in a payout-hold state
- show the seller a clear verification requirement
- notify seller to complete verification
- expose the hold reason to admin

Seller-facing message example:

```text
Your buyer has confirmed receipt. Your payout is on hold until identity verification is completed.
```

Do not falsely show "Paid out".

---

# 46. Seller Becomes Verified After Buyer Already Confirmed Receipt

When verification later becomes approved:

- re-evaluate eligible held payments
- do not require the buyer to confirm receipt a second time
- release only payments satisfying all other rules
- use an idempotent release mechanism

This may happen through:

- a verification-approved event/service
- a background reconciliation job
- explicit payout eligibility processing

Choose the approach that matches the existing architecture.

---

# 47. Buyer Reports a Problem

Alongside receipt confirmation, provide:

```text
Report a problem
```

if the dispute system exists.

If a dispute is open:

- automatic release is blocked
- admin/support workflow handles resolution
- do not automatically release merely because logistics shows delivered

Reuse existing dispute architecture.

---

# 48. Admin Manual Payment Release

Admin should retain an authorized manual review/release capability where the current payment/provider model supports it.

However, manual release is a high-risk action.

Requirements:

- admin-only backend permission
- display seller verification status
- display buyer receipt status
- display dispute state
- display payment state
- require confirmation
- require a reason for exceptional/manual release
- audit the action
- idempotency protection
- never permit duplicate payout

## 48.1 Unverified Seller Admin Override

The project owner wants admin discretion in exceptional cases.

Do **not** let an admin override external provider KYC, legal, banking, mobile-money or identity requirements that technically/compliance-wise prohibit a payout.

If the current payment provider allows the transfer but AgriculNet's internal rule is the only blocker, an explicit exceptional override may be implemented with:

```text
reason required
strong confirmation
audit trail
visible warning
```

If provider/compliance rules prohibit payout to an unverified recipient, admin must instead be able to:

```text
continue hold
request verification
refund according to policy
resolve dispute
```

Do not fake a "release succeeded" state when no legal/provider settlement occurred.

---

# 49. Payout State Machine

Inspect the current payment states and improve them if necessary.

The UI should distinguish concepts such as:

```text
payment initiated
funded/protected
awaiting delivery
delivery confirmed
payout blocked — verification required
payout blocked — dispute
eligible for release
released
refunded
failed
```

Reuse existing states wherever possible.

Do not overload one vague `completed` state to mean both "buyer paid" and "seller received funds".

---

# 50. Admin Payment Visibility

Admin payment/order detail should show, in one compact panel:

```text
buyer payment status
order/delivery status
buyer receipt confirmation
seller verification
seller account status
open dispute
gross amount
platform fee
net seller payout
release eligibility
release history
manual override history
```

This makes manual decisions auditable.

---

# 51. Public / Farmer Verification UX

For a farmer's own dashboard, show a clear verification card when incomplete.

Example progression:

```text
1. Identity document
2. Facial/selfie verification
3. Review
4. Verified
```

Use progress/state UI.

Do not show the public verified badge until final approval.

When verified, display the supplied badge.

---

# 52. Policies and Terms Must Be Updated

Inspect the current public pages and policy files.

Update all relevant user-facing legal/product policy text so it accurately reflects the implemented system.

At minimum inspect/update:

```text
Terms of Use
Privacy Policy
Buyer Protection / Payment Policy
Seller/Farmer Verification Policy
Fees / Pricing / Payout information
Help Center FAQs where appropriate
```

Do not copy generic legal templates without adapting them.

Do not claim legal compliance that has not been verified.

Mark the content as requiring final legal/business review before commercial launch if appropriate.

---

# 53. Terms of Use — New Topics to Cover

Terms should accurately explain:

- PWA/installable app experience
- account roles
- user responsibility for device access
- offline drafts and synchronization
- stale/offline data limitations
- push notification opt-in
- seller verification requirements
- identity and facial/selfie verification
- verified-farmer badge meaning
- transaction fees
- fee calculation/disclosure
- protected payment / payout-hold model
- buyer receipt confirmation
- conditions for seller payout
- unverified-seller payout holds
- disputes/refunds
- admin manual review/release authority
- account suspension/restoration
- prohibited activity
- limitation of prototype/service availability where still relevant

Avoid claiming AgriculNet is a licensed escrow provider unless that is actually true.

---

# 54. Privacy Policy — New Topics to Cover

Privacy Policy should accurately cover:

- PWA/device storage
- service worker/cache storage
- IndexedDB/local offline drafts
- synchronization
- push subscription data
- notification permissions
- device/browser push endpoints
- identity documents
- facial/selfie verification images
- purpose of verification data
- access restrictions
- retention/deletion approach
- profile changes
- account suspension records
- transaction/payment records
- audit logs
- third-party providers actually used
- user rights/contact process according to the real product/legal context

Do not state that biometric face recognition is performed if the system only collects a selfie for human/admin review.

---

# 55. Offline Data / Shared Device Privacy

Add appropriate UX/policy warnings for users on shared/public devices.

Because farmer data can be cached locally for offline use, Settings should include a control such as:

```text
Clear offline data from this device
```

On logout:

- clear sensitive session material according to auth design
- evaluate whether user-specific offline caches should be cleared automatically or explicitly
- never leave one user's offline data visible to the next user on a shared browser

If preserving drafts after logout is considered necessary, encrypt/partition them appropriately or require explicit product decision.

Default to privacy and account isolation.

---

# 56. User Settings — Offline and Push Section

Add a Settings section such as:

```text
App & Notifications
```

Possible controls:

```text
Install AgriculNet
Push notifications
Notification categories
Offline data status
Last sync time
Sync now
Clear offline data from this device
```

Do not show `Install AgriculNet` when already installed/standalone.

---

# 57. PWA Update UX

When a new service-worker/app version is available:

- do not leave users indefinitely on stale code
- show a small update prompt
- allow `Update now`
- preserve unsynced drafts before activating the new version
- do not reload in the middle of an unsafe financial action

Avoid aggressive forced refresh loops.

---

# 58. Offline / Online Testing Matrix

Test at minimum:

```text
first visit online
install PWA
launch installed app
farmer opens own listings online
turn network offline
reload installed app
view cached own listing
start listing draft offline
close and reopen app
draft remains
restore network
pending draft syncs
failed sync remains visible
conflict scenario
logout clears/isolates cached user data
different user login cannot see previous user's offline data
```

Test at mobile widths:

```text
320
360
375
390
414
768
```

---

# 59. Push Testing Matrix

Test:

```text
permission default
permission granted
permission denied
subscribe
duplicate subscribe
unsubscribe
expired push endpoint
push received while app open
push received while app closed
notification click deep-link
logged-out notification click
wrong-role deep-link
mobile installed PWA
desktop browser
```

Do not expose sensitive transaction details in lock-screen notifications.

---

# 60. Verification Badge Testing

Test:

```text
verified farmer → badge visible
unverified farmer → no badge
pending farmer → no badge
rejected farmer → no badge
badge next to name on directory
badge next to name on profile
badge on listing seller identity
tooltip/accessibility label works
badge does not distort mobile layout
```

---

# 61. User Settings Testing

Test each role's editable profile.

Ensure users cannot edit:

```text
role
account status
verification status
admin privileges
financial settlement state
```

without the appropriate protected flow.

Test sensitive identity changes for re-verification behavior.

---

# 62. Suspension Testing

Test:

```text
admin suspends farmer
farmer's existing session becomes restricted
farmer cannot perform protected mutations
farmer sees clear suspension message
admin restores account
farmer can authenticate/use allowed features again
audit record created
non-admin cannot suspend/restore
```

---

# 63. Protected Payout Tests

At minimum test:

```text
verified seller + buyer confirms + no dispute → eligible release
unverified seller + buyer confirms → payout remains held
seller becomes verified later → held eligible payout re-evaluated
buyer has not confirmed → no automatic release
open dispute → no automatic release
payment already released → no duplicate release
suspended seller → no automatic release
admin manual review
admin exceptional override where provider allows
provider forbids payout → override cannot bypass provider
```

---

# 64. Fee Engine Tests

Verify:

- all tier boundaries
- marginal calculation
- currency rounding
- fee stored with order/payment
- net payout matches gross minus fee
- admin view displays correct breakdown
- seller sees expected payout
- no client manipulation can change server fee
- historical transactions keep their stored calculation/version if fee config changes later

---

# 65. Do Not Over-Cache Financial Data

Even if order/payment summaries are available offline, do not allow cached financial UI to look authoritative.

When offline:

```text
Payment status may be outdated. Reconnect to confirm.
```

Financial mutations require online verification.

Do not allow offline "release", "refund", "withdraw", or buyer payment.

---

# 66. Performance

The PWA/offline layer must improve resilience without making the app heavier than necessary.

Audit:

- service-worker bundle
- precache size
- large crop images
- unnecessary cached assets
- stale cache cleanup
- IndexedDB growth
- duplicate media storage

Do not precache the entire marketplace catalog.

Use bounded caches and expiration.

---

# 67. Security Review

Before completion, review:

- service-worker cache boundaries
- authentication/token handling
- offline user-data isolation
- IndexedDB privacy
- push subscription authorization
- CSRF concerns for push-subscription endpoints
- verification document privacy
- selfie/facial image privacy
- payout eligibility authorization
- admin override authorization
- account suspension middleware
- fee calculation tampering
- duplicate payout/idempotency
- XSS in push deep-link handling

Do not include secrets in the service worker.

---

# 68. Deployment Documentation

Create/update:

```text
docs/APP_SUBDOMAIN_PWA_SETUP.md
docs/WEB_PUSH_SETUP.md
```

Document:

## PWA

- `app.agriculnet.farm`
- manifest
- service worker
- icons
- HTTPS requirement
- deployment/DNS changes
- install testing

## Web Push

- VAPID generation/configuration
- environment variables
- browser support expectations
- deployment steps
- invalid subscription cleanup
- notification permission UX

Do not commit private keys.

---

# 69. Update Existing Public Mobile-App Claims

Inspect the current `/mobile` or equivalent public page.

Ensure marketing claims accurately match what is now implemented.

If the page claims:

```text
offline draft listings
push notifications
PWA install
aggressive caching
```

do not leave those as future-tense/beta claims once implemented.

Likewise, do not claim capabilities that remain incomplete.

Keep public copy truthful.

---

# 70. Final Git Diff Review

Run:

```bash
git diff
```

Review every change.

Look specifically for:

- previous finished work accidentally reverted
- PWA caching auth/KYC responses
- service worker caching secrets
- offline data leaking across users
- push permission requested too aggressively
- push subscriptions not deleted on 404/410
- visible `Verified` chips left where badge should be used
- badge shown for pending/unverified user
- verified state being trusted from frontend
- user able to edit verification/account status
- suspension only implemented in UI but not backend
- transaction fee duplicated/hard-coded in multiple places
- fee cliff rather than marginal tiers
- buyer confirmation releasing unverified seller automatically
- payout released before buyer receipt confirmation
- payout duplicated
- dispute not blocking payout
- admin override lacking audit/reason
- provider compliance bypassed
- "escrow" claims unsupported by provider/legal reality
- Terms/Privacy not updated
- mobile regressions
- build/test regressions

Fix issues before declaring completion.

---

# 71. Final Codex Report

Return a detailed report.

## A. PWA

Report:

- service-worker approach/package
- manifest implementation
- cache strategies
- install experience
- `app.agriculnet.farm` code/deployment changes
- external DNS/deployment steps still required

## B. Offline Data

Report:

- IndexedDB implementation
- data cached
- data explicitly excluded
- draft persistence
- sync queue
- conflict handling
- user-data isolation
- `Clear offline data` behavior

## C. Push Notifications

Report:

- package/API used
- VAPID config
- subscription table/model
- protected events
- deep-link behavior
- settings/preferences
- tests

## D. Verified Farmer Badge

Report:

- asset path
- all placements updated
- visible text chips replaced
- accessibility implementation

## E. Farmer Profile UX

Report:

- desktop profile improvements
- mobile profile improvements
- trust metrics shown
- actions placement
- files changed

## F. User Settings

Report:

- editable fields by role
- protected/non-editable fields
- sensitive-change/reverification behavior

## G. Admin Suspend/Restore

Report:

- backend account-status enforcement
- admin actions
- audit logging
- session behavior
- tests

## H. Verification

Report:

- current verification workflow
- ID verification
- selfie/facial verification implementation
- whether review is automated provider-based or human/admin-based
- storage/privacy safeguards

Do not claim automated biometric face matching if it was not implemented.

## I. Transaction Fee Engine

Report:

- previous implementation
- new marginal tier calculation
- fee payer
- backend authority
- stored fee breakdown
- tests at thresholds

## J. Buyer Receipt & Payout Flow

Report:

- buyer UI/action
- delivery state required
- receipt-confirmation endpoint
- payout eligibility rule
- unverified seller hold
- later verification re-evaluation
- dispute behavior
- admin override
- idempotency

## K. Policy Updates

List every policy/page updated and summarize substantive changes.

## L. Validation

Report actual:

```text
frontend lint
frontend tests
frontend production build
backend tests
backend runtime checks
PWA/installability check
offline test
push test
```

Distinguish pre-existing errors from new ones.

## M. Files Changed

List every new/modified file.

---

# 72. Success Criteria

This phase is complete only when:

- WhatsApp notifications are not the focus of the implementation
- Web Push is implemented with a service worker
- push subscription is server-backed
- PWA is installable when deployed correctly
- `app.agriculnet.farm` deployment requirements are documented
- farmers can reopen useful cached own data
- unfinished safe farmer work survives connectivity loss
- safe offline changes sync when online
- financial/admin operations are never blindly queued offline
- offline data is isolated per user
- user can clear offline device data
- supplied verified badge identifies verified farmers
- public badge only reflects authoritative server verification
- farmer profile UX is improved on desktop and mobile
- users can edit allowed profile details from Settings
- users cannot edit protected role/verification/account fields
- admin can suspend and restore accounts
- suspension is enforced server-side
- fee engine uses centralized marginal progressive tiers
- fee starts at 5% for the first eligible tier from XAF 2,000
- higher-value orders increase gradually without threshold cliffs
- buyer receipt confirmation is required for normal automatic payout
- unverified seller payout remains held
- seller verification later can unlock already-confirmed eligible payout
- open disputes block automatic release
- manual admin release is protected, audited and cannot bypass provider/legal restrictions
- duplicate payout is impossible through normal retry/double-click paths
- Terms/Privacy/payment/verification policies reflect implemented behavior
- public marketing claims match actual capabilities
- mobile experience remains functional
- tests/build pass except clearly documented pre-existing problems
- final `git diff` is reviewed

---

# 73. Final Instruction

Do not merely propose these changes.

Inspect the real AgriculNet codebase and implement the requirements that can be implemented in source code.

For DNS, hosting, push credentials, legal review, or third-party identity/payment-provider configuration that requires external account access, implement the code/configuration hooks and write accurate setup documentation, but clearly identify the owner-side actions still required.

Do not fake:

- PWA installability
- push delivery
- offline synchronization
- biometric verification
- payout release
- provider escrow
- legal compliance
- DNS configuration

Preserve completed work from previous Codex sessions and finish with tests plus a full `git diff` review.
