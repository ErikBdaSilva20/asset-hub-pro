import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createAsset, listAssets, type Asset } from "@/lib/data/assets.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useRoleScopedResource } from "@/shared/hooks/use-role-scoped-resource";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

export const assetColumns: Column<Asset>[] = [
  { key: "tag", header: "Etiqueta", cell: (row) => mono(row.tag), width: "110px" },
  { key: "name", header: "Ativo", cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: "category", header: "Categoria", cell: (row) => muted(row.category) },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { key: "assignee", header: "Responsável", cell: (row) => muted(row.assignee) },
  { key: "location", header: "Local", cell: (row) => muted(row.location) },
  {
    key: "value",
    header: "Valor",
    align: "right",
    cell: (row) => <span className="tabular">{formatCurrency(row.purchase_value)}</span>,
  },
];

export const assetStatusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "available", label: "Disponível" },
  { value: "in_use", label: "Em uso" },
  { value: "maintenance", label: "Manutenção" },
  { value: "reserved", label: "Reservado" },
  { value: "retired", label: "Baixado" },
];

export const assetKindOptions = [
  { value: "notebook", label: "Notebook" },
  { value: "desktop", label: "Desktop" },
  { value: "phone", label: "Celular" },
  { value: "furniture", label: "Mobiliário" },
  { value: "ppe", label: "EPI" },
  { value: "license", label: "Licença" },
  { value: "tool", label: "Ferramenta" },
  { value: "vehicle", label: "Veículo" },
  { value: "peripheral", label: "Periférico" },
];

const assetConditionOptions = [
  { value: "new", label: "Novo" },
  { value: "good", label: "Bom" },
  { value: "fair", label: "Regular" },
  { value: "damaged", label: "Danificado" },
];

export function buildAssetFields(kindOptions = assetKindOptions): FormFieldDef[] {
  return [
    { name: "tag", label: "Etiqueta", required: true, placeholder: "AH-0001" },
    { name: "name", label: "Nome do ativo", required: true },
    { name: "kind", label: "Tipo", type: "select", required: true, options: kindOptions },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "available",
      options: assetStatusOptions.filter((o) => o.value !== "all"),
    },
    {
      name: "condition",
      label: "Condição",
      type: "select",
      defaultValue: "new",
      options: assetConditionOptions,
    },
    { name: "category", label: "Categoria" },
    { name: "manufacturer", label: "Fabricante" },
    { name: "model", label: "Modelo" },
    { name: "serial_number", label: "Número de série" },
    { name: "supplier", label: "Fornecedor" },
    { name: "department", label: "Departamento" },
    { name: "assignee", label: "Responsável" },
    { name: "location", label: "Local" },
    { name: "purchase_date", label: "Data de compra", type: "date" },
    { name: "purchase_value", label: "Valor de compra", type: "number", defaultValue: 0 },
    { name: "warranty_until", label: "Garantia até", type: "date" },
  ];
}

export function assetDetail(row: Asset) {
  return {
    title: row.name,
    subtitle: `${row.tag} · ${row.category ?? "—"}`,
    content: (
      <DetailGrid
        items={[
          { label: "Status", value: <StatusBadge status={row.status} /> },
          { label: "Condição", value: <StatusBadge status={row.condition} /> },
          { label: "Número de série", value: mono(row.serial_number) },
          { label: "Modelo", value: `${row.manufacturer ?? "—"} ${row.model ?? ""}`.trim() },
          { label: "Responsável", value: row.assignee ?? "—" },
          { label: "Departamento", value: row.department ?? "—" },
          { label: "Local", value: row.location ?? "—" },
          { label: "Fornecedor", value: row.supplier ?? "—" },
          { label: "Compra", value: formatDate(row.purchase_date) },
          { label: "Valor", value: formatCurrency(row.purchase_value) },
          { label: "Garantia até", value: formatDate(row.warranty_until) },
          { label: "Atualizado", value: formatDate(row.updated_at) },
        ]}
      />
    ),
  };
}

export function AssetsScreen() {
  const { list, readOnly, emptyState } = useRoleScopedResource(
    listAssets,
    (row) => row.assignee_id,
  );

  return (
    <ResourcePage
      title="Ativos"
      description="Registro central do patrimônio, com status, alocação e ciclo de vida completo."
      resource="assets"
      list={list}
      statusOf={(row) => row.status}
      columns={assetColumns}
      statusOptions={assetStatusOptions}
      createLabel="Novo ativo"
      createFields={buildAssetFields()}
      onCreate={(values) => createAsset(values as Partial<Asset>)}
      detail={assetDetail}
      readOnly={readOnly}
      emptyTitle={emptyState?.title}
      emptyDescription={emptyState?.description}
    />
  );
}
