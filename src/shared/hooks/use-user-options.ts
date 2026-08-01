import { useMemo } from "react";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { listUsersLite, usersLiteListQueryKey } from "@/lib/data/users-lite.repo";
import type { SelectFieldOption } from "@/shared/components/resource-form-dialog";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

/**
 * Opções de usuário pra qualquer select/combobox "Responsável" do app — substitui
 * `useEmployeeOptions` depois do merge employees→user (ver TODO-MERGE-COLABORADOR-USUARIO.md):
 * rep = usuário, não existe mais um cadastro de RH separado pra atribuir coisas.
 */
export function useUserOptions(): SelectFieldOption[] {
  const { data: users = [] } = useListQuery({
    queryKey: usersLiteListQueryKey,
    queryFn: listUsersLite,
  });
  return useMemo(
    () =>
      sortOptionsByLabel(
        users.map((user) => ({ value: user.id, label: user.name ?? user.email })),
      ),
    [users],
  );
}
