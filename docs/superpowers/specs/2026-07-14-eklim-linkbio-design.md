# EKLIM Link-in-Bio — Design Spec

## Summary

A single-tenant "link in bio" web app for EKLIM Agency: one public page showing
a profile photo, headline, message, background image, and a stack of social
link boxes (icon auto-detected per platform). One hidden, password-gated admin
panel lets EKLIM (and only EKLIM) edit everything. No other accounts, no
client logins, no signup flow of any kind.

## Architecture

- **Framework:** Next.js (App Router), deployed to Vercel.
- **Database:** Vercel Postgres (Neon integration). Single-tenant, so schema
  is intentionally small:
  - `site_settings` — single row: `headline`, `message`, `background_image_url`,
    `profile_image_url`.
  - `links` — `id`, `url`, `platform`, `position` (integer, controls display
    order).
- **Image storage:** Vercel Blob. Admin uploads write directly to Blob; the
  returned URL is saved into `site_settings`.
- **Routes:**
  - `/` — public page. Server-rendered from the DB. No auth.
  - `/panel-83c6f29c` — hidden admin path. Random, non-guessable slug;
    changeable later via an env var (`ADMIN_PATH`) without a code change.
    Any other unmatched path (including `/admin`, `/login`) 404s normally —
    nothing about the app's structure hints an admin panel exists.
- No separate backend service — API routes live inside the same Next.js app.

## Auth

- Single shared password: `<REDACTED-ADMIN-PASSWORD>`, stored hashed in an environment
  variable (e.g. `ADMIN_PASSWORD_HASH`) — never in the database, never in
  source.
- `/panel-83c6f29c` renders a bare password field. No username field, no
  "forgot password," no branding hinting at what it unlocks.
- On correct password, the server sets a signed, HTTP-only session cookie
  (reasonable expiry, e.g. 30 days). No user table, no accounts — the cookie
  just marks "this browser proved it knows the password."
- Wrong password re-renders the same bare form with a generic error; no
  lockout/rate-limiting needed given this is a single low-traffic secret.

## Public page behavior

- Displays, in order: profile photo, headline, message, background image
  (as page background), then the link boxes.
- Each link box: platform icon on the left, label on the right
  (e.g. "EKLIM Instagram"), entire box is a clickable link that opens in a
  new tab.
- A platform only appears if a link for it has been added in the admin panel.
  No placeholders, no greyed-out/disabled boxes for missing platforms.
- Box order matches `links.position`, set by drag-reordering in admin.
- Empty state (nothing configured yet): page renders cleanly with just
  whatever defaults exist (no crash, no broken image icons, no empty boxes).

## Admin panel behavior

Behind `/panel-83c6f29c`, after password:

- **Profile section:** upload/replace background image, upload/replace
  profile photo, edit headline text, edit message text. Changes reflect in a
  live preview.
- **Links section:**
  - "Add link" field: paste a URL, the app runs it through platform
    detection immediately and shows the resulting icon + platform name
    before/as you save — no manual "choose platform" dropdown.
  - Existing links can be removed individually.
  - Existing links can be drag-reordered; new order persists to
    `links.position`.
- Saves are immediate — no draft/publish distinction. What's in the admin
  panel is what's live on `/`.

## Platform detection

Pure function: given a URL, return `{ platform, icon }`. Matches by hostname
pattern against a known table:

| Platform  | Matches (hostname contains) |
|-----------|------------------------------|
| Instagram | `instagram.com` |
| YouTube   | `youtube.com`, `youtu.be` |
| TikTok    | `tiktok.com` |
| LinkedIn  | `linkedin.com` |
| X/Twitter | `x.com`, `twitter.com` |
| Facebook  | `facebook.com`, `fb.com` |
| WhatsApp  | `wa.me`, `whatsapp.com` |
| Threads   | `threads.net` |
| Email     | `mailto:` scheme |
| Website   | fallback — anything else, generic link icon |

Detection never blocks saving a link — an unrecognized URL simply falls back
to "Website" with a generic icon rather than erroring.

## Testing

- Unit tests for the platform-detection function: one case per platform in
  the table above, plus an unrecognized-URL fallback case.
- Manual browser verification (via preview tooling) before calling this
  done:
  - Password gate accepts the correct password and rejects an incorrect one.
  - Add/remove/reorder links; confirm order persists after reload.
  - Upload background image and profile photo; confirm they render on `/`.
  - Empty-state render with no data configured.
  - An unrecognized URL falls back to the "Website" box correctly.
- No end-to-end test suite for this iteration — single-tenant, low-traffic,
  would be overkill. Can be added later if the app grows.

## Explicitly out of scope

- Any client/multi-tenant accounts or signup flow.
- Click analytics/tracking on link boxes.
- Color/theme customization from admin (visual design will be supplied
  separately and swapped in over the placeholder styling built here).
- Rate limiting / lockout on the password form.

## Open item

- Visual design will be provided later (via an external design tool /
  import) and swapped in over this build's placeholder styling, without
  changing the functionality described above.
