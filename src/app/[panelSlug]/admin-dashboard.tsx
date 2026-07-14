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
