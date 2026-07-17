"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import {
  updateSettings,
  addLink,
  removeLink,
  reorderLinks,
  setMainLink,
  updateLinkLabel,
} from "@/lib/db";
import { detectPlatform } from "@/lib/platform-detect";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./session";

export async function requireSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET!;
  if (!token || !verifySessionToken(token, secret, SESSION_MAX_AGE_MS)) {
    throw new Error("Not authenticated");
  }
}

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  const password = String(formData.get("password") ?? "");
  const storedHash = process.env.ADMIN_PASSWORD_HASH!;
  const secret = process.env.SESSION_SECRET!;

  if (!verifyPassword(password, storedHash)) {
    return { error: "Incorrect password" };
  }

  const token = createSessionToken(secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  revalidatePath("/[panelSlug]", "page");
  return { error: "" };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/[panelSlug]", "page");
}

export async function saveProfile(
  _prevState: { error: string } | undefined,
  formData: FormData
): Promise<{ error: string }> {
  await requireSession();

  const headline = String(formData.get("headline") ?? "");
  const message = String(formData.get("message") ?? "");
  const backgroundFile = formData.get("backgroundImage") as File | null;
  const profileFile = formData.get("profileImage") as File | null;

  let backgroundImageUrl: string | undefined;
  let profileImageUrl: string | undefined;
  let uploadFailed = false;

  if (backgroundFile && backgroundFile.size > 0) {
    try {
      const blob = await put(`background-${Date.now()}`, backgroundFile, { access: "public" });
      backgroundImageUrl = blob.url;
    } catch (error) {
      console.error("Background image upload failed:", error);
      uploadFailed = true;
    }
  }
  if (profileFile && profileFile.size > 0) {
    try {
      const blob = await put(`profile-${Date.now()}`, profileFile, { access: "public" });
      profileImageUrl = blob.url;
    } catch (error) {
      console.error("Profile image upload failed:", error);
      uploadFailed = true;
    }
  }

  await updateSettings({ headline, message, backgroundImageUrl, profileImageUrl });
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");

  if (uploadFailed) {
    return {
      error:
        "Headline and message were saved, but the image upload failed. Check that image storage is configured (BLOB_READ_WRITE_TOKEN) and try again.",
    };
  }
  return { error: "" };
}

export async function addLinkAction(formData: FormData): Promise<void> {
  await requireSession();

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;

  const { platform, label } = detectPlatform(url);
  await addLink(url, platform, label);

  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function removeLinkAction(id: number): Promise<void> {
  await requireSession();
  await removeLink(id);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function reorderLinksAction(orderedIds: number[]): Promise<void> {
  await requireSession();
  await reorderLinks(orderedIds);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function setMainLinkAction(id: number): Promise<void> {
  await requireSession();
  await setMainLink(id);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}

export async function updateLinkLabelAction(id: number, label: string): Promise<void> {
  await requireSession();
  const trimmed = label.trim();
  if (!trimmed) return;
  await updateLinkLabel(id, trimmed);
  revalidatePath("/", "page");
  revalidatePath("/[panelSlug]", "page");
}
