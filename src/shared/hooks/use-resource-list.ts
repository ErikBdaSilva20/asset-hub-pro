import { useMemo } from "react";
import type { ListParams, Paginated } from "@/shared/types";
import { useListQuery } from "@/shared/hooks/use-list-query";

function buildHaystack(record: unknown): string {
  return JSON.stringify(record).toLowerCase();
}

/**
 * Busca a lista completa da tabela 1x e aplica busca/filtro/paginação no client.
 * O modo genérico do gateway não tem filtro por query nem get-by-id — então "list-then-filter"
 * aqui não é um atalho, é o único jeito correto de fazer isso.
 */
export function useResourceList<T extends { id: string }>(
  resource: string,
  fetchList: () => Promise<T[]>,
  params: ListParams,
  statusOf?: (item: T) => string,
  /** `retry: false` pra fontes que sabidamente não existem ainda (ex.: endpoint de admin ainda
   * não confirmado contra o gateway real) — sem isso, o React Query insiste 3x sozinho num 404
   * que já sabemos que vai falhar de novo. Omitido = comportamento padrão da lib. */
  options?: { retry?: boolean | number },
) {
  const query = useListQuery<T[]>({
    queryKey: [resource, "list"],
    queryFn: fetchList,
    retry: options?.retry,
  });

  // Um "índice de busca" por registro, recalculado só quando os dados mudam — não a cada tecla
  // digitada. Com listas grandes, re-serializar cada registro por keystroke (o que o código
  // fazia antes) trava a UI; guardando o texto já em minúsculo, a busca vira um .includes()
  // simples a cada tecla, não um JSON.stringify de tudo de novo.
  const haystackById = useMemo(() => {
    if (!query.data) return null;
    return new Map(query.data.map((item) => [item.id, buildHaystack(item)]));
  }, [query.data]);

  const filtered = useMemo(() => {
    if (!query.data) return undefined;
    const { search, status } = params;

    let items = query.data;
    if (search) {
      const term = search.toLowerCase();
      items = items.filter((item) => haystackById?.get(item.id)?.includes(term));
    }
    if (status && status !== "all" && statusOf) {
      items = items.filter((item) => statusOf(item) === status);
    }
    for (const [key, range] of Object.entries(params.ranges ?? {})) {
      if (!range?.min && !range?.max) continue;
      items = items.filter((item) => {
        const raw = (item as Record<string, unknown>)[key];
        if (raw === null || raw === undefined) return false;
        const value = typeof raw === "string" ? Date.parse(raw) : Number(raw);
        if (range.min && value < (Date.parse(range.min) || Number(range.min))) return false;
        if (range.max && value > (Date.parse(range.max) || Number(range.max))) return false;
        return true;
      });
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, haystackById, params.search, params.status, params.ranges, statusOf]);

  const data = useMemo<Paginated<T> | undefined>(() => {
    if (!filtered) return undefined;
    const { page = 1, pageSize = 10 } = params;
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, params.page, params.pageSize]);

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
