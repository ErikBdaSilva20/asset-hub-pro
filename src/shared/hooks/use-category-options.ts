import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { createCategory, listCategories, type Category } from "@/lib/data/categories.repo";
import type { AssetKind } from "@/lib/data/types.gen";
import type { SelectFieldOption } from "@/shared/components/resource-form-dialog";
import { findByNameCaseInsensitive } from "@/shared/utils/find-by-name";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

/**
 * Opções de categoria pra combobox criável (Ativos, Equipamentos, EPIs, Licenças/Assinaturas) —
 * uma só fonte pras 4 telas em vez de cada uma reimplementar "buscar categorias + criar se não
 * achar". `kind` fixo (ex. "ppe" em EPIs) escopa a lista e vira o padrão ao criar; deixa `kind`
 * de fora (caso de Ativos, que cobre todo tipo) pra listar tudo e exigir o kind na hora de criar
 * (`createOption(nome, kindDoRegistroAtual)`).
 */
export function useCategoryOptions(kind?: AssetKind) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useListQuery({
    queryKey: ["categories", "list"],
    queryFn: listCategories,
  });

  const scoped = useMemo(
    () => (kind ? categories.filter((category) => category.kind === kind) : categories),
    [categories, kind],
  );
  const options = useMemo(
    () =>
      sortOptionsByLabel(scoped.map((category) => ({ value: category.id, label: category.name }))),
    [scoped],
  );

  const createOption = useCallback(
    async (name: string, kindOverride?: AssetKind): Promise<SelectFieldOption> => {
      const existing = findByNameCaseInsensitive(scoped, name, (category) => category.name);
      const category: Category =
        existing ??
        (await createCategory({
          name,
          kind: kindOverride ?? kind ?? "tool",
          depreciation_months: 0,
          requires_maintenance: false,
        }));
      if (!existing) {
        await queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      }
      return { value: category.id, label: category.name };
    },
    [scoped, kind, queryClient],
  );

  return { options, createOption };
}
