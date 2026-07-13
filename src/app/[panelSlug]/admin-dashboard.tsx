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
