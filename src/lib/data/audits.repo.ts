import { db } from "./client";
import type { Tables } from "./types.gen";

export type Audit = Tables<"audits">;

const auditsTable = db.table<Audit>("audits");

export const listAudits = () => auditsTable.list();
export const createAudit = (input: Partial<Audit>) => auditsTable.create(input);
export const updateAudit = (id: string, patch: Partial<Audit>) => auditsTable.update(id, patch);
export const removeAudit = (id: string) => auditsTable.remove(id);
