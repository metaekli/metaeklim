import { describe, it, expect } from "vitest";
import { detectPlatform } from "@/lib/platform-detect";

describe("detectPlatform", () => {
  it("detects Instagram", () => {
    expect(detectPlatform("https://instagram.com/eklim")).toEqual({ platform: "instagram", label: "Instagram" });
  });

  it("detects YouTube from youtube.com", () => {
    expect(detectPlatform("https://www.youtube.com/@eklim")).toEqual({ platform: "youtube", label: "YouTube" });
  });

  it("detects YouTube from youtu.be", () => {
    expect(detectPlatform("https://youtu.be/abc123")).toEqual({ platform: "youtube", label: "YouTube" });
  });

  it("detects TikTok", () => {
    expect(detectPlatform("https://www.tiktok.com/@eklim")).toEqual({ platform: "tiktok", label: "TikTok" });
  });

  it("detects LinkedIn", () => {
    expect(detectPlatform("https://www.linkedin.com/company/eklim")).toEqual({ platform: "linkedin", label: "LinkedIn" });
  });

  it("detects X/Twitter from x.com", () => {
    expect(detectPlatform("https://x.com/eklim")).toEqual({ platform: "twitter", label: "X" });
  });

  it("detects X/Twitter from twitter.com", () => {
    expect(detectPlatform("https://twitter.com/eklim")).toEqual({ platform: "twitter", label: "X" });
  });

  it("detects Facebook", () => {
    expect(detectPlatform("https://www.facebook.com/eklim")).toEqual({ platform: "facebook", label: "Facebook" });
  });

  it("detects WhatsApp", () => {
    expect(detectPlatform("https://wa.me/1234567890")).toEqual({ platform: "whatsapp", label: "WhatsApp" });
  });

  it("detects Threads", () => {
    expect(detectPlatform("https://www.threads.net/@eklim")).toEqual({ platform: "threads", label: "Threads" });
  });

  it("detects Email from mailto:", () => {
    expect(detectPlatform("mailto:hello@eklim.agency")).toEqual({ platform: "email", label: "Email" });
  });

  it("falls back to Website for an unrecognized URL", () => {
    expect(detectPlatform("https://eklim.agency")).toEqual({ platform: "website", label: "Website" });
  });

  it("falls back to Website for a malformed URL instead of throwing", () => {
    expect(detectPlatform("not a url")).toEqual({ platform: "website", label: "Website" });
  });
});
