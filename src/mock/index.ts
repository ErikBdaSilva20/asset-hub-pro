import type {
  ActivityEntry,
  Asset,
  Audit,
  Category,
  Department,
  Employee,
  License,
  MaintenanceOrder,
  Movement,
  Ppe,
  Supplier,
  TimelineEntry,
} from "@/shared/types";

/** Mock dataset. Remove this folder once the backend is connected. */

const day = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

export const departments: Department[] = [
  { id: "dep-1", name: "Engenharia", manager: "Marina Duarte", costCenter: "CC-1010", headcount: 42, assetsCount: 138 },
  { id: "dep-2", name: "Operações", manager: "Rafael Nunes", costCenter: "CC-2020", headcount: 68, assetsCount: 204 },
  { id: "dep-3", name: "Financeiro", manager: "Helena Castro", costCenter: "CC-3030", headcount: 18, assetsCount: 51 },
  { id: "dep-4", name: "Comercial", manager: "Diego Prado", costCenter: "CC-4040", headcount: 31, assetsCount: 87 },
  { id: "dep-5", name: "Segurança do Trabalho", manager: "Paula Ferraz", costCenter: "CC-5050", headcount: 12, assetsCount: 246 },
];

export const categories: Category[] = [
  { id: "cat-1", name: "Notebooks", kind: "notebook", depreciationMonths: 36, assetsCount: 184, requiresMaintenance: true },
  { id: "cat-2", name: "Desktops", kind: "desktop", depreciationMonths: 48, assetsCount: 96, requiresMaintenance: true },
  { id: "cat-3", name: "Celulares", kind: "phone", depreciationMonths: 24, assetsCount: 132, requiresMaintenance: false },
  { id: "cat-4", name: "Mobiliário", kind: "furniture", depreciationMonths: 120, assetsCount: 310, requiresMaintenance: false },
  { id: "cat-5", name: "EPIs", kind: "ppe", depreciationMonths: 12, assetsCount: 246, requiresMaintenance: false },
  { id: "cat-6", name: "Ferramentas", kind: "tool", depreciationMonths: 60, assetsCount: 74, requiresMaintenance: true },
  { id: "cat-7", name: "Veículos", kind: "vehicle", depreciationMonths: 120, assetsCount: 9, requiresMaintenance: true },
  { id: "cat-8", name: "Periféricos", kind: "peripheral", depreciationMonths: 24, assetsCount: 221, requiresMaintenance: false },
];

export const suppliers: Supplier[] = [
  { id: "sup-1", name: "Nortec Distribuidora", document: "12.345.678/0001-90", contact: "Lucas Menezes", email: "lucas@nortec.com.br", category: "Hardware", contractUntil: iso(210), activeAssets: 312 },
  { id: "sup-2", name: "Vertex Tecnologia", document: "98.765.432/0001-11", contact: "Sofia Braga", email: "sofia@vertex.io", category: "Licenças", contractUntil: iso(64), activeAssets: 88 },
  { id: "sup-3", name: "SafeWork EPI", document: "45.111.222/0001-33", contact: "Bruno Tavares", email: "bruno@safework.com", category: "EPI", contractUntil: iso(-12), activeAssets: 246 },
  { id: "sup-4", name: "MobiCorp Móveis", document: "33.444.555/0001-77", contact: "Carla Lima", email: "carla@mobicorp.com", category: "Mobiliário", contractUntil: null, activeAssets: 310 },
  { id: "sup-5", name: "FleetOne Locadora", document: "77.888.999/0001-22", contact: "Iago Ferreira", email: "iago@fleetone.com", category: "Frota", contractUntil: iso(420), activeAssets: 9 },
];

export const employees: Employee[] = [
  { id: "emp-1", name: "Marina Duarte", email: "marina.duarte@assethub.co", role: "Head de Engenharia", departmentId: "dep-1", department: "Engenharia", status: "active", hiredAt: iso(-1420), assetsCount: 4, location: "São Paulo - HQ" },
  { id: "emp-2", name: "Rafael Nunes", email: "rafael.nunes@assethub.co", role: "Gerente de Operações", departmentId: "dep-2", department: "Operações", status: "active", hiredAt: iso(-980), assetsCount: 3, location: "Campinas - CD1" },
  { id: "emp-3", name: "Helena Castro", email: "helena.castro@assethub.co", role: "Controller", departmentId: "dep-3", department: "Financeiro", status: "active", hiredAt: iso(-2100), assetsCount: 2, location: "São Paulo - HQ" },
  { id: "emp-4", name: "Diego Prado", email: "diego.prado@assethub.co", role: "Diretor Comercial", departmentId: "dep-4", department: "Comercial", status: "active", hiredAt: iso(-640), assetsCount: 5, location: "Rio de Janeiro" },
  { id: "emp-5", name: "Paula Ferraz", email: "paula.ferraz@assethub.co", role: "Técnica de Segurança", departmentId: "dep-5", department: "Segurança do Trabalho", status: "active", hiredAt: iso(-380), assetsCount: 6, location: "Campinas - CD1" },
  { id: "emp-6", name: "Tiago Barros", email: "tiago.barros@assethub.co", role: "Desenvolvedor Sênior", departmentId: "dep-1", department: "Engenharia", status: "active", hiredAt: iso(-520), assetsCount: 3, location: "Remoto" },
  { id: "emp-7", name: "Juliana Reis", email: "juliana.reis@assethub.co", role: "Analista de Suporte", departmentId: "dep-2", department: "Operações", status: "on_leave", hiredAt: iso(-810), assetsCount: 2, location: "São Paulo - HQ" },
  { id: "emp-8", name: "Otávio Lins", email: "otavio.lins@assethub.co", role: "Analista Fiscal", departmentId: "dep-3", department: "Financeiro", status: "offboarded", hiredAt: iso(-1600), assetsCount: 0, location: "São Paulo - HQ" },
  { id: "emp-9", name: "Bianca Souza", email: "bianca.souza@assethub.co", role: "Executiva de Contas", departmentId: "dep-4", department: "Comercial", status: "active", hiredAt: iso(-240), assetsCount: 2, location: "Remoto" },
  { id: "emp-10", name: "Vitor Aguiar", email: "vitor.aguiar@assethub.co", role: "Almoxarife", departmentId: "dep-2", department: "Operações", status: "active", hiredAt: iso(-1120), assetsCount: 8, location: "Campinas - CD1" },
];

const assetSeed: Array<Partial<Asset> & Pick<Asset, "name" | "kind" | "category" | "categoryId">> = [
  { name: 'MacBook Pro 14" M3', kind: "notebook", category: "Notebooks", categoryId: "cat-1", manufacturer: "Apple", model: "A2918", purchaseValue: 18400 },
  { name: "ThinkPad T14 Gen 4", kind: "notebook", category: "Notebooks", categoryId: "cat-1", manufacturer: "Lenovo", model: "21HD", purchaseValue: 9200 },
  { name: "Dell OptiPlex 7010", kind: "desktop", category: "Desktops", categoryId: "cat-2", manufacturer: "Dell", model: "7010 SFF", purchaseValue: 6100 },
  { name: "iPhone 15", kind: "phone", category: "Celulares", categoryId: "cat-3", manufacturer: "Apple", model: "A3090", purchaseValue: 7300 },
  { name: "Galaxy S23", kind: "phone", category: "Celulares", categoryId: "cat-3", manufacturer: "Samsung", model: "SM-S911", purchaseValue: 4900 },
  { name: "Cadeira Ergonômica Flex", kind: "furniture", category: "Mobiliário", categoryId: "cat-4", manufacturer: "MobiCorp", model: "FLX-200", purchaseValue: 2200 },
  { name: "Capacete Classe B", kind: "ppe", category: "EPIs", categoryId: "cat-5", manufacturer: "SafeWork", model: "CA-31469", purchaseValue: 89 },
  { name: "Parafusadeira 20V", kind: "tool", category: "Ferramentas", categoryId: "cat-6", manufacturer: "Bosch", model: "GSR 20", purchaseValue: 1150 },
  { name: "Fiat Fiorino Furgão", kind: "vehicle", category: "Veículos", categoryId: "cat-7", manufacturer: "Fiat", model: "2023", purchaseValue: 118000 },
  { name: 'Monitor UltraSharp 27"', kind: "peripheral", category: "Periféricos", categoryId: "cat-8", manufacturer: "Dell", model: "U2723QE", purchaseValue: 3400 },
];

const statuses: Asset["status"][] = ["available", "in_use", "in_use", "maintenance", "reserved", "retired"];
const conditions: Asset["condition"][] = ["new", "good", "good", "fair", "damaged"];
const locations = ["São Paulo - HQ", "Campinas - CD1", "Rio de Janeiro", "Remoto", "Depósito Central"];

export const assets: Asset[] = Array.from({ length: 48 }, (_, index) => {
  const seed = assetSeed[index % assetSeed.length];
  const status = statuses[index % statuses.length];
  const holder = employees[index % employees.length];
  const department = departments[index % departments.length];
  const supplier = suppliers[index % suppliers.length];
  const assigned = status === "in_use" || status === "reserved";

  return {
    id: `ast-${index + 1}`,
    tag: `AH-${String(1000 + index)}`,
    name: seed.name,
    kind: seed.kind,
    categoryId: seed.categoryId,
    category: seed.category,
    status,
    condition: conditions[index % conditions.length],
    serialNumber: `SN${String(90210 + index * 37)}`,
    model: seed.model ?? "—",
    manufacturer: seed.manufacturer ?? "—",
    supplierId: supplier.id,
    supplier: supplier.name,
    departmentId: department.id,
    department: department.name,
    assigneeId: assigned ? holder.id : null,
    assignee: assigned ? holder.name : null,
    location: locations[index % locations.length],
    purchaseDate: iso(-(120 + index * 11)),
    purchaseValue: seed.purchaseValue ?? 1000,
    warrantyUntil: index % 5 === 0 ? iso(18 + index) : iso(300 + index * 3),
    createdAt: iso(-(120 + index * 11)),
    updatedAt: iso(-(index % 30)),
  } satisfies Asset;
});

export const licenses: License[] = [
  { id: "lic-1", name: "Microsoft 365 E3", vendor: "Microsoft", key: "M365-XXXX-4821", seatsTotal: 250, seatsUsed: 231, status: "active", renewalDate: iso(184), annualCost: 384000, ownerDepartment: "Operações" },
  { id: "lic-2", name: "Atlassian Jira Premium", vendor: "Atlassian", key: "JIRA-PRM-7734", seatsTotal: 120, seatsUsed: 118, status: "expiring", renewalDate: iso(22), annualCost: 96000, ownerDepartment: "Engenharia" },
  { id: "lic-3", name: "Figma Organization", vendor: "Figma", key: "FIG-ORG-2210", seatsTotal: 40, seatsUsed: 27, status: "active", renewalDate: iso(310), annualCost: 62000, ownerDepartment: "Engenharia" },
  { id: "lic-4", name: "AutoCAD LT", vendor: "Autodesk", key: "ACAD-LT-9931", seatsTotal: 15, seatsUsed: 15, status: "expiring", renewalDate: iso(11), annualCost: 48000, ownerDepartment: "Operações" },
  { id: "lic-5", name: "Adobe Creative Cloud", vendor: "Adobe", key: "ADB-CC-1120", seatsTotal: 25, seatsUsed: 9, status: "active", renewalDate: iso(240), annualCost: 71000, ownerDepartment: "Comercial" },
  { id: "lic-6", name: "SAP Business One", vendor: "SAP", key: "SAP-B1-0093", seatsTotal: 30, seatsUsed: 30, status: "expired", renewalDate: iso(-8), annualCost: 210000, ownerDepartment: "Financeiro" },
  { id: "lic-7", name: "Zoom Enterprise", vendor: "Zoom", key: "ZM-ENT-5512", seatsTotal: 200, seatsUsed: 0, status: "unassigned", renewalDate: iso(120), annualCost: 54000, ownerDepartment: "Comercial" },
];

const movementTypes: Movement["type"][] = ["checkout", "checkin", "transfer", "maintenance", "disposal"];

export const movements: Movement[] = Array.from({ length: 32 }, (_, index) => {
  const asset = assets[index % assets.length];
  const type = movementTypes[index % movementTypes.length];
  const person = employees[(index + 3) % employees.length];
  return {
    id: `mov-${index + 1}`,
    assetId: asset.id,
    assetTag: asset.tag,
    assetName: asset.name,
    type,
    fromLabel: type === "checkout" ? "Estoque" : person.department,
    toLabel: type === "checkin" ? "Estoque" : person.name,
    performedBy: employees[index % employees.length].name,
    occurredAt: iso(-(index * 2 + 1)),
    note: index % 4 === 0 ? "Registrado via termo digital assinado." : null,
  } satisfies Movement;
});

export const maintenanceOrders: MaintenanceOrder[] = Array.from({ length: 18 }, (_, index) => {
  const asset = assets[(index * 3) % assets.length];
  const status: MaintenanceOrder["status"] = (["scheduled", "in_progress", "done", "late"] as const)[index % 4];
  return {
    id: `mnt-${index + 1}`,
    code: `OS-${2400 + index}`,
    assetId: asset.id,
    assetTag: asset.tag,
    assetName: asset.name,
    type: index % 3 === 0 ? "corrective" : "preventive",
    status,
    provider: suppliers[index % suppliers.length].name,
    openedAt: iso(-(index * 4 + 2)),
    dueAt: iso(status === "late" ? -(index + 1) : index * 3 + 2),
    cost: 320 + index * 145,
    description: "Revisão técnica completa com laudo e substituição de peças críticas.",
  } satisfies MaintenanceOrder;
});

export const ppes: Ppe[] = Array.from({ length: 14 }, (_, index) => {
  const person = employees[index % employees.length];
  const status: Ppe["status"] = index % 5 === 0 ? "expired" : index % 3 === 0 ? "expiring" : "valid";
  return {
    id: `ppe-${index + 1}`,
    name: ["Capacete Classe B", "Luva Nitrílica", "Bota de Segurança", "Óculos Ampla Visão", "Protetor Auricular"][index % 5],
    ca: `CA-${31000 + index * 17}`,
    assignee: person.name,
    department: person.department,
    deliveredAt: iso(-(index * 12 + 20)),
    expiresAt: iso(status === "expired" ? -(index + 2) : status === "expiring" ? index + 5 : 180 + index * 4),
    status,
    stock: 12 + index * 3,
  } satisfies Ppe;
});

export const audits: Audit[] = Array.from({ length: 9 }, (_, index) => {
  const status: Audit["status"] = (["planned", "running", "closed"] as const)[index % 3];
  const planned = 80 + index * 25;
  return {
    id: `aud-${index + 1}`,
    code: `AUD-${2025}-${String(index + 1).padStart(3, "0")}`,
    scope: ["Notebooks - HQ", "EPIs - CD1", "Frota", "Mobiliário - HQ", "Licenças"][index % 5],
    responsible: employees[(index + 2) % employees.length].name,
    status,
    startedAt: iso(-(index * 9 + 3)),
    itemsPlanned: planned,
    itemsChecked: status === "closed" ? planned : Math.round(planned * 0.4),
    divergences: index % 4,
  } satisfies Audit;
});

export const timeline: TimelineEntry[] = assets.slice(0, 12).flatMap((asset, index) => [
  { id: `tl-${asset.id}-1`, refId: asset.id, title: "Ativo cadastrado", description: `${asset.name} registrado no inventário com etiqueta ${asset.tag}.`, actor: "Vitor Aguiar", at: asset.createdAt, kind: "created" as const },
  { id: `tl-${asset.id}-2`, refId: asset.id, title: "Entrega realizada", description: `Termo de responsabilidade assinado por ${asset.assignee ?? "colaborador"}.`, actor: "Marina Duarte", at: iso(-(30 + index)), kind: "assigned" as const },
  { id: `tl-${asset.id}-3`, refId: asset.id, title: "Manutenção preventiva", description: "Checklist executado pelo fornecedor sem divergências.", actor: "Rafael Nunes", at: iso(-(12 + index)), kind: "maintenance" as const },
  { id: `tl-${asset.id}-4`, refId: asset.id, title: "Auditoria de inventário", description: "Ativo localizado e conferido durante ciclo de auditoria.", actor: "Paula Ferraz", at: iso(-(3 + index)), kind: "audit" as const },
]);

export const activity: ActivityEntry[] = Array.from({ length: 10 }, (_, index) => ({
  id: `act-${index + 1}`,
  actor: employees[index % employees.length].name,
  action: ["entregou", "devolveu", "abriu manutenção em", "auditou", "transferiu"][index % 5],
  target: assets[index % assets.length].tag,
  at: iso(-(index * 0.3)),
}));

export const assetsByCategory = categories.map((category) => ({
  name: category.name,
  total: category.assetsCount,
}));

export const monthlyMovements = [
  { month: "Jan", entradas: 42, saidas: 31 },
  { month: "Fev", entradas: 38, saidas: 44 },
  { month: "Mar", entradas: 55, saidas: 39 },
  { month: "Abr", entradas: 47, saidas: 52 },
  { month: "Mai", entradas: 61, saidas: 48 },
  { month: "Jun", entradas: 58, saidas: 63 },
  { month: "Jul", entradas: 72, saidas: 55 },
];
