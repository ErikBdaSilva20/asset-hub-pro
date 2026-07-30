import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createSupplier,
  listSuppliers,
  removeSupplier,
  updateSupplier,
  type Supplier,
} from "@/lib/data/suppliers.repo";
import { formatDate } from "@/shared/utils/format";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const columns: Column<Supplier>[] = [
  {
    key: "name",
    header: "Fornecedor",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "doc", header: "CNPJ", cell: (row) => mono(row.document) },
  { key: "contact", header: "Contato", cell: (row) => muted(row.contact) },
  { key: "category", header: "Categoria", cell: (row) => muted(row.category) },
  {
    key: "contract",
    header: "Contrato até",
    cell: (row) => <span className="tabular">{formatDate(row.contract_until)}</span>,
  },
  {
    key: "assets",
    header: "Ativos",
    align: "right",
    cell: (row) => <span className="tabular">{row.active_assets}</span>,
  },
];

const createFields: FormFieldDef[] = [
  { name: "name", label: "Fornecedor", required: true },
  { name: "document", label: "CNPJ" },
  { name: "contact", label: "Contato" },
  { name: "email", label: "E-mail" },
  { name: "category", label: "Categoria" },
  { name: "contract_until", label: "Contrato até", type: "date" },
];

export function SuppliersScreen() {
  return (
    <ResourcePage
      title="Fornecedores"
      description="Parceiros de compra, contrato e manutenção vinculados ao patrimônio."
      resource="suppliers"
      list={listSuppliers}
      createLabel="Novo fornecedor"
      createFields={createFields}
      onCreate={(values) => createSupplier(values as Partial<Supplier>)}
      onUpdate={(id, values) => updateSupplier(id, values as Partial<Supplier>)}
      onDelete={(id) => removeSupplier(id)}
      columns={columns}
      detail={(row) => ({
        title: row.name,
        subtitle: row.category ?? "—",
        content: (
          <DetailGrid
            items={[
              { label: "CNPJ", value: row.document ?? "—" },
              { label: "Contato", value: row.contact ?? "—" },
              { label: "E-mail", value: row.email ?? "—" },
              { label: "Categoria", value: row.category ?? "—" },
              { label: "Contrato até", value: formatDate(row.contract_until) },
              { label: "Ativos ativos", value: row.active_assets },
            ]}
          />
        ),
      })}
    />
  );
}
