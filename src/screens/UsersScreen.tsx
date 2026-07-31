import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourcePage } from "@/shared/components/resource-page";
import { ResourceFormDialog } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { auth, type AdminUserSummary } from "@/lib/data/client";
import {
  createEmployee,
  listEmployees,
  employeesListQueryKey,
  type Employee,
} from "@/lib/data/employees.repo";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { useDepartmentOptions } from "@/shared/hooks/use-department-options";
import { findEmployeeByEmail } from "@/shared/utils/find-employee-by-email";
import { buildCreateFields } from "./EmployeesScreen";
import { useAuth } from "@/lib/auth";
import { getErrorMessage } from "@/shared/utils/errors";
import { toast } from "sonner";

const USERS_RESOURCE = "admin-users";

const PROMOTABLE_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "rep", label: "Rep" },
] as const;

/**
 * Troca o papel de UM usuário (rep↔manager). Componente próprio (não uma célula inline) porque
 * precisa do próprio estado de "salvando" — uma linha em trânsito não pode travar a tabela toda.
 */
function UserRoleCell({ user }: { user: AdminUserSummary }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [saving, setSaving] = useState(false);

  // Admin não é promovível/rebaixável por aqui — nem o admin logado, nem qualquer outro. Evita
  // autopromoção/autorebaixamento por engano e o risco de o tenant ficar sem nenhum admin.
  if (user.role === "admin") {
    return (
      <Badge variant="secondary" className="font-normal">
        Admin
      </Badge>
    );
  }

  if (user.role === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  const changeRole = async (nextRole: string) => {
    if (nextRole === user.role) return;
    setSaving(true);
    try {
      await auth.setRole(user.id, nextRole as "manager" | "rep");
      await queryClient.invalidateQueries({ queryKey: [USERS_RESOURCE, "list"] });
      toast.success(
        user.id === currentUser?.id
          ? "Seu papel foi atualizado."
          : `Papel de ${user.name ?? user.email} atualizado.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível trocar o papel."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={user.role} onValueChange={changeRole} disabled={saving}>
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROMOTABLE_ROLES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saving && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
    </div>
  );
}

/**
 * "Usuário" (esta tela) é o login/credencial — controla quem entra e o papel de acesso
 * (admin/manager/rep). "Colaborador" (`/employees`) é o diretório de RH — controla quem pode
 * receber ativos/EPIs, com cargo e departamento. São tabelas diferentes, ligadas só pelo e-mail
 * batendo (case-insensitive, sem FK) — criar um não cria o outro. Esta célula deixa o vínculo
 * visível e, quando falta, oferece o atalho de cadastro em vez de forçar ir em Colaboradores e
 * digitar o e-mail de novo.
 */
function LinkedEmployeeCell({ user }: { user: AdminUserSummary }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: employees = [] } = useListQuery({
    queryKey: employeesListQueryKey,
    queryFn: listEmployees,
  });
  const { options: departmentOptions, createOption: createDepartmentOption } =
    useDepartmentOptions();
  const employee = useMemo(
    () => findEmployeeByEmail(employees, user.email),
    [employees, user.email],
  );
  const fields = useMemo(
    () => buildCreateFields(departmentOptions, createDepartmentOption),
    [departmentOptions, createDepartmentOption],
  );

  if (employee) {
    return <span className="text-sm">{employee.name}</span>;
  }

  const handleCreate = async (values: Record<string, unknown>) => {
    await createEmployee(values as Partial<Employee>);
    await queryClient.invalidateQueries({ queryKey: employeesListQueryKey });
    toast.success("Colaborador cadastrado.");
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
        <UserPlus className="size-3.5" /> Cadastrar
      </Button>
      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Cadastrar como colaborador"
        description={`Cria o registro de RH pra ${user.email} — o vínculo com este login é pelo e-mail.`}
        fields={fields}
        initialValues={{ name: user.name ?? "", email: user.email }}
        submitLabel="Cadastrar"
        onSubmit={handleCreate}
      />
    </>
  );
}

const columns: Column<AdminUserSummary>[] = [
  {
    key: "name",
    header: "Nome",
    cell: (row) => <span className="font-medium">{row.name ?? "—"}</span>,
  },
  { key: "email", header: "E-mail", cell: (row) => row.email },
  { key: "role", header: "Papel de acesso", cell: (row) => <UserRoleCell user={row} /> },
  { key: "employee", header: "Colaborador", cell: (row) => <LinkedEmployeeCell user={row} /> },
];

export function UsersScreen() {
  return (
    <ResourcePage
      title="Usuários"
      description="Login e papel de acesso ao sistema — diferente de Colaboradores (diretório de RH); os dois se ligam pelo e-mail. Busque por nome e promova alguém a manager. Admin não é gerenciável por aqui."
      resource={USERS_RESOURCE}
      list={() => auth.listUsers().then((response) => response.users)}
      columns={columns}
      searchPlaceholder="Buscar por nome…"
      readOnly
      retry={false}
      errorTitle="Endpoint de administração indisponível"
      errorDescription={
        'O gateway ainda não confirmou "/api/auth/admin/list-users" — nada foi alterado no banco. ' +
        "Detalhes e como verificar em GATEWAY-ADMIN-ENDPOINTS.md, na raiz do repo."
      }
    />
  );
}
