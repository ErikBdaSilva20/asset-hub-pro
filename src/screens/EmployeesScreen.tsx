import { useMemo } from "react";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createEmployee,
  listEmployees,
  removeEmployee,
  updateEmployee,
  type Employee,
} from "@/lib/data/employees.repo";
import { listAssets, type Asset } from "@/lib/data/assets.repo";
import { formatDate } from "@/shared/utils/format";

const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativo" },
  { value: "on_leave", label: "Afastado" },
  { value: "offboarded", label: "Desligado" },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "Nome", required: true },
  { name: "email", label: "E-mail", required: true },
  { name: "role", label: "Cargo", required: true },
  { name: "department", label: "Departamento" },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: statusOptions.filter((o) => o.value !== "all"),
  },
  { name: "location", label: "Local" },
  { name: "hired_at", label: "Data de admissão", type: "date" },
];

/**
 * Colaboradores tem uma coluna `assets_count` própria no banco, mas ela é só um contador
 * estático (seed/histórico) — nunca é recalculada quando um ativo muda de responsável. Pra não
 * mostrar um número que diverge do que a tela de Ativos e o painel "Quem está com o quê" (mesmo
 * critério: `assets.assignee_id`) realmente mostram, esta tela ignora `row.assets_count` e
 * computa a contagem ao vivo a partir de `assets`.
 */
export function EmployeesScreen() {
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });

  const assetsByEmployeeId = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.assignee_id) continue;
      const held = map.get(asset.assignee_id) ?? [];
      held.push(asset);
      map.set(asset.assignee_id, held);
    }
    return map;
  }, [assets]);

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Colaborador",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "email", header: "E-mail", cell: (row) => muted(row.email) },
    { key: "role", header: "Cargo", cell: (row) => muted(row.role) },
    { key: "department", header: "Departamento", cell: (row) => muted(row.department) },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "assets",
      header: "Ativos",
      align: "right",
      cell: (row) => <span className="tabular">{assetsByEmployeeId.get(row.id)?.length ?? 0}</span>,
    },
  ];

  return (
    <ResourcePage
      title="Colaboradores"
      description="Pessoas aptas a receber ativos, com departamento, centro de custo e carga atual."
      resource="employees"
      list={listEmployees}
      statusOf={(row) => row.status}
      createLabel="Novo colaborador"
      createFields={createFields}
      onCreate={(values) => createEmployee(values as Partial<Employee>)}
      onUpdate={(id, values) => updateEmployee(id, values as Partial<Employee>)}
      onDelete={(id) => removeEmployee(id)}
      statusOptions={statusOptions}
      columns={columns}
      detail={(row) => {
        const heldAssets = assetsByEmployeeId.get(row.id) ?? [];
        return {
          title: row.name,
          subtitle: `${row.role} · ${row.department ?? "—"}`,
          content: (
            <DetailGrid
              items={[
                { label: "E-mail", value: row.email },
                { label: "Status", value: <StatusBadge status={row.status} /> },
                { label: "Local", value: row.location ?? "—" },
                { label: "Admissão", value: formatDate(row.hired_at) },
                { label: "Departamento", value: row.department ?? "—" },
                {
                  label: `Ativos sob responsabilidade (${heldAssets.length})`,
                  value:
                    heldAssets.length > 0 ? (
                      <ul className="space-y-0.5">
                        {heldAssets.map((asset) => (
                          <li key={asset.id}>
                            <span className="font-mono text-xs">{asset.tag}</span> — {asset.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    ),
                },
              ]}
            />
          ),
        };
      }}
    />
  );
}
