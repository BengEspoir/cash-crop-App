# AgriculNet Authentication Clone and Redesign Brief

## Required workflow

This task has two separate, sequential stages:

1. **Clone stage:** reproduce the current authentication screens faithfully.
2. **Redesign stage:** only after the complete clone set is produced and reviewed, create improved versions of every cloned screen.

Do not combine these stages. The clone must not contain redesigned layouts, additional fields, new authentication methods, or a different brand style. Label clone frames **CURRENT CLONE** and redesigned frames **REDESIGN CONCEPT** so they cannot be confused.

You will receive uploaded AgriculNet logo files with this document. Use the uploaded logo directly as an image asset. Do not redraw the symbol, recolor it, or recreate the wordmark as editable text.

## Screens and routes in scope

Create clone and redesign versions for:

- `/sell/onboarding` - seller route selection for Farmer/Producer or Reseller/Aggregator.
- `/register/farmer` - Farmer/Producer registration.
- `/register/reseller` - Reseller/Aggregator registration.
- `/register/buyer` - Local Buyer and International Buyer registration variants.
- `/sign-in` - shared login by phone or email.
- `/forgot-password` - recovery by phone or email.
- `/reset-password` - reset-code and email-link variants.

Do not generate dashboards, checkout, payments, marketplace pages, admin login, email verification, phone verification, OAuth callback, or account-review screens in this task. Registration actions may indicate their next verification step without designing those additional routes.

## AgriculNet visual foundation

Both stages must retain AgriculNet's green-and-gold identity.

### Color palette

| Purpose | Hex |
|---|---:|
| Deep green | `#0D3D22` |
| Primary green | `#1A6B3C` |
| Green hover | `#2E8B57` |
| Pale green | `#EAF4EE` |
| Very pale green | `#F3FAF5` |
| Primary gold | `#E8B84B` |
| Gold hover | `#D1A23A` or `#E0AE3E` |
| Dark gold | `#8A6200` |
| Pale gold | `#F7EDD5` |
| Main text | `#111827` |
| Secondary text | `#374151` |
| Muted text | `#6B7280` |
| Strong border | `#D1D5DB` |
| Standard border | `#E5E7EB` |
| Light canvas | `#F9FAFB` |
| Error text | `#922B21` |
| Error background | `#FDECEA` |

Use **DM Sans** for body copy, form fields, labels, navigation, and buttons. Use **DM Serif Display** for page headings. Inputs require visible labels; placeholders never replace labels. Use Lucide-style outline icons and a visible 4px translucent-green keyboard focus ring.

### Uploaded logo

Use the uploaded transparent PNG or SVG. Preserve its approximately 3.08:1 aspect ratio, transparent padding, green/gold colors, and subtitle. Set fit to **contain**. In the current auth shell it appears at approximately 168x48px inside a white translucent plate.

## Stage 1 - exact current clones

### Shared authentication shell

Use this exact shell for Login, Forgot Password, Reset Password, and all registration forms:

- Full viewport height and width.
- Background photograph:
  `https://res.cloudinary.com/dgfhsuzh8/image/upload/v1778517781/famer_3_epxio6.jpg`
- Image fills the viewport with cover cropping.
- Add a 120-degree green overlay: `rgba(13,61,34,.88)` at the left, `.72` at the middle, and `.55` at the right.
- Add a subtle gold radial light near the upper-left using approximately `rgba(232,184,75,.20)`.
- Center the content vertically and horizontally.
- Use 32px vertical page padding and 48px on desktop.
- Form stack maximum width: 560px.
- Place the uploaded 168x48px logo above the form in a 12px-radius white/95 plate with 12x8px padding and lift shadow.
- Outer form plate: 22px radius, white/20 border, white/95 background, 4px padding, backdrop blur, lift shadow.
- Inner form plate: 20px radius, white, 16px horizontal and 24px vertical padding on mobile; 24px horizontal and 32px vertical from 640px.
- Individual page cards use 20-22px radius and 24px padding, increasing to 32px at 640px.
- Entry animation: fade from opacity 0 and rise 6px over approximately 320ms.

Inputs are 44px high, 10px radius, neutral border, 14px text, and 12px horizontal padding. Buttons are normally 44px high and full-width on mobile. Error feedback is a 12px-radius pale-red block with 16x12px padding and 12px text.

### Shared clone components

**Segmented switcher:** inline-flex, 10px outer radius, neutral border, light-gray background, 4px inner padding. Options have 8px radius, 12x8px padding, and 13px semibold text. Selected is pale green with green text.

**Step indicator:** 28px numbered circles, 12px labels, 12px gaps, and hidden 32x2px connectors on small screens. Active and complete circles are green/white; incomplete circles are white with neutral border. Completed steps use a check icon.

**Password control:** labeled field with visibility toggle. Password strength is a 14px-radius light panel with four horizontal 8px bars and these rules:

- At least 8 characters.
- One uppercase letter.
- One number.
- Avoid common words such as password, qwerty, farmer, or buyer.

**Phone control:** country selector/dial code plus phone input, with Cameroon as the default where required.

**Form states:** include untouched, focused, valid, field error, server error, disabled, and submitting. Submitting buttons replace their label with Processing, Signing In, or the route-specific progress text.

### Clone: `/sell/onboarding`

This is the entry screen for the two seller registration routes. It uses the public-page shell rather than the photo auth shell.

- Header: “Choose your seller onboarding path.”
- Description explains professional onboarding, identity evidence, and protected orders.
- Two cards stack on mobile and form two columns at desktop.
- Cards use 20px radius and 24px padding, increasing to 28px.
- Farmer card uses a 4px green top accent and “Primary producer” pill.
- Reseller card uses a 4px gold top accent and “Aggregator” pill.
- Each card contains icon, 24px display heading, short explanation, and arrow action.
- Farmer action routes to `/register/farmer`.
- Reseller action routes to `/register/reseller`.

Keep current headings “Farmer onboarding” and “Reseller onboarding” in the clone. The redesign may display the clearer dual labels “Farmer / Producer” and “Reseller / Aggregator.”

### Clone: `/register/farmer`

Heading: **Create your farmer account**. Include a Sign In link and Farmer/Buyer segmented switcher. The Buyer option routes to buyer registration.

Use the three-step indicator:

1. **Personal**
2. **Farm Details**
3. **Payout Setup**

Step 1 fields:

- First Name and Last Name in two columns from 640px.
- Phone Number with helper “Used for trade alerts and payout setup.”
- Email Address.
- Password and Confirm Password in two columns.
- Four-rule Password Strength panel.
- Region select and City in two columns.
- Terms checkbox in a bordered light-gray panel.

Step 2 fields:

- Primary Crop.
- Estimated/Harvest Volume.
- Cooperative.
- Inspection Preference.
- Export-readiness checkbox spanning the width.

Step 3 fields:

- Payout Method.
- Account Name.
- Payout Phone.
- Notification opt-in checkbox.

Footer shows Back from step two onward and Continue until the final **Create Farmer Account** action. Include Processing and error states. The clone must show only the active step's fields.

### Clone: `/register/reseller`

Heading: **Create your reseller account**.

Supporting copy: “Start selling aggregated crop supply. Payout and ID verification tasks appear in your seller dashboard.”

The current screen is one long form, not a multi-step flow. Preserve that in the clone:

- First Name and Last Name.
- Cameroon Phone Number and Email Address.
- Password and Confirm Password.
- Four-rule Password Strength panel.
- Region and City.
- Business Name and Primary Crop.
- Terms checkbox.
- Full-width Create Reseller Account.
- Server-error and submitting states.

Use two-column field rows from 640px and one column on mobile. Do not add OAuth registration to this clone.

### Clone: `/register/buyer`

Heading: **Create your buyer account**. Include Local Buyer/International Buyer segmented selection and the single “Buyer Profile” step indicator.

Fields:

- Company or Buyer Name.
- Contact Name.
- Country.
- Phone Number.
- Email Address.
- Informational panel: buyer country is stored separately from destination market so trade and logistics records remain accurate.
- Password and Confirm Password.
- Terms checkbox accepting buyer terms, marketplace policies, and protected-payment conditions.
- Create Buyer Account.
- Sign In link.

Local Buyer variant:

- Cameroon is selected and stored automatically.
- Phone control defaults to Cameroon.

International Buyer variant:

- Country is an explicit selector with flag, country name, and dial code.
- Phone dial code follows country selection.

After the primary form, include a divider reading **Or continue with** and three 44px white bordered buttons: Continue with Google, Continue with Apple, Continue with Facebook. These social options belong to buyer registration in the current interface.

### Clone: `/sign-in`

Use a 22px-radius card with 24-32px padding.

Content order:

1. Welcome eyebrow and **Sign in to AgriculNet** heading.
2. Supporting copy about trading, sourcing, and order tracking.
3. “New here? Register” link.
4. Phone/Email segmented switcher.
5. Conditional Phone Number or Email Address field.
6. Password field with visibility control.
7. Forgot Password link and verification note.
8. Error alert area.
9. Full-width 44px Sign In button.

Phone is the default method and begins with Cameroon selected. The submit action is disabled until valid and reads Signing In while submitting. Do not add social-login buttons to this clone.

### Clone: `/forgot-password`

Heading: **Forgot your password?**

Supporting copy: “Choose your preferred recovery channel and we will send a secure reset option.”

Content order:

- Phone Number/Email Address segmented switcher.
- Conditional phone control or email input.
- Error, success, and development-hint areas when applicable.
- Full-width Send Reset Option action.
- Back to Sign In link.

On successful request, the prototype moves to `/reset-password`.

### Clone: `/reset-password`

Heading: **Create a new password**.

Provide two clone variants:

1. **Reset-code variant:** six-digit Reset Code, New Password, Confirm Password, Password Strength, feedback, Set New Password.
2. **Email-link variant:** omit the code because the token is already in the link; keep password fields, strength, feedback, and Set New Password.

If no valid recovery context exists, display: “Start from password recovery so we know which account to reset.” On success, route to Sign In. The submit button is disabled until valid and shows a processing state.

## Clone-stage acceptance gate

Do not start redesign work until all of these are present:

- One seller-route selection screen.
- Three Farmer/Producer step screens.
- One complete Reseller/Aggregator registration screen.
- Local Buyer and International Buyer registration variants.
- Phone and Email login variants.
- Phone and Email forgot-password variants.
- Reset-code and email-link reset-password variants.
- Focus, validation error, server error, disabled, and submitting examples.
- Mobile 390x844 and desktop 1440x1024 frames.
- Uploaded AgriculNet logo used correctly.

## Stage 2 - redesign every cloned screen

After the clone gate is complete, use the same fields, routes, legal agreements, and authentication behavior to create a visibly improved system. Preserve the brand colors and uploaded logo, but the layout, content hierarchy, spacing, helper text, navigation, and responsive structure may be redesigned.

### Redesign goals

- Make role selection understandable before the user begins a form.
- Clearly explain Farmer/Producer, Reseller/Aggregator, Local Buyer, and International Buyer.
- Reduce long-form fatigue and prevent accidental loss of entered information.
- Keep users aware of their current step and what comes next.
- Improve international country/phone handling.
- Show password requirements beside or directly below the password as users type.
- Make errors specific, close to the affected field, and recoverable.
- Explain why phone, payout, farm, business, and country information is requested.
- Keep privacy and security reassurance concise and contextual.
- Make the primary and secondary action hierarchy obvious on mobile.
- Do not require new backend fields or change existing route destinations.

### Redesigned shared shell

Create one coherent authentication family. On desktop, the redesigned shell may use either a more spacious centered card or a 40/60 split layout with an agricultural trust/imagery panel and form panel. On mobile, always use a single-column form with the logo, short context, and sticky-safe action area. Do not let decoration reduce form contrast or readability.

Retain the green image treatment and gold highlights. Add a compact “Back to AgriculNet” link. Keep the form column between approximately 480 and 620px. Use consistent header, progress, field, alert, and footer components across every role.

### Redesigned role selection

Turn the seller gateway into a clear account-type decision page. Show four concise role choices or a two-stage choice:

- Farmer / Producer - produces crops directly.
- Reseller / Aggregator - consolidates or resells crop supply.
- Local Buyer - sources primarily within Cameroon.
- International Buyer - sources for markets outside Cameroon.

Because routes must remain unchanged, each choice links to its existing registration route. Include “Not sure?” guidance without forcing users to understand legal terminology. Do not merge all registration payloads into one new route.

### Redesigned registrations

**Farmer / Producer:** retain three logical stages but improve step descriptions, review summaries, inline validation, mobile footer actions, and explanation of payout/verification. Keep all original fields.

**Reseller / Aggregator:** the redesign may split the current long form into three visual stages - Account, Business, Review - while submitting the same original fields to `/register/reseller`. Make the difference from a producer explicit.

**Buyer:** present Local and International options as descriptive selection cards rather than a tiny unexplained toggle. Keep one concise form or divide it into Account and Trade Profile if it materially improves scanning. Cameroon should remain locked for local buyers; international buyers must deliberately select country. Preserve the three current OAuth registration options.

Add a final review block before account creation where helpful, but never display the password. Clearly state that identity/contact verification may follow registration.

### Redesigned login and recovery

**Login:** make phone/email switching clearer, retain the same two methods, improve error recovery, and provide obvious Register and Forgot Password actions. Do not add unapproved social login.

**Forgot Password:** use a short two-step interaction if helpful: choose recovery channel, then enter destination. Confirmation must mask phone/email and explain the next action.

**Reset Password:** show the reset code as a dedicated six-cell control in the code variant, keep the email-link variant code-free, show real-time password rules, confirm matching, and provide clear expired/invalid context recovery back to Forgot Password.

## Redesigned state requirements

For every redesigned screen, show:

- Default and keyboard-focused field.
- Valid field confirmation where useful.
- Field-level validation error.
- Top-level network/server error.
- Disabled and loading submit.
- Successful submission or next-step confirmation.
- Mobile keyboard-safe layout.
- Password visible/hidden state.
- Slow network without duplicate submission.

Use touch targets of at least 44px. Respect reduced motion. Keep contrast WCAG-friendly. Avoid horizontal page scrolling and do not place critical help only inside tooltips.

## Copy-paste prompt for Stage 1

> Create exact high-fidelity clones of the current AgriculNet authentication screens described in the attached brief. Produce the seller onboarding selector, three Farmer/Producer registration steps, the complete Reseller/Aggregator form, Local Buyer and International Buyer registration variants, Phone and Email login variants, Phone and Email forgot-password variants, and reset-code and email-link reset-password variants. Use the uploaded AgriculNet logo files directly. Match the current full-screen farm background, green overlay, centered 560px auth shell, DM Sans and DM Serif Display typography, green/gold palette, spacing, card radii, inputs, segmented controls, progress indicators, fields, labels, copy, buttons, and states precisely. Do not redesign anything during this stage and do not add fields, routes, dashboards, or authentication methods. Label every frame CURRENT CLONE. Create mobile 390x844 and desktop 1440x1024 versions plus validation, server-error, disabled, and submitting examples. Stop after the complete clone set and wait for clone approval before creating redesigns.

## Copy-paste prompt for Stage 2

> Using the approved CURRENT CLONE screens and the redesign requirements in the attached brief, now create REDESIGN CONCEPT versions of every cloned AgriculNet authentication screen. Keep the same routes, fields, payload meaning, green/gold palette, uploaded logo, DM Sans/DM Serif identity, and authentication behavior. Improve role clarity, user flow, form grouping, progress, spacing, helper copy, password guidance, country/phone selection, error recovery, privacy reassurance, mobile usability, and action hierarchy. Clearly distinguish Farmer/Producer, Reseller/Aggregator, Local Buyer, and International Buyer. You may split the long reseller form into logical visual stages and use a refined centered or split desktop shell, but do not require new backend fields or add unapproved social login. Label all new frames REDESIGN CONCEPT and include responsive, focused, validation, loading, failure, and success states.

## Credit-conscious production sequence

Use the same variables and components across every batch:

1. Clone foundation, seller selector, Login, Forgot Password, Reset Password.
2. Clone Farmer/Producer, Reseller/Aggregator, Local Buyer, International Buyer.
3. After approval, create the redesigned shared shell, role selector, Login, and recovery screens.
4. Create redesigned Farmer/Producer, Reseller/Aggregator, Local Buyer, and International Buyer registrations.

Do not regenerate approved clone frames while producing redesigns. Duplicate them into a separate redesign page and preserve the originals for side-by-side comparison.
