import { createDepartment } from "@/lib/data/departments.repo";
import { createCategory } from "@/lib/data/categories.repo";
import { createSupplier } from "@/lib/data/suppliers.repo";
import { createEmployee } from "@/lib/data/employees.repo";
import { createAsset, type Asset } from "@/lib/data/assets.repo";
import { createLicense } from "@/lib/data/licenses.repo";
import { createLicenseAssignment } from "@/lib/data/license-assignments.repo";
import { createMovement } from "@/lib/data/movements.repo";
import { createMaintenanceOrder } from "@/lib/data/maintenance.repo";
import { createPpe } from "@/lib/data/ppes.repo";
import { createAudit } from "@/lib/data/audits.repo";

/**
 * Popula o workspace com um conjunto de dados de exemplo coerente entre si — pensado pra quem
 * acabou de clonar/rodar o AssetHub localmente e não sabe onde cada informação vai aparecer.
 * Roda pela API normal (mesmos create* usados nos modais), então respeita owner_id/papéis como
 * qualquer outro cadastro manual — não é um atalho especial de banco.
 *
 * Ordem importa: movements/maintenance_orders têm asset_id NOT NULL (FK), então só rodam depois
 * dos assets existirem de verdade.
 */

export interface SeedSummary {
  departments: number;
  categories: number;
  suppliers: number;
  employees: number;
  assets: number;
  licenses: number;
  licenseAssignments: number;
  movements: number;
  maintenanceOrders: number;
  ppes: number;
  audits: number;
}

const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString();

export async function seedDemoData(): Promise<SeedSummary> {
  const departments = await Promise.all([
    createDepartment({
      name: "Engenharia",
      manager: "Marina Duarte",
      cost_center: "CC-1010",
      headcount: 42,
    }),
    createDepartment({
      name: "Operações",
      manager: "Rafael Nunes",
      cost_center: "CC-2020",
      headcount: 68,
    }),
    createDepartment({
      name: "Financeiro",
      manager: "Helena Castro",
      cost_center: "CC-3030",
      headcount: 18,
    }),
    createDepartment({
      name: "Comercial",
      manager: "Diego Prado",
      cost_center: "CC-4040",
      headcount: 31,
    }),
  ]);

  const categories = await Promise.all([
    createCategory({
      name: "Notebooks",
      kind: "notebook",
      depreciation_months: 36,
      requires_maintenance: true,
    }),
    createCategory({
      name: "Desktops",
      kind: "desktop",
      depreciation_months: 48,
      requires_maintenance: true,
    }),
    createCategory({
      name: "Celulares",
      kind: "phone",
      depreciation_months: 24,
      requires_maintenance: false,
    }),
    createCategory({
      name: "Mobiliário",
      kind: "furniture",
      depreciation_months: 120,
      requires_maintenance: false,
    }),
    createCategory({
      name: "EPIs",
      kind: "ppe",
      depreciation_months: 12,
      requires_maintenance: false,
    }),
  ]);

  const suppliers = await Promise.all([
    createSupplier({
      name: "Nortec Distribuidora",
      document: "12.345.678/0001-90",
      contact: "Lucas Menezes",
      email: "lucas@nortec.com.br",
      category: "Hardware",
      contract_until: iso(210),
    }),
    createSupplier({
      name: "Vertex Tecnologia",
      document: "98.765.432/0001-11",
      contact: "Sofia Braga",
      email: "sofia@vertex.io",
      category: "Licenças",
      contract_until: iso(64),
    }),
    createSupplier({
      name: "SafeWork EPI",
      document: "45.111.222/0001-33",
      contact: "Bruno Tavares",
      email: "bruno@safework.com",
      category: "EPI",
      contract_until: iso(-12),
    }),
  ]);

  const employees = await Promise.all([
    createEmployee({
      name: "Marina Duarte",
      email: "marina.duarte@assethub.co",
      role: "Head de Engenharia",
      department: "Engenharia",
      status: "active",
      location: "São Paulo - HQ",
      hired_at: iso(-1420),
    }),
    createEmployee({
      name: "Rafael Nunes",
      email: "rafael.nunes@assethub.co",
      role: "Gerente de Operações",
      department: "Operações",
      status: "active",
      location: "Campinas - CD1",
      hired_at: iso(-980),
    }),
    createEmployee({
      name: "Helena Castro",
      email: "helena.castro@assethub.co",
      role: "Controller",
      department: "Financeiro",
      status: "active",
      location: "São Paulo - HQ",
      hired_at: iso(-2100),
    }),
    createEmployee({
      name: "Diego Prado",
      email: "diego.prado@assethub.co",
      role: "Diretor Comercial",
      department: "Comercial",
      status: "active",
      location: "Rio de Janeiro",
      hired_at: iso(-640),
    }),
    createEmployee({
      name: "Paula Ferraz",
      email: "paula.ferraz@assethub.co",
      role: "Técnica de Segurança",
      department: "Operações",
      status: "active",
      location: "Campinas - CD1",
      hired_at: iso(-380),
    }),
  ]);

  const assetSeeds: Partial<Asset>[] = [
    {
      tag: "AH-1000",
      name: 'MacBook Pro 14" M3',
      kind: "notebook",
      category: "Notebooks",
      status: "in_use",
      condition: "good",
      manufacturer: "Apple",
      model: "A2918",
      supplier: "Nortec Distribuidora",
      department: "Engenharia",
      assignee: "Marina Duarte",
      location: "São Paulo - HQ",
      purchase_value: 18400,
      purchase_date: iso(-400),
      warranty_until: iso(300),
    },
    {
      tag: "AH-1001",
      name: "ThinkPad T14 Gen 4",
      kind: "notebook",
      category: "Notebooks",
      status: "in_use",
      condition: "good",
      manufacturer: "Lenovo",
      model: "21HD",
      supplier: "Nortec Distribuidora",
      department: "Operações",
      assignee: "Rafael Nunes",
      location: "Campinas - CD1",
      purchase_value: 9200,
      purchase_date: iso(-300),
      warranty_until: iso(60),
    },
    {
      tag: "AH-1002",
      name: "Dell OptiPlex 7010",
      kind: "desktop",
      category: "Desktops",
      status: "available",
      condition: "good",
      manufacturer: "Dell",
      model: "7010 SFF",
      supplier: "Nortec Distribuidora",
      location: "Depósito Central",
      purchase_value: 6100,
      purchase_date: iso(-200),
    },
    {
      tag: "AH-1003",
      name: "iPhone 15",
      kind: "phone",
      category: "Celulares",
      status: "in_use",
      condition: "new",
      manufacturer: "Apple",
      model: "A3090",
      department: "Comercial",
      assignee: "Diego Prado",
      location: "Rio de Janeiro",
      purchase_value: 7300,
      purchase_date: iso(-90),
      warranty_until: iso(275),
    },
    {
      tag: "AH-1004",
      name: "Cadeira Ergonômica Flex",
      kind: "furniture",
      category: "Mobiliário",
      status: "in_use",
      condition: "good",
      manufacturer: "MobiCorp",
      model: "FLX-200",
      department: "Financeiro",
      assignee: "Helena Castro",
      location: "São Paulo - HQ",
      purchase_value: 2200,
      purchase_date: iso(-500),
    },
    {
      tag: "AH-1005",
      name: 'Monitor UltraSharp 27"',
      kind: "peripheral",
      category: "Desktops",
      status: "available",
      condition: "good",
      manufacturer: "Dell",
      model: "U2723QE",
      location: "Depósito Central",
      purchase_value: 3400,
      purchase_date: iso(-150),
    },
  ];
  const assets = await Promise.all(assetSeeds.map((seed) => createAsset(seed)));

  const licenses = await Promise.all([
    createLicense({
      name: "Microsoft 365 E3",
      vendor: "Microsoft",
      status: "active",
      billing_period: "annual",
      renewal_date: iso(184),
      cost: 384000,
      owner_department: "Operações",
      category: "Software",
    }),
    createLicense({
      name: "Atlassian Jira Premium",
      vendor: "Atlassian",
      status: "expiring",
      billing_period: "annual",
      renewal_date: iso(22),
      cost: 96000,
      owner_department: "Engenharia",
      category: "Software",
    }),
    createLicense({
      name: "Figma Organization",
      vendor: "Figma",
      status: "active",
      billing_period: "annual",
      renewal_date: iso(310),
      cost: 62000,
      owner_department: "Engenharia",
      category: "Software",
    }),
    createLicense({
      name: "Claude Pro",
      vendor: "Anthropic",
      status: "active",
      billing_period: "monthly",
      renewal_date: iso(18),
      cost: 100,
      owner_department: "Engenharia",
      category: "Software",
    }),
  ]);

  // Atribuição de responsável (Pedido 3, license_assignments) é admin-only no gateway — manager
  // também pode disparar o seed (ver help-drawer.tsx), então isto é best-effort: sem permissão,
  // o resto dos dados de exemplo continua valendo, só fica sem "quem está com o que".
  let licenseAssignments = 0;
  try {
    await Promise.all([
      createLicenseAssignment({
        license_id: licenses[1].id,
        assignee_id: employees[0].id,
        assignee: employees[0].name,
      }),
      createLicenseAssignment({
        license_id: licenses[2].id,
        assignee_id: employees[0].id,
        assignee: employees[0].name,
      }),
      createLicenseAssignment({
        license_id: licenses[3].id,
        assignee_id: employees[1].id,
        assignee: employees[1].name,
      }),
    ]);
    licenseAssignments = 3;
  } catch {
    // rodando como manager — sem permissão de admin pra atribuir, segue sem essa parte.
  }

  const movementTypes = ["checkout", "checkin", "transfer"] as const;
  const movements = await Promise.all(
    assets.slice(0, 3).map((asset, index) =>
      createMovement({
        asset_id: asset.id,
        asset_tag: asset.tag,
        asset_name: asset.name,
        type: movementTypes[index],
        from_label: "Estoque central",
        to_label: employees[index]?.name ?? "Estoque central",
        performed_by: employees[(index + 1) % employees.length]?.name ?? "Sistema",
        occurred_at: iso(-(index * 5 + 2)),
      }),
    ),
  );

  const maintenanceOrders = await Promise.all(
    assets.slice(0, 2).map((asset, index) =>
      createMaintenanceOrder({
        code: `OS-240${index + 1}`,
        asset_id: asset.id,
        asset_tag: asset.tag,
        asset_name: asset.name,
        type: index === 0 ? "preventive" : "corrective",
        status: index === 0 ? "scheduled" : "in_progress",
        provider: suppliers[0]?.name ?? "Fornecedor",
        opened_at: iso(-10),
        due_at: iso(10),
        cost: 350 + index * 200,
        description: "Revisão técnica com laudo e substituição de peças críticas.",
      }),
    ),
  );

  const ppes = await Promise.all([
    createPpe({
      name: "Capacete Classe B",
      ca: "CA-31469",
      assignee: "Paula Ferraz",
      department: "Operações",
      status: "valid",
      delivered_at: iso(-60),
      expires_at: iso(300),
      stock: 24,
    }),
    createPpe({
      name: "Luva Nitrílica",
      ca: "CA-31480",
      assignee: "Rafael Nunes",
      department: "Operações",
      status: "expiring",
      delivered_at: iso(-340),
      expires_at: iso(20),
      stock: 40,
    }),
  ]);

  const audits = await Promise.all([
    createAudit({
      code: "AUD-2026-001",
      scope: "Notebooks — Engenharia",
      responsible: "Helena Castro",
      status: "running",
      started_at: iso(-5),
      items_planned: 40,
      items_checked: 18,
      divergences: 1,
    }),
  ]);

  return {
    departments: departments.length,
    categories: categories.length,
    suppliers: suppliers.length,
    employees: employees.length,
    assets: assets.length,
    licenses: licenses.length,
    licenseAssignments,
    movements: movements.length,
    maintenanceOrders: maintenanceOrders.length,
    ppes: ppes.length,
    audits: audits.length,
  };
}
