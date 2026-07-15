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
    <div className="admin-backdrop">
      <main className="admin-shell">
        <div className="admin-header">
          <h1>EKLIM Admin</h1>
          <form action={logout}>
            <button type="submit">Log out</button>
          </form>
        </div>

        <div className="admin-section">
          <ProfileForm
            initialHeadline={settings.headline}
            initialMessage={settings.message}
            initialBackgroundUrl={settings.backgroundImageUrl}
            initialProfileUrl={settings.profileImageUrl}
          />
        </div>

        <div className="admin-section">
          <AddLinkForm />
          <AdminLinksList
            initialLinks={links.map((l) => ({ ...l, platform: l.platform as Platform }))}
          />
        </div>
      </main>
    </div>
  );
}
