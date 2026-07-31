import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { createDepartment, listDepartments, type Department } from "@/lib/data/departments.repo";
import type { SelectFieldOption } from "@/shared/components/resource-form-dialog";
import { findByNameCaseInsensitive } from "@/shared/utils/find-by-name";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

/**
 * Opções de departamento pra combobox criável (Colaboradores, Ativos, Equipamentos) — mesma
 * ideia de `useCategoryOptions`. EPIs é a exceção: `ppes` não tem `department_id` no schema
 * (só `department` texto), então PpeScreen não usa isto — resolve o próprio caso por nome.
 */
export function useDepartmentOptions() {
  const queryClient = useQueryClient();
  const { data: departments = [] } = useListQuery({
    queryKey: ["departments", "list"],
    queryFn: listDepartments,
  });

  const options = useMemo(
    () =>
      sortOptionsByLabel(
        departments.map((department) => ({ value: department.id, label: department.name })),
      ),
    [departments],
  );

  const createOption = useCallback(
    async (name: string): Promise<SelectFieldOption> => {
      const existing = findByNameCaseInsensitive(
        departments,
        name,
        (department) => department.name,
      );
      const department: Department = existing ?? (await createDepartment({ name }));
      if (!existing) {
        await queryClient.invalidateQueries({ queryKey: ["departments", "list"] });
      }
      return { value: department.id, label: department.name };
    },
    [departments, queryClient],
  );

  return { options, createOption };
}
