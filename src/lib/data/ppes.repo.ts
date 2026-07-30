import { db } from "./client";
import type { Tables } from "./types.gen";

export type Ppe = Tables<"ppes">;

const ppesTable = db.table<Ppe>("ppes");

function normalize(ppe: Ppe): Ppe {
  return { ...ppe, cost: Number(ppe.cost) || 0 };
}

export const listPpes = () => ppesTable.list().then((rows) => rows.map(normalize));
export const createPpe = (input: Partial<Ppe>) => ppesTable.create(input);
export const updatePpe = (id: string, patch: Partial<Ppe>) => ppesTable.update(id, patch);
export const removePpe = (id: string) => ppesTable.remove(id);
