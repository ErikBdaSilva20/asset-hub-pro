import { db } from "./client";
import type { Tables } from "./types.gen";
import { daysUntil, expiryState } from "@/shared/utils/format";

export type Ppe = Tables<"ppes">;

const ppesTable = db.table<Ppe>("ppes");

function normalize(ppe: Ppe): Ppe {
  return { ...ppe, cost: Number(ppe.cost) || 0 };
}

export const listPpes = () => ppesTable.list().then((rows) => rows.map(normalize));
export const createPpe = (input: Partial<Ppe>) => ppesTable.create(input);
export const updatePpe = (id: string, patch: Partial<Ppe>) => ppesTable.update(id, patch);
export const removePpe = (id: string) => ppesTable.remove(id);

/** Mesmo caso de `effectiveLicenseStatus` (licenses.repo.ts): `ppes.status` é manual e não
 * acompanha o tempo sozinho. Pra badge/agrupamento/filtro, deriva de `expires_at` com a regra de
 * 1 mês (`EXPIRING_SOON_DAYS`). Sem `expires_at`, mantém o valor salvo. */
export function effectivePpeStatus(ppe: Ppe): Ppe["status"] {
  if (!ppe.expires_at) return ppe.status;
  const state = expiryState(daysUntil(ppe.expires_at));
  if (state === "expired") return "expired";
  if (state === "expiring") return "expiring";
  return "valid";
}
