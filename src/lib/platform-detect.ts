export type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "whatsapp"
  | "threads"
  | "email"
  | "website";

export interface DetectedPlatform {
  platform: Platform;
  label: string;
}

interface PatternEntry {
  platform: Platform;
  label: string;
  hosts: string[];
}

const PATTERNS: PatternEntry[] = [
  { platform: "instagram", label: "Instagram", hosts: ["instagram.com"] },
  { platform: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  { platform: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
  { platform: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"] },
  { platform: "twitter", label: "X", hosts: ["x.com", "twitter.com"] },
  { platform: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com"] },
  { platform: "whatsapp", label: "WhatsApp", hosts: ["wa.me", "whatsapp.com"] },
  { platform: "threads", label: "Threads", hosts: ["threads.net"] },
];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function detectPlatform(url: string): DetectedPlatform {
  const trimmed = url.trim();

  if (trimmed.toLowerCase().startsWith("mailto:")) {
    return { platform: "email", label: "Email" };
  }

  const hostname = hostnameOf(trimmed);
  if (hostname) {
    for (const entry of PATTERNS) {
      if (entry.hosts.some((host) => hostname.includes(host))) {
        return { platform: entry.platform, label: entry.label };
      }
    }
  }

  return { platform: "website", label: "Website" };
}
