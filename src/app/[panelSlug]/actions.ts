"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
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
