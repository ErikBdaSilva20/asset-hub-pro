import { StatusBadge } from "@/shared/components/status-badge";
import { ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createPpe, listPpes, type Ppe } from "@/lib/data/ppes.repo";
import { formatDate } from "@/shared/utils/format";
import { useRoleScopedResource } from "@/shared/hooks/use-role-scoped-resource";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "valid", label: "Válido" },
  { value: "expiring", label: "Vencendo" },
  { value: "expired", label: "Vencido" },
];

const columns: Column<Ppe>[] = [
  { key: "name", header: "EPI", cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: "ca", header: "CA", cell: (row) => mono(row.ca) },
  { key: "assignee", header: "Colaborador", cell: (row) => muted(row.assignee) },
  { key: "department", header: "Departamento", cell: (row) => muted(row.department) },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    key: "expires",
    header: "Validade",
    align: "right",
    cell: (row) => <span className="tabular">{formatDate(row.expires_at)}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "EPI", required: true },
  { name: "ca", label: "CA" },
  { name: "assignee", label: "Colaborador" },
  { name: "department", label: "Departamento" },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "valid",
    options: statusOptions.filter((o) => o.value !== "all"),
  },
  { name: "delivered_at", label: "Entregue em", type: "date" },
  { name: "expires_at", label: "Validade", type: "date" },
  { name: "stock", label: "Estoque", type: "number", defaultValue: 0 },
];

export function PpeScreen() {
  const { list, readOnly, emptyState } = useRoleScopedResource(listPpes, (row) => row.assignee_id);

  return (
    <ResourcePage
      title="EPIs"
      description="Equipamentos de proteção individual com CA, validade e comprovação de entrega."
      resource="ppes"
      list={list}
      statusOf={(row) => row.status}
      createLabel="Nova entrega de EPI"
      createFields={createFields}
      onCreate={(values) => createPpe(values as Partial<Ppe>)}
      statusOptions={statusOptions}
      columns={columns}
      readOnly={readOnly}
      emptyTitle={emptyState?.title}
      emptyDescription={emptyState?.description}
    />
  );
}
