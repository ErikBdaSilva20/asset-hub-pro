import { db } from "./client";
import type { Tables } from "./types.gen";

export type Ppe = Tables<"ppes">;

const ppesTable = db.table<Ppe>("ppes");

export const listPpes = () => ppesTable.list();
export const createPpe = (input: Partial<Ppe>) => ppesTable.create(input);
export const updatePpe = (id: string, patch: Partial<Ppe>) => ppesTable.update(id, patch);
export const removePpe = (id: string) => ppesTable.remove(id);
