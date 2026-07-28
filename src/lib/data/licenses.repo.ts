import { db } from "./client";
import type { Tables } from "./types.gen";

export type License = Tables<"licenses">;

const licensesTable = db.table<License>("licenses");

function normalize(license: License): License {
  return { ...license, annual_cost: Number(license.annual_cost) || 0 };
}

export const listLicenses = () => licensesTable.list().then((rows) => rows.map(normalize));
export const createLicense = (input: Partial<License>) => licensesTable.create(input);
export const updateLicense = (id: string, patch: Partial<License>) =>
  licensesTable.update(id, patch);
export const removeLicense = (id: string) => licensesTable.remove(id);
