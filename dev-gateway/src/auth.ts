import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { pool } from "./db";

const corsOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:8080,http://localhost:8081"
).split(",");

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:8787",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
  trustedOrigins: corsOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
    },
  },
  // Plugin "admin" do Better-Auth — é o que a tela /users (src/screens/UsersScreen.tsx) espera
  // encontrar em produção (/api/auth/admin/list-users, /api/auth/admin/set-role). `adminRoles`
  // default já é ["admin"], que bate com o valor que já usamos — sem isso, o gateway real
  // devolve 404 pra essas rotas (foi o que aconteceu ao testar contra o gateway de verdade, ver
  // GATEWAY-ADMIN-ENDPOINTS.md na raiz do repo).
  plugins: [admin()],
  user: {
    additionalFields: {
      role: {
        type: ["admin", "manager", "rep"],
        required: false,
        defaultValue: "rep",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // 1º usuário do tenant vira admin; os demais entram como rep (Importantdoc.md §B8).
        // Como esse gateway é single-tenant local, "tenant" aqui é o próprio banco local.
        before: async (user) => {
          const { rows } = await pool.query<{ count: number }>(
            'select count(*)::int as count from "user"',
          );
          const isFirstUser = rows[0]?.count === 0;
          return {
            data: {
              ...user,
              role: isFirstUser ? "admin" : "rep",
            },
          };
        },
      },
    },
  },
});
