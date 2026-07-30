import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { listEmployees, employeesListQueryKey } from "@/lib/data/employees.repo";
import { canManageCatalog } from "@/shared/utils/permissions";
import { LIST_QUERY_OPTIONS } from "@/shared/utils/query-defaults";
import { findEmployeeByEmail } from "@/shared/utils/find-employee-by-email";
import { scopeToAssignee } from "@/shared/utils/scope-to-assignee";
import { useCurrentEmployee } from "./use-current-employee";

export interface RoleScopedResource<T> {
  /** Passa direto pro `list` do `ResourcePage`. */
  list: () => Promise<T[]>;
  /** Passa direto pro `readOnly` do `ResourcePage` — esconde "Novo item" pra quem não gerencia. */
  readOnly: boolean;
  /** Texto de lista vazia contextual pro rep; `undefined` deixa o `DataTable` usar o padrão. */
  emptyState?: { title: string; description: string };
}

/**
 * Adapta uma tabela "lookup" (leitura aberta a todo logado, escrita só admin/manager —
 * Importantdoc.md §B4.6) à experiência de cada papel: admin/manager veem e gerenciam tudo; rep
 * vê só os itens atribuídos a ele (via `assignee_id`) e não pode criar. Mesmo padrão reaproveitado
 * em Ativos, Equipamentos, EPIs e Assinaturas — centraliza a regra pra não duplicá-la 4x.
 *
 * `list()` resolve o vínculo rep→colaborador direto do cache do React Query (mesma queryKey de
 * `useCurrentEmployee`) a cada chamada, em vez de ler o estado reativo do hook — assim o
 * `ResourcePage`/`useResourceList` que consome `list` sempre recebe o resultado final e correto,
 * mesmo se essa função for chamada antes da lista de `employees` ter sido buscada uma primeira
 * vez (sem isso, corre o risco de filtrar contra um `employeeId` momentaneamente `null` e nunca
 * refazer o fetch quando o vínculo chegar — `useQuery` não reobserva sozinho só porque a
 * identidade da `queryFn` mudou).
 *
 * `LicensesScreen` parou de usar este hook: "quem tem qual assinatura" virou admin-only de
 * verdade (`license_assignments`, garantia de servidor — ver docs/rbac-papeis.md), não mais um
 * recorte "rep só vê o que é dele" como as outras tabelas lookup.
 */
export function useRoleScopedResource<T>(
  fetchAll: () => Promise<T[]>,
  getAssigneeId: (row: T) => string | null,
): RoleScopedResource<T> {
  const { role, user } = useAuth();
  const { hasLink } = useCurrentEmployee();
  const queryClient = useQueryClient();
  const readOnly = !canManageCatalog(role);
  const email = user?.email;

  const list = useCallback(async () => {
    if (!readOnly) return fetchAll();

    const [rows, employees] = await Promise.all([
      fetchAll(),
      queryClient.fetchQuery({
        queryKey: employeesListQueryKey,
        queryFn: listEmployees,
        ...LIST_QUERY_OPTIONS,
      }),
    ]);

    const employee = findEmployeeByEmail(employees, email);
    return scopeToAssignee(rows, employee?.id ?? null, getAssigneeId);
  }, [fetchAll, readOnly, queryClient, email, getAssigneeId]);

  if (!readOnly) {
    return { list, readOnly };
  }

  return {
    list,
    readOnly,
    emptyState: hasLink
      ? {
          title: "Nada atribuído a você ainda",
          description: "Fale com o admin ou manager responsável se esperava ver algo aqui.",
        }
      : {
          title: "Sua conta não está vinculada a um colaborador",
          description: "Peça pro admin conferir seu e-mail em Colaboradores.",
        },
  };
}
