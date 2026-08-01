import "dotenv/config";
import { randomUUID } from "node:crypto";
import { pool } from "../src/db";

// =====================================================
// Seed pesado — popula o banco em volume (milhares de linhas) direto via SQL, sem passar pela
// API/HTTP. Pensado pra testar a interface sob carga real: paginação, busca, filtros, gráficos
// do dashboard com muitos dados — coisa que o seed pequeno (seed-demo-data.ts, alguns registros
// coerentes pra onboarding) não serve pra validar.
//
// É aditivo — nunca apaga nada que já existe. Toda linha gerada aqui é identificável pelo prefixo
// "BULK-" (tags/códigos) ou pelo domínio de e-mail "@bulk-seed.local" (reps de exemplo, direto na
// tabela "user" do Better-Auth), então dá pra limpar depois com um DELETE filtrando por esses
// padrões, se quiser.
//
// Uso: npm run seed:heavy (dentro de dev-gateway/)
// =====================================================

const VOLUME = {
  departments: 20,
  categories: 16,
  users: 350,
  assets: 1000,
  licenses: 70,
  movements: 800,
  maintenanceOrders: 400,
  ppes: 500,
  ppeRequirements: 18,
  audits: 50,
};

// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maybe<T>(value: T, probabilityOfNull: number): T | null {
  return Math.random() < probabilityOfNull ? null : value;
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

async function bulkInsert(
  table: string,
  columns: string[],
  rows: unknown[][],
  returning?: string,
  onConflict?: string,
): Promise<Record<string, unknown>[]> {
  if (rows.length === 0) return [];
  const CHUNK = 500;
  const out: Record<string, unknown>[] = [];
  const colList = columns.map((c) => `"${c}"`).join(", ");

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const values: unknown[] = [];
    const tuples = chunk.map((row, r) => {
      const placeholders = row.map((_, c) => `$${r * columns.length + c + 1}`);
      values.push(...row);
      return `(${placeholders.join(", ")})`;
    });
    const sql = `insert into "${table}" (${colList}) values ${tuples.join(", ")}${
      onConflict ? ` ${onConflict}` : ""
    }${returning ? ` returning ${returning}` : ""}`;
    const res = await pool.query(sql, values);
    if (returning) out.push(...(res.rows as Record<string, unknown>[]));
  }
  return out;
}

// ---------------------------------------------------
// Pools de dados (hand-rolled, sem dependência de faker)
// ---------------------------------------------------

const FIRST_NAMES = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Elisa",
  "Fábio",
  "Gabriela",
  "Henrique",
  "Isabela",
  "João",
  "Karina",
  "Lucas",
  "Marina",
  "Nicolas",
  "Olívia",
  "Pedro",
  "Queila",
  "Rafael",
  "Sofia",
  "Tiago",
  "Ursula",
  "Vitor",
  "Wesley",
  "Yasmin",
  "Zeca",
  "Camila",
  "Daniel",
  "Eduarda",
  "Felipe",
  "Giovanna",
] as const;

const LAST_NAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Rodrigues",
  "Ferreira",
  "Almeida",
  "Pereira",
  "Lima",
  "Gomes",
  "Costa",
  "Ribeiro",
  "Martins",
  "Carvalho",
  "Rocha",
  "Dias",
  "Monteiro",
  "Cardoso",
  "Teixeira",
  "Correia",
  "Barros",
  "Freitas",
  "Nascimento",
  "Araújo",
  "Melo",
  "Castro",
  "Campos",
  "Moura",
  "Vieira",
  "Duarte",
] as const;

const JOB_ROLES = [
  "Analista de TI",
  "Desenvolvedor(a) Backend",
  "Desenvolvedor(a) Frontend",
  "Gerente de Projetos",
  "Analista Financeiro",
  "Assistente Administrativo",
  "Técnico de Segurança",
  "Coordenador(a) de RH",
  "Analista de Marketing",
  "Designer de Produto",
  "Engenheiro(a) de Dados",
  "Suporte Técnico",
  "Analista de Compras",
  "Controller",
  "Diretor(a) Comercial",
] as const;

const DEPARTMENT_NAMES = [
  "Engenharia",
  "Operações",
  "Financeiro",
  "Comercial",
  "Marketing",
  "Recursos Humanos",
  "Produto",
  "Suporte",
  "Jurídico",
  "Compras",
  "Logística",
  "TI",
  "Qualidade",
  "Pesquisa e Desenvolvimento",
  "Atendimento",
  "Segurança do Trabalho",
  "Facilities",
  "Business Intelligence",
  "Customer Success",
  "Expansão",
] as const;

// Só pra `maintenance_orders.provider` (texto livre, ver seed-heavy.ts) — não existe mais tabela
// suppliers, então isto não vira FK em lugar nenhum, é só nome de assistência técnica fictícia.
const PROVIDER_BASE = [
  "Nortec",
  "Vertex",
  "Prisma",
  "Zênite",
  "Órbita",
  "Fusion",
  "Delta",
  "Nimbus",
  "Solstice",
  "Quantum",
  "Atlas",
  "Helix",
  "Apex",
  "Cyrus",
  "Lumen",
  "Vórtex",
  "Meridian",
  "Áxion",
  "Titan",
  "Nexus",
] as const;
const PROVIDER_SUFFIX = [
  "Tecnologia",
  "Assistência Técnica",
  "Soluções",
  "Sistemas",
  "Corp",
  "Serviços",
  "Manutenções",
] as const;

const LICENSE_VENDORS = [
  "Microsoft 365",
  "Google Workspace",
  "Slack",
  "Notion",
  "Figma",
  "Atlassian Jira",
  "Confluence",
  "Zoom",
  "Salesforce",
  "HubSpot",
  "GitHub",
  "GitLab",
  "AWS",
  "Datadog",
  "PagerDuty",
  "Zendesk",
  "Asana",
  "Monday.com",
  "Adobe Creative Cloud",
  "Canva Pro",
  "1Password",
  "Okta",
  "Miro",
  "Linear",
  "Vercel",
  "Anthropic Claude",
  "OpenAI ChatGPT",
] as const;
const LICENSE_TIER = ["", " Pro", " Team", " Enterprise", " Business"] as const;

const ASSET_KINDS = [
  "notebook",
  "desktop",
  "phone",
  "furniture",
  "tool",
  "vehicle",
  "peripheral",
] as const;
const ASSET_NAMES_BY_KIND: Record<(typeof ASSET_KINDS)[number], readonly string[]> = {
  notebook: [
    "MacBook Pro 14",
    "MacBook Air M2",
    "ThinkPad T14",
    "Dell XPS 13",
    "Dell Latitude 5420",
    "HP EliteBook 840",
  ],
  desktop: ["Dell OptiPlex 7010", "iMac 24", "HP EliteDesk 800", "Mac Mini M2"],
  phone: ["iPhone 15", "iPhone 14", "Samsung Galaxy S23", "Motorola Edge 40"],
  furniture: [
    "Cadeira Ergonômica Flex",
    "Mesa Height-Adjustable",
    "Armário Modulado",
    "Poltrona Executiva",
  ],
  tool: ["Furadeira Industrial", "Multímetro Digital", "Chave de Torque", "Solda Portátil"],
  vehicle: ["Fiat Strada", "VW Saveiro", "Renault Kwid", "Toyota Hilux"],
  peripheral: ["Monitor UltraSharp 27", "Teclado Mecânico", "Webcam Logitech", "Dock USB-C"],
};
const MANUFACTURERS = [
  "Apple",
  "Dell",
  "Lenovo",
  "HP",
  "Samsung",
  "Motorola",
  "Logitech",
  "MobiCorp",
  "Fiat",
  "VW",
  "Toyota",
] as const;

const PPE_NAMES = [
  "Capacete de Segurança",
  "Luva Nitrílica",
  "Óculos de Proteção",
  "Protetor Auricular",
  "Bota de Segurança",
  "Cinto de Segurança",
  "Máscara PFF2",
  "Colete Refletivo",
  "Protetor Facial",
  "Luva de Raspa",
] as const;

const LOCATIONS = [
  "São Paulo - HQ",
  "Campinas - CD1",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Recife",
  "Home office",
] as const;

function personName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

// ---------------------------------------------------
// main
// ---------------------------------------------------

async function main() {
  const { rows: admins } = await pool.query<{ id: string }>(
    `select id from "user" where role = 'admin' order by "createdAt" asc limit 1`,
  );
  const owner = admins[0];
  if (!owner) {
    throw new Error(
      "Nenhum usuário admin encontrado — cadastre o primeiro usuário (vira admin automaticamente) antes de rodar o seed pesado.",
    );
  }
  const ownerId = owner.id;
  console.log(`Usando owner_id = ${ownerId} (primeiro admin) pras tabelas com dono.`);

  // --- departments ---
  const departmentRows = Array.from({ length: VOLUME.departments }, () => {
    const name = `${pick(DEPARTMENT_NAMES)} ${randInt(1, 99)}`;
    return [
      ownerId,
      name,
      personName(),
      `CC-${randInt(1000, 9999)}`,
      randInt(3, 120),
      randInt(0, 80),
    ];
  });
  await bulkInsert(
    "departments",
    ["owner_id", "name", "manager", "cost_center", "headcount", "assets_count"],
    departmentRows,
  );
  console.log(`departments: +${departmentRows.length}`);

  // --- categories --- (kind precisa bater com asset_kind pra fazer sentido junto de assets)
  const CATEGORY_KIND_POOL = [...ASSET_KINDS, "ppe"] as const;
  const categoryRows = Array.from({ length: VOLUME.categories }, (_, i) => {
    const kind = CATEGORY_KIND_POOL[i % CATEGORY_KIND_POOL.length];
    return [
      ownerId,
      `${kind[0].toUpperCase()}${kind.slice(1)} ${randInt(1, 999)}`,
      kind,
      pick([0, 12, 24, 36, 48, 60]),
      randInt(0, 200),
      Math.random() < 0.4,
    ];
  });
  await bulkInsert(
    "categories",
    ["owner_id", "name", "kind", "depreciation_months", "assets_count", "requires_maintenance"],
    categoryRows,
  );
  console.log(`categories: +${categoryRows.length}`);

  // Pools vivos (existentes + recém-criados) pra ligar FK com dado real.
  const departments = (
    await pool.query<{ id: string; name: string }>(`select id, name from departments`)
  ).rows;
  const categories = (
    await pool.query<{ id: string; name: string; kind: string }>(
      `select id, name, kind from categories`,
    )
  ).rows;

  // --- user (reps de exemplo) ---
  // Direto na tabela do Better-Auth ("user"), sem passar pela API — 350 chamadas de signup HTTP
  // (hash de senha cada uma) seriam lentas demais pro que este seed serve: popular volume pra
  // testar paginação/filtros/gráficos, não testar login de verdade. Por isso sem `"account"`
  // (nenhuma senha, ninguém loga como esses reps) — só precisam existir pra `assignee_id`
  // apontar pra um `"user".id` real (FK). role = 'rep' direto, sem passar pelo hook de "1º
  // usuário vira admin" de dev-gateway/src/auth.ts (que só roda via signUp/admin.createUser).
  const userRows = Array.from({ length: VOLUME.users }, (_, i) => [
    randomUUID(),
    personName(),
    `colaborador${i + 1}.bulk@bulk-seed.local`,
    true,
    "rep",
    pick(JOB_ROLES),
  ]);
  // "user".email tem unique constraint (Better-Auth) — employees não tinha isso, então rodar
  // este seed 2x quebraria no meio sem o ON CONFLICT (o resto do script continuaria intocado,
  // mas o processo inteiro abortaria aqui). DO NOTHING mantém o comportamento aditivo original:
  // rodar de novo não duplica os mesmos 350 "colaboradorN.bulk@..." já existentes.
  await bulkInsert(
    "user",
    ["id", "name", "email", "emailVerified", "role", "cargo"],
    userRows,
    undefined,
    "on conflict (email) do nothing",
  );
  console.log(`user: +${userRows.length} (linhas com e-mail já existente foram ignoradas)`);

  const users = (
    await pool.query<{ id: string; name: string }>(
      `select id, name from "user" where email like '%@bulk-seed.local'`,
    )
  ).rows;

  // --- assets ---
  let assetTagSeq = 1;
  const assetStatusWeights = {
    available: 30,
    in_use: 45,
    maintenance: 10,
    reserved: 8,
    retired: 5,
    lost: 2,
  } as const;
  const assetRows = Array.from({ length: VOLUME.assets }, () => {
    const kind = pick(ASSET_KINDS);
    const cat = pick(categories.filter((c) => c.kind === kind)) ?? pick(categories);
    const assigned = Math.random() < 0.75;
    const user = assigned ? pick(users) : null;
    const dep = Math.random() < 0.85 ? pick(departments) : null;
    // 20% sem garantia, 15% vencendo nos próximos 120 dias (popula "Garantias próximas" do
    // dashboard de propósito), resto espalhado no passado/futuro.
    const warrantyRoll = Math.random();
    const warrantyUntil =
      warrantyRoll < 0.2
        ? null
        : warrantyRoll < 0.35
          ? daysFromNow(randInt(1, 119))
          : daysFromNow(randInt(-700, 700));

    return [
      `BULK-${String(assetTagSeq++).padStart(5, "0")}`,
      pick(ASSET_NAMES_BY_KIND[kind]),
      kind,
      cat?.id ?? null,
      cat?.name ?? null,
      pickWeighted(assetStatusWeights),
      pickWeighted({ new: 25, good: 45, fair: 22, damaged: 8 }),
      `SN-${randInt(100000, 999999)}`,
      pick(ASSET_NAMES_BY_KIND[kind]),
      pick(MANUFACTURERS),
      dep?.id ?? null,
      dep?.name ?? null,
      user?.id ?? null,
      user?.name ?? null,
      pick(LOCATIONS),
      daysFromNow(-randInt(10, 1800)),
      randInt(400, 25000),
      warrantyUntil,
    ];
  });
  await bulkInsert(
    "assets",
    [
      "tag",
      "name",
      "kind",
      "category_id",
      "category",
      "status",
      "condition",
      "serial_number",
      "model",
      "manufacturer",
      "department_id",
      "department",
      "assignee_id",
      "assignee",
      "location",
      "purchase_date",
      "purchase_value",
      "warranty_until",
    ],
    assetRows,
  );
  console.log(`assets: +${assetRows.length}`);

  const assets = (
    await pool.query<{ id: string; tag: string; name: string }>(`select id, tag, name from assets`)
  ).rows;

  // --- licenses (+ license_assignments pra uma fatia delas) ---
  const licenseRows = Array.from({ length: VOLUME.licenses }, () => {
    const statusRoll = pickWeighted({ active: 65, expiring: 15, expired: 12, unassigned: 8 });
    const renewal =
      statusRoll === "expiring"
        ? daysFromNow(randInt(1, 30))
        : statusRoll === "expired"
          ? daysFromNow(-randInt(1, 200))
          : daysFromNow(randInt(31, 500));
    const softwareCat = categories.find((c) => c.kind === "license") ?? pick(categories);
    const dep = pick(departments);
    return [
      `${pick(LICENSE_VENDORS)}${pick(LICENSE_TIER)}`,
      pick(LICENSE_VENDORS),
      statusRoll,
      pickWeighted({ monthly: 40, annual: 60 }),
      renewal,
      randInt(50, 400000) / (Math.random() < 0.5 ? 1 : 100),
      dep.name,
      softwareCat?.id ?? null,
      softwareCat?.name ?? "Software",
    ];
  });
  const insertedLicenses = await bulkInsert(
    "licenses",
    [
      "name",
      "vendor",
      "status",
      "billing_period",
      "renewal_date",
      "cost",
      "owner_department",
      "category_id",
      "category",
    ],
    licenseRows,
    "id",
  );
  console.log(`licenses: +${insertedLicenses.length}`);

  const assignmentRows = insertedLicenses
    .filter(() => Math.random() < 0.55)
    .map((license) => {
      const user = pick(users);
      return [license.id as string, user.id, user.name];
    });
  await bulkInsert(
    "license_assignments",
    ["license_id", "assignee_id", "assignee"],
    assignmentRows,
  );
  console.log(`license_assignments: +${assignmentRows.length}`);

  // --- movements ---
  const movementRows = Array.from({ length: VOLUME.movements }, () => {
    const asset = pick(assets);
    const type = pickWeighted({
      checkout: 35,
      checkin: 25,
      transfer: 20,
      maintenance: 12,
      disposal: 8,
    });
    const performer = pick(users);
    return [
      ownerId,
      asset.id,
      asset.tag,
      asset.name,
      type,
      pick(["Estoque central", "Depósito filial", ...departments.map((d) => d.name)]),
      pick([performer.name, "Estoque central", ...departments.map((d) => d.name)]),
      performer.name,
      daysFromNow(-randInt(0, 900)),
      maybe(
        pick([
          "Entrega padrão.",
          "Troca de responsável.",
          "Retorno pra manutenção.",
          "Baixa por obsolescência.",
        ]),
        0.5,
      ),
    ];
  });
  await bulkInsert(
    "movements",
    [
      "owner_id",
      "asset_id",
      "asset_tag",
      "asset_name",
      "type",
      "from_label",
      "to_label",
      "performed_by",
      "occurred_at",
      "note",
    ],
    movementRows,
  );
  console.log(`movements: +${movementRows.length}`);

  // --- maintenance_orders ---
  let maintenanceSeq = 1;
  const maintenanceRows = Array.from({ length: VOLUME.maintenanceOrders }, () => {
    const asset = pick(assets);
    const status = pickWeighted({ scheduled: 30, in_progress: 20, done: 40, late: 10 });
    const openedAt = daysFromNow(-randInt(1, 400));
    const dueAt =
      status === "late"
        ? daysFromNow(-randInt(1, 60))
        : status === "done"
          ? openedAt
          : daysFromNow(randInt(1, 90));
    return [
      ownerId,
      `BULK-OS-${String(maintenanceSeq++).padStart(5, "0")}`,
      asset.id,
      asset.tag,
      asset.name,
      pickWeighted({ preventive: 55, corrective: 45 }),
      status,
      `${pick(PROVIDER_BASE)} ${pick(PROVIDER_SUFFIX)}`,
      openedAt,
      dueAt,
      randInt(80, 5000),
      pick([
        "Revisão técnica com laudo e substituição de peças críticas.",
        "Manutenção corretiva por falha reportada pelo usuário.",
        "Revisão preventiva de rotina.",
        "Troca de bateria e limpeza interna.",
      ]),
    ];
  });
  await bulkInsert(
    "maintenance_orders",
    [
      "owner_id",
      "code",
      "asset_id",
      "asset_tag",
      "asset_name",
      "type",
      "status",
      "provider",
      "opened_at",
      "due_at",
      "cost",
      "description",
    ],
    maintenanceRows,
  );
  console.log(`maintenance_orders: +${maintenanceRows.length}`);

  // --- ppes ---
  const ppeStatusWeights = { valid: 70, expiring: 18, expired: 12 } as const;
  const ppeRows = Array.from({ length: VOLUME.ppes }, () => {
    const status = pickWeighted(ppeStatusWeights);
    const expiresAt =
      status === "expiring"
        ? daysFromNow(randInt(1, 30))
        : status === "expired"
          ? daysFromNow(-randInt(1, 200))
          : daysFromNow(randInt(31, 700));
    const user = Math.random() < 0.85 ? pick(users) : null;
    const ppeCat = categories.find((c) => c.kind === "ppe") ?? pick(categories);
    return [
      pick(PPE_NAMES),
      `CA-${randInt(10000, 99999)}`,
      user?.id ?? null,
      user?.name ?? null,
      pick(departments).name,
      daysFromNow(-randInt(1, 500)),
      expiresAt,
      status,
      randInt(0, 150),
      randInt(15, 400) + Math.random(),
      ppeCat?.id ?? null,
      ppeCat?.name ?? "EPIs",
    ];
  });
  await bulkInsert(
    "ppes",
    [
      "name",
      "ca",
      "assignee_id",
      "assignee",
      "department",
      "delivered_at",
      "expires_at",
      "status",
      "stock",
      "cost",
      "category_id",
      "category",
    ],
    ppeRows,
  );
  console.log(`ppes: +${ppeRows.length}`);

  // --- ppe_requirements ---
  const requirementRows = Array.from({ length: VOLUME.ppeRequirements }, () => [
    pick(JOB_ROLES),
    pick(PPE_NAMES),
  ]);
  await bulkInsert("ppe_requirements", ["function_name", "ppe_name"], requirementRows);
  console.log(`ppe_requirements: +${requirementRows.length}`);

  // --- audits ---
  let auditSeq = 1;
  const auditRows = Array.from({ length: VOLUME.audits }, () => {
    const status = pickWeighted({ planned: 20, running: 30, closed: 50 });
    const planned = randInt(20, 400);
    const checked = status === "planned" ? 0 : status === "closed" ? planned : randInt(0, planned);
    return [
      ownerId,
      `BULK-AUD-${String(auditSeq++).padStart(5, "0")}`,
      `${pick(categories).name} — ${pick(departments).name}`,
      personName(),
      status,
      daysFromNow(-randInt(0, 300)),
      planned,
      checked,
      randInt(0, Math.floor(checked * 0.15)),
    ];
  });
  await bulkInsert(
    "audits",
    [
      "owner_id",
      "code",
      "scope",
      "responsible",
      "status",
      "started_at",
      "items_planned",
      "items_checked",
      "divergences",
    ],
    auditRows,
  );
  console.log(`audits: +${auditRows.length}`);

  console.log("\nSeed pesado concluído.");
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
