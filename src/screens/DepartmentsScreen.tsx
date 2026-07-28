import { ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createDepartment, listDepartments, type Department } from "@/lib/data/departments.repo";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const columns: Column<Department>[] = [
  {
    key: "name",
    header: "Departamento",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "manager", header: "Gestor", cell: (row) => muted(row.manager) },
  { key: "cc", header: "Centro de custo", cell: (row) => mono(row.cost_center) },
  {
    key: "headcount",
    header: "Pessoas",
    align: "right",
    cell: (row) => <span className="tabular">{row.headcount}</span>,
  },
  {
    key: "assets",
    header: "Ativos",
    align: "right",
    cell: (row) => <span className="tabular">{row.assets_count}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "Departamento", required: true },
  { name: "manager", label: "Gestor" },
  { name: "cost_center", label: "Centro de custo" },
  { name: "headcount", label: "Pessoas", type: "number", defaultValue: 0 },
];

export function DepartmentsScreen() {
  return (
    <ResourcePage
      title="Departamentos"
      description="Estrutura organizacional, centros de custo e distribuição de ativos."
      resource="departments"
      list={listDepartments}
      createLabel="Novo departamento"
      createFields={createFields}
      onCreate={(values) => createDepartment(values as Partial<Department>)}
      columns={columns}
    />
  );
}
