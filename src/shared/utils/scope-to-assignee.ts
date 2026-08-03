/**
 * Filtra uma lista pros itens atribuídos a um usuário específico. É a metade "dados" do
 * isolamento do rep em tabelas lookup: a leitura já é liberada a qualquer logado pelo gateway,
 * então "só o que é meu" é uma restrição de UI — ver `useRoleScopedResource`, que é quem decide
 * quando aplicar isto.
 */
export function scopeToAssignee<T>(
  rows: T[],
  assigneeId: string | null,
  getAssigneeId: (row: T) => string | null,
): T[] {
  if (assigneeId === null) return [];
  return rows.filter((row) => getAssigneeId(row) === assigneeId);
}
