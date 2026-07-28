// PROTEGIDO — não editável pela IA (masi.template.json, editable.protect).
// Dados mock usados pelo editor por IA (preview Sandpack) quando window.__MASI_PREVIEW__ = true.
// Cobertura completa por tabela: cada tabela de negócio tem pelo menos um registro de
// exemplo, para que o preview nunca renderize as telas no estado vazio.

import type { Database } from "./types.gen";

type Department = Database["public"]["Tables"]["departments"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type Employee = Database["public"]["Tables"]["employees"]["Row"];
type Asset = Database["public"]["Tables"]["assets"]["Row"];
type License = Database["public"]["Tables"]["licenses"]["Row"];
type Movement = Database["public"]["Tables"]["movements"]["Row"];
type MaintenanceOrder = Database["public"]["Tables"]["maintenance_orders"]["Row"];
type Ppe = Database["public"]["Tables"]["ppes"]["Row"];
type Audit = Database["public"]["Tables"]["audits"]["Row"];

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
    owner_id: PREVIEW_OWNER_ID,
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
    owner_id: PREVIEW_OWNER_ID,
    name: "GitHub Enterprise",
    vendor: "GitHub",
    key: "PREVIEW-KEY-0001",
    seats_total: 50,
    seats_used: 38,
    status: "active",
    renewal_date: now,
    annual_cost: 42000,
    owner_department: "Engenharia",
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
    owner_id: PREVIEW_OWNER_ID,
    name: "Capacete de segurança",
    ca: "CA-12345",
    assignee: "Paula Ferraz",
    department: "Segurança do Trabalho",
    delivered_at: now,
    expires_at: now,
    status: "valid",
    stock: 24,
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

const fixturesByTable: Record<string, unknown[]> = {
  departments: previewDepartments,
  categories: previewCategories,
  suppliers: previewSuppliers,
  employees: previewEmployees,
  assets: previewAssets,
  licenses: previewLicenses,
  movements: previewMovements,
  maintenance_orders: previewMaintenanceOrders,
  ppes: previewPpes,
  audits: previewAudits,
};

export function previewRequest<T>(method: string, path: string, _body?: unknown): Promise<T> {
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
