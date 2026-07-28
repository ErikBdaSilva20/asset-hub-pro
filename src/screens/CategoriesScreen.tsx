import { ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createCategory, listCategories, type Category } from "@/lib/data/categories.repo";
import { assetKindOptions } from "./AssetsScreen";

const muted = (value: string) => <span className="text-muted-foreground">{value}</span>;

const columns: Column<Category>[] = [
  {
    key: "name",
    header: "Categoria",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "kind", header: "Tipo", cell: (row) => muted(row.kind) },
  {
    key: "dep",
    header: "Depreciação",
    cell: (row) => <span className="tabular">{row.depreciation_months} meses</span>,
  },
  {
    key: "maint",
    header: "Manutenção",
    cell: (row) => muted(row.requires_maintenance ? "Obrigatória" : "Opcional"),
  },
  {
    key: "assets",
    header: "Ativos",
    align: "right",
    cell: (row) => <span className="tabular">{row.assets_count}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "Categoria", required: true },
  { name: "kind", label: "Tipo", type: "select", required: true, options: assetKindOptions },
  { name: "depreciation_months", label: "Depreciação (meses)", type: "number", defaultValue: 0 },
  {
    name: "requires_maintenance",
    label: "Exige manutenção",
    type: "checkbox",
    placeholder: "Sim, exige manutenção periódica",
  },
];

export function CategoriesScreen() {
  return (
    <ResourcePage
      title="Categorias"
      description="Taxonomia dos ativos, regras de depreciação e exigência de manutenção."
      resource="categories"
      list={listCategories}
      createLabel="Nova categoria"
      createFields={createFields}
      onCreate={(values) => createCategory(values as Partial<Category>)}
      columns={columns}
    />
  );
}
