/**
 * CSV genérico — exportação e importação reutilizáveis por qualquer `ResourcePage` (Ativos,
 * Colaboradores, EPIs, Assinaturas...), sem saber nada da entidade. Implementação própria (sem
 * dependência nova): RFC 4180 (aspas duplicadas, vírgula/quebra de linha dentro de campo com
 * aspas), O(n) — monta cada linha com `.join`, nunca concatenação de string em loop.
 */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = new Array<string>(rows.length + 1);
  lines[0] = headers.map(escapeCell).join(",");
  for (let i = 0; i < rows.length; i++) {
    lines[i + 1] = headers.map((key) => escapeCell(rows[i][key])).join(",");
  }
  return lines.join("\r\n");
}

const UTF8_BOM = String.fromCharCode(0xfeff);

export function downloadCsv(filename: string, csv: string): void {
  // BOM: sem isso o Excel abre acento/cedilha corrompido em CSV UTF-8.
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Parser de estado simples — lida com aspas, vírgula e quebra de linha dentro de campo, o que
 * `text.split(",")`/`split("\n")` ingênuo quebraria no primeiro campo com vírgula. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const [headerRow, ...dataRows] = rows.filter((r) => r.length > 1 || r[0] !== "");
  if (!headerRow) return [];
  return dataRows.map((cells) =>
    Object.fromEntries(headerRow.map((header, i) => [header, cells[i] ?? ""])),
  );
}

/** Roda `task` pra cada item com no máximo `concurrency` em paralelo — importar 1000 linhas uma
 * a uma seria lento; todas de uma vez sobrecarrega o gateway. Retorna quantos deram certo/erro. */
export async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<unknown>,
): Promise<{ ok: number; failed: number }> {
  let ok = 0;
  let failed = 0;
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      try {
        await task(current);
        ok++;
      } catch {
        failed++;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return { ok, failed };
}
