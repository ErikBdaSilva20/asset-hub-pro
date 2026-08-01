import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef, SelectFieldOption } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createPpe,
  effectivePpeStatus,
  listPpes,
  removePpe,
  updatePpe,
  type Ppe,
} from "@/lib/data/ppes.repo";
import { listPpeRequirements } from "@/lib/data/ppe-requirements.repo";
import { createDepartment, listDepartments } from "@/lib/data/departments.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useRoleScopedResource } from "@/shared/hooks/use-role-scoped-resource";
import { useCategoryOptions } from "@/shared/hooks/use-category-options";
import { useUserOptions } from "@/shared/hooks/use-user-options";
import { findByNameCaseInsensitive } from "@/shared/utils/find-by-name";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

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
  { key: "category", header: "Categoria", cell: (row) => muted(row.category) },
  { key: "assignee", header: "Responsável", cell: (row) => muted(row.assignee) },
  { key: "department", header: "Departamento", cell: (row) => muted(row.department) },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={effectivePpeStatus(row)} />,
  },
  {
    key: "expires",
    header: "Validade",
    align: "right",
    cell: (row) => <span className="tabular">{formatDate(row.expires_at)}</span>,
  },
  {
    key: "cost",
    header: "Custo",
    align: "right",
    cell: (row) => <span className="tabular">{formatCurrency(row.cost)}</span>,
  },
];

/**
 * O campo "EPI" (nome) vira um select com os nomes já cadastrados em Requisitos de EPI
 * (`ppe_requirements.ppe_name`) — assim quem registra uma entrega escolhe de uma lista já
 * validada em vez de digitar de novo (evita "Capacete" num dia e "Capacete de segurança" no
 * outro, que quebraria a comparação com o exigido por função). Sem nenhum requisito cadastrado
 * ainda, cai pra texto livre — não bloqueia o cadastro de EPI por falta de configuração prévia.
 */
function buildCreateFields(
  nameOptions: string[],
  categoryOptions: SelectFieldOption[],
  onCreateCategory: (name: string) => Promise<SelectFieldOption>,
  userOptions: SelectFieldOption[],
  departmentOptions: SelectFieldOption[],
  onCreateDepartment: (name: string) => Promise<SelectFieldOption>,
): FormFieldDef[] {
  const nameField: FormFieldDef =
    nameOptions.length > 0
      ? {
          name: "name",
          label: "EPI",
          type: "select",
          required: true,
          options: nameOptions.map((name) => ({ value: name, label: name })),
        }
      : { name: "name", label: "EPI", required: true };

  return [
    nameField,
    { name: "ca", label: "CA" },
    {
      name: "category_id",
      label: "Categoria",
      type: "combobox",
      placeholder: "Sem categoria",
      options: categoryOptions,
      deriveFields: (option) => ({ category: option.label }),
      onCreateOption: (name) => onCreateCategory(name),
    },
    {
      name: "assignee_id",
      label: "Responsável",
      type: "combobox",
      placeholder: "Sem responsável",
      options: userOptions,
      deriveFields: (option) => ({ assignee: option.label }),
    },
    // `ppes` não tem `department_id` no schema (só `department` texto) — a opção e o valor
    // guardado são o mesmo nome, sem id por trás (ver `useDepartmentOptions` vs. o caso aqui).
    {
      name: "department",
      label: "Departamento",
      type: "combobox",
      placeholder: "Sem departamento",
      options: departmentOptions,
      onCreateOption: (name) => onCreateDepartment(name),
    },
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
    { name: "cost", label: "Custo", type: "number", defaultValue: 0 },
  ];
}

export function PpeScreen() {
  const { list, readOnly, emptyState } = useRoleScopedResource(listPpes, (row) => row.assignee_id);
  const queryClient = useQueryClient();
  const { data: requirements = [] } = useListQuery({
    queryKey: ["ppe_requirements", "list"],
    queryFn: listPpeRequirements,
  });
  const { data: departments = [] } = useListQuery({
    queryKey: ["departments", "list"],
    queryFn: listDepartments,
  });
  const { options: categoryOptions, createOption: createCategoryOption } =
    useCategoryOptions("ppe");
  const userOptions = useUserOptions();

  const departmentOptions = useMemo(
    () =>
      sortOptionsByLabel(
        departments.map((department) => ({ value: department.name, label: department.name })),
      ),
    [departments],
  );
  const createDepartmentOption = useCallback(
    async (name: string): Promise<SelectFieldOption> => {
      const existing = findByNameCaseInsensitive(departments, name, (d) => d.name);
      const department = existing ?? (await createDepartment({ name }));
      if (!existing) await queryClient.invalidateQueries({ queryKey: ["departments", "list"] });
      return { value: department.name, label: department.name };
    },
    [departments, queryClient],
  );

  const nameOptions = useMemo(
    () => Array.from(new Set(requirements.map((requirement) => requirement.ppe_name))).sort(),
    [requirements],
  );
  const createFields = useMemo(
    () =>
      buildCreateFields(
        nameOptions,
        categoryOptions,
        createCategoryOption,
        userOptions,
        departmentOptions,
        createDepartmentOption,
      ),
    [
      nameOptions,
      categoryOptions,
      createCategoryOption,
      userOptions,
      departmentOptions,
      createDepartmentOption,
    ],
  );

  return (
    <ResourcePage
      title="EPIs"
      description="Equipamentos de proteção individual com CA, validade e comprovação de entrega."
      resource="ppes"
      list={list}
      statusOf={effectivePpeStatus}
      createLabel="Nova entrega de EPI"
      createFields={createFields}
      onCreate={(values) => createPpe(values as Partial<Ppe>)}
      onUpdate={(id, values) => updatePpe(id, values as Partial<Ppe>)}
      onDelete={(id) => removePpe(id)}
      statusOptions={statusOptions}
      columns={columns}
      readOnly={readOnly}
      emptyTitle={emptyState?.title}
      emptyDescription={emptyState?.description}
      detail={(row) => ({
        title: row.name,
        subtitle: `${row.category ?? "—"} · ${row.department ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "Status", value: <StatusBadge status={effectivePpeStatus(row)} /> },
              { label: "CA", value: row.ca ?? "—" },
              { label: "Responsável", value: row.assignee ?? "—" },
              { label: "Departamento", value: row.department ?? "—" },
              { label: "Entregue em", value: formatDate(row.delivered_at) },
              { label: "Validade", value: formatDate(row.expires_at) },
              { label: "Estoque", value: row.stock },
              { label: "Custo", value: formatCurrency(row.cost) },
            ]}
          />
        ),
      })}
    />
  );
}
