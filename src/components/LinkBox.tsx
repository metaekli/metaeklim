import { FiArrowRight } from "react-icons/fi";
import PlatformIcon from "./PlatformIcon";
import type { Platform } from "@/lib/platform-detect";

export default function LinkBox({
  url,
  platform,
  label,
  primary = false,
}: {
  url: string;
  platform: Platform;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={primary ? "link-box link-box--primary" : "link-box"}
    >
      <span className="link-box__icon">
        <PlatformIcon platform={platform} />
      </span>
      <span className="link-box__label">{label}</span>
      {primary && <FiArrowRight className="link-box__arrow" />}
    </a>
  );
}
