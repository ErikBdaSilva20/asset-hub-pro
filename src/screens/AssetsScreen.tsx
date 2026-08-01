import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef, SelectFieldOption } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createAsset,
  listAssets,
  removeAsset,
  updateAsset,
  type Asset,
} from "@/lib/data/assets.repo";
import type { AssetKind } from "@/lib/data/types.gen";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useRoleScopedResource } from "@/shared/hooks/use-role-scoped-resource";
import { useCategoryOptions } from "@/shared/hooks/use-category-options";
import { useDepartmentOptions } from "@/shared/hooks/use-department-options";
import { useUserOptions } from "@/shared/hooks/use-user-options";

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

const assetRangeFilters = [
  { key: "purchase_value", label: "Valor de compra", type: "number" as const },
  { key: "purchase_date", label: "Data de compra", type: "date" as const },
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

export function buildAssetFields(
  kindOptions = assetKindOptions,
  userOptions: SelectFieldOption[] = [],
  categoryOptions: SelectFieldOption[] = [],
  onCreateCategory?: (name: string, values: Record<string, unknown>) => Promise<SelectFieldOption>,
  departmentOptions: SelectFieldOption[] = [],
  onCreateDepartment?: (name: string) => Promise<SelectFieldOption>,
): FormFieldDef[] {
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
    {
      name: "category_id",
      label: "Categoria",
      type: "combobox",
      placeholder: "Sem categoria",
      options: categoryOptions,
      deriveFields: (option) => ({ category: option.label }),
      onCreateOption: onCreateCategory,
    },
    { name: "manufacturer", label: "Fabricante" },
    { name: "model", label: "Modelo" },
    { name: "serial_number", label: "Número de série" },
    {
      name: "department_id",
      label: "Departamento",
      type: "combobox",
      placeholder: "Sem departamento",
      options: departmentOptions,
      deriveFields: (option) => ({ department: option.label }),
      onCreateOption: onCreateDepartment ? (name) => onCreateDepartment(name) : undefined,
    },
    {
      name: "assignee_id",
      label: "Responsável",
      type: "combobox",
      placeholder: "Sem responsável",
      options: userOptions,
      deriveFields: (option) => ({ assignee: option.label }),
    },
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
  const userOptions = useUserOptions();
  // Sem `kind` fixo: Ativos cobre todo tipo, então lista todas as categorias e usa o "Tipo" já
  // escolhido no próprio formulário (values.kind) como kind da categoria nova, se precisar criar.
  const { options: categoryOptions, createOption: createCategoryOption } = useCategoryOptions();
  const { options: departmentOptions, createOption: createDepartmentOption } =
    useDepartmentOptions();

  return (
    <ResourcePage
      title="Ativos"
      description="Registro central do patrimônio, com status, alocação e ciclo de vida completo."
      resource="assets"
      list={list}
      statusOf={(row) => row.status}
      columns={assetColumns}
      statusOptions={assetStatusOptions}
      rangeFilters={assetRangeFilters}
      createLabel="Novo ativo"
      createFields={buildAssetFields(
        assetKindOptions,
        userOptions,
        categoryOptions,
        (name, values) => createCategoryOption(name, (values.kind as AssetKind) || undefined),
        departmentOptions,
        createDepartmentOption,
      )}
      onCreate={(values) => createAsset(values as Partial<Asset>)}
      onUpdate={(id, values) => updateAsset(id, values as Partial<Asset>)}
      onDelete={(id) => removeAsset(id)}
      detail={assetDetail}
      readOnly={readOnly}
      emptyTitle={emptyState?.title}
      emptyDescription={emptyState?.description}
    />
  );
}
