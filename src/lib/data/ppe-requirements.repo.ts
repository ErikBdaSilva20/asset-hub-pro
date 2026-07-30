import { db } from "./client";
import type { Tables } from "./types.gen";

export type PpeRequirement = Tables<"ppe_requirements">;

const ppeRequirementsTable = db.table<PpeRequirement>("ppe_requirements");

export const listPpeRequirements = () => ppeRequirementsTable.list();
export const createPpeRequirement = (input: Partial<PpeRequirement>) =>
  ppeRequirementsTable.create(input);
export const updatePpeRequirement = (id: string, patch: Partial<PpeRequirement>) =>
  ppeRequirementsTable.update(id, patch);
export const removePpeRequirement = (id: string) => ppeRequirementsTable.remove(id);
