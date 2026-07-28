import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { getMigrations } from "better-auth/db/migration";
import { auth } from "../src/auth";
import { pool } from "../src/db";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("Aplicando tabelas do Better-Auth (user/session/account/verification)...");
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();

  console.log("Aplicando schema de negócio (supabase/migrations/0001_business_schema.sql)...");
  const sqlPath = resolve(__dirname, "../../supabase/migrations/0001_business_schema.sql");
  const sql = readFileSync(sqlPath, "utf8");
  await pool.query(sql);

  console.log("Migrations aplicadas com sucesso.");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
