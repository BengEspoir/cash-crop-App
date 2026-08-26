# AgriculNet UI Clone Specification for UXPilot

## Purpose and fidelity rules

Use this document to reproduce the **current AgriculNet interface** before proposing improvements. The repository and live product call the platform **AgriculNet**; “AgriCornet” is not the product name. Create an agricultural B2B marketplace for Cameroon with public discovery pages, authentication, buyer and seller workspaces, an administration console, and a floating AI assistant.

The first UXPilot output must be a faithful clone, not a redesign. Preserve the current information hierarchy, dimensions, compact enterprise tone, green-and-gold identity, English/French controls, responsive behavior, loading/error/empty states, and role differences. Do not add a mobile hamburger, bottom navigation dock, split-screen authentication layout, separate reseller dashboard, charts where the current page uses CSS illustrations, or functions not described here.

Generate the system in reusable layers:

1. Create variables, type styles, effects, and spacing tokens.
2. Create the logo asset, buttons, fields, pills, cards, tables, dialogs, navigation, and state components.
3. Build the public shell and public pages.
4. Build the authentication shell and its form variants.
5. Build the shared workspace shell, then buyer, seller, and admin screens.
6. Build mobile, tablet, desktop, and state variants for each major screen.

Use four reference frames: **390×844 mobile**, **768×1024 tablet**, **1440×1024 desktop**, and **1600×1100 wide desktop**. Breakpoints match Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.

## Product character

AgriculNet connects Cameroonian farmers, resellers, local buyers, and international buyers. Its visual character is trustworthy, formal, field-aware, and export-ready rather than playful. Photography should show real African agriculture, crop harvesting, cooperatives, warehousing, ports, inspection, and trade. Use warm natural light, authentic people and environments, and high-resolution landscape crops. Crop and hero photographs are full bleed with `object-fit: cover`; profile and logo imagery use `contain` or circular crops. If an image cannot load, use a diagonal gradient from `#0D3D22` to `#2E8B57` so the layout never collapses.

## Design foundations

### Typography

- Interface, body, forms, tables, labels: **DM Sans**, weights 300–700.
- Display headings: **DM Serif Display**, normally weight 400; some existing screens visually request semibold/bold.
- Body default: 14px, line-height 1.5, antialiased.
- Hero title: 30px mobile, 40px at `sm`, 52px at `lg`, line-height 1.08.
- Large workspace title: 34px mobile, 42px from `md`, line-height approximately 1.1.
- Admin route title: 36px mobile, 44px from `md`.
- Standard public page title: 24px, line-height 1.15. Browse uses 30px/36px.
- Panel heading: 20–24px DM Serif. Standard section heading: 18px; major public section heading: 26–32px.
- Body copy: 14px/24px; large support copy: 15–18px/28px.
- Eyebrow: 11px, semibold, uppercase, letter-spacing `0.18em`, muted gray.
- Table header: 12px, bold, uppercase, letter-spacing `0.16–0.18em`.

Do not substitute Poppins, Inter, or a geometric display font. The logo contains its own lettering and must remain an image.

### Color variables

| Token | Hex | Use |
|---|---:|---|
| Green 900 | `#0D3D22` | Sidebars, dark hero fallback, deep panels |
| Green 800 | `#1A6B3C` | Primary actions, active state, trust |
| Green 700 | `#2E8B57` | Hover and secondary green |
| Green 600 | `#3DAA6A` | Accents |
| Green 500 | `#58C57F` | Data accents |
| Green 400 | `#83D8A0` | Soft decorative accents |
| Green 300 | `#AEE4C1` | Light icon/ring accents |
| Green 200 | `#D4EDDA` | Borders and pale status |
| Green 100 | `#EAF4EE` | Verified backgrounds |
| Green 50 | `#F3FAF5` | Hover and tinted surfaces |
| Gold 900 | `#5B3F00` | Dark gold text |
| Gold 800 | `#8A6200` | Gold text and badge |
| Gold 700 | `#B5892A` | Secondary gold |
| Gold 600 | `#D1A23A` | Gold hover |
| Gold 500 | `#E0AE3E` | Gold CTA hover |
| Gold 400 | `#E8B84B` | Main acquisition CTA and active marker |
| Gold 300 | `#F0CA71` | Icons on dark surfaces |
| Gold 200 | `#F5DDA2` | Borders |
| Gold 100 | `#F7EDD5` | Pale gold panels |
| Gold 50 | `#FDF8EE` | Announcement/background |
| Ink 900 | `#0B1220` | Darkest text/overlay |
| Ink 800 | `#111827` | Primary text |
| Ink 700 | `#374151` | Secondary text |
| Ink 600 | `#4B5563` | Supporting copy |
| Ink 500 | `#6B7280` | Muted text |
| Ink 400 | `#9CA3AF` | Placeholder/tertiary |
| Ink 300 | `#D1D5DB` | Strong input border |
| Ink 200 | `#E5E7EB` | Standard border |
| Ink 100 | `#F3F4F6` | Soft fill |
| Ink 50 | `#F9FAFB` | Global canvas |

Semantic states: verified uses `#1A6B3C` on `#EAF4EE`; export uses `#1D4ED8` on `#EFF6FF`; pending uses `#B45309` on `#FFFBEB`; risk/error uses `#B91C1C` or `#922B21` on pale red; information often uses cyan. The admin avatar alone uses purple `#5547BF`. Gold is for high-value acquisition, payment, and sidebar markers; green is for primary commerce, navigation, and trust.

### Spacing, shape, and effects

- Base spacing unit: 4px. Primary rhythm: 8, 12, 16, 20, 24, 28, 32, 40, 48, and 64px.
- Global `content-shell`: full width with 16px side padding, 24px at `sm`, 32px at `lg`, 40px at `xl`. Do **not** center public content in a narrow 1200px container. Only the homepage hero interior caps at 1440px and authentication caps at 560px.
- Controls: 8–12px radius. Public crop cards: 14px. Standard panels: 16px. Legacy/detail cards: 18px. Large marketing panels: 22–28px. Statuses and segmented controls: fully rounded.
- Input: 44px high, 10px radius, 12px horizontal padding, 14px type. Larger filters/search controls are 48 or 56px.
- Button sizes: small 32px/12px; medium 40px/13px; large 48px/14px; extra large 56px/15–16px. Horizontal padding is 12, 16, 24, or 32px respectively.
- Focus: visible 4px translucent green ring, never remove the outline without a replacement.
- Soft shadow: `0 1px 2px rgba(17,24,39,.04), 0 2px 8px rgba(17,24,39,.04)`.
- Lift shadow: `0 8px 24px rgba(17,24,39,.08)`.
- Green glow: `0 10px 30px rgba(26,107,60,.18)`.
- Gold glow: `0 10px 30px rgba(181,137,42,.20)`.
- Focus ring effect: `0 0 0 4px rgba(26,107,60,.12)`.

### Motion and accessibility

- Page entry: opacity 0 and translateY 6px to normal over 320ms with `cubic-bezier(.22,1,.36,1)`.
- Section reveal: opacity 0 and translateY 12px to normal over 500ms; reveal when 20% enters the viewport.
- Stagger children by 50–80ms; individual item duration 450ms from translateY 10px.
- Buttons transition over 200ms, lift 2px on hover, and scale to roughly .97–.98 on press.
- Interactive cards lift 2–4px and gain a green border/glow. Crop photos zoom to 1.04 over 500ms.
- Hero photos crossfade; static hero backgrounds may use a 16-second alternating Ken Burns scale from 1.05 to 1.14.
- Account chevrons rotate 180 degrees. Menus fade and zoom from 95%. Admin review drawer slides right-to-left over 260ms.
- Under `prefers-reduced-motion`, remove transforms, smooth scroll, and nonessential animation.
- Every icon-only control needs a tooltip or accessible name. Preserve keyboard focus, Enter submit, Escape close, and outside-click behavior. Disabled controls use 50–60% opacity and block pointer input.

## Logo and image asset handling

Upload the existing transparent logo as an image asset from:

```text
client/public/images/agriculnet_logo-transparent.png
```

If needed, use the vector fallback:

```text
client/public/images/agriculnet_logo.svg
```

Do not retype the wordmark. Preserve the approximately **3.08:1** aspect ratio and transparent spacing, set fit to **contain**, and align left. The SVG is 1600×520 and contains a green/gold basket, leaves, network nodes, “Agricul” in green, “Net” in gold, and the subtitle “AGRICULTURAL E-COMMERCE.” Current placements are:

- Public header: 156×44px mobile; 180×48px from `sm`.
- Footer: 168×44px inside a white plate with 12px radius and 12×8px padding.
- Authentication: 168×48px inside a translucent-white plate.
- Admin sidebar: 190×48px inside a white rectangle.
- Buyer and seller desktop sidebars intentionally begin with profile identity and contain **no logo**.

Use Lucide-style 1.5–2px outline icons throughout. Typical icon sizes are 16px in compact buttons, 20px in fields/navigation, 24px in top-bar actions, 28px in metric tiles, and 48–64px for empty/success illustrations.

## Shared public application shell

### Sticky header

The header is sticky at top with `z-index: 40`, a 1px `#E5E7EB` bottom border, white at 90% opacity, and backdrop blur. Add the soft shadow only after 8px of vertical scroll. On mobile it wraps into a stacked column with 16px outer padding and 16px gaps; at `lg` it is a minimum 72px horizontal row with 24px gaps and 24px side padding.

Left cluster is 320px on desktop: logo plus country selector. Center is a flexible search pill. Right contains language and account controls.

Search pill: `#F9FAFB`, `#D1D5DB` border, full radius, 4px internal padding. A desktop-only “All Crops” segment has a chevron and right divider. Then a 16px search icon, 32px-high 13px input reading “Search crops, farmers, resellers,” and a 32px gold pill button with 16px horizontal padding.

Language control is a bordered pill with 2px inner padding. EN and FR are 12px semibold; selected is green/white. Guest account controls show a gold “Sign In” link, a 32×32 chevron trigger, and a 280px popover with a full-width green sign-in button, “OR continue with,” three 44px provider buttons (Google light, Apple black, Facebook `#1877F2`), and a 40px Create Account CTA. Authenticated users see 40×40 bell/account buttons and a 224px menu containing email, My AgriculNet, Orders, optional Messages, Account, Settings, and red Sign Out. Destinations change with role. Close popovers on Escape and outside press.

### Sub-navigation

White surface, 1px bottom border, minimum height 44px. Mobile groups wrap with 8px gaps and 8px vertical padding; desktop is one row. Items are at least 42px high, 12px medium, 8–12px horizontal padding, 8px radius. Active marketplace links use green text and a 2px green bottom line.

Left links: **Browse Crops**, **Find Farmers**, **International Export**, **Request a Quote**, **Buyer Protection**. Right links: **Help Center**, **Sell on AgriculNet**, **Mobile App**; the latter two are green emphasis links. Hover panels are white, maximum 320px or viewport-minus-32px, 14px radius, 16px padding, border, and lift shadow.

### Footer

Place 64px below page content. Use `#071A12`, white text, and very subtle green/gold radial glows. Main grid has 40px gap and 48px vertical padding; it is one column until `lg`, then `1.15fr` brand column plus four equal navigation columns.

Brand column contains the white logo plate, 14px/24px tagline, a frosted 16px-radius newsletter panel, 44px email/subscribe controls, and 40×40 contact/social squares. The tagline is: “Africa-grade crop sourcing with enterprise verification, protected settlements, and logistics-aware workflows for global buyers.” Navigation headings are 12px uppercase with `.16em` tracking; links are 13px with 10px vertical rhythm. Columns are Marketplace, For Sellers, For Buyers, and Support. Bottom bar has a white/10 divider, 20px vertical padding, 12px text, stacked mobile and horizontal desktop.

## Homepage `/`

Render this exact order:

1. Pale-gold announcement card inside `content-shell`, with 10px radius, 16×12px padding, “New harvest listings” badge, weekly supply message, and “View latest listings” link.
2. Sticky Header.
3. Sub-navigation.
4. Full-width photographic hero.
5. Search and quick-filter card.
6. Four trust cards.
7. Live marketplace pulse, listing preview, and testimonials.
8. Curated crop marketplace with category sidebar.
9. Regional spotlight.
10. Featured farmers.
11. How it works.
12. Protected payments banner.
13. Footer.

The hero is minimum 500px high and 560px at `lg`. Cycle seven crop/farmer images every 6.5 seconds with crossfades. Use a deep-green 120-degree overlay (`.92` opacity at left to `.35` at right) and a gold radial glow. Inner grid caps at 1440px, uses 16/32/40px horizontal padding and 40/64px vertical padding. On desktop it has 12 columns: copy spans 7, two verification tiles span 5, and three trust tiles span the entire next row.

Hero copy: eyebrow “Agricultural trade platform”; title “AgriculNet: From Cameroonian Farms to the World”; subtitle “A premier B2B trade platform connecting Cameroon's finest agricultural producers with global buyers. Secure, transparent, and certified exports.” CTAs are green **Explore Marketplace**, gold **Become a Seller**, and transparent **Browse listings**. Right tiles show 56px gold-ring icons for **Verified** and **Export-ready**. Bottom glass cards are **Global Trade Hub**, **Quality Certified**, and **Secure Sourcing**, each with a 44px icon tile. Active slide indicator is 24×6px gold; inactive indicators are 6×6px white/40.

The main homepage stack uses 32px vertical gaps and 48px at `lg`. The search card is white, 20px radius, 16–20px padding, and holds a crop category segment, search field, gold “Search listings,” and chips: Filters, Verified only, Export-ready, Negotiable, Bulk orders, New arrivals.

Trust cards form 1→4 columns at `lg`, use 16px radius and 20px padding, with 40px pale-green icon tiles. Titles are Verified seller profiles, Buyer protection, Coordinated logistics, and Protected payouts.

Marketplace pulse includes its heading, green “Enter live marketplace,” three 16px-radius metric cards with 26px display values, up to four live crop cards, then three 18px-radius testimonial cards. Include 120px skeletons and dashed amber API-error variants.

Curated supply uses a 12-column desktop grid: category rail spans 3 and listings span 9. Listings form 1→2→4 columns. Show Cocoa Beans, Arabica Coffee, White Maize, Penja Pepper, Plantain, Palm Oil, Cassava Flour, and Export Banana. A crop card has a 180px image, dark bottom gradient, trust and grade badges, location/quantity overlay, 16px body, 15px crop/price, expandable trade details, and a full-width 32px Send inquiry action.

Regional Spotlight is a white 16px-radius container with 20–24px padding and 1→2→4 region cards. Each has a 120px photo, title, small emphasis pill, copy, crop chips, and green trade signal. Featured Farmers uses 1→2→4 cards with avatar, trust badges, two statistics, crop pills, and a full-width View Profile action.

How It Works is 12 columns at desktop: a photo card spans 4 and four step cards span 8 in a 2×2 grid. Steps are Create a verified profile, Browse or request a quote, Confirm inspection and payment, Track the order to completion. The final payment banner is deep green, 22px radius, photo-backed, and splits copy 5/12 from method tiles 7/12. Methods are MTN MoMo, Orange Money, Visa, Mastercard, Flutterwave, and Wire Transfer.

## Public marketplace and information pages

All public routes except `/` use Header → SubNav → `content-shell` main with 32px vertical padding/40px at `lg` → Footer. Use one of three page patterns:

- **PageHeader:** compact text-only header with 11px eyebrow, 24px title, body copy, and optional action row.
- **HeroBanner:** 22px-radius photo hero with green overlay, 30→44px title, 15px/28px copy, gold primary and translucent outline secondary action.
- **AnimatedPageHero:** 28px-radius photo carousel, 32→52px title, 6-second crossfades, green diagonal/gold radial overlays.

### Marketplace routes

- `/browse`: 30→36px title and sorting control. At `xl`, use a 320px filter rail plus flexible results (`340px` at `2xl`). Rail has 28px padding, 48px search/country controls, 24×24 custom checkboxes, verification options, eight region counts, and six crop counts. Initial filters show Cameroon and South West. Active chips sit above results. Cards form 1→2→3 columns at `2xl`, have 208px photos, 24px body padding, 21px DM Serif crop title, 24px green price, and 48px View Details. Do not turn the rail into a drawer on mobile; it stacks above results.
- `/crops/[id]`: PageHeader with View farmer, Chat, Add to cart, Request Quote. Follow with supplier verification card, then `1.1fr/.9fr` gallery/specifications at `lg`. Main gallery is 280px with four 64px thumbnails and full-screen 85%-black lightbox. Specs use 12px tinted tiles in a two-column grid from `sm`.
- `/find-farmers`: PageHeader, then a single vertical list of 16px-radius 20px-padded farmer rows—not a card grid. Include loading, API error, and “No farmers yet.”
- `/farmers/[id]`: Header with Start chat, a profile/verification split card, then Active listings in 1→2→3 columns. Show the explicit unverified warning variant.
- `/request-quote`: PageHeader “Request real supply pricing,” followed by a white quote form that writes requests to a buyer account. Use labeled crop/listing, quantity, target price, destination, requirements/message inputs; group related controls from `md`, and include signed-out/error/success states.
- `/buyer-protection`: compact PageHeader, protection/safeguard feature cards, protected-trade explanation, and action links toward marketplace/help.

### Marketing and institutional routes

- `/about`: AnimatedPageHero; mission introduction; structural farmer barriers; full-stack platform solution; values grid; dark-green impact-number band; team/people section; chronological roadmap; dark-green transformation CTA.
- `/international`: AnimatedPageHero “Source Verified Cameroonian Crops for Global Markets”; farm-to-port process; export-ready crop cards; documentation/requirements; common export questions; sourcing CTA.
- `/compliance`: AnimatedPageHero; buyer-trust introduction; ONCC and MINADER institutional cards; standards by crop; multi-step compliance verification process; FAQ; sourcing CTA.
- `/sell`: HeroBanner; four seller benefits; four numbered steps; white registration CTA.
- `/sell/onboarding`: PageHeader plus two 20px-radius cards at `lg`: Farmer with green 4px top border/“Primary producer,” and Reseller with gold top border/“Aggregator.” Each has icon, description, checklist, and arrow link.
- `/pricing`: HeroBanner; three plan/fee cards; no-subscription outcome-based-fee explanation; fine-print section.
- `/verification`: HeroBanner; benefits unlocked by verification; step-by-step process; seller verification CTA.
- `/mobile`: HeroBanner; field-use feature grid; low-connectivity and mobile workflow information.
- `/help`: HeroBanner; support-topic feature grid; FAQ section; contact escalation.
- `/contact`: HeroBanner; contact-channel cards; full message form with responsive paired inputs and submit state.
- `/trade-support`: HeroBanner plus trade-support pillars and action panel.
- `/logistics-info`: HeroBanner plus end-to-end logistics feature grid.
- `/inspections-info`: HeroBanner plus inspection-scope feature grid.
- `/documentation-info`: HeroBanner plus supported-document feature grid.
- `/privacy` and `/terms`: HeroBanner followed by a maximum 768px prose column. Use 14px/28px body, 20px section headings, ordered/unordered lists, and green underlined links.

Loading states are white bordered cards. Errors use red text/pale red. Empty states use at least 220px dashed panels with 48px icon, 20px title, and 15px explanation.

## Authentication and onboarding

### Shared authentication shell

All standard auth routes use a full-viewport photograph of a Cameroonian farmer/crop field. Cover it with a diagonal green gradient from approximately 88% to 55% opacity and a subtle gold radial glow. Center a full-height `content-shell` with 32px vertical padding and 48px on desktop. Cap the form stack at 560px.

Place the 168×48px logo in a translucent-white 12px-radius plate above the form. Wrap the form in a 22px-radius, white/20 border plate with 4px padding and lift shadow/backdrop blur; the inner surface is white, 20px radius, 16×24px padding mobile and 24×32px from `sm`. Animate the stack with the standard 320ms page rise.

### Authentication screen inventory

- `/sign-in`: 22px-radius form card, 24–32px padding. “Welcome Back” and “Sign in to AgriculNet,” registration link, Phone/Email segmented control, conditional identifier, password with visibility icon, Forgot Password, verification note, alert area, and full-width 44px Sign In. Phone defaults to Cameroon. There are no social buttons inside this screen.
- `/register/buyer`: one-step buyer onboarding. Local Buyer/International Buyer segmented choice; Company or Buyer Name, Contact Name, Country, Phone, Email, trade/logistics info tile, Password, Confirm Password, terms checkbox, Create Buyer Account. Then Google, Apple, Facebook registration buttons and Sign In link. Paired fields become two columns at `sm`.
- `/register/farmer`: three-step header—Personal, Farm Details, Payout Setup. Step one collects identity/contact, password strength, region/city, and terms. Step two collects crop, estimated volume, cooperative, inspection preference, and export readiness. Step three collects payout method, account name, payout phone, and notification opt-in. Footer has Back and Continue/Create Farmer Account. Farmer/Buyer switcher sits near the heading.
- `/register/reseller`: one long form with personal/contact/password, region/city, Business Name, Main Crop, terms, and Create Reseller Account. Do not add OAuth here.
- `/register`: immediately redirects to buyer registration and therefore has no designed screen.
- `/forgot-password`: Phone/Email segmented switcher, conditional identifier, error/success/development hint areas, Send Reset Option, Back to Sign In.
- `/reset-password`: optional six-digit reset code, new/confirm password, strength panel, error/success/development hints, Set New Password.
- `/verify-email`: “Email step” badge, 48px green circular mail icon, confirming/check-email heading, neutral “What happens next?” panel, error/gold fallback/green success variants, optional development link, Open Verification Link and Resend Email.
- `/verify-phone`: Phone verification badge, six separate OTP cells (40px mobile, 48px from `sm`), delivery/error/success/fallback status, full-width Verify Code, and resend link.
- `/pending`: pending badge, account-under-review heading, green status card, three checkpoint cards (Identity evidence, Risk and payout check, Final approval), Check Status and Go to Sign In, optional last-checked time. Show a 30-second polling state.
- `/oauth/callback`: compact processing variant (“Finalizing your session…”) and red error variant with a 44px Back to sign in button.
- `/admin-portal`: within the auth shell, add a deep-green full-screen layer and center a maximum 448px white card with 32px padding. Include logo, pale-red Restricted Access pill, Email or Phone, Password, state feedback, full-width Sign In, and the footer warning “Authorized personnel only. Unauthorized access is prohibited.”

Form labels are 12–13px semibold; helper/error text is 12–13px. Password strength uses four concise rules with semantic ticks. Checkboxes should be 16–20px with green checked state. Primary form actions fill the available width on mobile.

## Shared role workspace shell

Buyer, seller, and admin routes use a full-bleed operational dashboard, not a centered marketing container. From `lg` (1024px), the grid is exactly **300px sidebar + flexible main**. Below `lg`, hide the sidebar and render a white horizontal navigation strip below the top bar. Main background is `#F9FAFB`; horizontal padding is 16px mobile, 32px at `lg`, 40px at `xl`, with 40px bottom padding and 32px vertical page rhythm.

### Mobile workspace navigation

Use a white strip with bottom border and 12×16px padding. First line is a 12px uppercase breadcrumb with `.14em` tracking: workspace name, slash, current route in green. Below it, horizontally scroll full-pill navigation chips. Chips are minimum 44px, 16×8px padding, 14px semibold, 16px icons. Active is green/white; inactive is ink-50 with neutral border. Count badges are at least 20px, gold-tinted inactive and white/20 active.

### Buyer and seller desktop sidebar

Use dark green `#0D3D22`, white text, sticky top, full viewport height, and internal vertical scroll. Do not place the logo here. Start with a centered identity block: 28px horizontal/32px vertical padding; 80×80 avatar with a 4px white/30 ring and 26px initials; 13px amber edit link; 20px bold name; two 15px white/70 metadata lines; white 14px verification pill.

Navigation body uses 24px horizontal/28px vertical padding. Group labels are 12px uppercase, bold, `.18em` tracking, white/60. Rows are minimum 44px, 12px horizontal padding, 8px radius, 16px medium, 20px icon. Inactive rows are white/80 and translate 4px right on hover. Active rows are white/dark-green with a 4px gold left border. Orders/messages badges use pale gold. Footer has 24px padding, divider, full-width 56px gold CTA, and 14px availability count.

Buyer groups are **My Sourcing** and **Account**; footer CTA is Browse Market. Seller groups are **My Farm** and **Account**; footer CTA is Add New Listing. Both `farmer` and `reseller` accounts use the same `/farmer/*` seller workspace; preserve current farmer-oriented labels even for resellers.

### Admin desktop sidebar

Use the same dark green but 24×28px padding. Place the 190×48px logo in a white panel, then an amber “Admin Panel” pill. After a divider, show “Main” and navigation. Rows are minimum 56px, 16px text, 16px padding/gap, 16px radius; active has white background, dark-green text, and 4px gold left border. Count badges are translucent white; dispute count becomes red. Footer identity uses a medium avatar, 15px name, and 13px role.

### Buyer and seller top bar

Sticky `top:0`, `z-index:30`, white/95 with blur and bottom border. Use negative horizontal margins so it reaches main edges, then restore 16/32/40px inner padding. It stacks below `xl` and becomes one row at `xl`.

Search is flexible to 768px and exactly 520px at `xl`, 56px high, ink-50 full pill, 20px icon at 20px left, 16px text. Seller submission searches `/farmer/listings`; buyer searches `/buyer/orders`. Right actions are 24px help and bell icons inside padded circles, optional red count, divider, account menu, and 40px green verification pill. Account name appears from `md`. The 256px account menu is white, 16px radius, 12px below trigger, and contains Profile, Settings, edit profile photo, and red Logout.

Buyer additionally shows a country selector only at `xl`. Seller status reads Verified Farmer or Verification Pending; buyer reads Verified Buyer or Verification Pending.

### Admin top bar

Same sticky structure with 20px vertical padding. Left shows 28→30px display route title and muted “Admin > {route}.” Right shows 520px-cap admin search, help, activity bell, refresh, divider, date, and purple account avatar/menu. Search targets Users. Stack until `xl`.

### Shared workspace components

- Workspace page uses 32px vertical gaps.
- Large header: 34→42px DM Serif, 18px/28px description, optional 15px back link and 56px actions.
- Standard panel: white, 16px radius, neutral border, clipped overflow. Header minimum 80px with 24×20px padding; title 22px. Body padding 24px.
- Metric card: 16px radius, 28px padding, 56px icon tile, 28px icon, 42px display value, 14px uppercase label; hover lifts 4px.
- Filter/search/select controls: 48 or 56px high, 8px radius. Search icon sits 20px left and input text begins around 56px.
- Status pill: 13px bold, 16×6px padding, full radius.
- Tabs: horizontally scrollable, 32px gap, 17px semibold, 20px bottom padding, 2px green active underline.
- Empty panel: minimum 220px, dashed border, 16px radius, 40px vertical padding, 48px icon, 20px title, 15px copy.
- Tables are horizontally scrollable. Hover rows tint pale green. Retain their frame when empty.

## Buyer workspace

### Buyer navigation and routes

Visible navigation: Dashboard, Browse Crops, Find Farmers, Saved Crops, My Orders, Messages, Payments, My Profile, Settings, Help & Support. Secondary routes reached contextually are Checkout, Order Detail, Conversation Detail, Notifications, Payment Return, Quotes, and Documents.

### `/buyer/dashboard`

Large greeting “Good morning, {name},” current date, sourcing overview, and 56px outline View Public Profile. Follow with a conditional 12px-radius verification banner. Render four metrics in 1→2→4 columns with 24px gaps: Active Orders/cyan, Saved Crops/green, Unread Messages/amber, Total Sourced/amber.

At `xl`, operations split `1.35fr/.65fr` with recent inquiries at least 360px. Order rows use 24px padding, 56px cyan avatar, 19px party/location, 21px green amount, status pill, and a five-step progress rail with 36px circles and 13px labels. Inquiry rows use a 56px green avatar and 20–24px row padding. Recommended listings form 1→2→4 compact cards. Every panel must have loading and live-data empty variants; do not fabricate records.

### `/buyer/orders` and `/buyer/orders/[id]`

Orders uses the common resource page: compact PageHeader, 16px-radius filter card, 48px search/status/sort controls, Reset outline, Export CSV gold, and a single vertical list. Status options are Pending, Confirmed, In transit, Delivered. Cards use 20px padding, 12px uppercase ID, 20px crop, 13px details, status at top right, optional gold Pay Now, and green View order.

Detail begins with 12px breadcrumb and PageHeader. At `lg`, split flexible order content and exactly 360px timeline. Timeline has a 20px title, 12px green nodes, 1px connector, status pills, and dates. Shipment module uses a green tracking banner, then `1.2fr/.8fr`: a 260px pale-green map illustration with curved route and gold/green/cyan points, and inset Logistics fee, ETA, truck/carrier cards. Include no-shipment, loading, and not-found variants.

### `/buyer/checkout`

Show signed-out and empty-cart states before the active form. Header is 30→36px with a right status pill. At `xl`, use `1.3fr/.9fr`, 24px gap. Left: Order Details and Payment Method. Right: Seller Summary and Checkout Summary.

Order details starts with a pale-green 16px-radius product block, 48px icon, 24px crop title, and white protected-amount inset with 28px value. New checkout shows Quantity and Unit in two columns from `md`; existing order does not. Logistics is a gray 16px-radius module with a 48px toggle; when enabled show region/city fields and cyan estimate. Then shipping address, billing address, and notes textareas.

Payment options are MTN MoMo and Orange Money cards, 16px radius/20px padding. Selected is green border/green-50; unselected is neutral. Seller summary uses 64px avatar and 22px name. Summary rows show goods, logistics, commission, seller net, channel, and a divided 24px green buyer total. Add gold warning, full-width 56px protected-payment CTA, and outline Return. Processing label is “Preparing checkout...”. Do not create a payment modal; Fapshi is hosted externally.

### `/buyer/payments` and `/buyer/payments/return`

Payments has three metrics, Payment Activity header with gold export, a 20px-padded filter row, then scrollable table. Header is ink-50 with 12px uppercase type; cells are 24×20px. Columns: Date, Reference, Channel, Amount, Status.

Return page caps at 768px and has Missing intent, Checking, Success, and Failure variants. Show AgriculNet/Fapshi status pills, 16px/28px message, two buttons from `md`, and 13px webhook note.

### `/buyer/messages` and conversation detail

Main hub has `height: calc(100vh - 118px)`, minimum 760px, 28px-radius outer frame. At `xl`, grid is 340px rail plus chat; below it stacks. Rail header uses 24×28px padding, 30px title, 48px search, and tabs All/Unread/Active Orders. Rows use 24×20px padding and 56px avatar; active has pale green and 4px left border.

Chat header uses 24px padding, 64px avatar, 30px participant, verification tag, 48px actions, and a pale-green listing banner with 48px gold icon. Messages sit in a maximum 896px centered column with 24px padding/20px gaps. Bubbles cap at 75%, use 16px radius and 16×12px padding; own is green/white right, other white left. Composer is a bordered 16px card with 3-row textarea, Clear, Send, and quick-reply pills.

The dynamic detail variant is minimum 720px, `calc(100vh - 112px)`, and uses a 360px rail at `xl`; both headers are 96px. Include list loading, history loading, no selection, no messages, warning, linked-listing, and not-found states.

### Other buyer pages

- `/buyer/notifications`: maximum 1152px; large header and 56px Mark all read; three summary cards; notification rows with 56px cyan icon, 18px title, 16px/28px detail, unread dot and status.
- `/buyer/saved`: common resource filters for grade and sort, then vertical public CropCards with 180px image and Send inquiry.
- `/buyer/quotes`: status filters and 16px-radius quote rows with title, details, and pill.
- `/buyer/documents`: status filters and document rows with title, type, URL detail, and pill.
- `/buyer/profile`: compact PageHeader; 112px avatar identity card; three KPI cards; `1.1fr/.9fr` company/sourcing panels at `xl`; editable profile/contact/password/recovery sections. Profile-photo dialog is full screen over ink/60, maximum 512px, with 288×288 circular crop preview and zoom/X/Y sliders.
- `/buyer/settings`: 30→36px heading with 56px Save; at `xl` use a 240px local nav plus content. Sections are Account, Notifications, Payment methods, Security, Language, Privacy, Danger Zone. The local nav is currently visual and Account stays selected. Coming Soon/Deactivate/Delete/Add Method controls are disabled.
- `/buyer/help-support`: 30→36px header and gold New Support Ticket. Use a 26px-radius green hero with search and three glass metrics. Four topic cards, category-filtered FAQ cards (answers always visible), guides, ticket form, status/contact/tickets/resources/account side panels. At `xl`, lower content splits `1.45fr/.55fr`.

Buyer state variants must cover authentication redirect, verification banners, resource loading/empty/error, no shipment, checkout signed-out/empty/processing, payment return states, conversation states, profile error, notifications empty, support submission, and settings saving.

## Seller workspace (farmer and reseller)

### Navigation and identity

Visible navigation: Dashboard, My Listings, Add New Listing, My Orders, Messages, Payments, Notifications, Profile, Settings, Help & Support. The identity block shows farmer/reseller name, farm location, rating, and verification. The current product deliberately routes resellers through the same seller screens and still displays labels such as “My Farm,” “Verified Farmer,” and “Farm location pending.” Do not invent reseller-only screens in the clone.

### `/farmer/dashboard`

Render greeting/date, seller workspace explanation, View Public Profile outline action, and conditional verification banner. Four metrics form 1→2→4 columns: Active Listings, Open Orders, Unread Messages, Protected Revenue. At `xl`, split approximately `1.4fr/.7fr` for Active Orders and Active Conversations. Recent Listings forms 1→2→3 columns. End with a pale-green live-dashboard-sync strip. There is no earnings chart on this page.

### `/farmer/listings`

Large header shows active/pending/total count and gold Add New Listing. Place horizontally scrollable All, Active, Pending, Rejected, Draft tabs; in the current implementation the active tab is visual. Filters are 56px Search, Status, Grade, Sort, Reset, Export CSV. Cards form three columns only at `xl`. Each has a 176px crop-color/image hero with status overlay, 16px radius, crop title/meta, a three-column Quantity/Price/Views strip, inquiry/save chips, and 48px Edit/View Inquiries actions.

### `/farmer/listings/new`

Cap content at 1024px and include Back to My Listings. Show a three-stage visual rail—Crop Details, Pricing & Quantity, Photos & Location—but keep all sections visible as in the current UI. Controls are mostly 64px and 16px type. Fields: crop category, variety/grade, 500-character description, quantity, unit, XAF price per unit, delivery window, pickup location.

Gallery drop zone accepts six images. Thumbnails form 2/3/4 columns; cover image has a green ring and Cover label. Show set-cover and remove controls. Footer places Cancel left, Save Draft and Publish Listing right. Add uploading, validation, publishing, and draft-save states.

### Listing detail and edit

- `/farmer/listings/[id]`: 12px breadcrumb, compact 24px PageHeader, Edit and red Archive. At `lg`, exactly 360px crop marketplace card plus flexible trade specs. Reuse the 180px crop-card image and trust ribbons.
- `/farmer/listings/[id]/edit`: breadcrumb, compact PageHeader, 18px-radius/20px-padded form. At `md`, use two columns for crop, grade, quantity, unit, price, pickup region; delivery and minimum-120px summary span both. Cancel and Save Changes align right.

### `/farmer/orders` and order detail

Large header, six visual tabs, Search, Status, Sort, Reset, Export. Render a vertical list with 24px gaps. Each card has header, 56px buyer avatar/details, 30px amount, five-step Inquiry→Delivered progress tracker, and action footer. Detail reuses breadcrumb, order card, and exactly 360px timeline at `lg`, with 12px nodes and status/date labels.

### `/farmer/messages` and conversation detail

Use a minimum 720px viewport-derived message frame. At `xl`, 360px conversation rail plus flexible chat; below `xl`, stack. Headers are 96px. Search is 56px; active row has pale green and a 4px green left line. Buyer avatar is cyan and 56px. Bubbles, composer, warning/listing banners, loading, empty, and not-found states match the buyer message system.

### `/farmer/payments`

Four metric cards, then Search/Status/Sort/Reset/Export. At `xl`, use `1.35fr/.65fr`: transaction table left and two side cards right. Table columns are Date, Order, Buyer, Amount, Method, Status. Side cards are Payout Method with gold withdrawal CTA and Earnings Breakdown. Include disabled/loading withdrawal and empty transaction variants.

### `/farmer/notifications`

Cap at 1152px. Header includes Mark All Read. Tabs are All, Orders, Messages, System. Use 20px list gaps. Notification card has 24px padding, 64px circular icon, optional 4px green unread line and 12px dot, title/body/date/status, and hover movement.

### `/farmer/profile`

Header with View Public Profile. At `xl`, use 360px identity/documents rail plus flexible information panel. Identity uses 128×128 avatar with 8px pale-green ring, 30px name, and three-column stats. Document rows are National ID, Farm Ownership, Cooperative Reference. Main content shows read-only Personal, Farm, and Settlement fields, followed by editable image, name/location, primary contact verification, password, and recovery-contact panels. Reuse the 512px profile-photo editor dialog.

### `/farmer/settings`

Maximum 1280px. At `xl`, 360px local settings navigation plus content. Navigation rows are 64px and the first remains visually selected. Content includes Regional Preferences, Change Password link, and three checked notification rows. Use read-only/disabled variants where applicable.

### `/farmer/help-support`

Maximum 1152px. Place an 80px-high large search, four help-category panels in two columns, native `<details>` FAQ accordion, support-ticket form, and existing ticket cards. Include search-empty, ticket-loading, no-ticket, submission-success, and submission-error variants.

### `/farmer/verify-identity`

This secondary route is reached from the verification banner. Cap at 672px. Show three steps—ID Front, ID Back, Live Selfie—with a 6px segmented progress bar. Camera is black, 16:9, 16px radius with a 64px capture control. Review displays three 3:4 thumbnails, Start Over, and Submit for Review. Completion centers an 80px success icon and indicates a three-second redirect. Include camera-permission and capture-error variants.

## Administration console

Admin screens use more generous **24px radii**, denser tables, and operational tone while retaining the green/gold brand. The admin sidebar contains the logo; account avatar is purple. Admin page header is 36→44px. Admin stat card is minimum 190px high, 24px radius, 28px padding, with 56px rounded icon tile, 42px value, and optional 8px progress rail. Admin card header uses 24×20px padding and 24px title.

Toolbar controls are 48px high with 16px radius and support search, selects, From/To dates, Reset, and record count. Tables scroll horizontally; headers are 12px uppercase `.18em`, 24×16px padding; body cells are 24×20px with 15px text. Status pills use 12×4px padding and 12px bold text.

Admin navigation: Dashboard, Users, Listings, Orders, Payments, Inspections, Logistics, Disputes, Analytics, Settings, Audit Logs, Help & Support.

### `/admin/dashboard`

Greeting/header with report download. Five metrics at `xl`: Total Users, Pending Verifications, Active Listings, Open Orders, Revenue. Main split `1.3fr/.7fr`: pending-action table on the left, Revenue Overview and Platform Integrity on the right. Pending rows merge users, listings, and disputes with icon/status/contextual action. Revenue Overview is a **CSS illustration**, not a real line chart: 256px pale gradient panel, large rounded green arc, two dots.

### `/admin/users` and `/admin/users/[id]`

Users directory has three metrics and Role/Status/Sort/date filters. Columns: User, Contact, Region, Status, Joined, Actions. Quick Review opens a maximum 448px right drawer above a dark blurred overlay. Drawer includes role/status, heuristic score, checklist, contact, and full-review CTA. Close on backdrop, close button, and Escape.

User detail begins with breadcrumb and Profile Review header. At `xl`, split `.95fr/1.05fr` identity and evidence/review panels. Evidence rows are ID front, ID back, selfie, submitted date. Document preview opens a centered maximum 920px modal with image capped at 70vh. Review panel has reason textarea and Approve, Reject, Request ID Again, Ban actions, plus success/error banners.

### Listings and orders

- `/admin/listings`: three metrics; Status/Grade/Sort toolbar; table columns Listing/Crop, Quantity, Location, Price, Status, Updated, Action.
- `/admin/listings/[id]`: breadcrumb, compact header, and `360px + flexible` crop card/specification layout.
- `/admin/orders`: four metrics—total, active, value, average delivery; Status/Sort/date filters; columns Order ID, Buyer, Farmer, Crop, Amount, Status, Date, Action.
- `/admin/orders/[id]`: shared order detail with flexible order card and 360px timeline.

### Payments, inspections, logistics, and disputes

- `/admin/payments`: four metrics; at `xl`, `1.25fr/.75fr` transaction history and pending payouts. Columns Transaction ID, Party, Amount, Method, Status, Date. Payout rows have gold Release buttons and explicit loading/toast states.
- `/admin/inspections`: three metrics; Status/Sort/date toolbar; columns Subject, Inspector, Findings, Report, Status, Updated.
- `/admin/logistics`: three metrics; Status/Sort/date toolbar; columns Lane, Carrier, Tracking, Location, Status, Updated.
- `/admin/disputes`: three metrics; Status/Priority filters; columns Subject, Order, Details, Status, Updated, disabled resolution action. Highlight nonzero dispute counts red in the sidebar.

### `/admin/analytics`

Four metrics. At `xl`, `1.1fr/.9fr` revenue chart and operational mix. Revenue chart is a 320px hand-built six-bar illustration with October–March labels and bar proportions 42, 58, 46, 70, 64, 82. Operational Mix uses four labeled progress rows. Do not replace this with an advanced BI dashboard in the clone stage.

### `/admin/audit-logs`

Three metrics, audit toolbar, and table columns Timestamp, Admin/User, Action, Resource, IP/Details, Status. Actor avatars are 40px purple. Use action-code pills. Follow with a Security Boundary information panel.

### `/admin/settings`

Admin profile card with 112px avatar, three 24px-radius highlight cards, then Access Controls and Commission Display in two columns. Show read-only route secret, disabled checked security controls, and read-only 5% commission. Follow with editable account, profile, contact, and password panels using the shared profile editor.

### `/admin/help-support`

Place a 64px pill search in a padded card, then three-column Manual/SOP/System Status tiles. Split FAQ and IT support form `1fr/.85fr`. End with support-ticket table: Ticket, Subject, Creator, Priority, Status, Created. Include table-loading/empty and form-submission states.

## Global AgriculNet AI assistant

The assistant is available across public, authentication, buyer, seller, and admin routes.

Closed state: fixed round launcher at bottom right—20px from right and 80px from bottom on mobile, 24px from right/bottom from `sm`. Size 56×56px, green `#1A6B3C`, white 24px message icon, shadow `0 12px 32px rgba(26,107,60,.35)`. Hover lifts 2px and turns `#2E8B57`. Add a 14px gold status dot with 2px white border at its top-right.

Open state: mobile left/right inset 12px and bottom 144px; desktop width 384px, right 24px, bottom 96px. Height is approximately 608px but must remain within the viewport. Use 16px radius, neutral border, white background, `z-index:70`, and `0 24px 70px rgba(11,18,32,.24)` shadow.

Header is deep green with 16×14px padding. Add 40×40 white/10 sparkle tile with gold icon, 15px bold title, 12px pale-green subtitle, and 36×36 reset/close actions. Message area is ink-50 with 16px padding and 16px vertical gaps. Bubbles cap at 86%, use 14×10px padding, 13px copy, 16px radius; user is green/white with 4px bottom-right corner, assistant is white/bordered with 4px bottom-left corner. Render replies as plain pre-wrapped text.

Typing uses three bouncing 6px green dots. Errors appear in a friendly pale-red tile. Footer has top border and 12px padding, textarea from 44px to 112px tall, and 44×44 send action. Add a 10px privacy line with shield: do not submit passwords, identity documents, or payment credentials. Enter sends, Shift+Enter adds newline, Escape closes, reset restores the welcome message, and focus/scroll follows the latest message.

## Required component and state library

Create reusable variants before assembling screens:

- BrandLogo: header, footer/auth plate, admin plate.
- Primary green, gold, outline, ghost, danger, icon-only, disabled, loading buttons in 32/40/48/56px heights.
- Text, password, phone-country, select, textarea, search, OTP, checkbox, toggle, segmented language/role controls.
- Standard card, interactive card, metric card, admin stat card, panel, glass card, empty/error/loading card.
- Verified, export-ready, pending, risk, order, payment, and priority pills.
- Public crop card in 180px and buyer browse card in 208px image variants.
- Farmer card, farmer list row, notification row, order card, timeline, shipment tracker, conversation row, chat bubble, composer.
- Public Header guest/authenticated, SubNav, Footer; workspace sidebar buyer/seller/admin; desktop/mobile top bars.
- Filter toolbar, tabs, active chips, pagination, data table, dropdown, modal, right drawer, toast, skeleton.
- Verification banner, image uploader, camera capture, profile-photo crop dialog, AI launcher/chat panel.

For each data-driven screen, design at least: populated, loading, empty, API error, permission/verification warning, and disabled/submitting states. Do not use dummy records in an empty-state variant.

## UXPilot master prompt

Copy the following block into UXPilot after uploading the AgriculNet logo and agricultural images:

> Recreate the current AgriculNet agricultural B2B marketplace as a high-fidelity responsive design system and complete screen set. This is a clone stage, not a redesign. Use DM Sans for interface text and DM Serif Display for headings. Use ink-50 #F9FAFB canvas, dark agricultural green #0D3D22, primary green #1A6B3C, hover green #2E8B57, gold #E8B84B, primary text #111827, secondary #374151, muted #6B7280, and borders #E5E7EB. Use 8–12px controls, 14–18px standard cards, 22–28px feature/admin surfaces, subtle enterprise shadows, 4px green focus rings, and authentic Cameroonian crop/farmer/logistics imagery. Keep the public content shell full width with 16/24/32/40px responsive side padding. Preserve all dimensions, section orders, responsive rules, role-specific navigation, states, and exact component anatomy from the attached AgriculNet UI Clone Specification. Build the public homepage and all public marketplace/information pages, centered photo-backed authentication routes, buyer workspace, shared farmer/reseller seller workspace, admin operations console, and fixed AgriculNet AI assistant. At 1024px, switch dashboards from a 300px dark-green desktop sidebar to a white horizontal mobile navigation rail. Do not add a hamburger, bottom dock, split authentication view, separate reseller dashboard, or new functionality. Produce populated, loading, empty, error, unverified, disabled, and submitting variants. Use the uploaded logo as a contained image rather than recreated text. Design frames at 390×844, 768×1024, 1440×1024, and 1600×1100.

Because one UXPilot generation may truncate a platform this large, generate in this sequence while keeping the same library: **(1) foundations and public shell, (2) homepage and marketplace, (3) information and auth pages, (4) workspace shell and buyer, (5) seller, (6) admin, (7) assistant and state variants**. Use this document’s individual route section as the follow-up prompt for each batch.

## Exact current route manifest

Use this as a completeness check. Dynamic identifiers must be represented by realistic detail-screen examples.

**Public:** `/`, `/about`, `/browse`, `/buyer-protection`, `/compliance`, `/contact`, `/crops/[id]`, `/documentation-info`, `/farmers/[id]`, `/find-farmers`, `/help`, `/inspections-info`, `/international`, `/logistics-info`, `/mobile`, `/pricing`, `/privacy`, `/request-quote`, `/sell`, `/sell/onboarding`, `/terms`, `/trade-support`, `/verification`.

**Authentication:** `/admin-portal`, `/forgot-password`, `/oauth/callback`, `/pending`, `/register` (redirect only), `/register/buyer`, `/register/farmer`, `/register/reseller`, `/reset-password`, `/sign-in`, `/verify-email`, `/verify-phone`.

**Buyer:** `/buyer/dashboard`, `/buyer/checkout`, `/buyer/documents`, `/buyer/help-support`, `/buyer/messages`, `/buyer/messages/[conversationId]`, `/buyer/notifications`, `/buyer/orders`, `/buyer/orders/[id]`, `/buyer/payments`, `/buyer/payments/return`, `/buyer/profile`, `/buyer/quotes`, `/buyer/saved`, `/buyer/settings`.

**Seller:** `/farmer/dashboard`, `/farmer/help-support`, `/farmer/listings`, `/farmer/listings/new`, `/farmer/listings/[id]`, `/farmer/listings/[id]/edit`, `/farmer/messages`, `/farmer/messages/[conversationId]`, `/farmer/notifications`, `/farmer/orders`, `/farmer/orders/[id]`, `/farmer/payments`, `/farmer/profile`, `/farmer/settings`, `/farmer/verify-identity`.

**Admin:** `/admin/dashboard`, `/admin/analytics`, `/admin/audit-logs`, `/admin/disputes`, `/admin/help-support`, `/admin/inspections`, `/admin/listings`, `/admin/listings/[id]`, `/admin/logistics`, `/admin/orders`, `/admin/orders/[id]`, `/admin/payments`, `/admin/settings`, `/admin/users`, `/admin/users/[id]`.

## Current-interface caveats

- Keep the homepage category items, How It Works “Start onboarding,” footer newsletter submission, some support topic controls, and some settings navigation items as visual controls where the current implementation has no connected action.
- Browse active-filter X icons are currently decorative within chips rather than working remove buttons.
- Do not render the unused split-screen auth brand panel, role cards, or mobile marketplace dock.
- `ink-950` appears in several class names without a defined token. Render it as the intended darkest ink, `#0B1220` or the inherited `#111827`, rather than introducing a new blue-black.
- This specification describes the current interface, including prototype/planned marketplace states. It does not claim that every displayed workflow is operational in production.

## Clone acceptance checklist

- Product name reads AgriculNet everywhere.
- Uploaded transparent logo is used at the documented sizes and never rebuilt as editable text.
- Public pages keep their full-width shell and existing section order.
- Homepage hero is full bleed; secondary heroes remain rounded inside the content shell.
- Green/gold hierarchy, DM fonts, card radii, shadows, focus rings, and icon scale match the tokens.
- EN/FR and country controls are present; authenticated/guest header variants are present.
- Buyer/seller sidebars begin with identity and no logo; admin sidebar contains the logo.
- Dashboard sidebar is exactly 300px from `lg`; mobile uses a horizontal chip rail.
- Buyer, seller, and admin pages retain their distinct density, radii, and navigation.
- Tables remain horizontally scrollable and empty tables keep a visible frame.
- All specified loading, empty, error, warning, disabled, and submitting variants exist.
- The assistant follows the documented launcher/dialog dimensions and privacy treatment.
- No unused repository components or inferred features have been introduced.

$2b$12$Z5kMp.raprnP.1jjVB1ME.3PtkjJQukbPg6uX2rSnuF5skYnlxTuS
BEGIN;

UPDATE public.users
SET
  password_hash = '<$2b$12$Z5kMp.raprnP.1jjVB1ME.3PtkjJQukbPg6uX2rSnuF5skYnlxTuS>',
WHERE email = 'mbengespoir@gmail.com'
  AND role IN ('admin', 'super_admin');

DELETE FROM public.tokens
WHERE user_id = '<3e43edb1-428c-4377-9723-f26715c6e804>'
  AND type = 'refresh_token';

COMMIT;