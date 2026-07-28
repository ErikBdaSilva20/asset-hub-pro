// Espelha supabase/migrations/0001_business_schema.sql (raiz do repo).
// Lista branca de tabela/coluna: table/column names vêm de request params/body e nunca
// são interpolados sem passar por aqui — é o que impede SQL injection via identificador.

export interface TableDef {
  /** Toda tabela do AssetHub tem owner_id (§B4.1) — mantido como flag para o caso de uma
   * tabela de lookup (sem owner_id) ser adicionada no futuro. */
  ownerScoped: boolean;
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
    ownerScoped: true,
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
    ownerScoped: true,
    columns: [
      "name",
      "vendor",
      "key",
      "seats_total",
      "seats_used",
      "status",
      "renewal_date",
      "annual_cost",
      "owner_department",
    ],
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
    ownerScoped: true,
    columns: [
      "name",
      "ca",
      "assignee",
      "department",
      "delivered_at",
      "expires_at",
      "status",
      "stock",
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
};
