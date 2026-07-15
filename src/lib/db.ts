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
  isMain: boolean;
}

const RETRY_DELAYS_MS = [300, 1000, 2000];

/**
 * Neon's free-tier database auto-suspends after inactivity and can take a
 * few seconds to wake on the next connection. Retry transient connection
 * failures with backoff so a visitor never sees a crash for this reason.
 */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined) break;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function getSettings(): Promise<SiteSettings> {
  return withRetry(async () => {
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
  });
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<void> {
  await withRetry(
    () => sql`
      UPDATE site_settings SET
        headline = COALESCE(${settings.headline ?? null}, headline),
        message = COALESCE(${settings.message ?? null}, message),
        background_image_url = COALESCE(${settings.backgroundImageUrl ?? null}, background_image_url),
        profile_image_url = COALESCE(${settings.profileImageUrl ?? null}, profile_image_url)
      WHERE id = 1
    `
  );
}

export async function getLinks(): Promise<LinkRecord[]> {
  return withRetry(async () => {
    const { rows } = await sql`
      SELECT id, url, platform, label, position, is_main FROM links ORDER BY position ASC
    `;
    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      platform: r.platform,
      label: r.label,
      position: r.position,
      isMain: r.is_main,
    }));
  });
}

export async function addLink(url: string, platform: string, label: string): Promise<LinkRecord> {
  return withRetry(async () => {
    const { rows } = await sql`
      INSERT INTO links (url, platform, label, position)
      VALUES (${url}, ${platform}, ${label}, (SELECT COALESCE(MAX(position), -1) + 1 FROM links))
      RETURNING id, url, platform, label, position, is_main
    `;
    const r = rows[0];
    return {
      id: r.id,
      url: r.url,
      platform: r.platform,
      label: r.label,
      position: r.position,
      isMain: r.is_main,
    };
  });
}

export async function removeLink(id: number): Promise<void> {
  await withRetry(() => sql`DELETE FROM links WHERE id = ${id}`);
}

export async function reorderLinks(orderedIds: number[]): Promise<void> {
  await withRetry(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await sql`UPDATE links SET position = ${i} WHERE id = ${orderedIds[i]}`;
    }
  });
}

export async function setMainLink(id: number): Promise<void> {
  await withRetry(() => sql`UPDATE links SET is_main = (id = ${id})`);
}
