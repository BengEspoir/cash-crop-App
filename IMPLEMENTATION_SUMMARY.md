# AgriculNet Onboarding Implementation Summary

## Overview
This implementation adds complete phone/email verification, 5-minute automatic account review, and proper buyer portal segmentation (local vs international buyers with different country/phone handling).

---

## Backend Changes

### New Files Created

1. **`server/src/utils/countries.js`**
   - Comprehensive country data with dial codes, flags, and phone formats
   - 195+ countries included
   - Cameroon is available for local buyers only

2. **`server/src/utils/phoneValidator.js`**
   - Global phone validation utility
   - `validatePhone()` - validates based on user type and country
   - `normalizePhone()` - formats to international format
   - `formatPhoneInternational()` - formats with country code

3. **`server/src/utils/sms/index.js`**
   - Multi-provider SMS service
   - Africa's Talking (primary for African countries)
   - Twilio (fallback for international)
   - Auto-provider selection based on destination country

4. **`server/src/utils/email/index.js`**
   - Multi-provider email service
   - SendGrid support
   - Mailgun support
   - SMTP fallback

5. **`server/src/jobs/accountReviewJob.js`**
   - Automated 5-minute account approval job
   - Sends approval email when complete
   - Finds users in `pending_review` status for > 5 minutes

6. **`server/src/jobs/scheduler.js`**
   - Job scheduler running every minute
   - Manages background tasks
   - Error handling and logging

7. **`server/database/migrations/023_auto_approval_setup.sql`**
   - Adds `reviewed_at` column to users table
   - Creates indexes for efficient job queries

### Modified Files

1. **`server/src/utils/sms.js`**
   - Now re-exports from new multi-provider service
   - Maintains backward compatibility

2. **`server/src/utils/mailer.js`**
   - Uses new multi-provider email service
   - Added `sendAccountApprovedEmail()` function

3. **`server/src/config/env.js`**
   - Added SMS provider configuration:
     - `SMS_PRIMARY_PROVIDER`
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`
   - Added email provider configuration:
     - `EMAIL_PROVIDER`
     - `SENDGRID_API_KEY`
     - `MAILGUN_API_KEY`
     - `MAILGUN_DOMAIN`

4. **`server/server.js`**
   - Starts job scheduler on server startup
   - Scheduler runs in non-test environments

5. **`server/src/modules/auth/auth.service.js`**
   - Updated `registerBuyer()` to handle international phone numbers
   - Uses `countryCode` field to determine phone format

6. **`server/src/modules/auth/auth.helpers.js`**
   - Updated status logic for auto-approval
   - Buyers auto-approve, farmers need manual review

7. **`server/.env.example`**
   - Added all new environment variables with documentation

---

## Frontend Changes

### New Files Created

1. **`client/src/lib/countries.js`**
   - Client-side country data
   - Same structure as server version
   - Helper functions for dropdowns

### Modified Files

1. **`client/src/components/auth/PhoneInput.jsx`** (complete rewrite)
   - Dynamic country code prefix
   - Country dropdown for international buyers
   - Flag display
   - Country code synchronization
   - New props:
     - `countryCode` - current country code
     - `onCountryChange` - callback when country changes
     - `showCountrySelector` - enables dropdown
     - `disabled` - disables input

2. **`client/src/app/(auth)/register/buyer/page.js`**
   - **Local Buyer:**
     - Country field auto-set to "Cameroon" (disabled)
     - Phone locked to +237
   - **International Buyer:**
     - Country dropdown with all countries EXCEPT Cameroon
     - Phone country selector enabled
     - Country and phone code synchronized
   - Added `CountrySelect` component
   - Form state management for buyer type changes

3. **`client/src/lib/validators.js`**
   - Updated `registerBuyerUnifiedSchema`:
     - Added `countryCode` field
     - Conditional phone validation (Cameroon for local, international format for others)

4. **`client/src/components/auth/PendingReview.jsx`** (complete rewrite)
   - Countdown timer (5 minutes)
   - Auto-status check every 30 seconds
   - Auto-redirect to sign-in when timer expires
   - Auto-redirect to dashboard if approved early
   - "Check Status" button for manual refresh
   - Last checked timestamp

5. **`client/src/store/authStore.js`**
   - Updated `registerBuyer()` to conditionally normalize phone
   - Local buyers: Cameroon format
   - International buyers: pass through as-is

---

## Environment Variables (Add to .env)

### Server (.env)
```bash
# SMS
SMS_PRIMARY_PROVIDER=africastalking  # or twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Email
EMAIL_PROVIDER=smtp  # or sendgrid, mailgun
SENDGRID_API_KEY=your_sendgrid_key
MAILGUN_API_KEY=your_mailgun_key
MAILGUN_DOMAIN=your_mailgun_domain
```

### Database Migration
Run this SQL to add the reviewed_at column:
```bash
# Using Supabase CLI
supabase migration up

# Or using psql
psql $DATABASE_URL -f server/database/migrations/023_auto_approval_setup.sql
```

---

## User Flow

### Registration Flow

1. **User selects buyer type:**
   - Local: Cameroon pre-selected, +237 phone format
   - International: Country dropdown, selectable phone code

2. **Form submission:**
   - Local buyer: phone normalized to +237XXXXXXXX
   - International buyer: phone formatted with country code

3. **Backend creates user:**
   - Status: `pending_verification`
   - Sends OTP via SMS (provider selected by country)
   - Sends verification email

4. **User verifies:**
   - Phone OTP verification
   - Email link verification

5. **Status update:**
   - Farmers: Status → `pending_review` (manual approval required)
   - Buyers: Status → `active` (immediate access)

6. **For farmers in pending_review:**
   - Job runs every minute
   - After 5 minutes, auto-approves
   - Sends "Account Approved" email
   - Status → `active`

### Login Flow

- Phone or email + password
- Checks status (active, pending, suspended)
- Redirects to appropriate page

---

## Third-Party Service Setup

### Required for Production

1. **Africa's Talking:**
   - Account required for SMS to African countries
   - Fund account for message credits

2. **Twilio (Optional but recommended):**
   - Better international SMS coverage
   - Fallback if Africa's Talking fails

3. **SendGrid or Mailgun:**
   - Better email deliverability than SMTP
   - Domain verification required

4. **Supabase:**
   - Ensure `reviewed_at` column exists
   - RLS policies may need updating

---

## Testing Checklist

- [ ] Local buyer registration (Cameroon)
- [ ] International buyer registration (select country)
- [ ] Phone validation for different countries
- [ ] OTP SMS delivery
- [ ] Email verification delivery
- [ ] Auto-approval job runs
- [ ] Pending review page countdown
- [ ] Auto-redirect after approval
- [ ] Sign-in with phone number
- [ ] Sign-in with email

---

## Known Limitations

1. **Phone formats:** Country-specific phone formatting is basic. May need refinement for specific countries.

2. **Auto-approval timing:** 5 minutes is hardcoded. Could be made configurable via env variable.

3. **SMS fallbacks:** Twilio fallback is configured but requires account setup.

4. **International email:** No specific localization for different countries' email providers.

---

## Deployment Notes

1. Install dependencies:
   ```bash
   cd server && npm install
   cd client && npm install
   ```

2. Run database migration before deploying

3. Configure all environment variables

4. Test SMS and email delivery in staging

5. Monitor job scheduler logs initially

---

## Security Considerations

- Phone OTP remains 6 digits, 10-minute expiry, 3 attempts max
- All phone numbers stored in international format (+XXX...)
- Account lockout after 5 failed login attempts
- Reviewed accounts logged with timestamp

---

## Future Enhancements

- Admin dashboard for manual approval override
- Email templates for different languages
- SMS templates per country
- More granular phone validation per country
- Push notifications for approval status
