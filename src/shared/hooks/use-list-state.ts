import { useMemo, useState } from "react";
import type { ListParams } from "@/shared/types";

const DEFAULT_PAGE_SIZE = 10;

/** Local table state (search / status filter / pagination) in one place. */
export function useListState(pageSize = DEFAULT_PAGE_SIZE) {
  const [search, setSearchValue] = useState("");
  const [status, setStatusValue] = useState("all");
  const [page, setPage] = useState(1);

  const params = useMemo<ListParams>(
    () => ({ search, status, page, pageSize }),
    [search, status, page, pageSize],
  );

  return {
    params,
    search,
    status,
    page,
    setSearch: (value: string) => {
      setSearchValue(value);
      setPage(1);
    },
    setStatus: (value: string) => {
      setStatusValue(value);
      setPage(1);
    },
    setPage,
    reset: () => {
      setSearchValue("");
      setStatusValue("all");
      setPage(1);
    },
  };
}
