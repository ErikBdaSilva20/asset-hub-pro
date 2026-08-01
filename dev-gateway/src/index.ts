import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { auth } from "./auth";
import { dataRoutes } from "./data-routes";
import { usersLiteRoutes } from "./users-lite-routes";

const corsOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:8080,http://localhost:8081"
).split(",");

const app = new Hono();

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowHeaders: ["Content-Type", "X-Tenant-Id"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
// usersLiteRoutes ANTES de dataRoutes: o catch-all "/data/:table" de dataRoutes casaria com
// "/data/users_lite" primeiro se viesse antes (Hono resolve por ordem de registro), devolvendo
// 404 (tabela desconhecida em TABLES) sem nunca chegar nesta rota mais específica.
app.route("/", usersLiteRoutes);
app.route("/", dataRoutes);
app.get("/health", (c) => c.json({ ok: true }));

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`dev-gateway ouvindo em http://localhost:${info.port}`);
});
