import { db } from "./client";
import type { Tables } from "./types.gen";
import { daysUntil, expiryState } from "@/shared/utils/format";

export type License = Tables<"licenses">;

const licensesTable = db.table<License>("licenses");

function normalize(license: License): License {
  return { ...license, cost: Number(license.cost) || 0 };
}

export const listLicenses = () => licensesTable.list().then((rows) => rows.map(normalize));
export const createLicense = (input: Partial<License>) => licensesTable.create(input);
export const updateLicense = (id: string, patch: Partial<License>) =>
  licensesTable.update(id, patch);
export const removeLicense = (id: string) => licensesTable.remove(id);

/**
 * `licenses.status` é um campo manual (select no formulário) — nada recalcula ele sozinho com o
 * tempo passando, então uma assinatura cadastrada como "Ativa" continua "Ativa" pra sempre, até
 * alguém lembrar de editar. Pra badge/agrupamento/filtro (não pro formulário — lá o valor tem que
 * continuar sendo o que está salvo de verdade, senão editar e salvar sem mexer no status
 * sobrescreveria o valor manual com o calculado), use isto: deriva "vencendo"/"vencida" direto de
 * `renewal_date`, com a mesma regra de 1 mês usada em EPIs e garantias de Ativos
 * (`EXPIRING_SOON_DAYS`, format.ts). "unassigned" e licenças sem `renewal_date` mantêm o valor
 * salvo, por não terem data pra derivar.
 */
export function effectiveLicenseStatus(license: License): License["status"] {
  if (license.status === "unassigned" || !license.renewal_date) return license.status;
  const state = expiryState(daysUntil(license.renewal_date));
  if (state === "expired") return "expired";
  if (state === "expiring") return "expiring";
  return "active";
}
