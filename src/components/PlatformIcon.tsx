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
