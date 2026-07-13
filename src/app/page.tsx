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
