import type { Employee } from "@/lib/data/employees.repo";

/**
 * Casa o e-mail da sessão (Better-Auth) com um registro de `employees`, case-insensitive.
 * É o único jeito de saber "quem sou eu" no domínio de negócio: `rep` não controla o próprio
 * `owner_id` (Importantdoc.md §B8, "owner_id é setado pelo gateway"), e as tabelas que ele
 * consulta nem têm mais `owner_id` (viraram lookup — ver 0002_rbac_visibility.sql).
 */
export function findEmployeeByEmail(
  employees: Employee[],
  email: string | null | undefined,
): Employee | null {
  if (!email) return null;
  const normalized = email.toLowerCase();
  return employees.find((candidate) => candidate.email.toLowerCase() === normalized) ?? null;
}
