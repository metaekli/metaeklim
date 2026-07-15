import { FiUser } from "react-icons/fi";
import { getSettings, getLinks } from "@/lib/db";
import LinkBox from "@/components/LinkBox";
import type { Platform } from "@/lib/platform-detect";

export const revalidate = 0;

export default async function HomePage() {
  const [settings, links] = await Promise.all([getSettings(), getLinks()]);
  const year = new Date().getFullYear();

  return (
    <div className="public-page-backdrop">
      <main className="public-card">
        {settings.backgroundImageUrl && (
          <div
            className="public-card__blob"
            style={{
              inset: 0,
              backgroundImage: `url(${settings.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.5,
            }}
          />
        )}
        <div className="public-card__blob public-card__blob--a" />
        <div className="public-card__blob public-card__blob--b" />
        <div className="public-card__sheen" />

        <div className="public-card__content">
          <div className="avatar">
            <div className="avatar__spin" />
            <div className="avatar__frame">
              <div className="avatar__inner">
                {settings.profileImageUrl ? (
                  <img src={settings.profileImageUrl} alt="" />
                ) : (
                  <FiUser size={40} className="avatar__placeholder" />
                )}
              </div>
            </div>
          </div>

          <h1 className="headline">{settings.headline}</h1>
          <div className="headline-accent" />
          {settings.message && <p className="message">{settings.message}</p>}

          <div className="link-list">
            {links.map((link) => (
              <LinkBox
                key={link.id}
                url={link.url}
                platform={link.platform as Platform}
                label={link.label}
                primary={link.isMain}
              />
            ))}
          </div>

          <div className="public-footer">
            {settings.headline || "EKLIM"} © {year}
          </div>
        </div>
      </main>
    </div>
  );
}
