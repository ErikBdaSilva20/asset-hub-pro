/**
 * Filtra uma lista pros itens atribuídos a um colaborador específico. É a metade "dados" do
 * isolamento do rep em tabelas lookup: a leitura já é liberada a qualquer logado pelo gateway
 * (Importantdoc.md §B4.6), então "só o que é meu" é uma restrição de UI — ver
 * `useRoleScopedResource`, que é quem decide quando aplicar isto.
 */
export function scopeToAssignee<T>(
  rows: T[],
  employeeId: string | null,
  getAssigneeId: (row: T) => string | null,
): T[] {
  if (employeeId === null) return [];
  return rows.filter((row) => getAssigneeId(row) === employeeId);
}
