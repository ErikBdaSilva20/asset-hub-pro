import { db } from "./client";
import type { Tables } from "./types.gen";

export type Department = Tables<"departments">;

const departmentsTable = db.table<Department>("departments");

export const listDepartments = () => departmentsTable.list();
export const createDepartment = (input: Partial<Department>) => departmentsTable.create(input);
export const updateDepartment = (id: string, patch: Partial<Department>) =>
  departmentsTable.update(id, patch);
export const removeDepartment = (id: string) => departmentsTable.remove(id);
