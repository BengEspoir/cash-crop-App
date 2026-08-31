
You are working inside the existing AgriculNet production codebase.

Your task is to upgrade the marketplace search experience into a modern multimodal agricultural search system inspired by the interaction quality of major B2B marketplaces such as Alibaba, WITHOUT copying Alibaba branding, visual assets, trademarks, wording, product catalogue, or business domain.

AgriculNet must remain entirely focused on agriculture and agricultural trade in Cameroon.

IMPORTANT:
Before making changes, inspect the existing codebase, architecture, components, routes, authentication implementation, search logic, design system, backend services, database schema, AI integration, API conventions, and existing marketplace UX.

Do not rewrite working infrastructure unnecessarily.
Reuse existing components and services wherever possible.
Do not introduce breaking changes to existing authentication, marketplace listings, quotation, messaging, orders, payment, logistics, admin, or AI-assistant functionality.

CURRENT AGRICULNET CONTEXT

AgriculNet is a digital agricultural marketplace focused on Cameroon.

Core users include:

- Farmers
- Resellers / Aggregators
- Local Buyers
- International Buyers
- Field Agents
- Administrators

Typical marketplace content includes:

- Cocoa
- Coffee
- Maize
- Plantain
- Palm products
- Rubber
- Vegetables
- Other agricultural products

Existing technical stack should be detected from the repository before implementation. The project currently broadly uses:

- Next.js / React frontend
- Node.js / Express backend
- Supabase PostgreSQL / storage
- Existing authentication / role management
- Existing protected AI integration

Use the repository as the source of truth.

==================================================
PRIMARY GOAL
============

Build a redesigned AgriculNet search experience supporting:

1. Standard text marketplace search
2. AI-assisted natural-language search
3. Image-based agricultural product search
4. Voice input with editable transcription
5. Authentication gating for advanced AI functionality
6. Smooth modern search animations and transitions
7. Agricultural-only contextual results
8. Mobile-first responsive behavior

The experience should feel intelligent, clean and modern while remaining recognizably AgriculNet.

==================================================

1. MAIN SEARCH INTERFACE
   ==================================================

Redesign the primary marketplace search area.

Create a visually prominent search component that may appear on:

- Homepage
- Marketplace page
- Search results page

The search component should contain:

[ Search input .................................... ] [ Search ]

Within or beside the input provide:

- AI Search button/icon
- Camera/Image Search button/icon
- Microphone/Voice Search button/icon

Suggested behavior:

Normal mode:
"Search cocoa, coffee, maize, farmers, buyers..."

AI mode:
"Ask AgriculNet AI what you are looking for..."

Image mode:
"Upload or take a photo of an agricultural product"

Voice mode:
"Describe what you are looking for"

The interface must remain simple and usable even for users with limited digital experience.

==================================================
2. NORMAL MARKETPLACE SEARCH
============================

Normal text search must continue searching actual AgriculNet marketplace data.

Support matching against relevant existing fields such as:

- Product/crop name
- Listing title
- Description
- Category
- Seller
- Region/location
- Quantity
- Grade/quality where available
- Availability
- Price where appropriate

Do not fabricate listings.

Search results must come from actual AgriculNet data.

Where supported by the existing schema, provide filters such as:

- Crop category
- Region
- Seller type
- Verified sellers
- Price range
- Quantity
- Availability

==================================================
3. AI SEARCH MODE
=================

Add a distinct AI Search mode.

The transition into AI mode should feel polished:

- Smooth width/height transitions
- Soft fade/slide
- Animated AI icon
- Slight focus glow where consistent with AgriculNet branding
- Loading animation while interpreting the request

Do not make animations excessive.

AI Search accepts conversational queries such as:

"I need 5 tons of cocoa from a verified farmer near Yaoundé."

"Show me maize sellers in the Centre Region."

"I need coffee suppliers accepting mobile money."

"Find verified cocoa suppliers and compare their prices."

"Who can supply plantain around Yaoundé this week?"

The AI must interpret the user's request into marketplace search parameters.

Example:

User query:
"I need 10 bags of maize from a verified seller around Yaoundé."

Possible interpretation:
{
  product: "maize",
  quantityIntent: "10 bags",
  location: "Yaoundé",
  verifiedSeller: true
}

Then search REAL AgriculNet listings.

CRITICAL:
The AI must never invent farmers, products, prices, inventory, verification status, availability or transactions.

AI should help interpret and rank real marketplace data.

If no matching data exists, explicitly say:
"No matching AgriculNet listings were found."

Then suggest legitimate alternatives such as:

- broaden location
- remove verification-only filter
- change quantity
- create a buyer request / quotation request where supported

==================================================
4. AUTHENTICATION FOR AI SEARCH
===============================

Advanced AI Search must require authentication.

A visitor may:

- use basic marketplace search
- browse public listings according to current authorization rules

But if an unauthenticated user activates AI Search:

Show a polished authentication prompt/modal.

Example:

"Sign in to use AgriculNet AI Search"

Supporting text:
"AI Search can understand detailed agricultural sourcing requests and personalize results based on your marketplace activity."

Buttons:
[ Sign In ]
[ Create Account ]
[ Not Now ]

After successful authentication:
return the user to the search they attempted to perform.

Preserve their query.

Do not lose:

- entered text
- selected image
- intended search mode

Use existing AgriculNet authentication instead of implementing a second auth system.

==================================================
5. IMAGE SEARCH
===============

Implement agricultural image search.

User can:

- upload an image
- choose an image from device
- where browser/device supports it, take a photo

Examples:

- cocoa beans
- maize
- coffee
- plantain
- palm products
- vegetables
- packaged agricultural goods

Flow:

1. User presses camera/image icon.
2. Image picker opens.
3. User selects image.
4. Display image preview.
5. Show:
   "Analyzing agricultural product..."
6. Identify likely agricultural category/product.
7. Use detected information to search actual AgriculNet marketplace listings.
8. Present visually similar or category-relevant listings.

Example:

Image interpreted as:
"Cocoa beans"

Then display:
"Possible match: Cocoa"

and search actual cocoa listings.

IMPORTANT:
Do not claim 100% certainty.

Use language such as:
"Likely cocoa beans"
"Possible match: maize"

Allow user to correct the detected category.

Example:
[ Change product ]

Image search must not return unrelated consumer goods.

Agricultural context takes priority.

If the current AI/model infrastructure supports image understanding, reuse it securely through backend routes.

Never expose provider API keys to the browser.

==================================================
6. VOICE SEARCH
===============

Implement voice input properly.

This is an important UX requirement.

When microphone is pressed:

State 1:
Request microphone permission if required.

State 2:
Begin recording.

Show an obvious animated recording state:

- microphone pulse
- recording indicator
- elapsed time
- Stop button

Example:

● Recording 00:07

[ Stop ]

When the user presses Stop:

DO NOT immediately submit the search.

First:

1. Stop recording.
2. Transcribe speech.
3. Put the transcription into the normal search text field.
4. Allow the user to EDIT the transcription.
5. User then explicitly presses Search/Send.

Example:

Voice:
"I need cocoa suppliers around Yaoundé that are verified."

After transcription:

Search field:
"I need cocoa suppliers around Yaoundé that are verified."

User can modify it to:
"I need verified cocoa suppliers around Yaoundé with at least 2 tons."

Then press:
[ Search with AI ]

This editing step is mandatory.

Also provide:

- Cancel recording
- Delete transcription
- Re-record

Do not automatically perform searches after transcription.

==================================================
7. VOICE TECHNICAL IMPLEMENTATION
=================================

Inspect the current application before selecting implementation.

Prefer a robust architecture such as:

Browser:
MediaRecorder API

Frontend:
records supported audio format

Backend:
receives temporary audio securely

Backend transcription service:
use existing configured AI/audio provider if available

Response:
{
  transcript: "..."
}

Then populate search input.

If browser speech recognition is used as fallback, isolate it behind a capability check.

Handle:

- permission denied
- microphone unavailable
- transcription failure
- unsupported browser
- empty recording
- network failure

Provide useful UI messages rather than raw errors.

Never permanently store voice recordings unless the existing privacy design explicitly requires it.

Temporary transcription audio should be deleted after processing when possible.

==================================================
8. UNIFIED MULTIMODAL SEARCH
============================

Architect search so text, AI, image and voice eventually feed the same search pipeline.

Conceptually:

TEXT
   ↓
QUERY NORMALIZATION
   ↓
SEARCH PARAMETERS
   ↓
AGRiCULNET LISTINGS
   ↓
RESULTS

VOICE
   ↓
TRANSCRIPTION
   ↓
TEXT
   ↓
AI QUERY INTERPRETATION
   ↓
SEARCH PARAMETERS
   ↓
REAL LISTINGS

IMAGE
   ↓
IMAGE CLASSIFICATION
   ↓
PRODUCT/CATEGORY
   ↓
SEARCH PARAMETERS
   ↓
REAL LISTINGS

This should not become four duplicated search implementations.

Create reusable services/hooks/components.

==================================================
9. AI SEARCH RESULT PRESENTATION
================================

AI Search results should feel different from basic keyword results without becoming a chatbot page.

Example:

AI interpretation panel:

"Understanding your request"

Looking for:
• Cocoa
• Verified sellers
• Yaoundé / Centre Region
• Commercial quantity

Then:

"12 matching AgriculNet listings"

Listing cards underneath.

Provide optional refinement suggestions:

"Try:"
[ Expand to Centre Region ]
[ Show Resellers ]
[ Sort by Price ]
[ Verified Only ]

If there are multiple good matches, optionally provide a short AI summary based ONLY on returned data.

Example:

"Most matching sellers are located in Centre and West regions. Three verified listings meet your stated quantity."

Again:
never fabricate marketplace facts.

==================================================
10. SEARCH ANIMATION / INTERACTION QUALITY
==========================================

Create polished transitions inspired by premium modern marketplaces, but stay within AgriculNet's branding.

Desired animation behavior:

Search focus:

- subtle elevation
- border transition
- smooth shadow

AI activation:

- search component smoothly expands
- AI icon animates briefly
- contextual placeholder changes

Voice:

- pulsing microphone
- waveform or subtle level animation if practical

Image:

- preview fades/scales in
- processing indicator

Results:

- skeleton loading cards
- staggered light entrance animation

Avoid:

- excessive bouncing
- huge gradients
- distracting effects
- animations that reduce accessibility

Respect:
prefers-reduced-motion.

==================================================
11. VISUAL DESIGN
=================

Retain AgriculNet's existing branding.

Do not visually reproduce Alibaba exactly.

Use AgriculNet colors, typography, spacing and component system.

Aim for:

- professional agricultural marketplace
- trustworthy
- modern
- clean
- accessible
- mobile friendly

Agricultural imagery/categories should remain dominant.

No electronics.
No fashion.
No industrial Alibaba catalogue content.
No unrelated consumer products.

==================================================
12. SEARCH HISTORY
==================

For authenticated users, if consistent with the existing privacy model, optionally persist recent searches.

Examples:

Recent searches

- verified cocoa suppliers Yaoundé
- maize 5 tons Centre
- coffee exporters

Allow:
[ Clear history ]

Do not persist voice audio.

Only store normalized search text/history if appropriate.

==================================================
13. MOBILE EXPERIENCE
=====================

This feature must work extremely well on mobile.

On small screens:

Search bar remains prominent.

Advanced actions may appear as:
[ AI ] [ Camera ] [ Mic ]

Image preview should not overflow.

Recording controls should be thumb-friendly.

Authentication modal should use nearly full width.

Result cards should remain readable.

Test:
320px
375px
390px
430px
tablet
desktop

==================================================
14. ACCESSIBILITY
=================

Add:

- ARIA labels
- keyboard support
- visible focus states
- descriptive icon labels/tooltips
- screen-reader status for recording
- screen-reader status for transcription
- loading announcements where appropriate

Do not rely only on color to indicate mode.

==================================================
15. SECURITY
============

All AI and transcription requests must go through protected backend endpoints.

Never expose:

- AI provider keys
- Supabase service role keys
- payment secrets
- transcription provider secrets

Validate request payloads.

Limit:

- image size
- image MIME type
- audio size
- audio duration

Add appropriate rate limiting to AI/image/audio endpoints.

Authentication should be verified server-side.

Do not rely solely on frontend authentication guards.

==================================================
16. ERROR STATES
================

Design friendly states for:

AI service unavailable
"No worries — you can still use standard AgriculNet search."

Voice transcription failed
"We couldn't transcribe that recording. Please try again or type your request."

Image unidentified
"We couldn't confidently identify this agricultural product. Select a category manually."

No marketplace results
"No matching AgriculNet listings were found."

Authentication expired
"Your session has expired. Please sign in again."

==================================================
17. BACKEND API DESIGN
======================

Inspect existing API conventions first.

Where new endpoints are necessary, use patterns consistent with the project.

Potential conceptual endpoints:

POST /api/search/ai
POST /api/search/image
POST /api/search/transcribe

AI Search request:
{
  query: string
}

AI Search response:
{
  interpretation: {
    product,
    category,
    location,
    verifiedOnly,
    minQuantity,
    maxPrice,
    otherFilters
  },
  results: [...]
}

Voice transcription:
multipart/form-data audio

Response:
{
  transcript: string
}

Image:
multipart/form-data image

Response:
{
  detectedProduct: string,
  confidence?: number,
  alternatives?: [],
  results: [...]
}

Do not blindly implement these exact paths if existing backend conventions use another structure.

==================================================
18. COMPONENT ARCHITECTURE
==========================

After inspecting the repository, create clean reusable architecture.

Potential conceptual components:

AgriculNetSearch
SearchInput
SearchModeSwitcher
AISearchMode
ImageSearchPopover
VoiceRecorder
VoiceTranscriptEditor
SearchInterpretation
SearchFilters
SearchResults
AuthRequiredModal
RecentSearches

Potential hooks/services:

useMarketplaceSearch()
useAISearch()
useVoiceRecorder()
useImageSearch()
useSearchHistory()

Names should follow existing project naming conventions.

==================================================
19. DO NOT BREAK EXISTING FEATURES
==================================

Regression-test:

- Registration
- Login
- Logout
- Seller verification
- Marketplace listings
- Search/filter
- Product details
- Quotations
- Messaging
- Orders
- Payment
- Logistics
- Admin
- Existing AI assistant

The new AI search feature is complementary.

Do not replace the existing AI assistant unless there is an explicit architectural reason.

The AI assistant and AI marketplace search serve different purposes:

AI Assistant:
general navigation/agricultural support

AI Marketplace Search:
interprets sourcing intent and searches marketplace data

==================================================
20. TESTING
===========

Add appropriate tests.

Test at minimum:

STANDARD SEARCH

- keyword returns listings
- no matches
- filters

AUTHENTICATION

- guest AI click shows login
- authenticated user accesses AI
- intended query survives authentication

AI SEARCH

- natural language parsing
- backend error
- empty query
- no fabricated results

VOICE

- start recording
- stop recording
- transcription appears
- transcription can be edited
- search only occurs after explicit submission
- denied microphone permission
- transcription failure

IMAGE

- valid image
- invalid MIME
- oversized file
- unrecognized image
- detected agricultural category
- manual correction

RESPONSIVE

- mobile search controls
- desktop layout

ACCESSIBILITY

- keyboard navigation
- ARIA labels

==================================================
21. IMPLEMENTATION PROCESS
==========================

Work in this order:

PHASE 1
Audit the repository.

Before editing, report:

- relevant frontend search files
- current marketplace API
- authentication implementation
- existing AI infrastructure
- reusable components
- database fields relevant to search
- potential implementation risks

PHASE 2
Propose the implementation architecture.

PHASE 3
Implement basic redesigned search shell.

PHASE 4
Implement authenticated AI search.

PHASE 5
Implement voice recording + transcription + editable transcript.

PHASE 6
Implement image search.

PHASE 7
Add animations/responsive/accessibility behavior.

PHASE 8
Add automated tests.

PHASE 9
Run lint, type checking, frontend tests, backend tests and build.

PHASE 10
Provide a concise implementation summary.

==================================================
22. ACCEPTANCE CRITERIA
=======================

The task is complete only when:

✓ Existing normal AgriculNet search still works.

✓ Search UI includes text, AI, image and voice entry methods.

✓ Guests are asked to authenticate before using AI search.

✓ Successful authentication returns users to their intended AI query.

✓ Voice can be recorded.

✓ Stopping voice recording generates a transcription.

✓ The transcription appears in the search input.

✓ The user can edit transcription BEFORE searching.

✓ Search only happens after the user explicitly submits it.

✓ Image upload identifies a likely agricultural product/category.

✓ Image results use actual AgriculNet marketplace data.

✓ AI search interprets conversational agricultural requests.

✓ AI never creates fake marketplace listings.

✓ Search stays restricted to the agricultural context.

✓ UI works well on mobile and desktop.

✓ Animations are smooth but restrained.

✓ Existing marketplace workflows continue functioning.

✓ Secrets remain server-side.

✓ Relevant tests pass.

✓ Production build succeeds.

Finally, show me:

1. Files modified
2. Files created
3. Database/schema changes, if any
4. Environment variables required
5. Backend endpoints added
6. Test results
7. Any feature requiring an external API/provider
8. Any remaining limitations

Do not stop at mock UI.
Implement the complete working end-to-end feature wherever existing project infrastructure permits it.
