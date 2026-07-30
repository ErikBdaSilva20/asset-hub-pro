import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
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

  // Roda TODOS os arquivos de supabase/migrations/, em ordem — não só o 0001. Todos usam
  // `if not exists`/`if exists`, então rodar de novo num banco já migrado é sempre seguro.
  const migrationsDir = resolve(__dirname, "../../supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Aplicando schema de negócio (supabase/migrations/${file})...`);
    const sql = readFileSync(resolve(migrationsDir, file), "utf8");
    await pool.query(sql);
  }

  console.log("Migrations aplicadas com sucesso.");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
