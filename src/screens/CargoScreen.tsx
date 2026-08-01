import { ResourcePage } from "@/shared/components/resource-page";
import { CargoCell } from "@/shared/components/cargo-cell";
import type { Column } from "@/shared/components/data-table";
import { listUsersLite, type UserLite } from "@/lib/data/users-lite.repo";

const columns: Column<UserLite>[] = [
  {
    key: "name",
    header: "Nome",
    cell: (row) => <span className="font-medium">{row.name ?? "—"}</span>,
  },
  { key: "email", header: "E-mail", cell: (row) => row.email },
  { key: "cargo", header: "Cargo", cell: (row) => <CargoCell user={row} /> },
];

/**
 * Recorte de `/users` só com nome/e-mail/cargo, acessível a admin **e** manager — `/users`
 * (papel de acesso completo) fica admin-only de verdade porque depende do plugin admin do
 * Better-Auth (`auth.listUsers`/`setRole`), que o servidor recusa pra manager (ver
 * GATEWAY-ADMIN-ENDPOINTS.md). Esta tela usa só `/data/users_lite`, que o gateway já libera pra
 * admin+manager — é como o manager consegue de fato "definir o cargo depois" (decisão do Erik em
 * TODO-MERGE-COLABORADOR-USUARIO.md), sem precisar mexer no plugin admin.
 */
export function CargoScreen() {
  return (
    <ResourcePage
      title="Cargos"
      description="Cargo de cada usuário — usado pra conferência de EPI (Requisitos de EPI). Papel de acesso (admin/manager/rep) continua só em /users; cargo de admin não é editável por aqui."
      resource="users_lite"
      list={listUsersLite}
      columns={columns}
      searchPlaceholder="Buscar por nome…"
      readOnly
    />
  );
}
