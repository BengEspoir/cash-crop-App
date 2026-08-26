# AgriculNet Public Website Redesign Brief for UXPilot

## How to use this brief

This brief covers only AgriculNet's public website. Do not generate authentication screens, buyer dashboards, farmer dashboards, admin screens, checkout, payments, private messages, or account settings.

The goal is to **redesign and improve the public experience**, not merely copy it. Preserve AgriculNet's identity, content purpose, public routes, green-and-gold colors, and agricultural credibility, but improve navigation, hierarchy, spacing, content grouping, calls to action, accessibility, mobile behavior, and the journey from discovery to inquiry or seller registration.

There is one strict exception: the homepage background-image carousel hero must be reproduced exactly as specified below. Do not redesign that hero.

You will receive uploaded AgriculNet logo files with this document. Use those uploaded files directly wherever the brand logo appears. Do not recreate, redraw, or type the logo as text.

## Scope and non-negotiable rules

Design these public routes:

`/`, `/about`, `/browse`, `/buyer-protection`, `/compliance`, `/contact`, `/crops/[id]`, `/documentation-info`, `/farmers/[id]`, `/find-farmers`, `/help`, `/inspections-info`, `/international`, `/logistics-info`, `/mobile`, `/pricing`, `/privacy`, `/request-quote`, `/sell`, `/sell/onboarding`, `/terms`, `/trade-support`, `/verification`.

Required constraints:

- Redesign only the public-facing website.
- Keep the homepage carousel hero exactly faithful.
- Keep the existing green, gold, and neutral color system.
- Use the uploaded transparent PNG or SVG logo files as image assets.
- Keep the product name **AgriculNet**.
- Keep English/French language support and country selection visible.
- Preserve all important public content and actions, but reorganize them when it improves comprehension.
- Maintain a professional B2B agricultural marketplace character, not a playful consumer-grocery appearance.
- Use authentic African and Cameroonian agriculture, farmer, inspection, warehouse, logistics, and export imagery.
- Produce responsive mobile, tablet, desktop, loading, empty, error, and interaction states.
- Do not invent claims, certifications, user counts, revenue, or impact results.
- Prototype/planned marketplace capabilities must not be presented as proven production outcomes.

## Brand foundation

### Colors

Use the same palette throughout the redesign. Do not replace the brand with another dominant color.

| Purpose | Color |
|---|---:|
| Deep agricultural green | `#0D3D22` |
| Primary action green | `#1A6B3C` |
| Green hover | `#2E8B57` |
| Mid green | `#3DAA6A` |
| Pale verified green | `#EAF4EE` |
| Very pale green | `#F3FAF5` |
| Primary gold | `#E8B84B` |
| Gold hover | `#D1A23A` or `#E0AE3E` |
| Dark gold text | `#8A6200` |
| Pale gold | `#F7EDD5` |
| Very pale gold | `#FDF8EE` |
| Primary ink | `#111827` |
| Secondary ink | `#374151` |
| Muted ink | `#6B7280` |
| Strong border | `#D1D5DB` |
| Standard border | `#E5E7EB` |
| Page canvas | `#F9FAFB` |
| Dark footer | `#071A12` |

Semantic colors may remain: green for verified/success, blue for export/information, amber for pending, and red for risk/error. Use gold selectively for high-value conversion actions and highlights. Use green for primary navigation, trust, search, inquiry, and marketplace actions.

### Typography

- Use **DM Sans** for navigation, body text, buttons, forms, cards, and labels.
- Use **DM Serif Display** for major headings and editorial moments.
- Body text should normally be 14-16px with generous 1.5-1.75 line height.
- Page titles should be 36-52px on desktop and 30-38px on mobile.
- Section headings should be 28-38px on desktop and 24-30px on mobile.
- Eyebrows should be 11-12px, uppercase, semibold, with wide tracking.
- Avoid oversized decorative typography that makes marketplace information difficult to scan.

### Logo instructions

Use the uploaded AgriculNet logo files as provided. Prefer the transparent PNG for ordinary screens and the SVG when a scalable vector is needed. Preserve the wide aspect ratio, transparent padding, original green/gold artwork, and subtitle. Set image fit to **contain**. Do not alter its colors or rebuild the wordmark.

Recommended placements:

- Header: approximately 160-190px wide and 44-50px high.
- Mobile header: approximately 145-160px wide.
- Footer: approximately 165-180px wide on a subtle white logo plate if contrast is required.
- Promotional panels: never exceed 220px wide.

## Redesign direction

The redesigned public website should feel clearer, calmer, more premium, and easier to navigate than the current interface. It should communicate three things immediately:

1. Buyers can discover verified Cameroonian agricultural supply.
2. Farmers and resellers can build trustworthy market visibility.
3. AgriculNet provides structured support around verification, inspection, documentation, payments, and logistics.

Improve the experience through:

- Stronger visual hierarchy and more breathing room between major sections.
- A simpler path from homepage to Browse, Find Farmers, Request Quote, or Sell.
- Fewer competing calls to action inside one viewport.
- Clear buyer and seller entry points without forcing users to understand platform terminology first.
- Better trust explanations near important actions instead of isolated marketing claims.
- Consistent cards and reusable content patterns across information pages.
- Sticky or persistent actions where useful on listing and farmer detail pages.
- Mobile filter drawers and touch-friendly controls rather than long stacked sidebars.
- More meaningful empty and error states with a clear recovery action.
- Clear labels for features that are informational, planned, or require account access.

Use a spacing system based on 4px with common gaps of 8, 12, 16, 24, 32, 48, 64, and 96px. Standard cards may use 16-20px radii; feature panels may use 24-28px. Use restrained shadows and 1px neutral borders. Interactive cards can rise 2-4px on hover.

## Homepage hero - exact replication required

This entire section must retain the current composition, copy, layout, colors, background swapping, badges, cards, and motion. Do not simplify, rearrange, modernize, recolor, or replace it.

### Hero container and imagery

- Full browser width.
- Minimum height 500px; 560px from desktop breakpoint.
- Deep-green fallback background and white text.
- Background images cover the entire hero.
- Swap images automatically every 6.5 seconds.
- Crossfade the outgoing and incoming image.
- Use this exact image sequence:
  1. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517779/cocoa_too1wf.jpg`
  2. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517780/maize_farm_nz88c7.jpg`
  3. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517781/pimeaple_plantation_uf2adi.jpg`
  4. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517780/famer_1_oetdap.jpg`
  5. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517779/suger_cane_vewwyc.jpg`
  6. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517778/rubber_nfpqx3.jpg`
  7. `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517778/Rice_plantation_qcoqiq.jpg`
- Overlay the images with a 120-degree green gradient: approximately `rgba(13,61,34,.92)` on the left, `.55` near the middle, and `.35` at the right.
- Add a soft gold radial highlight near the upper-left.

### Hero layout

- Inner content maximum width: 1440px.
- Side padding: 16px mobile, 32px desktop, 40px wide desktop.
- Vertical padding: 40px mobile and 64px desktop.
- Desktop uses a 12-column grid.
- Main copy spans 7 columns.
- Two verification tiles occupy the right 5 columns.
- Three trust cards span the full-width row below.
- Preserve the current mobile stacking order.

### Hero content

Eyebrow: **Agricultural trade platform**

Title: **AgriculNet: From Cameroonian Farms to the World**

Subtitle: **A premier B2B trade platform connecting Cameroon's finest agricultural producers with global buyers. Secure, transparent, and certified exports.**

Actions:

- Green: **Explore Marketplace**
- Gold: **Become a Seller**
- Transparent: **Browse listings**

Right-side glass tiles:

- **Verified** with a gold-ring badge icon.
- **Export-ready** with a gold-ring shipping icon.

Bottom glass cards:

- **Global Trade Hub**
- **Quality Certified**
- **Secure Sourcing**

Use 56px icon circles in the right tiles and 44px icon blocks in the bottom cards. Preserve the active slide indicator as a 24x6px gold pill and inactive indicators as 6x6px translucent-white dots. If UXPilot cannot create a functioning carousel, create seven prototyped hero states and document the 6.5-second crossfade interaction.

## Redesigned public header and navigation

The header and navigation may be redesigned for a clearer public journey while retaining all routes.

Recommended structure:

1. A compact optional announcement bar for timely marketplace information.
2. Main header with uploaded logo, large marketplace search, country selector, EN/FR switch, Sign In, and Create Account.
3. A simplified category/navigation row.

Desktop navigation should prioritize:

- Browse Crops
- Find Farmers
- Request a Quote
- International Buyers
- Sell on AgriculNet

Place Buyer Protection, Verification, Logistics, Documentation, Pricing, About, Help, and Contact under clearly named secondary menus such as **Trade Services**, **Trust & Compliance**, and **Company**. Do not hide the main marketplace actions in a generic menu.

On mobile, use a clear menu drawer with large 44-48px rows, search at the top, language/country controls, and separated buyer/seller actions. This is a deliberate redesign; a mobile menu is allowed for this new version.

Keep the header visually lighter than the hero. It may be sticky and become slightly more compact after scrolling. Search should support crop, farmer, region, and listing discovery. Give keyboard focus a visible translucent-green ring.

## Redesigned homepage below the hero

The hero remains exact. Everything after it may be reorganized into this improved flow:

### 1. Fast marketplace discovery

Immediately below the hero, create a spacious search and filter module without overlapping or modifying the hero. Include crop/category search, country/region, verification, export readiness, and a clear Search Marketplace action. On mobile, show the primary search and a Filters button opening a sheet.

### 2. Choose a journey

Use two balanced pathway cards:

- **I want to source crops** - Browse listings, compare farmers, request a quote.
- **I want to sell crops** - Learn requirements, choose farmer or reseller onboarding.

Make the buyer path green and the seller path gold-accented while keeping both within the same brand system.

### 3. Featured supply

Present active crop listings earlier. Use a responsive grid with image, crop, origin, quantity, grade, verification, price, delivery readiness, and one strong View Details action. Avoid too many badges. Allow category chips or a compact horizontal category rail.

### 4. Why buyers can trust the marketplace

Combine verification, buyer protection, inspection, protected payment, and logistics into a clear step-based trust story. Each card should explain what AgriculNet does and what still requires buyer confirmation. Link to the relevant information page.

### 5. Verified farmers and regional supply

Show verified farmer profiles and regional crop availability in one coherent section. Use tabs or paired panels instead of two unrelated long grids. Provide View All Farmers and Explore by Region.

### 6. How trade works

Use four numbered steps from profile/listing discovery to quote, verification/payment preparation, and delivery coordination. Keep descriptions short and visually connect the sequence on desktop.

### 7. International sourcing and documentation

Use a premium dark-green image panel explaining export readiness, compliance, documentation, inspections, and logistics. Primary action: International Sourcing. Secondary: Request a Quote.

### 8. Payment methods and final CTA

Keep supported-payment labels but avoid presenting all methods as guaranteed in every market. Finish with a strong dual CTA: Browse Crops and Become a Seller.

## Marketplace page redesigns

### `/browse`

Create a strong browse header with title, result count, active filters, sort, and view choice. Desktop uses a collapsible/sticky filter rail; mobile uses a bottom sheet or drawer. Filters include search, country, region, crop, verified, export-ready, grade, quantity, price, and delivery readiness where data exists.

Listing grid should be one column mobile, two tablet, and three or four wide desktop depending on available width. Cards must prioritize crop image, crop name, price, quantity, location, seller verification, and View Details. Show loading skeletons, no-results with Clear Filters, and API failure with Retry.

### `/crops/[id]`

Redesign as a confident purchase-inquiry page:

- Breadcrumb and concise trust status.
- Large gallery with thumbnails and lightbox.
- Crop title, price, quantity, grade, location, readiness, and updated time.
- Clear seller card with verification and View Farmer.
- Structured specification table.
- Sticky desktop action card and mobile bottom action bar with Start Chat, Request Quote, and Add to Cart/Sign In as appropriate.
- Explain verification limitations before allowing high-commitment actions.
- Related listings at the bottom.

### `/find-farmers`

Add search, crop, region, verified, export-ready, and sort controls. Use responsive profile cards or detailed rows containing photo, name, location, crops, verification, listing count, rating if real, and View Profile. Provide loading, no-results, and error recovery states.

### `/farmers/[id]`

Create a profile hero with farmer image, name, location, verified status, crops, cooperative/business information, and Start Conversation. Follow with Trust and Verification, About the Farm, Active Listings, Trade Capability, and inquiry CTA. Keep private contact or review-only data hidden.

### `/request-quote`

Use a guided, low-friction quote flow rather than one intimidating form. Group it into Supply Needed, Quantity and Quality, Destination and Timing, Contact and Notes. Display progress, clear required fields, review summary, signed-out guidance, and success confirmation. Do not ask for payment credentials.

### `/buyer-protection`

Explain the protection journey visually: seller checks, order agreement, inspection/document review, payment status, shipment coordination, dispute support. Clearly distinguish platform support from guarantees. Include Browse Verified Supply and Contact Support.

## Seller-facing public pages

### `/sell`

Use a conversion-focused seller landing page with image hero, benefits grounded in current capabilities, farmer/reseller comparison, eligibility checklist, onboarding steps, verification explanation, common questions, and Start Seller Onboarding. Avoid promising guaranteed buyers, revenue, or export approval.

### `/sell/onboarding`

Present two clear cards:

- **Farmer / Primary Producer** - for people producing crops directly.
- **Reseller / Aggregator** - for businesses consolidating or reselling supply.

Explain documents, profile expectations, and what happens after registration. Use a short comparison table on desktop and stacked details on mobile. Make the two primary actions unambiguous.

### `/verification`

Explain benefits, required evidence, privacy handling, review steps, possible outcomes, and next action. Use a timeline and document checklist. Do not display sensitive example identity numbers.

## Institutional and service pages

Create a consistent editorial system for these pages: compact photographic hero, clear table of contents where content is long, alternating image/text sections, restrained feature cards, contextual CTA, and related-page links.

- `/about`: mission, farmer market barriers, platform approach, values, roadmap, responsible impact language, final participation CTA.
- `/international`: international-buyer value proposition, sourcing process, export-ready crops, inspections, documentation, port/logistics readiness, FAQ, quote CTA.
- `/compliance`: ONCC/MINADER context, crop standards, verification workflow, evidence boundaries, FAQ, sourcing CTA. Avoid implying official endorsement without evidence.
- `/inspections-info`: inspection scope, process, responsibilities, report outcomes, FAQ, request support.
- `/logistics-info`: farm-gate-to-destination stages, transporter/warehouse coordination, tracking expectations, exceptions, quote CTA.
- `/documentation-info`: document types, who provides them, review process, export context, templates/support CTA.
- `/trade-support`: support pillars, when to contact AgriculNet, escalation path, common trade problems, contact CTA.
- `/mobile`: field-first benefits, low-connectivity considerations, key mobile workflows, availability or planned-status notice, web-app CTA.
- `/pricing`: simple fee explanation, when fees apply, included support, comparison cards only where accurate, FAQ, start CTA.
- `/help`: prominent search, topic categories, popular guides, FAQ accordion, contact/escalation options.
- `/contact`: contact channels, response expectations, subject/category routing, accessible contact form, privacy note, success state.
- `/privacy` and `/terms`: readable maximum 760-820px article width, sticky or collapsible contents navigation, clear section hierarchy, last-updated area, and contact link.

## Footer redesign

Use the uploaded logo on the dark `#071A12` footer. Organize links into Marketplace, Sell, Trade Services, Trust and Compliance, Company, and Support. Add a concise platform description, EN/FR access, contact channel, legal links, and optional newsletter only if it has a clear consent note. On mobile, use accessible accordion link groups to reduce page length.

## Interaction, states, and responsive behavior

- Use frames at 390x844, 768x1024, 1440x1024, and 1600x1100.
- Buttons and interactive targets must be at least 44px high on touch screens.
- Use a 4px translucent-green focus ring.
- Support keyboard navigation, visible labels, useful alt text, and WCAG-friendly contrast.
- Page transitions may fade/rise gently; cards may lift slightly; avoid excessive parallax.
- Respect `prefers-reduced-motion`, especially for the carousel.
- Forms need field-level errors, submit loading, success confirmation, and preserved input after recoverable failure.
- Marketplace data needs skeleton, empty, no-results, API-error, retry, unverified-seller, and signed-out variants.
- On mobile, keep the primary action accessible without covering content.
- Do not use horizontal page overflow. Tables or specifications may scroll within their own container.

## Copy-paste UXPilot prompt

> Redesign only the public-facing AgriculNet website described in the attached brief. Improve its user flow, navigation, hierarchy, spacing, cards, filtering, trust communication, accessibility, mobile experience, and conversion paths while keeping the current AgriculNet identity. Use the uploaded AgriculNet logo files directly; do not recreate the logo as text. Preserve the existing color palette: deep green #0D3D22, primary green #1A6B3C, hover green #2E8B57, pale greens #EAF4EE and #F3FAF5, primary gold #E8B84B, dark gold #8A6200, pale gold #F7EDD5, canvas #F9FAFB, text #111827/#374151/#6B7280, borders #E5E7EB, and footer #071A12. Use DM Sans for interface text and DM Serif Display for headings. The redesign applies to all public routes only; do not generate login, registration, checkout, dashboards, private messaging, payments, settings, or admin screens. One section is locked: reproduce the homepage background-image carousel hero exactly, including its seven supplied Cloudinary images, 6.5-second crossfade, dimensions, overlays, copy, three actions, two right-side verification tiles, three lower trust cards, and slide indicators. Do not alter that hero. You may be creative everywhere else, but preserve truthful content and all public routes. Create responsive mobile, tablet, desktop, loading, empty, error, unverified, and form-success states. The result should feel like a premium, trustworthy Cameroonian agricultural B2B marketplace with clearer buyer and seller journeys.

## Credit-conscious generation sequence

To reduce wasted generations, use the same design library and work in four batches:

1. **Foundation + public header/footer + exact homepage hero.** Approve these before continuing.
2. **Redesigned homepage below the hero + Browse + Crop Detail.**
3. **Find Farmers + Farmer Profile + Request Quote + Sell + Seller Onboarding.**
4. **About, International, Compliance, protection/service/help/legal pages + responsive/state variants.**

Do not regenerate approved foundations in later batches. Ask UXPilot to reuse the same components and variables instead.

## Acceptance checklist

- Only public pages are included.
- The uploaded logo assets are used without redrawing or recoloring.
- The green/gold palette remains unchanged.
- The homepage carousel hero is an exact replica, not a redesign.
- All other public sections show a visibly improved hierarchy and user journey.
- Buyer and seller paths are understandable within the first two homepage sections after the hero.
- Browse, farmer discovery, crop detail, quote, and seller onboarding are easy to complete on mobile.
- Trust language is clear and does not overpromise unfinished capabilities.
- Every public route in scope is represented.
- Loading, empty, error, unverified, signed-out, and form-result states are included.
