import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createMaintenanceOrder,
  listMaintenanceOrders,
  type MaintenanceOrder,
} from "@/lib/data/maintenance.repo";
import { listAssets } from "@/lib/data/assets.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "scheduled", label: "Agendada" },
  { value: "in_progress", label: "Em execução" },
  { value: "done", label: "Concluída" },
  { value: "late", label: "Atrasada" },
];

const typeOptions = [
  { value: "preventive", label: "Preventiva" },
  { value: "corrective", label: "Corretiva" },
];

const columns: Column<MaintenanceOrder>[] = [
  { key: "code", header: "OS", cell: (row) => mono(row.code), width: "100px" },
  {
    key: "asset",
    header: "Ativo",
    cell: (row) => <span className="font-medium">{row.asset_name}</span>,
  },
  { key: "type", header: "Tipo", cell: (row) => <StatusBadge status={row.type} /> },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { key: "provider", header: "Fornecedor", cell: (row) => muted(row.provider) },
  {
    key: "due",
    header: "Prazo",
    cell: (row) => <span className="tabular">{formatDate(row.due_at)}</span>,
  },
  {
    key: "cost",
    header: "Custo",
    align: "right",
    cell: (row) => <span className="tabular">{formatCurrency(row.cost)}</span>,
  },
];

export function MaintenanceScreen() {
  // maintenance_orders.asset_id é FK not null — mesmo caso de movements: precisa de um
  // seletor de ativo existente, não dá pra criar a ordem "solta".
  const { data: assets = [] } = useQuery({ queryKey: ["assets", "list"], queryFn: listAssets });

  const createFields: FormFieldDef[] = [
    { name: "code", label: "Código da OS", required: true, placeholder: "OS-0001" },
    {
      name: "asset_id",
      label: "Ativo",
      type: "select",
      required: true,
      options: assets.map((asset) => ({ value: asset.id, label: `${asset.tag} — ${asset.name}` })),
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      defaultValue: "preventive",
      options: typeOptions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "scheduled",
      options: statusOptions.filter((o) => o.value !== "all"),
    },
    { name: "provider", label: "Fornecedor" },
    { name: "opened_at", label: "Abertura", type: "date" },
    { name: "due_at", label: "Prazo", type: "date" },
    { name: "cost", label: "Custo", type: "number", defaultValue: 0 },
    { name: "description", label: "Descrição", type: "textarea" },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    const asset = assets.find((item) => item.id === values.asset_id);
    return createMaintenanceOrder({
      ...values,
      asset_tag: asset?.tag ?? null,
      asset_name: asset?.name ?? null,
    } as Partial<MaintenanceOrder>);
  };

  return (
    <ResourcePage
      title="Manutenções"
      description="Ordens preventivas e corretivas com prazo, fornecedor e custo real."
      resource="maintenance_orders"
      list={listMaintenanceOrders}
      statusOf={(row) => row.status}
      createLabel="Nova ordem"
      createFields={createFields}
      onCreate={handleCreate}
      statusOptions={statusOptions}
      columns={columns}
      detail={(row) => ({
        title: row.code,
        subtitle: `${row.asset_name ?? "—"} · ${row.asset_tag ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "Tipo", value: <StatusBadge status={row.type} /> },
              { label: "Status", value: <StatusBadge status={row.status} /> },
              { label: "Fornecedor", value: row.provider ?? "—" },
              { label: "Abertura", value: formatDate(row.opened_at) },
              { label: "Prazo", value: formatDate(row.due_at) },
              { label: "Custo", value: formatCurrency(row.cost) },
              { label: "Descrição", value: row.description ?? "—" },
            ]}
          />
        ),
      })}
    />
  );
}
