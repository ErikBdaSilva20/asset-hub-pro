import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createEmployee, listEmployees, type Employee } from "@/lib/data/employees.repo";
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
    cell: (row) => <span className="tabular">{row.assets_count}</span>,
  },
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

export function EmployeesScreen() {
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
      statusOptions={statusOptions}
      columns={columns}
      detail={(row) => ({
        title: row.name,
        subtitle: `${row.role} · ${row.department ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "E-mail", value: row.email },
              { label: "Status", value: <StatusBadge status={row.status} /> },
              { label: "Local", value: row.location ?? "—" },
              { label: "Admissão", value: formatDate(row.hired_at) },
              { label: "Ativos sob responsabilidade", value: row.assets_count },
              { label: "Departamento", value: row.department ?? "—" },
            ]}
          />
        ),
      })}
    />
  );
}
