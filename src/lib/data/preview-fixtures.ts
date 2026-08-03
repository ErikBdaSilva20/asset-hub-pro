// PROTEGIDO — não editável pela IA (masi.template.json, editable.protect).
// Dados mock usados pelo editor por IA (preview Sandpack) quando window.__MASI_PREVIEW__ = true.
// Cobertura completa por tabela, com volume suficiente pra o preview parecer um tenant de
// verdade (não só 1 linha por tabela) — cada tela nunca renderiza o estado vazio.

import type { Database } from "./types.gen";
import type { AdminUserSummary } from "./client";
import type { UserLite } from "./users-lite.repo";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Asset = Database["public"]["Tables"]["assets"]["Row"];
type License = Database["public"]["Tables"]["licenses"]["Row"];
type LicenseAssignment = Database["public"]["Tables"]["license_assignments"]["Row"];
type Movement = Database["public"]["Tables"]["movements"]["Row"];
type MaintenanceOrder = Database["public"]["Tables"]["maintenance_orders"]["Row"];
type Ppe = Database["public"]["Tables"]["ppes"]["Row"];
type Audit = Database["public"]["Tables"]["audits"]["Row"];
type PpeRequirement = Database["public"]["Tables"]["ppe_requirements"]["Row"];

const PREVIEW_OWNER_ID = "preview-owner-1";
const now = "2026-01-01T12:00:00.000Z";
const days = (offset: number) =>
  new Date(new Date(now).getTime() + offset * 86_400_000).toISOString();

// --- pessoas (mesmos ids usados como assignee_id em assets/ppes/license_assignments abaixo) ---
const ANA_ID = PREVIEW_OWNER_ID; // admin
const MARINA_ID = "preview-emp-1"; // manager
const PAULA_ID = "preview-user-3"; // rep
const RAFAEL_ID = "preview-user-4"; // rep

const previewDepartments: Department[] = [
  {
    id: "preview-dep-1",
    owner_id: PREVIEW_OWNER_ID,
    name: "Engenharia",
    manager: "Marina Duarte",
    cost_center: "CC-1010",
    headcount: 42,
    assets_count: 138,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-dep-2",
    owner_id: PREVIEW_OWNER_ID,
    name: "Operações",
    manager: "Rafael Nunes",
    cost_center: "CC-2020",
    headcount: 28,
    assets_count: 64,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-dep-3",
    owner_id: PREVIEW_OWNER_ID,
    name: "Financeiro",
    manager: "Helena Castro",
    cost_center: "CC-3030",
    headcount: 12,
    assets_count: 19,
    created_at: now,
    updated_at: now,
  },
];

const previewCategories: Category[] = [
  {
    id: "preview-cat-1",
    owner_id: PREVIEW_OWNER_ID,
    name: "Notebooks",
    kind: "notebook",
    depreciation_months: 36,
    assets_count: 184,
    requires_maintenance: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-cat-2",
    owner_id: PREVIEW_OWNER_ID,
    name: "EPIs",
    kind: "ppe",
    depreciation_months: 0,
    assets_count: 24,
    requires_maintenance: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-cat-3",
    owner_id: PREVIEW_OWNER_ID,
    name: "Celulares",
    kind: "phone",
    depreciation_months: 24,
    assets_count: 41,
    requires_maintenance: false,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-cat-4",
    owner_id: PREVIEW_OWNER_ID,
    name: "Desktops",
    kind: "desktop",
    depreciation_months: 48,
    assets_count: 22,
    requires_maintenance: true,
    created_at: now,
    updated_at: now,
  },
];

const previewAssets: Asset[] = [
  {
    id: "preview-asset-1",
    tag: "AH-0001",
    name: "MacBook Pro 14",
    kind: "notebook",
    category_id: "preview-cat-1",
    category: "Notebooks",
    status: "in_use",
    condition: "good",
    serial_number: "C02PREVIEW01",
    model: "MacBook Pro 14 M3",
    manufacturer: "Apple",
    department_id: "preview-dep-1",
    department: "Engenharia",
    assignee_id: MARINA_ID,
    assignee: "Marina Duarte",
    location: "São Paulo - HQ",
    purchase_date: days(-400),
    purchase_value: 18500,
    warranty_until: days(300),
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-asset-2",
    tag: "AH-0002",
    name: "ThinkPad T14",
    kind: "notebook",
    category_id: "preview-cat-1",
    category: "Notebooks",
    status: "in_use",
    condition: "good",
    serial_number: "R9PREVIEW02",
    model: "T14 Gen 4",
    manufacturer: "Lenovo",
    department_id: "preview-dep-2",
    department: "Operações",
    assignee_id: RAFAEL_ID,
    assignee: "Rafael Nunes",
    location: "Campinas - CD1",
    purchase_date: days(-300),
    purchase_value: 9200,
    warranty_until: days(60),
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-asset-3",
    tag: "AH-0003",
    name: "iPhone 15",
    kind: "phone",
    category_id: "preview-cat-3",
    category: "Celulares",
    status: "in_use",
    condition: "new",
    serial_number: "F2PREVIEW03",
    model: "A3090",
    manufacturer: "Apple",
    department_id: "preview-dep-1",
    department: "Engenharia",
    assignee_id: PAULA_ID,
    assignee: "Paula Ferraz",
    location: "São Paulo - HQ",
    purchase_date: days(-90),
    purchase_value: 7300,
    warranty_until: days(275),
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-asset-4",
    tag: "AH-0004",
    name: "Monitor UltraSharp 27",
    kind: "peripheral",
    category_id: "preview-cat-4",
    category: "Desktops",
    status: "available",
    condition: "good",
    serial_number: "M0PREVIEW04",
    model: "U2723QE",
    manufacturer: "Dell",
    department_id: null,
    department: null,
    assignee_id: null,
    assignee: null,
    location: "Depósito Central",
    purchase_date: days(-150),
    purchase_value: 3400,
    warranty_until: null,
    created_at: now,
    updated_at: now,
  },
];

const previewLicenses: License[] = [
  {
    id: "preview-lic-1",
    name: "Claude Pro",
    vendor: "Anthropic",
    status: "active",
    billing_period: "monthly",
    renewal_date: days(18),
    cost: 100,
    owner_department: "Engenharia",
    category_id: null,
    category: "Software",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-lic-2",
    name: "Figma Organization",
    vendor: "Figma",
    status: "active",
    billing_period: "annual",
    renewal_date: days(310),
    cost: 62000,
    owner_department: "Engenharia",
    category_id: null,
    category: "Software",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-lic-3",
    name: "Atlassian Jira Premium",
    vendor: "Atlassian",
    status: "expiring",
    billing_period: "annual",
    renewal_date: days(22),
    cost: 96000,
    owner_department: "Operações",
    category_id: null,
    category: "Software",
    created_at: now,
    updated_at: now,
  },
];

const previewLicenseAssignments: LicenseAssignment[] = [
  {
    id: "preview-lic-assign-1",
    license_id: "preview-lic-1",
    assignee_id: MARINA_ID,
    assignee: "Marina Duarte",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-lic-assign-2",
    license_id: "preview-lic-2",
    assignee_id: RAFAEL_ID,
    assignee: "Rafael Nunes",
    created_at: now,
    updated_at: now,
  },
];

const previewMovements: Movement[] = [
  {
    id: "preview-mov-1",
    owner_id: PREVIEW_OWNER_ID,
    asset_id: "preview-asset-1",
    asset_tag: "AH-0001",
    asset_name: "MacBook Pro 14",
    type: "checkout",
    from_label: "Estoque central",
    to_label: "Marina Duarte",
    performed_by: "Ana Ribeiro",
    occurred_at: days(-5),
    note: null,
    created_at: now,
  },
  {
    id: "preview-mov-2",
    owner_id: PREVIEW_OWNER_ID,
    asset_id: "preview-asset-3",
    asset_tag: "AH-0003",
    asset_name: "iPhone 15",
    type: "transfer",
    from_label: "Estoque central",
    to_label: "Paula Ferraz",
    performed_by: "Ana Ribeiro",
    occurred_at: days(-9),
    note: "Repasse pra time de campo.",
    created_at: now,
  },
  {
    id: "preview-mov-3",
    owner_id: PREVIEW_OWNER_ID,
    asset_id: "preview-asset-4",
    asset_tag: "AH-0004",
    asset_name: "Monitor UltraSharp 27",
    type: "checkin",
    from_label: "Rafael Nunes",
    to_label: "Estoque central",
    performed_by: "Rafael Nunes",
    occurred_at: days(-3),
    note: "Devolução por troca de posto.",
    created_at: now,
  },
];

const previewMaintenanceOrders: MaintenanceOrder[] = [
  {
    id: "preview-mnt-1",
    owner_id: PREVIEW_OWNER_ID,
    code: "OS-0001",
    asset_id: "preview-asset-1",
    asset_tag: "AH-0001",
    asset_name: "MacBook Pro 14",
    type: "preventive",
    status: "scheduled",
    provider: "AppleCare",
    opened_at: days(-10),
    due_at: days(10),
    cost: 350,
    description: "Revisão preventiva anual.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-mnt-2",
    owner_id: PREVIEW_OWNER_ID,
    code: "OS-0002",
    asset_id: "preview-asset-2",
    asset_tag: "AH-0002",
    asset_name: "ThinkPad T14",
    type: "corrective",
    status: "in_progress",
    provider: "Nortec Assistência Técnica",
    opened_at: days(-4),
    due_at: days(6),
    cost: 480,
    description: "Troca de bateria e limpeza interna.",
    created_at: now,
    updated_at: now,
  },
];

const previewPpes: Ppe[] = [
  {
    id: "preview-ppe-1",
    name: "Capacete de segurança",
    ca: "CA-12345",
    assignee_id: MARINA_ID,
    assignee: "Marina Duarte",
    department: "Engenharia",
    delivered_at: days(-60),
    expires_at: days(300),
    status: "valid",
    stock: 24,
    cost: 89.9,
    category_id: "preview-cat-2",
    category: "EPIs",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-ppe-2",
    name: "Luva Nitrílica",
    ca: "CA-12346",
    assignee_id: PAULA_ID,
    assignee: "Paula Ferraz",
    department: "Engenharia",
    delivered_at: days(-340),
    expires_at: days(20),
    status: "expiring",
    stock: 40,
    cost: 25,
    category_id: "preview-cat-2",
    category: "EPIs",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-ppe-3",
    name: "Colete Refletivo",
    ca: "CA-12347",
    assignee_id: RAFAEL_ID,
    assignee: "Rafael Nunes",
    department: "Operações",
    delivered_at: days(-120),
    expires_at: days(180),
    status: "valid",
    stock: 30,
    cost: 45,
    category_id: "preview-cat-2",
    category: "EPIs",
    created_at: now,
    updated_at: now,
  },
];

const previewAudits: Audit[] = [
  {
    id: "preview-audit-1",
    owner_id: PREVIEW_OWNER_ID,
    code: "AUD-2026-01",
    scope: "Notebooks — Engenharia",
    responsible: "Helena Castro",
    status: "running",
    started_at: days(-5),
    items_planned: 120,
    items_checked: 64,
    divergences: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-audit-2",
    owner_id: PREVIEW_OWNER_ID,
    code: "AUD-2025-12",
    scope: "EPIs — Operações",
    responsible: "Rafael Nunes",
    status: "closed",
    started_at: days(-60),
    items_planned: 40,
    items_checked: 40,
    divergences: 0,
    created_at: now,
    updated_at: now,
  },
];

// Casa com o cargo de cada pessoa em previewUsersLite abaixo — todo mundo aparece "ok" no painel
// de conformidade de EPI do próprio preview, sem precisar de nenhuma ação de quem está editando.
const previewPpeRequirements: PpeRequirement[] = [
  {
    id: "preview-ppe-req-1",
    function_name: "Head de Engenharia",
    ppe_name: "Capacete de segurança",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-ppe-req-2",
    function_name: "Técnica de Segurança",
    ppe_name: "Luva Nitrílica",
    created_at: now,
    updated_at: now,
  },
  {
    id: "preview-ppe-req-3",
    function_name: "Gerente de Operações",
    ppe_name: "Colete Refletivo",
    created_at: now,
    updated_at: now,
  },
];

// Fixture separado de `fixturesByTable` porque não é uma tabela `/data/:table` — é o mock dos
// endpoints de admin do Better-Auth que a tela de Usuários consome (ver client.ts e
// GATEWAY-ADMIN-ENDPOINTS.md pro porquê deles serem "melhor palpite", não confirmados). Mutado
// em memória no `setRole`/`create-user` abaixo pra parecer persistente dentro da sessão de
// preview, sem precisar de storage nenhum.
const previewAdminUsers: AdminUserSummary[] = [
  { id: ANA_ID, name: "Ana Ribeiro", email: "ana.ribeiro@assethub.co", role: "admin" },
  { id: MARINA_ID, name: "Marina Duarte", email: "marina.duarte@assethub.co", role: "manager" },
  { id: PAULA_ID, name: "Paula Ferraz", email: "paula.ferraz@assethub.co", role: "rep" },
  { id: RAFAEL_ID, name: "Rafael Nunes", email: "rafael.nunes@assethub.co", role: "rep" },
];

// Mock de `/data/users_lite` (dev-gateway/src/users-lite-routes.ts) — mesmas pessoas de
// `previewAdminUsers`, mais `cargo`.
const previewUsersLite: UserLite[] = [
  { id: ANA_ID, name: "Ana Ribeiro", email: "ana.ribeiro@assethub.co", role: "admin", cargo: null },
  {
    id: MARINA_ID,
    name: "Marina Duarte",
    email: "marina.duarte@assethub.co",
    role: "manager",
    cargo: "Head de Engenharia",
  },
  {
    id: PAULA_ID,
    name: "Paula Ferraz",
    email: "paula.ferraz@assethub.co",
    role: "rep",
    cargo: "Técnica de Segurança",
  },
  {
    id: RAFAEL_ID,
    name: "Rafael Nunes",
    email: "rafael.nunes@assethub.co",
    role: "rep",
    cargo: "Gerente de Operações",
  },
];

const fixturesByTable: Record<string, unknown[]> = {
  departments: previewDepartments,
  categories: previewCategories,
  users_lite: previewUsersLite,
  assets: previewAssets,
  licenses: previewLicenses,
  license_assignments: previewLicenseAssignments,
  movements: previewMovements,
  maintenance_orders: previewMaintenanceOrders,
  ppes: previewPpes,
  audits: previewAudits,
  ppe_requirements: previewPpeRequirements,
};

// Demo pública (Vercel, sem login) — troca quem "está logado" sem precisar de sessão real.
// Sujo de propósito: é build só-mock, não precisa ficar bonito (ver conversa da sessão).
// PRECISA de localStorage: o switcher dá reload da página pra forçar o app a reler a sessão, e
// isso reexecuta este módulo do zero — uma variável em memória sozinha voltaria pro padrão (Ana)
// bem antes da troca valer.
const PREVIEW_ROLE_KEY = "assethub.preview.role";

function initialPreviewUserId(): string {
  if (typeof window === "undefined") return ANA_ID;
  const storedRole = window.localStorage.getItem(PREVIEW_ROLE_KEY);
  const match = previewUsersLite.find((u) => u.role === storedRole);
  return match?.id ?? ANA_ID;
}

let currentPreviewUserId = initialPreviewUserId();

export function getPreviewRole(): "admin" | "manager" | "rep" {
  return previewUsersLite.find((u) => u.id === currentPreviewUserId)?.role ?? "admin";
}

export function setPreviewRole(role: "admin" | "manager" | "rep") {
  const match = previewUsersLite.find((u) => u.role === role);
  if (match) {
    currentPreviewUserId = match.id;
    if (typeof window !== "undefined") window.localStorage.setItem(PREVIEW_ROLE_KEY, role);
  }
}

export function previewRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (path === "/api/auth/get-session") {
    const match = previewUsersLite.find((u) => u.id === currentPreviewUserId);
    return Promise.resolve({
      user: match
        ? {
            id: match.id,
            email: match.email,
            name: match.name,
            role: match.role ?? undefined,
            cargo: match.cargo,
          }
        : null,
    } as T);
  }

  if (path === "/api/auth/sign-out") {
    return Promise.resolve(undefined as T);
  }

  if (path.startsWith("/api/auth/admin/list-users")) {
    return Promise.resolve({ users: previewAdminUsers } as T);
  }

  if (path === "/api/auth/admin/set-role" && method === "POST") {
    const { userId, role } = (body ?? {}) as { userId?: string; role?: AdminUserSummary["role"] };
    const user = previewAdminUsers.find((candidate) => candidate.id === userId);
    if (user && role) user.role = role;
    return Promise.resolve({ user: user ?? null } as T);
  }

  if (path === "/api/auth/admin/create-user" && method === "POST") {
    const { email, name, data } = (body ?? {}) as {
      email?: string;
      name?: string;
      data?: { cargo?: string };
    };
    const id = `preview-user-${previewAdminUsers.length + 1}`;
    const user: AdminUserSummary = { id, name: name ?? null, email: email ?? "", role: "rep" };
    previewAdminUsers.push(user);
    previewUsersLite.push({ ...user, cargo: data?.cargo ?? null });
    return Promise.resolve({ user } as T);
  }

  const match = path.match(/^\/data\/([a-z_]+)(?:\/(.+))?$/);

  if (!match) {
    return Promise.resolve(undefined as T);
  }

  const [, table] = match;
  const rows = fixturesByTable[table] ?? [];

  if (method === "GET") {
    return Promise.resolve(rows as T);
  }

  // create/update/remove em preview: eco simples, sem persistência real.
  return Promise.resolve({} as T);
}
