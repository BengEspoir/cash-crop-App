# Admin Dashboard Access Guide

AgriculNet administrators use the same native Supabase Auth session pipeline as every other role. There is no hidden admin route, public admin key, or special client-side credential.

## Sign-in endpoint

- Frontend route: `http://localhost:3000/auth/login`
- Session issuer: Supabase Auth
- API authorization: `Authorization: Bearer <supabase-access-token>`

Do not add an admin secret to a `NEXT_PUBLIC_` variable or custom request header. Express verifies the Supabase token and resolves the linked `admin` or `super_admin` role from `public.users` under RLS.

## Account requirements

The database account must:

- have role `admin` or `super_admin`;
- have status `active`;
- be linked through `public.users.auth_user_id` to an `auth.users` identity;
- use a private Supabase Auth credential with verified email ownership.

## Creating a local administrator

The tracked seed at `server/database/seeds/001_seed_admin.sql` contains no email, password, phone number, or reusable password hash. Before running it, provide the email and bcrypt hash as private PostgreSQL session settings in a one-off SQL Editor query. Keep those values out of the repository, screenshots, logs, and shared documentation.

The seed is optional. A production administrator should be provisioned through an audited database operation or a dedicated administrative workflow, then required to use a unique password.

## Safe diagnostics

The tracked scripts accept private inputs only through local environment variables:

- `server/test-admin-login.js`: `BASE_URL`, `ADMIN_DIAGNOSTIC_EMAIL`, and `ADMIN_DIAGNOSTIC_PASSWORD`;
- `server/verify-hash.js`: Supabase service credentials plus `ADMIN_DIAGNOSTIC_EMAIL` and `ADMIN_DIAGNOSTIC_PASSWORD`;
- `server/debug-admin.js`: Supabase service credentials plus `ADMIN_DIAGNOSTIC_EMAIL`.

They report only generic success/failure state. Do not modify them to print credentials, hashes, tokens, database rows, or provider response bodies.

## Troubleshooting

- A `401` response means the identifier/password pair was not accepted.
- A `403` response can indicate an inactive, suspended, or locked account.
- A successful login followed by a dashboard redirect usually means the authenticated user does not have an administrator role.
- A `404` from an API password-login or older hidden admin path is expected; update the caller to `/auth/login`.
- If a previously tracked credential was ever used, rotate it. Removing it from the current tree does not remove it from Git history.
