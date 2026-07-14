# EKLIM Link-in-Bio

Single-tenant link-in-bio site for EKLIM Agency. Public page at `/`, hidden
admin panel at `/<ADMIN_PATH>`.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `POSTGRES_URL` — a Postgres connection string (e.g. from Neon:
     https://neon.tech, or Vercel Postgres once deployed).
   - `BLOB_READ_WRITE_TOKEN` — from a Vercel Blob store (Vercel dashboard >
     Storage > Blob).
   - `ADMIN_PATH` — the hidden admin URL segment. Defaults to
     `panel-83c6f29c`; change it to anything only you would guess.
   - `ADMIN_PASSWORD_HASH` — run `node scripts/hash-password.mjs "<password>"`
     and paste the output.
   - `SESSION_SECRET` — run `node scripts/generate-secret.mjs` and paste the
     output.
3. Apply the schema by running the statements in `db/schema.sql` against
   your database (e.g. via `psql "$POSTGRES_URL" -f db/schema.sql`, or via
   the Neon/Vercel dashboard's SQL editor if `psql` isn't installed locally).
4. `npm run dev`, visit `http://localhost:3000` and
   `http://localhost:3000/<ADMIN_PATH>`.

## Tests

`npm test` runs the automated unit tests (platform detection, auth). All
other behavior is verified manually in the browser — see the plan document
at `docs/superpowers/plans/2026-07-14-eklim-linkbio-plan.md` for the
per-feature manual verification checklists.

## Deploying to Vercel

1. Push this repo to GitHub (or another Git provider Vercel supports).
2. Import the repo in the Vercel dashboard.
3. Add a Postgres database (Storage tab > Postgres, powered by Neon) and a
   Blob store (Storage tab > Blob) to the project — Vercel wires
   `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` into the project automatically.
4. Add the remaining environment variables in Project Settings > Environment
   Variables: `ADMIN_PATH`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (same
   values as local, or regenerate fresh ones for production).
5. Run the schema against the production database once (via `psql` or the
   provider's SQL editor).
6. Deploy. Visit `https://<your-domain>/<ADMIN_PATH>` to confirm the admin
   panel loads and the password gate works in production.

## Final verification checklist

- [ ] Password gate accepts the correct password and rejects an incorrect one.
- [ ] Add/remove/reorder links; order persists after reload.
- [ ] Background image and profile photo upload and render on `/`.
- [ ] Empty-state renders cleanly with nothing configured.
- [ ] An unrecognized URL falls back to the "Website" box correctly.
- [ ] Any unmatched path (e.g. `/admin`, `/login`) 404s normally.
