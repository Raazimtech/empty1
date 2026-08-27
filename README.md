# Safarlink Parcel

A simple, fast, mobile-first parcel tracking web app for Safarlink.

## What it does

Customers enter a Safarlink tracking code and can view the limited parcel information intended for public tracking:

- Tracking code
- Recipient name
- Item
- Origin
- Destination
- Current status
- Last updated time

The public application is **read-only**. It has no customer-facing ability to create, edit, delete, or update parcels.

## Technology

This project is intentionally built as a straightforward static web app:

- HTML
- CSS
- Vanilla JavaScript
- Web App Manifest / PWA support
- Service worker
- Supabase Edge Function for the protected tracking lookup

There is no React, Next.js, build framework, or frontend database write access.

## Security model

The browser does not receive a Supabase service-role key or direct write access to the parcel database. Parcel lookup is performed through the dedicated tracking endpoint, which should return only the fields approved for public tracking.

The frontend also avoids caching parcel responses in the service worker.

> No web application can honestly guarantee 100% security. The goal of this project is least privilege, minimal data exposure, server-side authorization, and a deliberately small public attack surface.

## PWA

Safarlink Parcel can be installed on supported devices through the **Install** button or the browser's normal install controls.

## Deployment

The repository includes a GitHub Actions workflow in `.github/workflows/JKyle.yml` for static deployment.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
├── .github/
│   └── workflows/
│       └── JKyle.yml
└── README.md
```

## Important

Do not place private Supabase keys, database credentials, or service-role credentials in this repository or in frontend JavaScript.

The public tracker should expose only the minimum parcel information required by customers.

---

**Safarlink Parcel** — straightforward parcel tracking, nothing more.
