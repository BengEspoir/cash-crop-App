# AgriculNet Web Push setup

AgriculNet uses standards-based browser Web Push. Permission is requested only when an authenticated user chooses Enable push from Settings. Lock-screen payloads contain only the generic text "Open AgriculNet to view your update"; sensitive order, payment, message, or identity content stays inside the authenticated application.

## 1. Generate VAPID keys

From server/, run once:

    npx web-push generate-vapid-keys

Treat the private key as a secret. Do not commit either generated value into a real tracked environment file.

## 2. Configure Railway

Add:

    WEB_PUSH_PUBLIC_KEY=<generated public key>
    WEB_PUSH_PRIVATE_KEY=<generated private key>
    WEB_PUSH_SUBJECT=mailto:inf@agriculnet.farm

Apply migration 042_web_push_subscriptions.sql, then redeploy the API. The push subscription table is service-role-only and stores the endpoint and browser encryption keys as private device data.

## 3. Configure Vercel

Add the matching public key:

    NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=<same generated public key>

Redeploy the frontend. Never add WEB_PUSH_PRIVATE_KEY to Vercel or use a NEXT_PUBLIC_ prefix for it.

## 4. Test

1. Use an HTTPS production or preview hostname permitted by the browser.
2. Sign in, open buyer or farmer Settings, and choose Enable push.
3. Accept the browser prompt and confirm POST /api/v1/notifications/push/subscribe returns 201.
4. Create a safe test notification through an authenticated admin workflow.
5. Confirm the generic notification opens /notifications, which routes to the signed-in role's notification center.
6. Disable push in Settings and confirm the server subscription and browser subscription are both removed.
7. Test an expired subscription. Provider responses 404 and 410 must delete the stale endpoint.

Web Push availability depends on browser and operating-system policy. A denied permission must be changed from browser site settings; AgriculNet does not repeatedly prompt.
