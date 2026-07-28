/** Tipos de UI compartilhados entre módulos. Os tipos de domínio vêm de `@/lib/data/types.gen`. */

export interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
