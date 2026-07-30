import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createLicense,
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
import { listEmployees, employeesListQueryKey } from "@/lib/data/employees.repo";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useAuth } from "@/lib/auth";
import { canManageCatalog, isAdmin } from "@/shared/utils/permissions";

const muted = (value: string | null | undefined) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

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

const baseFields: FormFieldDef[] = [
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
  { name: "owner_department", label: "Departamento" },
  { name: "category", label: "Categoria" },
];

const baseColumns: Column<License>[] = [
  {
    key: "name",
    header: "Assinatura",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "vendor", header: "Fornecedor", cell: (row) => muted(row.vendor) },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  {
    key: "renewal",
    header: "Renovação",
    cell: (row) => <span className="tabular">{formatDate(row.renewal_date)}</span>,
  },
  {
    key: "cost",
    header: "Custo",
    align: "right",
    cell: (row) => (
      <span className="tabular">
        {formatCurrency(row.cost)}
        {billingPeriodLabel[row.billing_period]}
      </span>
    ),
  },
];

/**
 * "Responsável" (quem tem a assinatura) vive em `license_assignments`, tabela admin-only no
 * gateway (Pedido 3 do TODO-LICENSES-DASHBOARD.md: "rep ou manager não deve saber disso jamais").
 * Por isso a coluna, o campo do formulário e o item do detalhe só existem quando `isAdmin(role)`
 * — pra qualquer outro papel, o dado nem é buscado (evita um 403 previsível na tela).
 */
export function LicensesScreen() {
  const { role } = useAuth();
  const admin = isAdmin(role);
  const readOnly = !canManageCatalog(role);
  const queryClient = useQueryClient();

  const { data: assignments = [] } = useQuery({
    queryKey: ["license_assignments", "list"],
    queryFn: listLicenseAssignments,
    enabled: admin,
  });
  const { data: employees = [] } = useQuery({
    queryKey: employeesListQueryKey,
    queryFn: listEmployees,
    enabled: admin,
  });

  const assigneeByLicense = useMemo(
    () => new Map(assignments.map((a) => [a.license_id, a.assignee])),
    [assignments],
  );
  const employeeOptions = useMemo(
    () => employees.map((employee) => ({ value: employee.id, label: employee.name })),
    [employees],
  );

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
          options: employeeOptions,
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
      statusOf={(row) => row.status}
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
      columns={columns}
      readOnly={readOnly}
      detail={(row) => ({
        title: row.name,
        subtitle: `${row.vendor ?? "—"} · ${row.owner_department ?? "—"}`,
        content: (
          <DetailGrid
            items={[
              { label: "Status", value: <StatusBadge status={row.status} /> },
              {
                label: "Periodicidade",
                value:
                  billingPeriodOptions.find((o) => o.value === row.billing_period)?.label ?? "—",
              },
              { label: "Renovação", value: formatDate(row.renewal_date) },
              {
                label: "Custo",
                value: `${formatCurrency(row.cost)}${billingPeriodLabel[row.billing_period]}`,
              },
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
