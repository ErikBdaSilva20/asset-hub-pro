// Espelha supabase/migrations/*.sql (raiz do repo — 0001 a 0007). Lista branca de
// tabela/coluna: table/column names vêm de request params/body e nunca são interpolados sem
// passar por aqui — é o que impede SQL injection via identificador.

export interface TableDef {
  /** false = tabela lookup (sem owner_id): leitura liberada a todo logado, escrita só
   * admin/manager. true = tem owner_id: admin/manager veem tudo, rep só o que é dele
   * (Importantdoc.md §B4.6). */
  ownerScoped: boolean;
  /** true = nenhum verbo (GET/POST/PATCH/DELETE) é liberado pra quem não é admin — nem manager,
   * diferente de ownerScoped=false (que ainda deixa manager ler/escrever). Pra dado sensível que
   * precisa de garantia de servidor, não só UI escondida (ver license_assignments). */
  adminOnly?: boolean;
  /** Colunas que o client pode enviar em create/update — nunca inclui id/owner_id/created_at/updated_at. */
  columns: string[];
}

export const TABLES: Record<string, TableDef> = {
  departments: {
    ownerScoped: true,
    columns: ["name", "manager", "cost_center", "headcount", "assets_count"],
  },
  categories: {
    ownerScoped: true,
    columns: ["name", "kind", "depreciation_months", "assets_count", "requires_maintenance"],
  },
  suppliers: {
    ownerScoped: true,
    columns: [
      "name",
      "document",
      "contact",
      "email",
      "category",
      "contract_until",
      "active_assets",
    ],
  },
  employees: {
    ownerScoped: true,
    columns: [
      "name",
      "email",
      "role",
      "department_id",
      "department",
      "status",
      "hired_at",
      "assets_count",
      "location",
    ],
  },
  assets: {
    // Virou tabela lookup em 0002_rbac_visibility.sql (sem owner_id): leitura liberada a todo
    // logado, escrita só admin/manager (ver isPrivileged() em data-routes.ts).
    ownerScoped: false,
    columns: [
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
      "supplier_id",
      "supplier",
      "department_id",
      "department",
      "assignee_id",
      "assignee",
      "location",
      "purchase_date",
      "purchase_value",
      "warranty_until",
    ],
  },
  licenses: {
    // Virou tabela lookup em 0002_rbac_visibility.sql (sem owner_id). Simplificada em
    // 0005_licenses_simplify.sql: sem assentos/chave, com billing_period + cost.
    // assignee_id/assignee saíram daqui em 0006_license_assignments.sql — ver license_assignments.
    ownerScoped: false,
    columns: [
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
  },
  license_assignments: {
    // Quem tem qual assinatura — admin-only de verdade (ver TableDef.adminOnly). licenses
    // continua lookup normal; só o vínculo com pessoa vive aqui, isolado.
    ownerScoped: false,
    adminOnly: true,
    columns: ["license_id", "assignee_id", "assignee"],
  },
  movements: {
    ownerScoped: true,
    columns: [
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
  },
  maintenance_orders: {
    ownerScoped: true,
    columns: [
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
  },
  ppes: {
    // Virou tabela lookup em 0002_rbac_visibility.sql (sem owner_id).
    ownerScoped: false,
    columns: [
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
  },
  audits: {
    ownerScoped: true,
    columns: [
      "code",
      "scope",
      "responsible",
      "status",
      "started_at",
      "items_planned",
      "items_checked",
      "divergences",
    ],
  },
  ppe_requirements: {
    // Tabela lookup desde a criação (0004_ppe_requirements.sql) — leitura liberada a todo
    // logado, escrita só admin/manager.
    ownerScoped: false,
    columns: ["function_name", "ppe_name"],
  },
};
