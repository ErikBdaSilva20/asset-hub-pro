import { Hono } from "hono";
import type { Context } from "hono";
import { pool } from "./db";
import { auth } from "./auth";
import { TABLES } from "./schema";

// Modo genérico do gateway (Importantdoc.md §B5): list/create/update/remove por tabela,
// sem get-by-id, sem filtro por query, sem joins. owner_id é sempre setado a partir da
// sessão — nunca aceito do client.

interface SessionUser {
  id: string;
  role: "admin" | "manager" | "rep";
}

async function requireSession(c: Context): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return null;
  const role = (session.user as { role?: "admin" | "manager" | "rep" }).role ?? "rep";
  return { id: session.user.id, role };
}

function isPrivileged(role: string) {
  return role === "admin" || role === "manager";
}

export const dataRoutes = new Hono();

dataRoutes.get("/data/:table", async (c) => {
  const table = c.req.param("table");
  const def = TABLES[table];
  if (!def) return c.json({ error: "unknown table" }, 404);

  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);

  let query = `select * from "${table}"`;
  const params: unknown[] = [];
  if (def.ownerScoped && !isPrivileged(user.role)) {
    query += ` where owner_id = $1`;
    params.push(user.id);
  }
  query += ` order by created_at desc`;

  const result = await pool.query(query, params);
  return c.json(result.rows);
});

dataRoutes.post("/data/:table", async (c) => {
  const table = c.req.param("table");
  const def = TABLES[table];
  if (!def) return c.json({ error: "unknown table" }, 404);

  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);

  if (!def.ownerScoped && !isPrivileged(user.role)) {
    return c.json({ error: "forbidden" }, 403);
  }

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const columns = def.columns.filter((col) => col in body);
  const values = columns.map((col) => body[col]);

  if (def.ownerScoped) {
    columns.push("owner_id");
    values.push(user.id);
  }

  const placeholders = values.map((_, i) => `$${i + 1}`);
  const query = `insert into "${table}" (${columns.map((col) => `"${col}"`).join(", ")}) values (${placeholders.join(", ")}) returning *`;

  const result = await pool.query(query, values);
  return c.json(result.rows[0], 201);
});

dataRoutes.patch("/data/:table/:id", async (c) => {
  const table = c.req.param("table");
  const id = c.req.param("id");
  const def = TABLES[table];
  if (!def) return c.json({ error: "unknown table" }, 404);

  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const columns = def.columns.filter((col) => col in body);
  if (columns.length === 0) return c.json({ error: "empty patch" }, 400);

  const values = columns.map((col) => body[col]);
  const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(", ");

  const params = [...values, id];
  let query = `update "${table}" set ${setClause} where id = $${params.length}`;
  if (def.ownerScoped && !isPrivileged(user.role)) {
    params.push(user.id);
    query += ` and owner_id = $${params.length}`;
  }
  query += ` returning *`;

  const result = await pool.query(query, params);
  if (result.rowCount === 0) return c.json({ error: "not found" }, 404);
  return c.json(result.rows[0]);
});

dataRoutes.delete("/data/:table/:id", async (c) => {
  const table = c.req.param("table");
  const id = c.req.param("id");
  const def = TABLES[table];
  if (!def) return c.json({ error: "unknown table" }, 404);

  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);

  const params: unknown[] = [id];
  let query = `delete from "${table}" where id = $1`;
  if (def.ownerScoped && !isPrivileged(user.role)) {
    params.push(user.id);
    query += ` and owner_id = $${params.length}`;
  }

  const result = await pool.query(query, params);
  if (result.rowCount === 0) return c.json({ error: "not found" }, 404);
  return c.body(null, 204);
});
