import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams, Paginated } from "@/shared/types";
import type { Repository } from "@/shared/services/resource-repository";

/** Bridges the service layer with TanStack Query. Components never fetch. */
export function useResourceList<T extends { id: string }>(
  resource: string,
  repository: Repository<T>,
  params: ListParams,
) {
  return useQuery<Paginated<T>>({
    queryKey: [resource, params],
    queryFn: () => repository.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
