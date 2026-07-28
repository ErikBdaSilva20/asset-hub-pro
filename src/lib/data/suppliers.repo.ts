import { db } from "./client";
import type { Tables } from "./types.gen";

export type Supplier = Tables<"suppliers">;

const suppliersTable = db.table<Supplier>("suppliers");

export const listSuppliers = () => suppliersTable.list();
export const createSupplier = (input: Partial<Supplier>) => suppliersTable.create(input);
export const updateSupplier = (id: string, patch: Partial<Supplier>) =>
  suppliersTable.update(id, patch);
export const removeSupplier = (id: string) => suppliersTable.remove(id);
