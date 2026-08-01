import { Hono } from "hono";
import { pool } from "./db";
import { requireSession, isPrivileged } from "./session";

// Extensão real de gateway (Importantdoc.md §A3) — não cabe no modo genérico /data/:table porque
// "user" é gerenciado pelo Better-Auth, não por supabase/migrations/*.sql + TABLES (schema.ts).
// Cobre duas lacunas que o merge employees→user deixou (ver TODO-MERGE-COLABORADOR-USUARIO.md):
// 1. manager listar reps pra atribuir ativo/EPI/assinatura (o plugin admin do Better-Auth é
//    admin-only de verdade — ver GATEWAY-ADMIN-ENDPOINTS.md, manager toma 403 lá);
// 2. admin/manager definir o cargo de um rep sem depender do endpoint /admin/update-user do
//    Better-Auth (não confirmado contra a versão de produção, mesmo risco já documentado pra
//    list-users/set-role).
// Só expõe id/name/email/role/cargo — nunca senha/sessão. Escrita só aceita `cargo`; role e
// e-mail continuam exclusivos do plugin admin (setRole) e do próprio Better-Auth.

export const usersLiteRoutes = new Hono();

usersLiteRoutes.get("/data/users_lite", async (c) => {
  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  // Leitura aberta a qualquer logado, igual `employees` era antes do merge (ownerScoped: false,
  // sem adminOnly) — rep precisa disto pra listar colegas no "Repassar para" do próprio
  // dashboard (MyEquipmentPanel). Só a escrita (PATCH abaixo) é admin/manager only.

  const result = await pool.query(
    'select id, name, email, role, cargo from "user" order by name',
  );
  return c.json(result.rows);
});

usersLiteRoutes.patch("/data/users_lite/:id", async (c) => {
  const id = c.req.param("id");
  const user = await requireSession(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  if (!isPrivileged(user.role)) return c.json({ error: "forbidden" }, 403);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!("cargo" in body)) return c.json({ error: "empty patch" }, 400);

  // Admin não é gerenciável por manager — mesma garantia de servidor que já existe pra role
  // (plugin admin do Better-Auth) e que a UI espelha em CargoCell/UserRoleCell. Sem isto, um
  // manager poderia reescrever o cargo de um admin direto pela API, ignorando a tela.
  const target = await pool.query<{ role: string | null }>('select role from "user" where id = $1', [
    id,
  ]);
  if (target.rowCount === 0) return c.json({ error: "not found" }, 404);
  if (target.rows[0].role === "admin" && user.role !== "admin") {
    return c.json({ error: "forbidden" }, 403);
  }

  const result = await pool.query(
    'update "user" set cargo = $1 where id = $2 returning id, name, email, role, cargo',
    [body.cargo, id],
  );
  if (result.rowCount === 0) return c.json({ error: "not found" }, 404);
  return c.json(result.rows[0]);
});
