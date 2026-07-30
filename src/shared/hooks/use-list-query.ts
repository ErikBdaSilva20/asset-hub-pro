import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import { LIST_QUERY_OPTIONS } from "@/shared/utils/query-defaults";

/**
 * `useQuery` com `LIST_QUERY_OPTIONS` (staleTime/gcTime) já aplicado — use isto em vez de
 * `useQuery` direto pra qualquer listagem de tabela de negócio (`listAssets`, `listEmployees`,
 * etc.), aqui ou em telas futuras. Centraliza a política de cache num só lugar em vez de esperar
 * que cada tela lembre de espalhar as mesmas opções.
 */
export function useListQuery<TData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TData, Error, TData, TQueryKey>,
) {
  return useQuery({ ...LIST_QUERY_OPTIONS, ...options });
}
