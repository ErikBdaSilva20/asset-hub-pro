/**
 * Domain types shared across modules.
 * These mirror the future backend contracts (DTOs) — the UI never invents shapes.
 */

export type ID = string;

export type AssetStatus =
  | "available"
  | "in_use"
  | "maintenance"
  | "reserved"
  | "retired"
  | "lost";

export type AssetCondition = "new" | "good" | "fair" | "damaged";

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

export interface Asset {
  id: ID;
  tag: string;
  name: string;
  kind: AssetKind;
  categoryId: ID;
  category: string;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber: string;
  model: string;
  manufacturer: string;
  supplierId: ID | null;
  supplier: string | null;
  departmentId: ID | null;
  department: string | null;
  assigneeId: ID | null;
  assignee: string | null;
  location: string;
  purchaseDate: string;
  purchaseValue: number;
  warrantyUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: ID;
  name: string;
  email: string;
  role: string;
  departmentId: ID;
  department: string;
  status: "active" | "on_leave" | "offboarded";
  hiredAt: string;
  assetsCount: number;
  location: string;
}

export type LicenseStatus = "active" | "expiring" | "expired" | "unassigned";

export interface License {
  id: ID;
  name: string;
  vendor: string;
  key: string;
  seatsTotal: number;
  seatsUsed: number;
  status: LicenseStatus;
  renewalDate: string;
  annualCost: number;
  ownerDepartment: string;
}

export type MovementType =
  | "checkout"
  | "checkin"
  | "transfer"
  | "maintenance"
  | "disposal";

export interface Movement {
  id: ID;
  assetId: ID;
  assetTag: string;
  assetName: string;
  type: MovementType;
  fromLabel: string;
  toLabel: string;
  performedBy: string;
  occurredAt: string;
  note: string | null;
}

export type MaintenanceStatus = "scheduled" | "in_progress" | "done" | "late";

export interface MaintenanceOrder {
  id: ID;
  code: string;
  assetId: ID;
  assetTag: string;
  assetName: string;
  type: "preventive" | "corrective";
  status: MaintenanceStatus;
  provider: string;
  openedAt: string;
  dueAt: string;
  cost: number;
  description: string;
}

export interface Ppe {
  id: ID;
  name: string;
  ca: string;
  assignee: string;
  department: string;
  deliveredAt: string;
  expiresAt: string;
  status: "valid" | "expiring" | "expired";
  stock: number;
}

export interface Audit {
  id: ID;
  code: string;
  scope: string;
  responsible: string;
  status: "planned" | "running" | "closed";
  startedAt: string;
  itemsPlanned: number;
  itemsChecked: number;
  divergences: number;
}

export interface Supplier {
  id: ID;
  name: string;
  document: string;
  contact: string;
  email: string;
  category: string;
  contractUntil: string | null;
  activeAssets: number;
}

export interface Department {
  id: ID;
  name: string;
  manager: string;
  costCenter: string;
  headcount: number;
  assetsCount: number;
}

export interface Category {
  id: ID;
  name: string;
  kind: AssetKind;
  depreciationMonths: number;
  assetsCount: number;
  requiresMaintenance: boolean;
}

export interface TimelineEntry {
  id: ID;
  refId: ID;
  title: string;
  description: string;
  actor: string;
  at: string;
  kind: "created" | "assigned" | "returned" | "maintenance" | "audit" | "note";
}

export interface ActivityEntry {
  id: ID;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
