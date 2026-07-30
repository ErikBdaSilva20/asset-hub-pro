import { useEffect, useMemo, useState } from "react";
import type { ListParams, RangeValue } from "@/shared/types";

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Local table state (search / status filter / pagination) in one place.
 *
 * A busca é debounced: o `<input>` mostra `search` (atualiza na hora, pra não travar a
 * digitação), mas o valor usado de fato pra filtrar (`params.search`, consumido por
 * `useResourceList`) só muda depois de uma pausa de digitação — em listas grandes, refiltrar a
 * cada caractere é desperdício, ninguém lê resultado de busca no meio de uma palavra.
 */
export function useListState(pageSize = DEFAULT_PAGE_SIZE) {
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatusValue] = useState("all");
  const [ranges, setRanges] = useState<Record<string, RangeValue>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  const params = useMemo<ListParams>(
    () => ({ search: debouncedSearch, status, page, pageSize, ranges }),
    [debouncedSearch, status, page, pageSize, ranges],
  );

  return {
    params,
    search,
    status,
    ranges,
    page,
    setSearch: setSearchValue,
    setStatus: (value: string) => {
      setStatusValue(value);
      setPage(1);
    },
    setRange: (key: string, value: RangeValue) => {
      setRanges((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    setPage,
    reset: () => {
      setSearchValue("");
      setDebouncedSearch("");
      setStatusValue("all");
      setRanges({});
      setPage(1);
    },
  };
}
