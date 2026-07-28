import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createLicense, listLicenses, type License } from "@/lib/data/licenses.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "expiring", label: "Vencendo" },
  { value: "expired", label: "Vencida" },
  { value: "unassigned", label: "Sem alocação" },
];

const columns: Column<License>[] = [
  {
    key: "name",
    header: "Licença",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "vendor", header: "Fornecedor", cell: (row) => muted(row.vendor) },
  {
    key: "seats",
    header: "Assentos",
    cell: (row) => (
      <span className="tabular">
        {row.seats_used}/{row.seats_total}
      </span>
    ),
  },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    key: "renewal",
    header: "Renovação",
    cell: (row) => <span className="tabular">{formatDate(row.renewal_date)}</span>,
  },
  {
    key: "cost",
    header: "Custo anual",
    align: "right",
    cell: (row) => <span className="tabular">{formatCurrency(row.annual_cost)}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "Nome da licença", required: true },
  { name: "vendor", label: "Fornecedor" },
  { name: "key", label: "Chave" },
  { name: "seats_total", label: "Assentos totais", type: "number", defaultValue: 0 },
  { name: "seats_used", label: "Assentos usados", type: "number", defaultValue: 0 },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: statusOptions.filter((o) => o.value !== "all"),
  },
  { name: "renewal_date", label: "Renovação", type: "date" },
  { name: "annual_cost", label: "Custo anual", type: "number", defaultValue: 0 },
  { name: "owner_department", label: "Departamento" },
];

export function LicensesScreen() {
  return (
    <ResourcePage
      title="Licenças"
      description="Contratos de software, assentos consumidos, renovação e custo anual."
      resource="licenses"
      list={listLicenses}
      statusOf={(row) => row.status}
      createLabel="Nova licença"
      createFields={createFields}
      onCreate={(values) => createLicense(values as Partial<License>)}
      statusOptions={statusOptions}
      columns={columns}
      detail={(row) => ({
        title: row.name,
        subtitle: `${row.vendor ?? "—"} · ${row.owner_department ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "Chave", value: mono(row.key) },
              { label: "Status", value: <StatusBadge status={row.status} /> },
              { label: "Assentos", value: `${row.seats_used} de ${row.seats_total}` },
              { label: "Renovação", value: formatDate(row.renewal_date) },
              { label: "Custo anual", value: formatCurrency(row.annual_cost) },
              { label: "Departamento", value: row.owner_department ?? "—" },
            ]}
          />
        ),
      })}
    />
  );
}
