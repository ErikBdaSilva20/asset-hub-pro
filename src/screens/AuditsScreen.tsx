import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createAudit,
  listAudits,
  removeAudit,
  updateAudit,
  type Audit,
} from "@/lib/data/audits.repo";
import { formatDate } from "@/shared/utils/format";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "planned", label: "Planejada" },
  { value: "running", label: "Em andamento" },
  { value: "closed", label: "Encerrada" },
];

const columns: Column<Audit>[] = [
  { key: "code", header: "Código", cell: (row) => mono(row.code), width: "140px" },
  {
    key: "scope",
    header: "Escopo",
    cell: (row) => <span className="font-medium">{row.scope}</span>,
  },
  { key: "responsible", header: "Responsável", cell: (row) => muted(row.responsible) },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    key: "progress",
    header: "Conferidos",
    cell: (row) => (
      <span className="tabular">
        {row.items_checked}/{row.items_planned}
      </span>
    ),
  },
  {
    key: "div",
    header: "Divergências",
    align: "right",
    cell: (row) => <span className="tabular">{row.divergences}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "code", label: "Código", required: true, placeholder: "AUD-2026-001" },
  { name: "scope", label: "Escopo", required: true },
  { name: "responsible", label: "Responsável" },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "planned",
    options: statusOptions.filter((o) => o.value !== "all"),
  },
  { name: "started_at", label: "Início", type: "date" },
  { name: "items_planned", label: "Itens planejados", type: "number", defaultValue: 0 },
  { name: "items_checked", label: "Itens conferidos", type: "number", defaultValue: 0 },
  { name: "divergences", label: "Divergências", type: "number", defaultValue: 0 },
];

export function AuditsScreen() {
  return (
    <ResourcePage
      title="Auditorias"
      description="Ciclos de conferência física do inventário e tratamento de divergências."
      resource="audits"
      list={listAudits}
      statusOf={(row) => row.status}
      createLabel="Nova auditoria"
      createFields={createFields}
      onCreate={(values) => createAudit(values as Partial<Audit>)}
      onUpdate={(id, values) => updateAudit(id, values as Partial<Audit>)}
      onDelete={(id) => removeAudit(id)}
      statusOptions={statusOptions}
      columns={columns}
      detail={(row) => ({
        title: row.code,
        subtitle: row.scope ?? "—",
        content: (
          <DetailGrid
            items={[
              { label: "Status", value: <StatusBadge status={row.status} /> },
              { label: "Responsável", value: row.responsible ?? "—" },
              { label: "Início", value: formatDate(row.started_at) },
              { label: "Itens planejados", value: row.items_planned },
              { label: "Itens conferidos", value: row.items_checked },
              { label: "Divergências", value: row.divergences },
            ]}
          />
        ),
      })}
    />
  );
}
