// PROTEGIDO — não editável pela IA (masi.template.json, editable.protect).
// Dados mock usados pelo editor por IA (preview Sandpack) quando window.__MASI_PREVIEW__ = true.
// Cobertura completa por tabela: cada tabela de negócio tem pelo menos um registro de
// exemplo, para que o preview nunca renderize as telas no estado vazio.

import type { Database } from "./types.gen";
import type { AdminUserSummary } from "./client";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type Employee = Database["public"]["Tables"]["employees"]["Row"];
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
];

const previewSuppliers: Supplier[] = [
  {
    id: "preview-sup-1",
    owner_id: PREVIEW_OWNER_ID,
    name: "Nortec Distribuidora",
    document: "12.345.678/0001-90",
    contact: "Lucas Menezes",
    email: "lucas@nortec.com.br",
    category: "Hardware",
    contract_until: now,
    active_assets: 312,
    created_at: now,
    updated_at: now,
  },
];

const previewEmployees: Employee[] = [
  {
    id: "preview-emp-1",
    owner_id: PREVIEW_OWNER_ID,
    name: "Marina Duarte",
    email: "marina.duarte@assethub.co",
    role: "Head de Engenharia",
    department_id: "preview-dep-1",
    department: "Engenharia",
    status: "active",
    hired_at: now,
    assets_count: 4,
    location: "São Paulo - HQ",
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
    supplier_id: "preview-sup-1",
    supplier: "Nortec Distribuidora",
    department_id: "preview-dep-1",
    department: "Engenharia",
    assignee_id: "preview-emp-1",
    assignee: "Marina Duarte",
    location: "São Paulo - HQ",
    purchase_date: now,
    purchase_value: 18500,
    warranty_until: now,
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
    renewal_date: now,
    cost: 100,
    owner_department: "Engenharia",
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
    assignee_id: "preview-emp-1",
    assignee: "Marina Duarte",
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
    performed_by: "Rafael Nunes",
    occurred_at: now,
    note: null,
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
    opened_at: now,
    due_at: now,
    cost: 350,
    description: "Revisão preventiva anual.",
    created_at: now,
    updated_at: now,
  },
];

const previewPpes: Ppe[] = [
  {
    id: "preview-ppe-1",
    name: "Capacete de segurança",
    ca: "CA-12345",
    assignee_id: "preview-emp-1",
    assignee: "Marina Duarte",
    department: "Segurança do Trabalho",
    delivered_at: now,
    expires_at: now,
    status: "valid",
    stock: 24,
    cost: 89.9,
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
    started_at: now,
    items_planned: 120,
    items_checked: 64,
    divergences: 2,
    created_at: now,
    updated_at: now,
  },
];

const previewPpeRequirements: PpeRequirement[] = [
  {
    id: "preview-ppe-req-1",
    function_name: "Head de Engenharia",
    ppe_name: "Capacete de segurança",
    created_at: now,
    updated_at: now,
  },
];

// Fixture separado de `fixturesByTable` porque não é uma tabela `/data/:table` — é o mock dos
// endpoints de admin do Better-Auth que a tela de Usuários consome (ver client.ts e
// GATEWAY-ADMIN-ENDPOINTS.md pro porquê deles serem "melhor palpite", não confirmados). Mutado
// em memória no `setRole` abaixo pra troca de papel parecer persistente dentro da sessão de
// preview, sem precisar de storage nenhum.
const previewAdminUsers: AdminUserSummary[] = [
  { id: PREVIEW_OWNER_ID, name: "Ana Ribeiro", email: "ana.ribeiro@assethub.co", role: "admin" },
  {
    id: "preview-emp-1",
    name: "Marina Duarte",
    email: "marina.duarte@assethub.co",
    role: "manager",
  },
  { id: "preview-user-3", name: "Paula Ferraz", email: "paula.ferraz@assethub.co", role: "rep" },
];

const fixturesByTable: Record<string, unknown[]> = {
  departments: previewDepartments,
  categories: previewCategories,
  suppliers: previewSuppliers,
  employees: previewEmployees,
  assets: previewAssets,
  licenses: previewLicenses,
  license_assignments: previewLicenseAssignments,
  movements: previewMovements,
  maintenance_orders: previewMaintenanceOrders,
  ppes: previewPpes,
  audits: previewAudits,
  ppe_requirements: previewPpeRequirements,
};

export function previewRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (path.startsWith("/api/auth/admin/list-users")) {
    return Promise.resolve({ users: previewAdminUsers } as T);
  }

  if (path === "/api/auth/admin/set-role" && method === "POST") {
    const { userId, role } = (body ?? {}) as { userId?: string; role?: AdminUserSummary["role"] };
    const user = previewAdminUsers.find((candidate) => candidate.id === userId);
    if (user && role) user.role = role;
    return Promise.resolve({ user: user ?? null } as T);
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
