import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef, SelectFieldOption } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createLicense,
  effectiveLicenseStatus,
  listLicenses,
  removeLicense,
  updateLicense,
  type License,
} from "@/lib/data/licenses.repo";
import {
  createLicenseAssignment,
  listLicenseAssignments,
  removeLicenseAssignment,
  updateLicenseAssignment,
} from "@/lib/data/license-assignments.repo";
import { listUsersLite, usersLiteListQueryKey } from "@/lib/data/users-lite.repo";
import { createDepartment, listDepartments } from "@/lib/data/departments.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useAuth } from "@/lib/auth";
import { canManageCatalog, isAdmin } from "@/shared/utils/permissions";
import { useCategoryOptions } from "@/shared/hooks/use-category-options";
import { findByNameCaseInsensitive } from "@/shared/utils/find-by-name";
import { sortOptionsByLabel } from "@/shared/utils/sort-options";

const muted = (value: string | null | undefined) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

function buildRangeFilters(showValue: boolean) {
  return [
    ...(showValue ? [{ key: "cost", label: "Custo", type: "number" as const }] : []),
    { key: "renewal_date", label: "Renovação", type: "date" as const },
  ];
}

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "expiring", label: "Vencendo" },
  { value: "expired", label: "Vencida" },
  { value: "unassigned", label: "Sem responsável" },
];

const billingPeriodOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "annual", label: "Anual" },
];

const billingPeriodLabel: Record<License["billing_period"], string> = {
  monthly: "/mês",
  annual: "/ano",
};

// `licenses` não tem `category_id`/`owner_department` com FK de departamento no schema além da
// categoria (que sim tem `category_id`, ver TABLES em dev-gateway/src/schema.ts) — `owner_department`
// segue por nome, sem id, igual `ppes.department` (ver PpeScreen.tsx).
function buildBaseFields(
  categoryOptions: SelectFieldOption[],
  onCreateCategory: (name: string) => Promise<SelectFieldOption>,
  departmentOptions: SelectFieldOption[],
  onCreateDepartment: (name: string) => Promise<SelectFieldOption>,
): FormFieldDef[] {
  return [
    {
      name: "name",
      label: "Nome da assinatura",
      required: true,
      placeholder: "Claude, GPT, Netflix…",
    },
    { name: "vendor", label: "Fornecedor" },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "active",
      options: statusOptions.filter((o) => o.value !== "all"),
    },
    {
      name: "billing_period",
      label: "Periodicidade",
      type: "select",
      defaultValue: "annual",
      options: billingPeriodOptions,
    },
    { name: "cost", label: "Custo", type: "number", defaultValue: 0 },
    { name: "renewal_date", label: "Próxima renovação", type: "date" },
    {
      name: "owner_department",
      label: "Departamento",
      type: "combobox",
      placeholder: "Sem departamento",
      options: departmentOptions,
      onCreateOption: (name) => onCreateDepartment(name),
    },
    {
      name: "category_id",
      label: "Categoria",
      type: "combobox",
      placeholder: "Sem categoria",
      options: categoryOptions,
      deriveFields: (option) => ({ category: option.label }),
      onCreateOption: (name) => onCreateCategory(name),
    },
  ];
}

// Custo é dado sensível — rep nunca vê, só admin/manager (mesma regra de Ativos/EPIs).
function buildBaseColumns(showValue: boolean): Column<License>[] {
  const columns: Column<License>[] = [
    {
      key: "name",
      header: "Assinatura",
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    { key: "vendor", header: "Fornecedor", cell: (row) => muted(row.vendor) },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={effectiveLicenseStatus(row)} />,
    },
    {
      key: "renewal",
      header: "Renovação",
      cell: (row) => <span className="tabular">{formatDate(row.renewal_date)}</span>,
    },
  ];
  if (showValue) {
    columns.push({
      key: "cost",
      header: "Custo",
      align: "right",
      cell: (row) => (
        <span className="tabular">
          {formatCurrency(row.cost)}
          {billingPeriodLabel[row.billing_period]}
        </span>
      ),
    });
  }
  return columns;
}

/**
 * "Responsável" (quem tem a assinatura) vive em `license_assignments`, tabela admin-only no
 * gateway (Pedido 3 do TODO-LICENSES-DASHBOARD.md: "rep ou manager não deve saber disso jamais").
 * Por isso a coluna, o campo do formulário e o item do detalhe só existem quando `isAdmin(role)`
 * — pra qualquer outro papel, o dado nem é buscado (evita um 403 previsível na tela).
 */
export function LicensesScreen() {
  const { role } = useAuth();
  const admin = isAdmin(role);
  const showValue = canManageCatalog(role);
  const readOnly = !showValue;
  const queryClient = useQueryClient();

  const { data: assignments = [] } = useListQuery({
    queryKey: ["license_assignments", "list"],
    queryFn: listLicenseAssignments,
    enabled: admin,
  });
  const { data: users = [] } = useListQuery({
    queryKey: usersLiteListQueryKey,
    queryFn: listUsersLite,
    enabled: admin,
  });
  const { data: departments = [] } = useListQuery({
    queryKey: ["departments", "list"],
    queryFn: listDepartments,
  });
  const { options: categoryOptions, createOption: createCategoryOption } =
    useCategoryOptions("license");

  const assigneeByLicense = useMemo(
    () => new Map(assignments.map((a) => [a.license_id, a.assignee])),
    [assignments],
  );
  const userOptions = useMemo(
    () =>
      sortOptionsByLabel(
        users.map((user) => ({ value: user.id, label: user.name ?? user.email })),
      ),
    [users],
  );
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
  const baseFields = useMemo(
    () =>
      buildBaseFields(
        categoryOptions,
        createCategoryOption,
        departmentOptions,
        createDepartmentOption,
      ),
    [categoryOptions, createCategoryOption, departmentOptions, createDepartmentOption],
  );

  const baseColumns = buildBaseColumns(showValue);
  const columns: Column<License>[] = admin
    ? [
        ...baseColumns.slice(0, 2),
        {
          key: "assignee",
          header: "Responsável",
          cell: (row) => muted(assigneeByLicense.get(row.id)),
        },
        ...baseColumns.slice(2),
      ]
    : baseColumns;

  const createFields: FormFieldDef[] = admin
    ? [
        ...baseFields,
        {
          name: "assignee_id",
          label: "Responsável",
          type: "select",
          placeholder: "Sem responsável",
          options: userOptions,
          deriveFields: (option) => ({ assignee: option.label }),
        },
      ]
    : baseFields;

  // Cria/atualiza/remove a linha de license_assignments correspondente — no-op pra quem não é
  // admin (o campo nem existe no formulário nesse caso). Select limpo (sem opção escolhida) com
  // atribuição existente remove o vínculo, em vez de deixar um assignee_id órfão pra trás.
  const syncAssignment = async (licenseId: string, assigneeId: unknown, assignee: unknown) => {
    if (!admin) return;
    const existing = assignments.find((a) => a.license_id === licenseId);
    if (typeof assigneeId === "string" && assigneeId) {
      const patch = { assignee_id: assigneeId, assignee: assignee as string };
      await (existing
        ? updateLicenseAssignment(existing.id, patch)
        : createLicenseAssignment({ license_id: licenseId, ...patch }));
    } else if (existing) {
      await removeLicenseAssignment(existing.id);
    }
    await queryClient.invalidateQueries({ queryKey: ["license_assignments", "list"] });
  };

  const handleCreate = async (values: Record<string, unknown>) => {
    const { assignee_id: assigneeId, assignee, ...licenseValues } = values;
    const license = await createLicense(licenseValues as Partial<License>);
    await syncAssignment(license.id, assigneeId, assignee);
    return license;
  };

  const handleUpdate = async (id: string, values: Record<string, unknown>) => {
    const { assignee_id: assigneeId, assignee, ...licenseValues } = values;
    const license = await updateLicense(id, licenseValues as Partial<License>);
    await syncAssignment(id, assigneeId, assignee);
    return license;
  };

  return (
    <ResourcePage
      title="Assinaturas"
      description="Assinaturas e licenças de software centralizadas: custo, periodicidade e responsável."
      resource="licenses"
      list={listLicenses}
      statusOf={effectiveLicenseStatus}
      createLabel="Nova assinatura"
      createFields={createFields}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={(id) => removeLicense(id)}
      editInitialValues={(row) => {
        const existing = assignments.find((a) => a.license_id === row.id);
        return {
          ...row,
          assignee_id: existing?.assignee_id ?? "",
          assignee: existing?.assignee ?? "",
        };
      }}
      statusOptions={statusOptions}
      rangeFilters={buildRangeFilters(showValue)}
      columns={columns}
      readOnly={readOnly}
      detail={(row) => ({
        title: row.name,
        subtitle: `${row.vendor ?? "—"} · ${row.owner_department ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "Status", value: <StatusBadge status={effectiveLicenseStatus(row)} /> },
              {
                label: "Periodicidade",
                value:
                  billingPeriodOptions.find((o) => o.value === row.billing_period)?.label ?? "—",
              },
              { label: "Renovação", value: formatDate(row.renewal_date) },
              ...(showValue
                ? [
                    {
                      label: "Custo",
                      value: `${formatCurrency(row.cost)}${billingPeriodLabel[row.billing_period]}`,
                    },
                  ]
                : []),
              { label: "Departamento", value: row.owner_department ?? "—" },
              ...(admin
                ? [{ label: "Responsável", value: assigneeByLicense.get(row.id) ?? "—" }]
                : []),
            ]}
          />
        ),
      })}
    />
  );
}
