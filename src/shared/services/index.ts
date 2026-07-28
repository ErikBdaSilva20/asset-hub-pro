import { createRepository } from "./resource-repository";
import * as mock from "@/mock";
import type {
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
} from "@/shared/types";

/** Service layer: one entry point per domain resource. */

export const assetsService = createRepository<Asset>("assets", () => mock.assets, (a) => a.status);
export const employeesService = createRepository<Employee>("employees", () => mock.employees, (e) => e.status);
export const licensesService = createRepository<License>("licenses", () => mock.licenses, (l) => l.status);
export const movementsService = createRepository<Movement>("movements", () => mock.movements, (m) => m.type);
export const maintenanceService = createRepository<MaintenanceOrder>("maintenance", () => mock.maintenanceOrders, (m) => m.status);
export const ppeService = createRepository<Ppe>("ppes", () => mock.ppes, (p) => p.status);
export const auditsService = createRepository<Audit>("audits", () => mock.audits, (a) => a.status);
export const suppliersService = createRepository<Supplier>("suppliers", () => mock.suppliers);
export const departmentsService = createRepository<Department>("departments", () => mock.departments);
export const categoriesService = createRepository<Category>("categories", () => mock.categories);
export const equipmentService = createRepository<Asset>(
  "equipment",
  () => mock.assets.filter((a) => ["notebook", "desktop", "peripheral", "tool"].includes(a.kind)),
  (a) => a.status,
);
