import type { SelectFieldOption } from "@/shared/components/resource-form-dialog";

/**
 * Ordena opções de select/combobox por label, alfabético e sensível a acento (`pt-BR`) — usado
 * em qualquer lista de nome (colaborador, categoria, departamento) pra achar por inicial em vez
 * de depender da ordem de criação/seed.
 */
export function sortOptionsByLabel(options: SelectFieldOption[]): SelectFieldOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
