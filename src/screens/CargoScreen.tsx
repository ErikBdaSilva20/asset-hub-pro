import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { DataTable, TableToolbar, type Column } from "@/shared/components/data-table";
import { CargoCell } from "@/shared/components/cargo-cell";
import { UserHoldingsCard, useUserHoldings } from "@/shared/components/user-holdings";
import { EmptyState } from "@/shared/components/states";
import { listUsersLite, type UserLite } from "@/lib/data/users-lite.repo";
import { listAssets } from "@/lib/data/assets.repo";
import { listPpes } from "@/lib/data/ppes.repo";
import { listLicenseAssignments } from "@/lib/data/license-assignments.repo";
import { listLicenses } from "@/lib/data/licenses.repo";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { useAuth } from "@/lib/auth";
import { isAdmin } from "@/shared/utils/permissions";

const cargoColumns: Column<UserLite>[] = [
  {
    key: "name",
    header: "Nome",
    cell: (row) => <span className="font-medium">{row.name ?? "—"}</span>,
  },
  { key: "email", header: "E-mail", cell: (row) => row.email },
  { key: "cargo", header: "Cargo", cell: (row) => <CargoCell user={row} /> },
];

function filterByNameOrEmail<T extends { name: string | null; email: string }>(
  rows: T[],
  search: string,
): T[] {
  const key = search.trim().toLowerCase();
  if (!key) return rows;
  return rows.filter(
    (row) => (row.name ?? "").toLowerCase().includes(key) || row.email.toLowerCase().includes(key),
  );
}

/**
 * Recorte de `/users` acessível a admin **e** manager — `/users` (papel de acesso completo) fica
 * admin-only de verdade porque depende do plugin admin do Better-Auth (`auth.listUsers`/
 * `setRole`), que o servidor recusa pra manager (ver GATEWAY-ADMIN-ENDPOINTS.md). Esta tela usa
 * só `/data/users_lite`, que o gateway já libera pra admin+manager.
 *
 * Duas abas (pedido do Erik): "O que cada um tem" é a padrão — cards pra bater o olho no que já
 * está atribuído, não uma tabela de gestão (por isso não é `ResourcePage`: aqui não tem
 * create/delete/CSV, só uma visão agrupada). "Cargos" (a tela original) fica atrás de uma aba,
 * pra quem precisa editar cargo de verdade.
 */
export function CargoScreen() {
  const { role } = useAuth();
  const admin = isAdmin(role);
  const [holdingsSearch, setHoldingsSearch] = useState("");
  const [cargoSearch, setCargoSearch] = useState("");

  const { data: users = [], isLoading: usersLoading } = useListQuery({
    queryKey: ["users_lite", "list"],
    queryFn: listUsersLite,
  });
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: ppes = [] } = useListQuery({ queryKey: ["ppes", "list"], queryFn: listPpes });
  // Assinatura é a única coisa que o manager nunca vê (mesma regra de LicensesScreen.tsx,
  // garantida no servidor via TableDef.adminOnly) — nem busca esses dados quando não é admin.
  const { data: licenseAssignments = [] } = useListQuery({
    queryKey: ["license_assignments", "list"],
    queryFn: listLicenseAssignments,
    enabled: admin,
  });
  const { data: licenses = [] } = useListQuery({
    queryKey: ["licenses", "list"],
    queryFn: listLicenses,
    enabled: admin,
  });

  const holdings = useUserHoldings(users, assets, ppes, licenseAssignments, licenses);
  const filteredHoldings = useMemo(() => {
    const key = holdingsSearch.trim().toLowerCase();
    if (!key) return holdings;
    return holdings.filter(
      ({ user }) =>
        (user.name ?? "").toLowerCase().includes(key) || user.email.toLowerCase().includes(key),
    );
  }, [holdings, holdingsSearch]);
  const filteredCargoRows = useMemo(
    () => filterByNameOrEmail(users, cargoSearch),
    [users, cargoSearch],
  );

  return (
    <PageContainer>
      <PageHeader
        title="Cargos"
        description="O que cada usuário tem atribuído, e o cargo usado pra conferência de EPI (Requisitos de EPI). Papel de acesso (admin/manager/rep) continua só em /users."
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Cargos" }]}
        actions={
          // Atalho pra cadastrar um cargo novo sem precisar navegar até /ppe-requirements na mão
          // — é lá que o cargo "existe de verdade" (função_name), o combobox de cada usuário só
          // lista o que já foi cadastrado ali. Não duplica o formulário aqui, só encurta o caminho.
          <Button asChild size="sm" variant="outline">
            <Link to="/ppe-requirements">
              <Plus className="size-4" /> Novo cargo
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="holdings">
        <TabsList>
          <TabsTrigger value="holdings">O que cada um tem</TabsTrigger>
          <TabsTrigger value="cargos">Cargos</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="mt-4 space-y-4">
          <Input
            value={holdingsSearch}
            onChange={(event) => setHoldingsSearch(event.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="max-w-sm"
          />
          {filteredHoldings.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={
                holdingsSearch
                  ? "Ninguém encontrado"
                  : "Ninguém tem ativo, EPI ou assinatura atribuído ainda"
              }
              description={
                holdingsSearch
                  ? "Tente buscar por outro nome ou e-mail."
                  : "Atribua um ativo ou EPI a um usuário pra ele aparecer aqui."
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredHoldings.map((entry) => (
                <UserHoldingsCard key={entry.user.id} holdings={entry} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cargos" className="mt-4">
          <DataTable
            columns={cargoColumns}
            rows={filteredCargoRows}
            rowKey={(row) => row.id}
            isLoading={usersLoading}
            emptyTitle="Nenhum usuário encontrado"
            emptyDescription="Ajuste a busca pra ver outros resultados."
            toolbar={
              <TableToolbar
                search={cargoSearch}
                onSearch={setCargoSearch}
                placeholder="Buscar por nome ou e-mail…"
              />
            }
            page={1}
            pageSize={Math.max(filteredCargoRows.length, 1)}
            total={filteredCargoRows.length}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
