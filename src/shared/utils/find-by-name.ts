/**
 * Acha um registro cujo nome bate com `name` ignorando maiúsculas/minúsculas e espaços nas
 * pontas — usado antes de criar categoria/departamento "na hora" (combobox criável) pra não
 * duplicar "Capacete" e "capacete" como duas linhas diferentes só por causa de digitação.
 */
export function findByNameCaseInsensitive<T>(
  rows: T[],
  name: string,
  getName: (row: T) => string,
): T | undefined {
  const key = name.trim().toLowerCase();
  return rows.find((row) => getName(row).trim().toLowerCase() === key);
}
