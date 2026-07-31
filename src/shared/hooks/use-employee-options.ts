import { useMemo } from "react";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { listEmployees, employeesListQueryKey } from "@/lib/data/employees.repo";
import type { SelectFieldOption } from "@/shared/components/resource-form-dialog";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

/**
 * Opções de colaborador pra qualquer select/combobox "Responsável"/"Colaborador" do app —
 * reaproveita a mesma queryKey de `useCurrentEmployee` pra cair no mesmo cache. Sem criação
 * inline de propósito: um colaborador tem campos obrigatórios demais (e-mail, cargo, admissão)
 * pra caber num combobox — quem não existe ainda se cadastra em Colaboradores.
 */
export function useEmployeeOptions(): SelectFieldOption[] {
  const { data: employees = [] } = useListQuery({
    queryKey: employeesListQueryKey,
    queryFn: listEmployees,
  });
  return useMemo(
    () =>
      sortOptionsByLabel(
        employees.map((employee) => ({ value: employee.id, label: employee.name })),
      ),
    [employees],
  );
}
