import type { Role } from "@/lib/auth";

/**
 * Única fonte de verdade pra "quem pode gerenciar o catálogo" (Ativos, Equipamentos, EPIs,
 * Assinaturas, Departamentos, Categorias, Manutenções, Auditorias, Movimentações).
 * Espelha a regra que o próprio gateway aplica nas tabelas lookup (Importantdoc.md §B4.6:
 * "escrita só admin/manager") — mantida aqui pra UI (esconder botão, redirecionar rota) em vez de
 * checks de role espalhados pelo código. Se um papel novo entrar no jogo um dia, muda só aqui.
 */
const CATALOG_MANAGER_ROLES: ReadonlySet<Role> = new Set(["admin", "manager"]);

export function canManageCatalog(role: Role | null): boolean {
  return role !== null && CATALOG_MANAGER_ROLES.has(role);
}

export function isAdmin(role: Role | null): boolean {
  return role === "admin";
}

export function hasAnyRole(role: Role | null, allowed: readonly Role[]): boolean {
  return role !== null && allowed.includes(role);
}
