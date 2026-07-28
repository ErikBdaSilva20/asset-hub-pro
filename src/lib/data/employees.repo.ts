import { db } from "./client";
import type { Tables } from "./types.gen";

export type Employee = Tables<"employees">;

const employeesTable = db.table<Employee>("employees");

export const listEmployees = () => employeesTable.list();
export const createEmployee = (input: Partial<Employee>) => employeesTable.create(input);
export const updateEmployee = (id: string, patch: Partial<Employee>) =>
  employeesTable.update(id, patch);
export const removeEmployee = (id: string) => employeesTable.remove(id);
