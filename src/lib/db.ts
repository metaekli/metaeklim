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
