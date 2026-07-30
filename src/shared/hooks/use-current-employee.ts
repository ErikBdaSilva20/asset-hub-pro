import { useMemo } from "react";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { useAuth } from "@/lib/auth";
import { listEmployees, employeesListQueryKey } from "@/lib/data/employees.repo";
import { findEmployeeByEmail } from "@/shared/utils/find-employee-by-email";
import type { Employee } from "@/lib/data/employees.repo";

export interface CurrentEmployeeState {
  employee: Employee | null;
  isLoading: boolean;
  /** false quando o e-mail da sessão não bate com nenhum `employees.email` cadastrado. */
  hasLink: boolean;
}

/**
 * Liga o usuário logado a um registro de `employees` (ver `findEmployeeByEmail`). É o elo que
 * faltava pro rep saber "quais ativos/EPIs/assinaturas são meus" sem precisar de endpoint novo
 * no gateway — list-then-filter no front, como o modo genérico já exige pra tudo (Importantdoc.md
 * §B5). Usado pela UI (aviso de "sem vínculo"); o filtro de dados em si mora em
 * `useRoleScopedResource`, que resolve o mesmo vínculo de forma race-free.
 */
export function useCurrentEmployee(): CurrentEmployeeState {
  const { user } = useAuth();
  const query = useListQuery({
    queryKey: employeesListQueryKey,
    queryFn: listEmployees,
  });

  const employee = useMemo(
    () => findEmployeeByEmail(query.data ?? [], user?.email),
    [query.data, user?.email],
  );

  return { employee, isLoading: query.isLoading, hasLink: employee !== null };
}
