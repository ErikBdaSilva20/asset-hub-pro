// PROTEGIDO — não editável pela IA (masi.template.json, editable.protect).
// Gerado a partir de supabase/migrations/0001_business_schema.sql. Se o schema mudar,
// regenerar este arquivo — não editar tipos aqui sem editar a migration primeiro.

export type AssetKind =
  | "notebook"
  | "desktop"
  | "phone"
  | "furniture"
  | "ppe"
  | "license"
  | "tool"
  | "vehicle"
  | "peripheral";

export type AssetStatus = "available" | "in_use" | "maintenance" | "reserved" | "retired" | "lost";
export type AssetCondition = "new" | "good" | "fair" | "damaged";
export type LicenseStatus = "active" | "expiring" | "expired" | "unassigned";
export type LicenseBillingPeriod = "monthly" | "annual";
export type MovementType = "checkout" | "checkin" | "transfer" | "maintenance" | "disposal";
export type MaintenanceKind = "preventive" | "corrective";
export type MaintenanceStatus = "scheduled" | "in_progress" | "done" | "late";
export type PpeStatus = "valid" | "expiring" | "expired";
export type AuditStatus = "planned" | "running" | "closed";

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          manager: string | null;
          cost_center: string | null;
          headcount: number;
          assets_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          kind: AssetKind;
          depreciation_months: number;
          assets_count: number;
          requires_maintenance: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      assets: {
        Row: {
          id: string;
          tag: string;
          name: string;
          kind: AssetKind;
          category_id: string | null;
          category: string | null;
          status: AssetStatus;
          condition: AssetCondition;
          serial_number: string | null;
          model: string | null;
          manufacturer: string | null;
          department_id: string | null;
          department: string | null;
          assignee_id: string | null;
          assignee: string | null;
          location: string | null;
          purchase_date: string | null;
          purchase_value: number;
          warranty_until: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      licenses: {
        Row: {
          id: string;
          name: string;
          vendor: string | null;
          status: LicenseStatus;
          billing_period: LicenseBillingPeriod;
          renewal_date: string | null;
          cost: number;
          owner_department: string | null;
          category_id: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      license_assignments: {
        Row: {
          id: string;
          license_id: string;
          assignee_id: string | null;
          assignee: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      movements: {
        Row: {
          id: string;
          owner_id: string;
          asset_id: string;
          asset_tag: string | null;
          asset_name: string | null;
          type: MovementType;
          from_label: string | null;
          to_label: string | null;
          performed_by: string | null;
          occurred_at: string;
          note: string | null;
          created_at: string;
        };
      };
      maintenance_orders: {
        Row: {
          id: string;
          owner_id: string;
          code: string;
          asset_id: string;
          asset_tag: string | null;
          asset_name: string | null;
          type: MaintenanceKind;
          status: MaintenanceStatus;
          provider: string | null;
          opened_at: string;
          due_at: string | null;
          cost: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      ppes: {
        Row: {
          id: string;
          name: string;
          ca: string | null;
          assignee_id: string | null;
          assignee: string | null;
          department: string | null;
          delivered_at: string | null;
          expires_at: string | null;
          status: PpeStatus;
          stock: number;
          cost: number;
          category_id: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      audits: {
        Row: {
          id: string;
          owner_id: string;
          code: string;
          scope: string | null;
          responsible: string | null;
          status: AuditStatus;
          started_at: string;
          items_planned: number;
          items_checked: number;
          divergences: number;
          created_at: string;
          updated_at: string;
        };
      };
      ppe_requirements: {
        Row: {
          id: string;
          function_name: string;
          ppe_name: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
