import { createDepartment } from "@/lib/data/departments.repo";
import { createCategory } from "@/lib/data/categories.repo";
import { auth, ApiError, type AdminUserSummary } from "@/lib/data/client";
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
  users: number;
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

  // Cria usuários de verdade (Better-Auth) pros reps de exemplo — rep precisa ter login desde o
  // merge employees→user (TODO-MERGE-COLABORADOR-USUARIO.md). `admin.createUser` é admin-only
  // (mesma família de list-users/set-role, ver GATEWAY-ADMIN-ENDPOINTS.md) e, diferente de
  // signUp, não loga como a conta nova — não derruba a sessão de quem clicou em "Popular com
  // dados de exemplo". Best-effort: se quem chamou for manager (sem permissão de admin), o resto
  // do seed segue sem usuários de exemplo vinculados, só com nomes em texto nos ativos.
  let users: AdminUserSummary[] = [];
  try {
    const created = await Promise.all([
      auth.createUser("marina.duarte@assethub.co", crypto.randomUUID(), "Marina Duarte", {
        cargo: "Head de Engenharia",
      }),
      auth.createUser("rafael.nunes@assethub.co", crypto.randomUUID(), "Rafael Nunes", {
        cargo: "Gerente de Operações",
      }),
      auth.createUser("helena.castro@assethub.co", crypto.randomUUID(), "Helena Castro", {
        cargo: "Controller",
      }),
      auth.createUser("diego.prado@assethub.co", crypto.randomUUID(), "Diego Prado", {
        cargo: "Diretor Comercial",
      }),
      auth.createUser("paula.ferraz@assethub.co", crypto.randomUUID(), "Paula Ferraz", {
        cargo: "Técnica de Segurança",
      }),
    ]);
    users = created.map((response) => response.user);
  } catch (error) {
    // 403 = rodando como manager, sem permissão de admin pra criar usuário — best-effort
    // esperado, segue sem essa parte. Qualquer outro erro (ex.: e-mail de exemplo já existe de
    // uma rodada anterior do seed) não deve ser engolido em silêncio — quem clicou em "Popular
    // com dados de exemplo" precisa saber que os usuários de exemplo não foram criados desta vez.
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
  }

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

  // Atribuição de responsável (Pedido 3, license_assignments) é admin-only no gateway, igual a
  // criar usuário acima — best-effort, e também precisa de `users` não vazio (sem usuário de
  // exemplo criado, não tem pra quem atribuir).
  let licenseAssignments = 0;
  if (users.length >= 2) {
    try {
      await Promise.all([
        createLicenseAssignment({
          license_id: licenses[1].id,
          assignee_id: users[0].id,
          assignee: users[0].name,
        }),
        createLicenseAssignment({
          license_id: licenses[2].id,
          assignee_id: users[0].id,
          assignee: users[0].name,
        }),
        createLicenseAssignment({
          license_id: licenses[3].id,
          assignee_id: users[1].id,
          assignee: users[1].name,
        }),
      ]);
      licenseAssignments = 3;
    } catch {
      // rodando como manager — sem permissão de admin pra atribuir, segue sem essa parte.
    }
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
        to_label: users[index]?.name ?? "Estoque central",
        performed_by: users.length > 0 ? (users[(index + 1) % users.length]?.name ?? "Sistema") : "Sistema",
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
        provider: "Nortec Assistência Técnica",
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
    users: users.length,
    assets: assets.length,
    licenses: licenses.length,
    licenseAssignments,
    movements: movements.length,
    maintenanceOrders: maintenanceOrders.length,
    ppes: ppes.length,
    audits: audits.length,
  };
}
