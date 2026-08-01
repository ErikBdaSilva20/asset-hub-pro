import { db } from "./client";

/**
 * Vista mínima de `user` (Better-Auth) exposta pelo gateway via `/data/users_lite` — extensão
 * própria (não é tabela de negócio de `schema.ts`), ver `dev-gateway/src/users-lite-routes.ts`.
 * Serve pra manager listar reps (atribuir ativo/EPI/assinatura) e pra admin/manager definir o
 * cargo de alguém em `/users`.
 */
export interface UserLite {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "manager" | "rep" | null;
  cargo: string | null;
}

const usersLiteTable = db.table<UserLite>("users_lite");

export const listUsersLite = () => usersLiteTable.list();
export const usersLiteListQueryKey = ["users_lite", "list"] as const;
export const updateUserCargo = (id: string, cargo: string | null) =>
  usersLiteTable.update(id, { cargo });
