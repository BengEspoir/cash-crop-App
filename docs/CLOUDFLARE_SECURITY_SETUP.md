# Cloudflare Security Setup for AgriculNet

This guide separates what is already implemented in code from the dashboard actions that must be completed by an administrator. Committing this repository does **not** activate Cloudflare.

## What the code now does

- Renders a responsive Cloudflare Turnstile widget on password sign-in, farmer/reseller/buyer registration, and password-recovery request forms.
- Sends the CAPTCHA token to Supabase Auth for sign-up, email sign-in, and password recovery. Supabase must have CAPTCHA protection enabled for those endpoints.
- Validates API-native phone-login tokens from Railway against Cloudflare Siteverify.
- Rejects missing, failed, wrong-hostname, or wrong-action API tokens without logging the token or secret.
- Allows the Turnstile script, frame, and verification connection in the frontend Content Security Policy.
- Keeps the existing API rate limits, Helmet, CORS allowlist, Supabase sessions, and role authorization.

Cloudflare documents that tokens are single-use and expire after five minutes, so failed forms reset the widget and request a fresh token.

## 1. Put agriculnet.farm behind Cloudflare

1. Sign in to Cloudflare and choose **Add a domain**.
2. Add agriculnet.farm, select a plan, and review the imported DNS records.
3. Keep the Vercel DNS records Cloudflare gives you for the apex and www hostnames. Do not proxy the Railway-generated hostname.
4. At the domain registrar, replace the current nameservers with the two Cloudflare nameservers shown in the onboarding screen.
5. Wait until Cloudflare reports the zone as **Active**.
6. In **SSL/TLS**, use **Full (strict)** after Vercel's certificate for the custom domain is valid.
7. Confirm both https://agriculnet.farm and https://www.agriculnet.farm load before enabling bot challenges.

## 2. Create the production Turnstile widget

1. In Cloudflare Dashboard, open **Turnstile** and select **Add widget**.
2. Name it AgriculNet production forms.
3. Add only agriculnet.farm, www.agriculnet.farm, and app.agriculnet.farm as production hostnames.
4. Choose **Managed** mode.
5. Create the widget and copy the site key and secret key. The site key is public; the secret must never use a NEXT_PUBLIC_ name.

Official references:

- [Cloudflare Turnstile get started](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## 3. Configure Vercel

In the frontend Vercel project, open **Settings -> Environment Variables** and add:

    NEXT_PUBLIC_TURNSTILE_ENABLED=true
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=<production site key>

Apply it to Production. Apply it to Preview only when the widget hostname list also contains the preview hostname. Redeploy the frontend after saving. Do not put the Turnstile secret in Vercel public variables.

## 4. Configure Supabase Auth CAPTCHA

AgriculNet's email/password registration, email sign-in, and password-reset request use Supabase Auth directly. Their server-side CAPTCHA enforcement is configured in Supabase:

1. Open the AgriculNet project in Supabase Dashboard.
2. Go to **Authentication -> Bot and Abuse Protection**. The dashboard may place this under Authentication settings.
3. Enable CAPTCHA protection.
4. Select **Cloudflare Turnstile**.
5. Paste the production Turnstile secret key and save.
6. Test sign-up, sign-in, and password recovery from https://agriculnet.farm.

See [Supabase CAPTCHA protection](https://supabase.com/docs/guides/auth/auth-captcha).

## 5. Configure Railway

Add these variables to the Railway backend service:

    TURNSTILE_ENABLED=true
    TURNSTILE_SECRET_KEY=<production secret key>
    TURNSTILE_ALLOWED_HOSTNAMES=agriculnet.farm,www.agriculnet.farm,app.agriculnet.farm
    CLIENT_ALLOWED_ORIGINS=https://app.agriculnet.farm

Redeploy Railway. A service with TURNSTILE_ENABLED=true but no secret refuses to start instead of silently disabling verification.

## 6. Local development and automated tests

Use Cloudflare's official always-pass keys only outside production:

    # client/.env.local
    NEXT_PUBLIC_TURNSTILE_ENABLED=true
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA

    # server/.env
    TURNSTILE_ENABLED=true
    TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
    TURNSTILE_ALLOWED_HOSTNAMES=localhost,127.0.0.1

Never deploy test keys to production. Cloudflare publishes additional always-fail and duplicate-token keys in its [Turnstile testing guide](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

## 7. Enable domain-wide Bot Fight Mode

This is a Cloudflare dashboard action; the repository cannot enable it.

1. Open the agriculnet.farm zone in Cloudflare.
2. Go to **Security -> Settings**.
3. Filter settings by **Bot traffic**.
4. Turn **Bot Fight Mode** on.
5. Review **Security -> Analytics -> Events** after activation.

Cloudflare notes that Bot Fight Mode protects the entire domain and cannot be skipped with ordinary WAF rules. It may challenge API or monitoring traffic. If that affects the proxied application, disable it or evaluate Super Bot Fight Mode for granular exceptions. See [Cloudflare Bot Fight Mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/).

## 8. Production acceptance checks

1. A valid challenge permits email sign-in, phone sign-in, each registration route, and password recovery.
2. An expired or already-used token is rejected and the widget resets.
3. A token generated on an unapproved hostname is rejected.
4. The browser console has no CSP errors for https://challenges.cloudflare.com.
5. Dashboard pages do not show Turnstile.
6. Maintenance mode still displays its notice, admin sign-in remains usable, and admin can resume operation.
7. Cloudflare Security Analytics shows Bot Fight Mode events only after the dashboard setting has actually been enabled.

## Rollback

- Set NEXT_PUBLIC_TURNSTILE_ENABLED=false on Vercel, turn off TURNSTILE_ENABLED on Railway, and disable Supabase CAPTCHA protection together only during a controlled rollback; then redeploy both applications.
- Remove or replace NEXT_PUBLIC_TURNSTILE_SITE_KEY only after the frontend enable flag is false.
- Turn Bot Fight Mode off under Cloudflare **Security -> Settings** if legitimate traffic is being challenged.
- Keep existing rate limiting and authentication controls enabled throughout rollback.
