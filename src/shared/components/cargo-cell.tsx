import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComboboxField } from "@/shared/components/resource-form-dialog";
import { listUsersLite, updateUserCargo, usersLiteListQueryKey } from "@/lib/data/users-lite.repo";
import { listPpeRequirements } from "@/lib/data/ppe-requirements.repo";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { getErrorMessage } from "@/shared/utils/errors";
import { toast } from "sonner";

/** Shape mínimo que `CargoCell` precisa da linha — cabe tanto em `AdminUserSummary`
 * (`auth.listUsers()`, usado em `/users`, admin-only) quanto em `UserLite`
 * (`listUsersLite()`, usado em `/cargo`, admin+manager). */
export interface CargoCellUser {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "manager" | "rep" | null;
}

/**
 * Cargo do usuário (ex.: "Técnica de Segurança") — additionalField do Better-Auth
 * (`dev-gateway/src/auth.ts`), editado via `/data/users_lite` (extensão de gateway própria, não
 * é `employees` — ver TODO-MERGE-COLABORADOR-USUARIO.md). Combobox criável (mesmo componente de
 * categoria/departamento — `ComboboxField`), não um `Select` fechado: sugere os `function_name`
 * de `ppe_requirements` (evita erro de digitação que quebraria o match de EPI exigido), mas
 * permite digitar um cargo novo — sem isso, um tenant sem nenhum requisito de EPI cadastrado
 * ainda ficaria travado, sem conseguir definir o primeiro cargo de ninguém.
 *
 * Admin não é gerenciável por aqui (mesma regra de `UserRoleCell` em `UsersScreen.tsx`) — nem o
 * cargo dele é editável por manager; `users-lite-routes.ts` bloqueia isso no servidor também.
 *
 * Compartilhado entre `/users` (admin, tela completa com papel de acesso) e `/cargo` (admin +
 * manager, só cargo — manager não alcança `/users`, que depende do plugin admin do Better-Auth,
 * admin-only de verdade no servidor).
 */
export function CargoCell({ user }: { user: CargoCellUser }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: usersLite = [] } = useListQuery({
    queryKey: usersLiteListQueryKey,
    queryFn: listUsersLite,
  });
  const { data: requirements = [] } = useListQuery({
    queryKey: ["ppe_requirements", "list"],
    queryFn: listPpeRequirements,
  });

  const cargo = useMemo(
    () => usersLite.find((candidate) => candidate.id === user.id)?.cargo ?? null,
    [usersLite, user.id],
  );
  const cargoOptions = useMemo(() => {
    const names = new Set(requirements.map((requirement) => requirement.function_name));
    if (cargo) names.add(cargo);
    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ value: name, label: name }));
  }, [requirements, cargo]);

  if (user.role === "admin") {
    return <span className="text-muted-foreground">—</span>;
  }

  const changeCargo = async (nextCargo: string | null) => {
    if (nextCargo === cargo) return;
    setSaving(true);
    try {
      await updateUserCargo(user.id, nextCargo);
      await queryClient.invalidateQueries({ queryKey: usersLiteListQueryKey });
      toast.success(
        nextCargo
          ? `Cargo de ${user.name ?? user.email} atualizado.`
          : `Cargo de ${user.name ?? user.email} removido.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível atualizar o cargo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="w-[200px]">
        <ComboboxField
          value={cargo ?? ""}
          options={cargoOptions}
          placeholder="Sem cargo"
          onSelect={(option) => changeCargo(option.value)}
          onCreateOption={async (inputValue) => ({ value: inputValue, label: inputValue })}
        />
      </div>
      {saving ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        cargo && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
            onClick={() => changeCargo(null)}
            title="Remover cargo"
          >
            <X className="size-3.5" />
          </Button>
        )
      )}
    </div>
  );
}
