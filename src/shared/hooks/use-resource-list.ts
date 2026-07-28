import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ListParams, Paginated } from "@/shared/types";

function matches(record: unknown, search: string) {
  return JSON.stringify(record).toLowerCase().includes(search.toLowerCase());
}

/**
 * Busca a lista completa da tabela 1x e aplica busca/filtro/paginação no client.
 * O modo genérico do gateway não tem filtro por query nem get-by-id (Importantdoc.md §B5) —
 * então "list-then-filter" aqui não é um atalho, é o único jeito correto de fazer isso.
 */
export function useResourceList<T extends { id: string }>(
  resource: string,
  fetchList: () => Promise<T[]>,
  params: ListParams,
  statusOf?: (item: T) => string,
) {
  const query = useQuery<T[]>({
    queryKey: [resource, "list"],
    queryFn: fetchList,
    staleTime: 30_000,
  });

  const data = useMemo<Paginated<T> | undefined>(() => {
    if (!query.data) return undefined;
    const { page = 1, pageSize = 10, search = "", status } = params;

    let items = query.data;
    if (search) items = items.filter((item) => matches(item, search));
    if (status && status !== "all" && statusOf) {
      items = items.filter((item) => statusOf(item) === status);
    }

    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }, [query.data, params, statusOf]);

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
