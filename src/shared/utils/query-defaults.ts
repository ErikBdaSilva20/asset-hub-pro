/**
 * Opções de cache pra queries de listagem (tabelas de negócio inteiras, sem paginação no
 * servidor — o modo genérico do gateway não tem filtro por query, então o front busca a lista
 * inteira e pagina/filtra localmente). Toda mutação (criar/editar/excluir) já
 * invalida a query na hora (`ResourcePage`), então um `staleTime`/`gcTime` maiores não arriscam
 * mostrar dado desatualizado — só evitam rebuscar um payload grande de novo só por trocar de tela
 * e voltar, ou expulsar do cache uma lista que ninguém está olhando há alguns minutos.
 */
export const LIST_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 30 * 60_000,
} as const;
