import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourcePage } from "@/shared/components/resource-page";
import type { Column } from "@/shared/components/data-table";
import { auth, type AdminUserSummary } from "@/lib/data/client";
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

const columns: Column<AdminUserSummary>[] = [
  {
    key: "name",
    header: "Nome",
    cell: (row) => <span className="font-medium">{row.name ?? "—"}</span>,
  },
  { key: "email", header: "E-mail", cell: (row) => row.email },
  { key: "role", header: "Papel", cell: (row) => <UserRoleCell user={row} /> },
];

export function UsersScreen() {
  return (
    <ResourcePage
      title="Usuários"
      description="Busque por nome e promova alguém a manager. Admin não é gerenciável por aqui."
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
