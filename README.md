# Safarlink Parcel

A small, polished, read-only parcel tracking web app for Safarlink.

## What the public tracker can do

A visitor can submit one tracking code and receive only:

- Tracking code
- Recipient name
- Item category / description
- Quantity
- Current parcel status
- Last updated time

It cannot create, update, delete, or otherwise manage parcels.

## Architecture

- **Next.js 16 + React 19 + TypeScript** for the web app
- **Supabase Edge Function** as the only public data gateway
- Existing Safarlink Supabase PostgreSQL database as the source of truth
- PWA manifest + service worker for installation

The browser does **not** query `public.parcels` directly and the public client never receives a Supabase service-role key.

## Security review checklist

Threats considered for this public read-only surface:

1. **Unauthorized writes** — no public write endpoint exists; the Edge Function accepts only POST lookups and never performs INSERT/UPDATE/DELETE.
2. **Direct table exposure / BOLA / IDOR** — the public browser does not receive direct Data API access to the parcels table. Existing parcel RLS permits SELECT to staff only.
3. **Over-fetching / data leakage** — the Edge Function explicitly selects only the fields needed by the tracker. Sender names, sender/recipient phone numbers, internal IDs, staff IDs, branch IDs, and other internal fields are not returned.
4. **SQL/PostgREST injection** — tracking codes are normalized and restricted to `A-Z`, `0-9`, and `-`; the REST filter is generated from the validated value.
5. **Enumeration abuse** — exact-code lookup, bounded input length, generic not-found responses, no autocomplete, and per-isolate request throttling are used. For high-volume production traffic, put an external WAF/rate limiter in front of the function as well.
6. **Credential leakage** — the service-role key is used only inside the Edge Function runtime and is never embedded in the Next.js bundle.
7. **Caching of personal data** — tracker responses use `Cache-Control: no-store`; the client also uses `cache: no-store`.
8. **XSS** — React escapes displayed values; no `dangerouslySetInnerHTML` is used. CSP and `X-Content-Type-Options` are enabled.
9. **Clickjacking** — `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` are enabled.
10. **MIME sniffing** — `X-Content-Type-Options: nosniff` is enabled.
11. **Referrer leakage** — a strict referrer policy is enabled.
12. **Unnecessary browser capabilities** — camera, microphone and geolocation are disabled through Permissions-Policy.
13. **Service-worker data leakage** — the service worker caches only same-origin app-shell resources and never caches tracker API responses.
14. **Third-party supply-chain exposure** — the app has no runtime third-party script or font dependency.
15. **Method abuse / CORS** — the Edge Function accepts only POST plus preflight and responds with no-store headers. The function returns a minimal JSON shape.

## Important security reality

No web application can honestly promise "100% security." This project is designed with least privilege and defense in depth, but production security still depends on the Supabase account, deployment platform, DNS/TLS, dependency updates, tracking-code entropy, and operational monitoring.

The public tracker deliberately exposes less data than the staff portal. If tracking codes are short or predictable, an attacker may still guess valid codes; high-entropy codes and an upstream WAF/rate limiter are recommended for a public launch.

## Supabase notes

The connected Safarlink project currently has RLS enabled on `public.parcels`, with staff-only SELECT/INSERT/UPDATE policies. The public tracker uses a dedicated Edge Function instead of weakening those policies.

The Supabase security advisor also reports two pre-existing project warnings unrelated to this tracker: a mutable search path on `public.safar_buses_updated_at` and disabled leaked-password protection. Those should be addressed in the main Safarlink project separately.

## Environment

Optional:

```env
NEXT_PUBLIC_TRACKER_API_URL=https://qjidxeyaxytiqfevqniv.supabase.co/functions/v1/track-parcel
```

The repository already has a safe public fallback for the current function URL, so the app can run without a local `.env` file. Never put `SUPABASE_SERVICE_ROLE_KEY` in this repository or in a `NEXT_PUBLIC_*` variable.
