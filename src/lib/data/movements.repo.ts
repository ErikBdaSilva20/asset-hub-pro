import { db } from "./client";
import type { Tables } from "./types.gen";

export type Movement = Tables<"movements">;

const movementsTable = db.table<Movement>("movements");

export const listMovements = () => movementsTable.list();
export const createMovement = (input: Partial<Movement>) => movementsTable.create(input);
export const updateMovement = (id: string, patch: Partial<Movement>) =>
  movementsTable.update(id, patch);
export const removeMovement = (id: string) => movementsTable.remove(id);
