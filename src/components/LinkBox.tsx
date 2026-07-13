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
