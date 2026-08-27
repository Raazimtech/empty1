# Safarlink Parcel

A simple, polished, **read-only** parcel tracking web app for Safarlink.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- Supabase Edge Function as the only public parcel-data gateway
- PWA manifest + service worker
- GitHub Pages deployment via `JKyle.yml`

## Public permissions

The browser can only submit a tracking code and display the minimal parcel information returned by the tracking function. It has no database write capability and never contains a Supabase service-role key.

Displayed data:

- Tracking code
- Recipient name
- Item
- Origin
- Destination
- Current status
- Last updated time

## Security model

The frontend does not query `public.parcels` directly. The dedicated Supabase Edge Function is responsible for validation, authorization to the underlying data, minimal field selection, generic not-found responses, and response headers. The client validates tracking codes before sending them, uses POST, disables autocomplete, and never caches API responses. The service worker intentionally skips all tracker-function requests.

No application can honestly guarantee 100% security. For a public launch, use high-entropy tracking codes and keep rate limiting/WAF protection enabled at the API edge.

## Local preview

Because this is a static site, no Node.js build is required. Open `index.html` through a local static server (recommended for the service worker), or deploy the repository to GitHub Pages.

## Deployment

The `JKyle.yml` workflow deploys the repository as a static GitHub Pages site whenever `main` changes. Enable GitHub Pages with **GitHub Actions** as the source in the repository settings if it is not already enabled.

## Tracker endpoint

The public client uses:

`https://qjidxeyaxytiqfevqniv.supabase.co/functions/v1/track-parcel`

Never add a Supabase service-role key to this repository.
