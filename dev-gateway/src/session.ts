import type { Context } from "hono";
import { auth } from "./auth";

// Compartilhado entre data-routes.ts (modo genérico /data/:table) e users-lite-routes.ts
// (extensão própria pra "user") — era duplicado byte-a-byte nos dois arquivos.

export interface SessionUser {
  id: string;
  role: "admin" | "manager" | "rep";
}

export async function requireSession(c: Context): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return null;
  const role = (session.user as { role?: "admin" | "manager" | "rep" }).role ?? "rep";
  return { id: session.user.id, role };
}

export function isPrivileged(role: string) {
  return role === "admin" || role === "manager";
}
