import { db } from "./client";
import type { Tables } from "./types.gen";

export type Category = Tables<"categories">;

const categoriesTable = db.table<Category>("categories");

export const listCategories = () => categoriesTable.list();
export const createCategory = (input: Partial<Category>) => categoriesTable.create(input);
export const updateCategory = (id: string, patch: Partial<Category>) =>
  categoriesTable.update(id, patch);
export const removeCategory = (id: string) => categoriesTable.remove(id);
