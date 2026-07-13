import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getSettings, getLinks } from "@/lib/db";
import LoginForm from "./login-form";
import AdminDashboard from "./admin-dashboard";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./session";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ panelSlug: string }>;
}) {
  const { panelSlug } = await params;
  if (panelSlug !== process.env.ADMIN_PATH) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET!;
  const isAuthed = token ? verifySessionToken(token, secret, SESSION_MAX_AGE_MS) : false;

  if (!isAuthed) {
    return <LoginForm />;
  }

  const [settings, links] = await Promise.all([getSettings(), getLinks()]);
  return <AdminDashboard settings={settings} links={links} />;
}
