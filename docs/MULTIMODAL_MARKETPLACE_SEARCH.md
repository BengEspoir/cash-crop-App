# AgriculNet Multimodal Marketplace Search

## What was implemented

AgriculNet now exposes one marketplace search surface with four modes:

1. **Text** ? public keyword search over currently published listings.
2. **Ask AI** ? authenticated natural-language interpretation followed by a real listing query.
3. **Image** ? authenticated crop recognition followed by a real listing query, with manual correction.
4. **Voice** ? authenticated audio transcription into an editable query. Transcription never submits automatically.

AI providers only interpret intent or identify a likely crop. They never create marketplace cards, sellers, prices, availability, ratings, or verification claims. Every displayed result comes from the existing listings data path.

## User flow

Guests can use text search immediately. Selecting Ask AI, Image, or Voice while signed out opens an authentication dialog. The mode and query are retained in session storage. A compressed selected image can also be retained for the current browser tab during sign-in.

The browser records voice with MediaRecorder. Selecting **Stop** sends the clip for transcription. The transcript is placed into the text input and remains editable. The user must select **Search marketplace** to query listings.

Authenticated history is user-scoped in local browser storage and can be cleared. It contains query text, mode, and time only. No database migration was added.

## API endpoints

All advanced endpoints require a valid Supabase bearer token and use the existing AI rate limiter.

| Method | Endpoint | Payload | Purpose |
| --- | --- | --- | --- |
| POST | /api/v1/search/ai | JSON with query | Interpret language and query real listings |
| POST | /api/v1/search/image | multipart image, optional productOverride | Identify or confirm a crop and query real listings |
| POST | /api/v1/search/transcribe | multipart audio | Return editable transcript text only |
| GET | /api/v1/listings | query parameters | Existing public text search and listing retrieval |

Images accept JPG, PNG, and WebP up to 6 MB. Audio accepts WebM, OGG, WAV, MP3/MPEG, MP4, and M4A up to 12 MB. Uploads use request memory and are not persisted by search.

## Railway backend variables

Add these only to Railway. Never place provider keys in Vercel or a NEXT_PUBLIC variable.

~~~env
AI_PROVIDER_ORDER=openrouter,groq,gemini,cerebras
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
OPENROUTER_FALLBACK_MODELS=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite
CEREBRAS_API_KEY=
CEREBRAS_MODEL=gpt-oss-120b

AI_VISION_MODEL=google/gemini-2.5-flash
AI_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
AI_TRANSCRIPTION_LANGUAGE=

AI_REQUEST_TIMEOUT_MS=45000
AI_PROVIDER_TIMEOUT_MS=10000
AI_RATE_LIMIT_WINDOW_MS=900000
AI_RATE_LIMIT_MAX_REQUESTS=12
~~~

Leave AI_TRANSCRIPTION_LANGUAGE blank for automatic language detection.

## Getting provider keys

### OpenRouter

1. Create or sign in to OpenRouter.
2. Create a server key at [OpenRouter Keys](https://openrouter.ai/keys).
3. Store it in Railway as OPENROUTER_API_KEY.
4. Keep AI_VISION_MODEL set to a vision-capable model available to the account.

OpenRouter handles image understanding and can participate in the language provider chain.

### Groq

1. Create or sign in to GroqCloud.
2. Create a key at [Groq API Keys](https://console.groq.com/keys).
3. Store it in Railway as GROQ_API_KEY.
4. Keep AI_TRANSCRIPTION_MODEL set to whisper-large-v3-turbo unless intentionally changing models.

Groq is required for voice transcription. If absent, typed search remains available and voice returns a safe configuration error.

## Vercel frontend variable

No new frontend secret is required. Vercel still needs the deployed backend base:

~~~env
NEXT_PUBLIC_API_URL=https://cash-crop-app-production-9f79.up.railway.app/api/v1
~~~

Provider credentials stay on Railway. Redeploy Vercel after changing frontend variables.

## Main implementation files

### Server

- server/src/modules/search/search.routes.js
- server/src/modules/search/search.controller.js
- server/src/modules/search/search.service.js
- server/src/modules/search/search.filters.js
- server/src/modules/search/search.providers.js
- server/src/modules/search/search.uploads.js
- server/src/modules/listings/listings.service.js
- server/src/config/env.js
- server/src/app.js
- server/.env.example

### Client

- client/src/components/search/AgriculNetSearch.jsx
- client/src/components/search/AuthRequiredDialog.jsx
- client/src/components/search/SearchModeTabs.jsx
- client/src/components/search/SearchResultInsight.jsx
- client/src/hooks/useMarketplaceSearch.js
- client/src/hooks/useVoiceRecorder.js
- client/src/hooks/useSearchHistory.js
- client/src/components/landing/MarketplaceHeroSearch.jsx
- client/src/app/(public)/browse/page.js

## Limitations

- Recognition is probabilistic; users can correct the likely crop.
- Cross-unit quantity comparison assumes one bag is 80 kg. Bunches compare only with bunches.
- Search stores neither images nor recordings.
- Microphone support varies by browser; typing remains the fallback.
- Provider access, quotas, and billing depend on provider accounts.
- Deterministic language filters remain available if AI language providers fail.
- Advanced routes require authentication but not phone verification, so searching does not trigger the marketplace-operation verification gate.
