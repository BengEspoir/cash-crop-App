# AgriculNet

AgriculNet connects Cameroonian farmers with local and international buyers.

## Stack
- Next.js 14 App Router frontend
- Tailwind CSS, React Hook Form, Zod, Zustand
- Express API with Supabase-backed auth
- Development `devHints` for local OTP and email verification fallback

## Local mode
- Real backend: auth, admin-auth, admin review, and authenticated dashboard data
- Public browse/marketing pages can still use seed-friendly preview data

## Quick start
```bash
cd client && cmd /c npm install
cd ../server && cmd /c npm install

copy server\.env.example server\.env
copy client\.env.local.example client\.env.local
```

To enable the AgriculNet AI assistant locally, add at least one server-only provider key to `server/.env`. Configured providers are attempted in order and missing keys are skipped:

```env
AI_PROVIDER_ORDER=openrouter,groq,gemini,cerebras
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openrouter/free
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
CEREBRAS_API_KEY=
CEREBRAS_MODEL=gpt-oss-120b
# Total deadline for the complete provider chain (must stay below the client timeout).
AI_REQUEST_TIMEOUT_MS=45000
# Maximum time for each provider attempt when multiple providers are configured.
AI_PROVIDER_TIMEOUT_MS=10000
AI_RATE_LIMIT_WINDOW_MS=900000
AI_RATE_LIMIT_MAX_REQUESTS=12
```

Keep every provider key out of `client/.env.local` and never prefix one with `NEXT_PUBLIC_`. Restart the backend after changing `server/.env`. Free plans are suitable for testing, but availability and quotas can change.

## Auth-critical database setup
Run these Supabase migrations in order:
- `001_enums_and_extensions.sql`
- `002_users_table.sql`
- `003_farmer_profiles.sql`
- `004_buyer_profiles.sql`
- `005_tokens_and_otps.sql`
- `021_audit_logs.sql`
- `022_profile_extensions.sql`
- `023_auto_approval_setup.sql`
- `024_enhanced_verification.sql`
- `025_activity_events.sql`

Then run these seeds as needed:
- `001_seed_admin.sql` for seeded admin access
- `002_seed_regions.sql` and `003_seed_crops.sql` for marketplace seed data

Verify the auth schema:
```bash
cd server
node verify-db-init.js
```

## Start the app
Run these from the repository root in two separate terminals:

```powershell
npm run dev:server
npm run dev:client
```

## Local URLs
- Frontend: `http://localhost:3000`
- API health: `http://localhost:5000/api/health`
- Sign in: `http://localhost:3000/sign-in`
- Admin portal: `http://localhost:3000/admin-portal`

## Local auth behavior
- Buyers become `active` immediately after both phone and email verification.
- Farmers move to `pending_identity_verification` after phone and email verification.
- Farmers submit ID front, ID back, and selfie evidence, then move to `pending_review` for manual admin approval.
- If SMS or email providers are not configured, the UI can still complete local flows by using `devHints`.

## Seeded admin
After running `server/database/seeds/001_seed_admin.sql`, the default admin account is:
- Email: `mbengespoir@gmail.com`
- Password: set your own private admin password before seeding production data.

## Useful docs
- Setup guide: `docs/setup-guide.md`
- Admin access: `ADMIN_ACCESS_GUIDE.md`
- Database setup: `server/database/MIGRATION_GUIDE.md`
