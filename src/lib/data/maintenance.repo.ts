import { db } from "./client";
import type { Tables } from "./types.gen";

export type MaintenanceOrder = Tables<"maintenance_orders">;

const maintenanceTable = db.table<MaintenanceOrder>("maintenance_orders");

function normalize(order: MaintenanceOrder): MaintenanceOrder {
  return { ...order, cost: Number(order.cost) || 0 };
}

export const listMaintenanceOrders = () =>
  maintenanceTable.list().then((rows) => rows.map(normalize));
export const createMaintenanceOrder = (input: Partial<MaintenanceOrder>) =>
  maintenanceTable.create(input);
export const updateMaintenanceOrder = (id: string, patch: Partial<MaintenanceOrder>) =>
  maintenanceTable.update(id, patch);
export const removeMaintenanceOrder = (id: string) => maintenanceTable.remove(id);
