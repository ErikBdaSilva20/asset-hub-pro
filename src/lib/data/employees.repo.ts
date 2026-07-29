import { db } from "./client";
import type { Tables } from "./types.gen";

export type Employee = Tables<"employees">;

const employeesTable = db.table<Employee>("employees");

export const listEmployees = () => employeesTable.list();

/**
 * Mesma queryKey que `useResourceList("employees", ...)` monta implicitamente (`[resource,
 * "list"]`) pra tela de Colaboradores. Exportada pra quem precisa ler `employees` fora dessa
 * tela (ex.: `useCurrentEmployee`) cair no mesmo cache — sem isso, os dois lugares fariam
 * fetches redundantes e, pior, um poderia ver dados mais "frescos" que o outro.
 */
export const employeesListQueryKey = ["employees", "list"] as const;
export const createEmployee = (input: Partial<Employee>) => employeesTable.create(input);
export const updateEmployee = (id: string, patch: Partial<Employee>) =>
  employeesTable.update(id, patch);
export const removeEmployee = (id: string) => employeesTable.remove(id);
