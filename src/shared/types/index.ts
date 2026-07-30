/** Tipos de UI compartilhados entre módulos. Os tipos de domínio vêm de `@/lib/data/types.gen`. */

export interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  ranges?: Record<string, RangeValue>;
}

export interface RangeValue {
  min?: string;
  max?: string;
}

/** Declara um campo numérico/data como filtrável por intervalo — reutilizável por qualquer tela
 * de recurso (ex.: "custo entre X e Y", "renovação entre datas"), sem repetir a lógica de
 * comparação em cada tela. */
export interface RangeFilterDef {
  key: string;
  label: string;
  type: "date" | "number";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
