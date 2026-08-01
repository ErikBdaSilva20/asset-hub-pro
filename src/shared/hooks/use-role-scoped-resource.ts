import { useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { canManageCatalog } from "@/shared/utils/permissions";
import { scopeToAssignee } from "@/shared/utils/scope-to-assignee";

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
 * em Ativos, Equipamentos e EPIs — centraliza a regra pra não duplicá-la 3x.
 *
 * Rep é usuário (Better-Auth) desde o merge employees→user (ver
 * TODO-MERGE-COLABORADOR-USUARIO.md) — "é meu?" é `assignee_id === session.user.id` direto, sem
 * outra tabela pra casar por e-mail. Isso também elimina o estado "conta sem vínculo" que existia
 * antes: toda conta rep JÁ é o vínculo.
 *
 * `LicensesScreen` não usa este hook: "quem tem qual assinatura" é admin-only de verdade
 * (`license_assignments`, garantia de servidor — ver docs/rbac-papeis.md), não um recorte
 * "rep só vê o que é dele" como as outras tabelas lookup.
 */
export function useRoleScopedResource<T>(
  fetchAll: () => Promise<T[]>,
  getAssigneeId: (row: T) => string | null,
): RoleScopedResource<T> {
  const { role, user } = useAuth();
  const readOnly = !canManageCatalog(role);
  const userId = user?.id ?? null;

  const list = useCallback(async () => {
    const rows = await fetchAll();
    if (!readOnly) return rows;
    return scopeToAssignee(rows, userId, getAssigneeId);
  }, [fetchAll, readOnly, userId, getAssigneeId]);

  if (!readOnly) {
    return { list, readOnly };
  }

  return {
    list,
    readOnly,
    emptyState: {
      title: "Nada atribuído a você ainda",
      description: "Fale com o admin ou manager responsável se esperava ver algo aqui.",
    },
  };
}
