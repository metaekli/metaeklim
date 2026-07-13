# EKLIM Link-in-Bio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-tenant link-in-bio web app: one public page (profile photo, headline, message, background, auto-detected social link boxes) and one hidden, password-gated admin panel to edit everything.

**Architecture:** Next.js 15 (App Router) deployed to Vercel. Vercel Postgres (Neon) holds a single settings row and an ordered list of links. Vercel Blob stores uploaded images. A dynamic `[panelSlug]` route compares against an `ADMIN_PATH` env var and 404s on mismatch; a signed HTTP-only cookie (no user accounts) gates the dashboard behind a single shared password.

**Tech Stack:** Next.js 15, React 19, TypeScript, `@vercel/postgres`, `@vercel/blob`, `@dnd-kit/*` (drag reorder), `react-icons` (brand icons), Vitest (unit tests).

## Global Constraints

- Single-tenant only: exactly one admin identity, no client/user accounts, no signup flow, ever.
- Admin password is `<REDACTED-ADMIN-PASSWORD>`; stored only as a salted hash in `ADMIN_PASSWORD_HASH`, never in source or DB.
- Default hidden admin path value: `panel-83c6f29c`; must remain changeable via `ADMIN_PATH` env var without a code change.
- Platform detection table (exact, from spec) — Instagram (`instagram.com`), YouTube (`youtube.com`, `youtu.be`), TikTok (`tiktok.com`), LinkedIn (`linkedin.com`), X/Twitter (`x.com`, `twitter.com`), Facebook (`facebook.com`, `fb.com`), WhatsApp (`wa.me`, `whatsapp.com`), Threads (`threads.net`), Email (`mailto:`), else fallback to Website with a generic icon. Detection never blocks saving.
- No click analytics/tracking, no color/theme admin controls, no rate limiting/lockout on the password form — explicitly out of scope per spec.
- Only automated tests required by spec: platform-detection unit tests. Everything else is verified manually in the browser (documented per-task below).
- Visual design will be swapped in later over placeholder styling — do not hand-roll a full design system now.

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx` (temporary placeholder, replaced in Task 5)

**Interfaces:**
- Produces: a running Next.js dev server on `http://localhost:3000`, a working `npm test` command (Vitest), path alias `@/*` → `src/*`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "eklim-linkbio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@vercel/postgres": "^0.10.0",
    "@vercel/blob": "^0.27.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react-icons": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules
.next
.env.local
.env*.local
*.log
```

- [ ] **Step 6: Write `.env.example`**

```
# Postgres connection string (Vercel Postgres / Neon)
POSTGRES_URL=

# Vercel Blob token (Vercel dashboard > Storage > Blob)
BLOB_READ_WRITE_TOKEN=

# Admin auth
ADMIN_PATH=panel-83c6f29c
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

- [ ] **Step 7: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EKLIM Agency",
  description: "EKLIM Agency links",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Write `src/app/globals.css`**

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 9: Write placeholder `src/app/page.tsx`**

```tsx
export default function HomePage() {
  return <main>Coming soon.</main>;
}
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`
Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 11: Verify the app boots**

Run: `npm run dev` (in background/separate terminal), then:
Run: `curl -s http://localhost:3000 | grep -o "Coming soon."`
Expected output: `Coming soon.`
Then stop the dev server.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts .gitignore .env.example src
git commit -m "Scaffold Next.js project"
```

---

### Task 2: Platform detection

**Files:**
- Create: `src/lib/platform-detect.ts`
- Test: `tests/platform-detect.test.ts`

**Interfaces:**
- Produces: `export type Platform = "instagram" | "youtube" | "tiktok" | "linkedin" | "twitter" | "facebook" | "whatsapp" | "threads" | "email" | "website"`; `export interface DetectedPlatform { platform: Platform; label: string }`; `export function detectPlatform(url: string): DetectedPlatform`.

- [ ] **Step 1: Write the failing tests**

Create `tests/platform-detect.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { detectPlatform } from "@/lib/platform-detect";

describe("detectPlatform", () => {
  it("detects Instagram", () => {
    expect(detectPlatform("https://instagram.com/eklim")).toEqual({ platform: "instagram", label: "Instagram" });
  });

  it("detects YouTube from youtube.com", () => {
    expect(detectPlatform("https://www.youtube.com/@eklim")).toEqual({ platform: "youtube", label: "YouTube" });
  });

  it("detects YouTube from youtu.be", () => {
    expect(detectPlatform("https://youtu.be/abc123")).toEqual({ platform: "youtube", label: "YouTube" });
  });

  it("detects TikTok", () => {
    expect(detectPlatform("https://www.tiktok.com/@eklim")).toEqual({ platform: "tiktok", label: "TikTok" });
  });

  it("detects LinkedIn", () => {
    expect(detectPlatform("https://www.linkedin.com/company/eklim")).toEqual({ platform: "linkedin", label: "LinkedIn" });
  });

  it("detects X/Twitter from x.com", () => {
    expect(detectPlatform("https://x.com/eklim")).toEqual({ platform: "twitter", label: "X" });
  });

  it("detects X/Twitter from twitter.com", () => {
    expect(detectPlatform("https://twitter.com/eklim")).toEqual({ platform: "twitter", label: "X" });
  });

  it("detects Facebook", () => {
    expect(detectPlatform("https://www.facebook.com/eklim")).toEqual({ platform: "facebook", label: "Facebook" });
  });

  it("detects WhatsApp", () => {
    expect(detectPlatform("https://wa.me/1234567890")).toEqual({ platform: "whatsapp", label: "WhatsApp" });
  });

  it("detects Threads", () => {
    expect(detectPlatform("https://www.threads.net/@eklim")).toEqual({ platform: "threads", label: "Threads" });
  });

  it("detects Email from mailto:", () => {
    expect(detectPlatform("mailto:hello@eklim.agency")).toEqual({ platform: "email", label: "Email" });
  });

  it("falls back to Website for an unrecognized URL", () => {
    expect(detectPlatform("https://eklim.agency")).toEqual({ platform: "website", label: "Website" });
  });

  it("falls back to Website for a malformed URL instead of throwing", () => {
    expect(detectPlatform("not a url")).toEqual({ platform: "website", label: "Website" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/platform-detect'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `src/lib/platform-detect.ts`:

```ts
export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "whatsapp"
  | "threads"
  | "email"
  | "website";

export interface DetectedPlatform {
  platform: Platform;
  label: string;
}

interface PatternEntry {
  platform: Platform;
  label: string;
  hosts: string[];
}

const PATTERNS: PatternEntry[] = [
  { platform: "instagram", label: "Instagram", hosts: ["instagram.com"] },
  { platform: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  { platform: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
  { platform: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"] },
  { platform: "twitter", label: "X", hosts: ["x.com", "twitter.com"] },
  { platform: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com"] },
  { platform: "whatsapp", label: "WhatsApp", hosts: ["wa.me", "whatsapp.com"] },
  { platform: "threads", label: "Threads", hosts: ["threads.net"] },
];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function detectPlatform(url: string): DetectedPlatform {
  const trimmed = url.trim();

  if (trimmed.toLowerCase().startsWith("mailto:")) {
    return { platform: "email", label: "Email" };
  }

  const hostname = hostnameOf(trimmed);
  if (hostname) {
    for (const entry of PATTERNS) {
      if (entry.hosts.some((host) => hostname.includes(host))) {
        return { platform: entry.platform, label: entry.label };
      }
    }
  }

  return { platform: "website", label: "Website" };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 13 `detectPlatform` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/platform-detect.ts tests/platform-detect.test.ts
git commit -m "Add platform detection with unit tests"
```

---

### Task 3: Auth utilities (password hashing + session tokens)

**Files:**
- Create: `src/lib/auth.ts`
- Test: `tests/auth.test.ts`
- Create: `scripts/hash-password.mjs`
- Create: `scripts/generate-secret.mjs`

**Interfaces:**
- Consumes: nothing (pure, Node `crypto` only).
- Produces: `export function hashPassword(password: string): string`, `export function verifyPassword(password: string, storedHash: string): boolean`, `export function createSessionToken(secret: string): string`, `export function verifySessionToken(token: string, secret: string, maxAgeMs: number): boolean`.

- [ ] **Step 1: Write the failing tests**

Create `tests/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

describe("password hashing", () => {
  it("verifies a correct password against its hash", () => {
    const hash = hashPassword("<REDACTED-ADMIN-PASSWORD>");
    expect(verifyPassword("<REDACTED-ADMIN-PASSWORD>", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("<REDACTED-ADMIN-PASSWORD>");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});

describe("session tokens", () => {
  const secret = "test-secret";

  it("verifies a freshly created token", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, secret, 1000 * 60)).toBe(true);
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, "other-secret", 1000 * 60)).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(secret);
    expect(verifySessionToken(token, secret, -1)).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(verifySessionToken("not-a-token", secret, 1000 * 60)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/auth'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/auth.ts`:

```ts
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

const SESSION_VALUE = "authenticated";

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, 64);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function createSessionToken(secret: string): string {
  const payload = `${SESSION_VALUE}.${Date.now()}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token: string, secret: string, maxAgeMs: number): boolean {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  const [value, tsStr] = payload.split(".");
  if (value !== SESSION_VALUE) return false;

  const issuedAt = Number(tsStr);
  if (!Number.isFinite(issuedAt)) return false;

  return Date.now() - issuedAt <= maxAgeMs;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all `platform-detect` and `auth` tests green.

- [ ] **Step 5: Write the password-hash generator script**

Create `scripts/hash-password.mjs`:

```js
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = scryptSync(password, salt, 64);
console.log(`${salt.toString("hex")}:${derived.toString("hex")}`);
```

- [ ] **Step 6: Write the session-secret generator script**

Create `scripts/generate-secret.mjs`:

```js
import { randomBytes } from "node:crypto";

console.log(randomBytes(32).toString("hex"));
```

- [ ] **Step 7: Manually verify the scripts produce usable values**

Run: `node scripts/hash-password.mjs "<REDACTED-ADMIN-PASSWORD>"`
Expected: prints a `<hex>:<hex>` string (this is the value for `ADMIN_PASSWORD_HASH`).

Run: `node scripts/generate-secret.mjs`
Expected: prints a 64-character hex string (this is the value for `SESSION_SECRET`).

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts tests/auth.test.ts scripts/hash-password.mjs scripts/generate-secret.mjs
git commit -m "Add auth utilities: password hashing and session tokens"
```

---

### Task 4: Database layer

**Files:**
- Create: `db/schema.sql`
- Create: `src/lib/db.ts`

**Interfaces:**
- Consumes: `POSTGRES_URL` env var (via `@vercel/postgres`).
- Produces: `export interface SiteSettings { headline: string; message: string; backgroundImageUrl: string | null; profileImageUrl: string | null }`; `export interface LinkRecord { id: number; url: string; platform: string; label: string; position: number }`; `export async function getSettings(): Promise<SiteSettings>`; `export async function updateSettings(settings: Partial<SiteSettings>): Promise<void>`; `export async function getLinks(): Promise<LinkRecord[]>`; `export async function addLink(url: string, platform: string, label: string): Promise<LinkRecord>`; `export async function removeLink(id: number): Promise<void>`; `export async function reorderLinks(orderedIds: number[]): Promise<void>`.

- [ ] **Step 1: Write the schema**

Create `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY,
  headline TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  background_image_url TEXT,
  profile_image_url TEXT
);

INSERT INTO site_settings (id, headline, message)
VALUES (1, 'EKLIM Agency', '')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL
);
```

- [ ] **Step 2: Write the database module**

Create `src/lib/db.ts`:

```ts
import { sql } from "@vercel/postgres";

export interface SiteSettings {
  headline: string;
  message: string;
  backgroundImageUrl: string | null;
  profileImageUrl: string | null;
}

export interface LinkRecord {
  id: number;
  url: string;
  platform: string;
  label: string;
  position: number;
}

export async function getSettings(): Promise<SiteSettings> {
  const { rows } = await sql`
    SELECT headline, message, background_image_url, profile_image_url
    FROM site_settings WHERE id = 1
  `;
  const row = rows[0];
  return {
    headline: row?.headline ?? "",
    message: row?.message ?? "",
    backgroundImageUrl: row?.background_image_url ?? null,
    profileImageUrl: row?.profile_image_url ?? null,
  };
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<void> {
  await sql`
    UPDATE site_settings SET
      headline = COALESCE(${settings.headline ?? null}, headline),
      message = COALESCE(${settings.message ?? null}, message),
      background_image_url = COALESCE(${settings.backgroundImageUrl ?? null}, background_image_url),
      profile_image_url = COALESCE(${settings.profileImageUrl ?? null}, profile_image_url)
    WHERE id = 1
  `;
}

export async function getLinks(): Promise<LinkRecord[]> {
  const { rows } = await sql`
    SELECT id, url, platform, label, position FROM links ORDER BY position ASC
  `;
  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    platform: r.platform,
    label: r.label,
    position: r.position,
  }));
}

export async function addLink(url: string, platform: string, label: string): Promise<LinkRecord> {
  const { rows } = await sql`
    INSERT INTO links (url, platform, label, position)
    VALUES (${url}, ${platform}, ${label}, (SELECT COALESCE(MAX(position), -1) + 1 FROM links))
    RETURNING id, url, platform, label, position
  `;
  const r = rows[0];
  return { id: r.id, url: r.url, platform: r.platform, label: r.label, position: r.position };
}

export async function removeLink(id: number): Promise<void> {
  await sql`DELETE FROM links WHERE id = ${id}`;
}

export async function reorderLinks(orderedIds: number[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`UPDATE links SET position = ${i} WHERE id = ${orderedIds[i]}`;
  }
}
```

- [ ] **Step 3: Provision a Postgres database and set `POSTGRES_URL`**

This step is manual (no automated test — spec limits automated tests to platform detection):

1. Create a free Postgres database (Neon: https://neon.tech, or Vercel Postgres from the Vercel dashboard once the project is imported there).
2. Copy the connection string into a local `.env.local` (not committed) as `POSTGRES_URL=...`.
3. Run: `psql "$POSTGRES_URL" -f db/schema.sql`
   Expected: no errors; `site_settings` has one row with `headline = 'EKLIM Agency'`, `links` is empty.

- [ ] **Step 4: Manually verify the module works against the real database**

Run this ad-hoc check (delete the file afterward, it's not part of the app):

```bash
cat > /tmp/db-check.mjs <<'EOF'
import { getSettings, getLinks, addLink, removeLink, reorderLinks } from "./src/lib/db.ts";

console.log(await getSettings());
const link = await addLink("https://instagram.com/eklim", "instagram", "Instagram");
console.log(await getLinks());
await reorderLinks([link.id]);
await removeLink(link.id);
console.log(await getLinks());
EOF
node --experimental-strip-types /tmp/db-check.mjs
```

Expected: prints the default settings row, then a one-item links array containing the Instagram link, then an empty links array after removal. Requires `POSTGRES_URL` to be set in the shell environment (`export $(cat .env.local | xargs)` or equivalent).

- [ ] **Step 5: Commit**

```bash
git add db/schema.sql src/lib/db.ts
git commit -m "Add database schema and data access layer"
```

---

### Task 5: Public page

**Files:**
- Create: `src/components/PlatformIcon.tsx`
- Create: `src/components/LinkBox.tsx`
- Modify: `src/app/page.tsx` (replace Task 1 placeholder)

**Interfaces:**
- Consumes: `Platform` from `@/lib/platform-detect` (Task 2); `getSettings`, `getLinks`, `SiteSettings`, `LinkRecord` from `@/lib/db` (Task 4).
- Produces: `export default function PlatformIcon({ platform, className }: { platform: Platform; className?: string })`; `export default function LinkBox({ url, platform, label }: { url: string; platform: Platform; label: string })`.

- [ ] **Step 1: Write the platform icon component**

Create `src/components/PlatformIcon.tsx`:

```tsx
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaWhatsapp,
  FaThreads,
} from "react-icons/fa6";
import { FiMail, FiLink } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { Platform } from "@/lib/platform-detect";

const ICONS: Record<Platform, IconType> = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  threads: FaThreads,
  email: FiMail,
  website: FiLink,
};

export default function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const Icon = ICONS[platform] ?? FiLink;
  return <Icon className={className} />;
}
```

- [ ] **Step 2: Write the link box component**

Create `src/components/LinkBox.tsx`:

```tsx
import PlatformIcon from "./PlatformIcon";
import type { Platform } from "@/lib/platform-detect";

export default function LinkBox({
  url,
  platform,
  label,
}: {
  url: string;
  platform: Platform;
  label: string;
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="link-box">
      <PlatformIcon platform={platform} className="link-box-icon" />
      <span className="link-box-label">{label}</span>
    </a>
  );
}
```

- [ ] **Step 3: Replace the placeholder public page**

Overwrite `src/app/page.tsx`:

```tsx
import { getSettings, getLinks } from "@/lib/db";
import LinkBox from "@/components/LinkBox";
import type { Platform } from "@/lib/platform-detect";

export const revalidate = 0;

export default async function HomePage() {
  const [settings, links] = await Promise.all([getSettings(), getLinks()]);

  return (
    <main
      className="public-page"
      style={
        settings.backgroundImageUrl
          ? { backgroundImage: `url(${settings.backgroundImageUrl})` }
          : undefined
      }
    >
      {settings.profileImageUrl && (
        <img src={settings.profileImageUrl} alt="" className="profile-photo" />
      )}
      <h1 className="headline">{settings.headline}</h1>
      {settings.message && <p className="message">{settings.message}</p>}
      <div className="link-list">
        {links.map((link) => (
          <LinkBox
            key={link.id}
            url={link.url}
            platform={link.platform as Platform}
            label={link.label}
          />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: page renders the headline "EKLIM Agency" (default row from schema), no links yet (empty `link-list`), no crash, no broken image icons.

Using the ad-hoc script pattern from Task 4 Step 4, insert one link (e.g. Instagram), reload the page.
Expected: one link box appears with the Instagram icon and label "Instagram", clicking it opens the URL in a new tab. Remove the link again afterward so the DB is back to empty state.

- [ ] **Step 5: Commit**

```bash
git add src/components/PlatformIcon.tsx src/components/LinkBox.tsx src/app/page.tsx
git commit -m "Add public page rendering settings and links"
```

---

### Task 6: Admin auth gate (hidden route + login)

**Files:**
- Create: `src/app/[panelSlug]/page.tsx`
- Create: `src/app/[panelSlug]/actions.ts`
- Create: `src/app/[panelSlug]/login-form.tsx`
- Create: `src/app/[panelSlug]/admin-dashboard.tsx` (minimal placeholder body; expanded in Tasks 7–8)

**Interfaces:**
- Consumes: `verifyPassword`, `createSessionToken`, `verifySessionToken` from `@/lib/auth` (Task 3); `getSettings`, `getLinks`, `SiteSettings`, `LinkRecord` from `@/lib/db` (Task 4).
- Produces: `SESSION_COOKIE = "eklim_admin_session"` constant and `requireSession()` helper in `actions.ts`, consumed by Tasks 7 and 8's mutating actions. `AdminDashboard({ settings, links }: { settings: SiteSettings; links: LinkRecord[] })` component, extended in place by Tasks 7–8.
- Env vars used: `ADMIN_PATH`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`.

- [ ] **Step 1: Write the server actions file (login, logout, requireSession)**

Create `src/app/[panelSlug]/actions.ts`:

```ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

export const SESSION_COOKIE = "eklim_admin_session";
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export async function requireSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET!;
  if (!token || !verifySessionToken(token, secret, SESSION_MAX_AGE_MS)) {
    throw new Error("Not authenticated");
  }
}

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const password = String(formData.get("password") ?? "");
  const storedHash = process.env.ADMIN_PASSWORD_HASH!;
  const secret = process.env.SESSION_SECRET!;

  if (!verifyPassword(password, storedHash)) {
    return { error: "Incorrect password" };
  }

  const token = createSessionToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  revalidatePath("/[panelSlug]", "page");
  return { error: "" };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/[panelSlug]", "page");
}
```

- [ ] **Step 2: Write the login form**

Create `src/app/[panelSlug]/login-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(login, { error: "" });

  return (
    <main className="login-page">
      <form action={formAction}>
        <input type="password" name="password" placeholder="Password" required autoFocus />
        <button type="submit">Enter</button>
      </form>
      {state?.error && <p className="login-error">{state.error}</p>}
    </main>
  );
}
```

- [ ] **Step 3: Write a minimal admin dashboard placeholder**

Create `src/app/[panelSlug]/admin-dashboard.tsx`:

```tsx
import { logout } from "./actions";
import type { SiteSettings, LinkRecord } from "@/lib/db";

export default function AdminDashboard({
  settings,
  links,
}: {
  settings: SiteSettings;
  links: LinkRecord[];
}) {
  return (
    <main className="admin-dashboard">
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
      <h1>EKLIM Admin</h1>
      <p>Headline: {settings.headline}</p>
      <p>{links.length} link(s) configured.</p>
    </main>
  );
}
```

- [ ] **Step 4: Write the hidden route page**

Create `src/app/[panelSlug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getSettings, getLinks } from "@/lib/db";
import LoginForm from "./login-form";
import AdminDashboard from "./admin-dashboard";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./actions";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ panelSlug: string }>;
}) {
  const { panelSlug } = await params;
  if (panelSlug !== process.env.ADMIN_PATH) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET!;
  const isAuthed = token ? verifySessionToken(token, secret, SESSION_MAX_AGE_MS) : false;

  if (!isAuthed) {
    return <LoginForm />;
  }

  const [settings, links] = await Promise.all([getSettings(), getLinks()]);
  return <AdminDashboard settings={settings} links={links} />;
}
```

- [ ] **Step 5: Set local env vars for manual verification**

In `.env.local`, alongside `POSTGRES_URL`:

```
ADMIN_PATH=panel-83c6f29c
ADMIN_PASSWORD_HASH=<output of: node scripts/hash-password.mjs "<REDACTED-ADMIN-PASSWORD>">
SESSION_SECRET=<output of: node scripts/generate-secret.mjs>
```

- [ ] **Step 6: Manually verify in the browser**

Run: `npm run dev`.

1. Visit `http://localhost:3000/some-random-guess` → expect a normal Next.js 404 page.
2. Visit `http://localhost:3000/panel-83c6f29c` → expect the bare password form, no hints about what it unlocks.
3. Submit the wrong password → expect "Incorrect password" shown, still on the login form.
4. Submit `<REDACTED-ADMIN-PASSWORD>` → expect redirect-free transition straight to the admin dashboard placeholder showing "EKLIM Admin" and the headline.
5. Reload `http://localhost:3000/panel-83c6f29c` → expect to still be logged in (cookie persisted).
6. Click "Log out", then reload → expect the password form again.

- [ ] **Step 7: Commit**

```bash
git add src/app/\[panelSlug\]
git commit -m "Add hidden admin route with password gate"
```

---

### Task 7: Admin profile form (headline, message, images)

**Files:**
- Create: `src/app/[panelSlug]/profile-form.tsx`
- Modify: `src/app/[panelSlug]/actions.ts` (add `saveProfile`)
- Modify: `src/app/[panelSlug]/admin-dashboard.tsx` (render `ProfileForm`)

**Interfaces:**
- Consumes: `updateSettings` from `@/lib/db` (Task 4); `requireSession` from `./actions` (Task 6); `put` from `@vercel/blob`.
- Produces: `export default function ProfileForm({ initialHeadline, initialMessage, initialBackgroundUrl, initialProfileUrl }: { initialHeadline: string; initialMessage: string; initialBackgroundUrl: string | null; initialProfileUrl: string | null })`.
- Env vars used: `BLOB_READ_WRITE_TOKEN` (read implicitly by `@vercel/blob`'s `put`).

- [ ] **Step 1: Add `saveProfile` to actions.ts**

Append to `src/app/[panelSlug]/actions.ts`:

```ts
import { put } from "@vercel/blob";
import { updateSettings } from "@/lib/db";

export async function saveProfile(formData: FormData): Promise<void> {
  await requireSession();

  const headline = String(formData.get("headline") ?? "");
  const message = String(formData.get("message") ?? "");
  const backgroundFile = formData.get("backgroundImage") as File | null;
  const profileFile = formData.get("profileImage") as File | null;

  let backgroundImageUrl: string | undefined;
  let profileImageUrl: string | undefined;

  if (backgroundFile && backgroundFile.size > 0) {
    const blob = await put(`background-${Date.now()}`, backgroundFile, { access: "public" });
    backgroundImageUrl = blob.url;
  }
  if (profileFile && profileFile.size > 0) {
    const blob = await put(`profile-${Date.now()}`, profileFile, { access: "public" });
    profileImageUrl = blob.url;
  }

  await updateSettings({ headline, message, backgroundImageUrl, profileImageUrl });
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}
```

(`revalidatePath` and `updateSettings` imports are added to the existing import block at the top of the file; `updateSettings` joins the existing `@/lib/db` import if present, otherwise add it.)

- [ ] **Step 2: Write the profile form component**

Create `src/app/[panelSlug]/profile-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { saveProfile } from "./actions";

export default function ProfileForm({
  initialHeadline,
  initialMessage,
  initialBackgroundUrl,
  initialProfileUrl,
}: {
  initialHeadline: string;
  initialMessage: string;
  initialBackgroundUrl: string | null;
  initialProfileUrl: string | null;
}) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [message, setMessage] = useState(initialMessage);
  const [backgroundPreview, setBackgroundPreview] = useState(initialBackgroundUrl);
  const [profilePreview, setProfilePreview] = useState(initialProfileUrl);

  return (
    <form action={saveProfile} className="profile-form">
      <label>
        Headline
        <input
          type="text"
          name="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </label>
      <label>
        Message
        <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label>
        Profile photo
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setProfilePreview(URL.createObjectURL(file));
          }}
        />
      </label>
      {profilePreview && <img src={profilePreview} alt="" className="preview-thumb" />}
      <label>
        Background image
        <input
          type="file"
          name="backgroundImage"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setBackgroundPreview(URL.createObjectURL(file));
          }}
        />
      </label>
      {backgroundPreview && <img src={backgroundPreview} alt="" className="preview-thumb" />}
      <button type="submit">Save</button>
    </form>
  );
}
```

- [ ] **Step 3: Render `ProfileForm` in the dashboard**

Overwrite `src/app/[panelSlug]/admin-dashboard.tsx`:

```tsx
import { logout } from "./actions";
import ProfileForm from "./profile-form";
import type { SiteSettings, LinkRecord } from "@/lib/db";

export default function AdminDashboard({
  settings,
  links,
}: {
  settings: SiteSettings;
  links: LinkRecord[];
}) {
  return (
    <main className="admin-dashboard">
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
      <h1>EKLIM Admin</h1>
      <ProfileForm
        initialHeadline={settings.headline}
        initialMessage={settings.message}
        initialBackgroundUrl={settings.backgroundImageUrl}
        initialProfileUrl={settings.profileImageUrl}
      />
      <p>{links.length} link(s) configured.</p>
    </main>
  );
}
```

- [ ] **Step 4: Get a local Blob token**

In the Vercel dashboard, create a Blob store and copy its read/write token into `.env.local` as `BLOB_READ_WRITE_TOKEN=...` (matches `.env.example`, already listed in Task 1).

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, log into `/panel-83c6f29c`.

1. Change the headline and message, click Save. Reload the admin page → expect the new values still shown (persisted).
2. Upload a background image → expect a preview thumbnail appears immediately; after Save and reload, expect the same image URL still set.
3. Upload a profile photo → same check.
4. Visit `http://localhost:3000/` → expect the new headline, message, background, and profile photo all appear on the public page.

- [ ] **Step 6: Commit**

```bash
git add src/app/\[panelSlug\]
git commit -m "Add admin profile form for headline, message, and images"
```

---

### Task 8: Admin links management (add, remove, reorder)

**Files:**
- Create: `src/app/[panelSlug]/add-link-form.tsx`
- Create: `src/app/[panelSlug]/admin-links-list.tsx`
- Modify: `src/app/[panelSlug]/actions.ts` (add `addLinkAction`, `removeLinkAction`, `reorderLinksAction`)
- Modify: `src/app/[panelSlug]/admin-dashboard.tsx` (render `AddLinkForm` + `AdminLinksList`)

**Interfaces:**
- Consumes: `detectPlatform` from `@/lib/platform-detect` (Task 2); `addLink`, `removeLink`, `reorderLinks` from `@/lib/db` (Task 4); `requireSession` from `./actions` (Task 6).
- Produces: `AdminLinkRecord { id: number; url: string; platform: Platform; label: string }` type used by `AdminLinksList`.

- [ ] **Step 1: Add link actions to actions.ts**

Append to `src/app/[panelSlug]/actions.ts`:

```ts
import { detectPlatform } from "@/lib/platform-detect";
import { addLink, removeLink, reorderLinks } from "@/lib/db";

export async function addLinkAction(formData: FormData): Promise<void> {
  await requireSession();

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;

  const { platform, label } = detectPlatform(url);
  await addLink(url, platform, label);

  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function removeLinkAction(id: number): Promise<void> {
  await requireSession();
  await removeLink(id);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function reorderLinksAction(orderedIds: number[]): Promise<void> {
  await requireSession();
  await reorderLinks(orderedIds);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}
```

(`addLink`, `removeLink`, `reorderLinks` join the existing `@/lib/db` import already present from Task 7's `updateSettings` import.)

- [ ] **Step 2: Write the add-link form with live platform preview**

Create `src/app/[panelSlug]/add-link-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import { detectPlatform } from "@/lib/platform-detect";
import { addLinkAction } from "./actions";

export default function AddLinkForm() {
  const [url, setUrl] = useState("");
  const preview = url.trim() ? detectPlatform(url) : null;

  return (
    <form
      action={async (formData) => {
        await addLinkAction(formData);
        setUrl("");
      }}
      className="add-link-form"
    >
      <input
        type="url"
        name="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a link (e.g. https://instagram.com/eklim)"
        required
      />
      {preview && (
        <span className="add-link-preview">
          <PlatformIcon platform={preview.platform} /> {preview.label}
        </span>
      )}
      <button type="submit">Add link</button>
    </form>
  );
}
```

- [ ] **Step 3: Write the draggable links list**

Create `src/app/[panelSlug]/admin-links-list.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlatformIcon from "@/components/PlatformIcon";
import type { Platform } from "@/lib/platform-detect";
import { removeLinkAction, reorderLinksAction } from "./actions";

export interface AdminLinkRecord {
  id: number;
  url: string;
  platform: Platform;
  label: string;
}

function SortableRow({
  link,
  onRemove,
}: {
  link: AdminLinkRecord;
  onRemove: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: link.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="admin-link-row" {...attributes} {...listeners}>
      <PlatformIcon platform={link.platform} className="admin-link-icon" />
      <span className="admin-link-label">{link.label}</span>
      <span className="admin-link-url">{link.url}</span>
      <button type="button" onClick={() => onRemove(link.id)}>
        Remove
      </button>
    </li>
  );
}

export default function AdminLinksList({ initialLinks }: { initialLinks: AdminLinkRecord[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(links, oldIndex, newIndex);
    setLinks(newOrder);
    startTransition(() => {
      reorderLinksAction(newOrder.map((l) => l.id));
    });
  }

  function handleRemove(id: number) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    startTransition(() => {
      removeLinkAction(id);
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <ul className="admin-link-list">
          {links.map((link) => (
            <SortableRow key={link.id} link={link} onRemove={handleRemove} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
```

- [ ] **Step 4: Render both in the dashboard**

Overwrite `src/app/[panelSlug]/admin-dashboard.tsx`:

```tsx
import { logout } from "./actions";
import ProfileForm from "./profile-form";
import AddLinkForm from "./add-link-form";
import AdminLinksList from "./admin-links-list";
import type { SiteSettings, LinkRecord } from "@/lib/db";
import type { Platform } from "@/lib/platform-detect";

export default function AdminDashboard({
  settings,
  links,
}: {
  settings: SiteSettings;
  links: LinkRecord[];
}) {
  return (
    <main className="admin-dashboard">
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
      <h1>EKLIM Admin</h1>
      <ProfileForm
        initialHeadline={settings.headline}
        initialMessage={settings.message}
        initialBackgroundUrl={settings.backgroundImageUrl}
        initialProfileUrl={settings.profileImageUrl}
      />
      <AddLinkForm />
      <AdminLinksList
        initialLinks={links.map((l) => ({ ...l, platform: l.platform as Platform }))}
      />
    </main>
  );
}
```

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, log into `/panel-83c6f29c`.

1. Paste `https://instagram.com/eklim` into the add-link field → expect the Instagram icon and label preview to appear before clicking "Add link".
2. Click "Add link" → expect it appears in the list below, and the input clears.
3. Add a second link, e.g. `https://youtu.be/abc123` → expect the YouTube icon/label.
4. Add a third, unrecognized link, e.g. `https://example.com` → expect it falls back to "Website" with a generic icon, no error.
5. Drag to reorder the three links, reload the admin page → expect the new order persisted.
6. Remove one link, reload → expect it's gone and the other two remain in order.
7. Visit `http://localhost:3000/` → expect the public page shows only the remaining link boxes, in the same order, each opening its URL in a new tab.

- [ ] **Step 6: Commit**

```bash
git add src/app/\[panelSlug\]
git commit -m "Add admin link management: add, remove, reorder"
```

---

### Task 9: Deployment

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing new — documents env vars already defined in `.env.example` (Task 1) and provisioning steps already exercised locally in Tasks 4, 6, 7.

- [ ] **Step 1: Write the README**

Create `README.md`:

```markdown
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
3. Apply the schema: `psql "$POSTGRES_URL" -f db/schema.sql`
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
5. Run the schema against the production database once:
   `psql "$PROD_POSTGRES_URL" -f db/schema.sql`
6. Deploy. Visit `https://<your-domain>/<ADMIN_PATH>` to confirm the admin
   panel loads and the password gate works in production.

## Final verification checklist

- [ ] Password gate accepts the correct password and rejects an incorrect one.
- [ ] Add/remove/reorder links; order persists after reload.
- [ ] Background image and profile photo upload and render on `/`.
- [ ] Empty-state renders cleanly with nothing configured.
- [ ] An unrecognized URL falls back to the "Website" box correctly.
- [ ] Any unmatched path (e.g. `/admin`, `/login`) 404s normally.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Add setup and deployment documentation"
```

---

## Self-Review

**Spec coverage:**
- Architecture (Next.js + Vercel Postgres + Blob, hidden path, one app) → Tasks 1, 4, 6.
- Auth (single password, hashed env var, signed cookie, generic error, no lockout) → Tasks 3, 6.
- Public page behavior (profile/headline/message/background, link boxes, only-if-set, order, empty state) → Task 5.
- Admin panel (profile edit + live preview, add-link with live detection, remove, drag-reorder, immediate save) → Tasks 7, 8.
- Platform detection table (exact 10 entries + fallback) → Task 2, mirrored in Task 8's manual checklist.
- Testing (unit tests for detection only; everything else manual) → Task 2 automated tests; Tasks 4–8 manual verification steps; explicitly no e2e suite.
- Out-of-scope items (multi-tenant, analytics, theme controls, rate limiting) → none implemented in any task; confirmed absent by design.
- Design-swap-later note → placeholder styling only (no CSS framework/design system introduced), consistent with spec's open item.

No gaps found.

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code or an exact manual command with expected output.

**Type consistency check:**
- `Platform` (Task 2) is reused verbatim in `PlatformIcon`, `LinkBox` (Task 5), `AddLinkForm`, `AdminLinksList`'s `AdminLinkRecord` (Task 8).
- `SiteSettings` / `LinkRecord` (Task 4) reused verbatim in `page.tsx` (Task 5) and `AdminDashboard` (Tasks 6–8).
- `SESSION_COOKIE` / `SESSION_MAX_AGE_MS` defined once in `actions.ts` (Task 6) and imported (not redefined) by `page.tsx`.
- `requireSession()` defined in Task 6, called identically from every mutating action added in Tasks 7 and 8.
