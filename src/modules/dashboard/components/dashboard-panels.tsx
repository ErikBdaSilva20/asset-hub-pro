import { Button } from "@/components/ui/button";
import { listAssets, updateAsset, type Asset } from "@/lib/data/assets.repo";
import { listUsersLite, usersLiteListQueryKey, type UserLite } from "@/lib/data/users-lite.repo";
import { effectiveLicenseStatus, listLicenses } from "@/lib/data/licenses.repo";
import { listMaintenanceOrders } from "@/lib/data/maintenance.repo";
import { listMovements, type Movement } from "@/lib/data/movements.repo";
import { listPpeRequirements } from "@/lib/data/ppe-requirements.repo";
import { effectivePpeStatus, listPpes } from "@/lib/data/ppes.repo";
import { UserChip } from "@/shared/components/avatar-group";
import { StatusBadge } from "@/shared/components/status-badge";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { findByNameCaseInsensitive } from "@/shared/utils/find-by-name";
import {
  EXPIRING_SOON_DAYS,
  daysUntil,
  formatCurrency,
  formatDate,
  formatRelative,
} from "@/shared/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  CalendarClock,
  KeyRound,
  Loader2,
  ShieldAlert,
  Undo2,
  Wrench,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

function PanelHeader({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Link to={to} className="flex items-center gap-1 text-xs text-primary hover:underline">
        Ver tudo <ArrowUpRight className="size-3" />
      </Link>
    </div>
  );
}

function recentMovements<T extends { occurred_at: string }>(movements: T[], limit: number): T[] {
  return [...movements]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, limit);
}

export function RecentMovements() {
  const { data: movements = [] } = useListQuery({
    queryKey: ["movements", "list"],
    queryFn: listMovements,
  });
  const recent = recentMovements(movements, 6);

  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Últimas movimentações" to="/movements" />
      <ul className="divide-y divide-border">
        {recent.map((movement) => (
          <li key={movement.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{movement.asset_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                <span className="font-mono">{movement.asset_tag}</span> · {movement.from_label} →{" "}
                {movement.to_label}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={movement.type} />
              <span className="w-16 text-right text-xs text-muted-foreground">
                {formatRelative(movement.occurred_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ACTIVITY_VERBS: Record<string, string> = {
  checkout: "entregou",
  checkin: "devolveu",
  transfer: "transferiu",
  maintenance: "enviou p/ manutenção",
  disposal: "descartou",
};

export function RecentActivity() {
  const { data: movements = [] } = useListQuery({
    queryKey: ["movements", "list"],
    queryFn: listMovements,
  });
  const recent = recentMovements(movements, 6);

  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Atividades recentes" to="/movements" />
      <ul className="divide-y divide-border">
        {recent.map((movement) => (
          <li key={movement.id} className="flex items-center justify-between gap-3 px-4 py-2">
            <UserChip
              name={movement.performed_by ?? "—"}
              subtitle={`${ACTIVITY_VERBS[movement.type] ?? movement.type} ${movement.asset_tag ?? ""}`}
            />
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelative(movement.occurred_at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PendingHandoff {
  asset: Asset;
  movement: Movement;
  /** "clear" = devolveu, ninguém fica com o ativo. "assign" = peguei/repassei, alguém fica. */
  action: "clear" | "assign";
  targetUser?: UserLite;
}

/**
 * O rep não tem permissão de escrita em `assets` (lookup, admin/manager only) — o "Avisar
 * movimentação" dele (`RepDashboardPage`) só grava a intenção em `movements`, sem mudar quem
 * está com o ativo de verdade. Esta função acha, pra cada ativo, a movimentação mais recente de
 * custódia (`checkout`/`checkin`/`transfer`) e compara o que ela implica contra o
 * `assignee_id` atual — se não bate, é um aviso ainda não confirmado.
 *
 * Só conta movimentação com `occurred_at` **depois** de `asset.updated_at` — sem isso, todo
 * histórico antigo (inclusive o de seed, com datas passadas aleatórias) entra na conta: como
 * `movements` nunca sincronizou com `assets` (nem quando o admin loga pela tela cheia), é
 * esperado que a última movimentação de um ativo qualquer não bata com o estado atual, mesmo que
 * já esteja tudo certo — não é "pendente", é só histórico. Só o que aconteceu DEPOIS da última
 * vez que o ativo foi tocado é sinal de verdade de algo ainda não reconciliado.
 */
function derivePendingHandoffs(
  assets: Asset[],
  movements: Movement[],
  users: UserLite[],
): PendingHandoff[] {
  const latestByAsset = new Map<string, Movement>();
  for (const movement of movements) {
    if (
      movement.type !== "checkout" &&
      movement.type !== "checkin" &&
      movement.type !== "transfer"
    ) {
      continue;
    }
    const current = latestByAsset.get(movement.asset_id);
    if (!current || new Date(movement.occurred_at) > new Date(current.occurred_at)) {
      latestByAsset.set(movement.asset_id, movement);
    }
  }

  const pending: PendingHandoff[] = [];
  for (const asset of assets) {
    const movement = latestByAsset.get(asset.id);
    if (!movement) continue;
    if (new Date(movement.occurred_at) <= new Date(asset.updated_at)) continue;

    if (movement.type === "checkin") {
      if (asset.assignee_id) pending.push({ asset, movement, action: "clear" });
      continue;
    }

    if (!movement.to_label) continue;
    const targetUser = findByNameCaseInsensitive(
      users,
      movement.to_label,
      (u) => u.name ?? u.email,
    );
    if (targetUser && asset.assignee_id !== targetUser.id) {
      pending.push({ asset, movement, action: "assign", targetUser });
    }
  }
  return pending;
}

/**
 * Some sozinho da tela quando não há nada pendente — é um painel de "ação necessária", não faz
 * sentido ocupar espaço permanente no dashboard do admin/manager mostrando "tudo em dia".
 */
export function PendingHandoffsPanel() {
  const queryClient = useQueryClient();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: movements = [] } = useListQuery({
    queryKey: ["movements", "list"],
    queryFn: listMovements,
  });
  const { data: users = [] } = useListQuery({
    queryKey: usersLiteListQueryKey,
    queryFn: listUsersLite,
  });

  const pending = useMemo(
    () => derivePendingHandoffs(assets, movements, users),
    [assets, movements, users],
  );

  if (pending.length === 0) return null;

  const apply = async (item: PendingHandoff) => {
    setApplyingId(item.asset.id);
    try {
      const patch =
        item.action === "clear"
          ? { assignee_id: null, assignee: null, status: "available" as const }
          : {
              assignee_id: item.targetUser!.id,
              assignee: item.targetUser!.name ?? item.targetUser!.email,
              status: "in_use" as const,
            };
      await updateAsset(item.asset.id, patch);
      await queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="panel mb-4 overflow-hidden border-2 border-warning/40">
      <div className="flex items-center gap-3 border-b border-border bg-warning/5 px-4 py-3">
        <Undo2 className="size-5 shrink-0 text-warning" />
        <div>
          <h3 className="text-sm font-semibold">Movimentações aguardando confirmação</h3>
          <p className="text-xs text-muted-foreground">
            Um colaborador avisou que pegou, devolveu ou repassou algo — confirme pra atualizar o
            responsável de verdade.
          </p>
        </div>
      </div>
      {/* max-h + overflow-y-auto: sem isso, uma lista grande empurra o resto do dashboard pra
          baixo em vez de rolar dentro do próprio card. */}
      <ul className="max-h-80 divide-y divide-border overflow-y-auto">
        {pending.map((item) => (
          <li
            key={item.movement.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.asset.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.movement.performed_by ?? "—"} ·{" "}
                {ACTIVITY_VERBS[item.movement.type] ?? item.movement.type} · agora fica{" "}
                {item.action === "clear"
                  ? "sem responsável"
                  : `com ${item.targetUser!.name ?? item.targetUser!.email}`}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={applyingId === item.asset.id}
              onClick={() => apply(item)}
            >
              {applyingId === item.asset.id && <Loader2 className="size-3.5 animate-spin" />}
              Aplicar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Quem está com o quê" — agrupa `assets` por `assignee_id` (qualquer tipo: notebook, móvel,
 * veículo... EPI fica de fora de propósito, mora em `ppes` e é uso individual, não faz sentido
 * listar como "patrimônio na mão de alguém"). Ao lado de cada usuário, mostra o EPI que o cargo
 * dele exige (`ppe_requirements`, casado por texto com `user.cargo`) — só a lista do que é
 * exigido, sem cruzar com o que já foi entregue (ver docs/rbac-papeis.md pra outras decisões
 * desse tipo neste projeto).
 */
export function AssignedEquipmentPanel() {
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: users = [] } = useListQuery({
    queryKey: usersLiteListQueryKey,
    queryFn: listUsersLite,
  });
  const { data: requirements = [] } = useListQuery({
    queryKey: ["ppe_requirements", "list"],
    queryFn: listPpeRequirements,
  });

  const holders = useMemo(() => {
    const assetsByUserId = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.assignee_id) continue;
      const held = assetsByUserId.get(asset.assignee_id) ?? [];
      held.push(asset);
      assetsByUserId.set(asset.assignee_id, held);
    }

    return users
      .map((user) => ({ user, assets: assetsByUserId.get(user.id) ?? [] }))
      .filter((entry) => entry.assets.length > 0)
      .sort((a, b) => b.assets.length - a.assets.length)
      .slice(0, 3);
  }, [assets, users]);

  const requiredPpeByFunction = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const requirement of requirements) {
      const key = requirement.function_name.trim().toLowerCase();
      const list = map.get(key) ?? [];
      list.push(requirement.ppe_name);
      map.set(key, list);
    }
    return map;
  }, [requirements]);

  return (
    <div className="panel overflow-hidden">
      {/* /cargo (não /users) — é a tela que admin e manager acessam; /users é admin-only de
          verdade (plugin admin do Better-Auth). /cargo mostra a mesma ficha completa (inclusive
          assinaturas pro admin, ver CargoScreen.tsx). */}
      <PanelHeader title="Quem está com o quê" to="/cargo" />
      <ul className="divide-y divide-border">
        {holders.map(({ user, assets: heldAssets }) => {
          // Sem cargo definido não deve casar com uma linha de ppe_requirements que porventura
          // tenha function_name vazio — não é "a mesma função", é "nenhuma função ainda".
          const requiredPpe = user.cargo
            ? requiredPpeByFunction.get(user.cargo.trim().toLowerCase())
            : undefined;
          const shown = heldAssets.slice(0, 4);
          const extra = heldAssets.length - shown.length;

          return (
            <li key={user.id} className="px-4 py-3">
              <UserChip name={user.name ?? user.email} subtitle={user.cargo ?? undefined} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {shown.map((asset) => (
                  <span
                    key={asset.id}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {asset.name}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                    +{extra}
                  </span>
                )}
              </div>
              {requiredPpe && requiredPpe.length > 0 && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldAlert className="size-3 shrink-0" />
                  EPI exigido: {requiredPpe.join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ExpiringPanel() {
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: licenses = [] } = useListQuery({
    queryKey: ["licenses", "list"],
    queryFn: listLicenses,
  });
  const { data: ppes = [] } = useListQuery({ queryKey: ["ppes", "list"], queryFn: listPpes });

  // Mesma regra de "vencendo" (EXPIRING_SOON_DAYS, 1 mês) usada em Assinaturas e EPIs — antes
  // este painel usava 120 dias só pra garantia, um limiar solto que não batia com o resto do
  // sistema.
  const warranties = assets
    .filter((asset) => {
      const days = daysUntil(asset.warranty_until);
      return days !== null && days >= 0 && days <= EXPIRING_SOON_DAYS;
    })
    .slice(0, 4);

  const expiringLicenses = licenses
    .filter((license) => ["expiring", "expired"].includes(effectiveLicenseStatus(license)))
    .slice(0, 3);
  const expiringPpe = ppes
    .filter((ppe) => ["expiring", "expired"].includes(effectivePpeStatus(ppe)))
    .slice(0, 3);

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">Itens vencendo</h3>
        <p className="text-xs text-muted-foreground">
          Garantias, licenças e EPIs com prazo crítico
        </p>
      </div>
      <div className="divide-y divide-border">
        <AlertGroup
          icon={CalendarClock}
          label="Garantias próximas"
          to="/assets"
          count={warranties.length}
        >
          {warranties.map((asset) => (
            <AlertRow
              key={asset.id}
              title={asset.name}
              subtitle={asset.tag}
              value={`${daysUntil(asset.warranty_until)} dias`}
            />
          ))}
        </AlertGroup>
        <AlertGroup icon={KeyRound} label="Licenças" to="/licenses" count={expiringLicenses.length}>
          {expiringLicenses.map((license) => (
            <AlertRow
              key={license.id}
              title={license.name}
              subtitle={license.vendor ?? "—"}
              value={formatDate(license.renewal_date)}
              status={effectiveLicenseStatus(license)}
            />
          ))}
        </AlertGroup>
        <AlertGroup icon={ShieldAlert} label="EPIs" to="/ppe" count={expiringPpe.length}>
          {expiringPpe.map((ppe) => (
            <AlertRow
              key={ppe.id}
              title={ppe.name}
              subtitle={ppe.assignee ?? "—"}
              value={formatDate(ppe.expires_at)}
              status={effectivePpeStatus(ppe)}
            />
          ))}
        </AlertGroup>
      </div>
    </div>
  );
}

function AlertGroup({
  icon: Icon,
  label,
  to,
  count,
  children,
}: {
  icon: typeof CalendarClock;
  label: string;
  /** Link de navegação rápida pra tela cheia do item — some quando o grupo está vazio, não faz
   * sentido oferecer atalho pra uma lista sem nada. */
  to?: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Icon className="size-3.5" /> {label}
        </p>
        {to && count > 0 && (
          <Link
            to={to}
            className="flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
          >
            Ver tudo <ArrowUpRight className="size-3" />
          </Link>
        )}
      </div>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function AlertRow({
  title,
  subtitle,
  value,
  status,
}: {
  title: string;
  subtitle: string;
  value: string;
  status?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm">{title}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status && <StatusBadge status={status} />}
        <span className="tabular text-xs text-muted-foreground">{value}</span>
      </div>
    </li>
  );
}

const BILLING_PERIOD_SUFFIX: Record<string, string> = { monthly: "/mês", annual: "/ano" };

export function ActiveSubscriptions() {
  const { data: licenses = [] } = useListQuery({
    queryKey: ["licenses", "list"],
    queryFn: listLicenses,
  });
  const active = licenses.filter((license) => license.status !== "expired").slice(0, 5);

  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Assinaturas ativas" to="/licenses" />
      <ul className="divide-y divide-border">
        {active.map((license) => (
          <li key={license.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{license.name}</p>
              <p className="truncate text-xs text-muted-foreground">{license.vendor ?? "—"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={license.status} />
              <span className="tabular w-24 text-right text-xs text-muted-foreground">
                {formatCurrency(license.cost)}
                {BILLING_PERIOD_SUFFIX[license.billing_period] ?? ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MaintenanceQueue() {
  const { data: maintenanceOrders = [] } = useListQuery({
    queryKey: ["maintenance_orders", "list"],
    queryFn: listMaintenanceOrders,
  });
  const queue = maintenanceOrders.filter((order) => order.status !== "done").slice(0, 5);

  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Fila de manutenção" to="/maintenance" />
      <ul className="divide-y divide-border">
        {queue.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.asset_name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {order.code} · {order.asset_tag}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="tabular w-16 text-right text-xs text-muted-foreground">
                {formatDate(order.due_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
