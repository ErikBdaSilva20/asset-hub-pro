import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, KeyRound, ShieldAlert, Wrench } from "lucide-react";
import { listAssets, type Asset } from "@/lib/data/assets.repo";
import { listEmployees } from "@/lib/data/employees.repo";
import { listLicenses } from "@/lib/data/licenses.repo";
import { listMaintenanceOrders } from "@/lib/data/maintenance.repo";
import { listMovements } from "@/lib/data/movements.repo";
import { listPpeRequirements } from "@/lib/data/ppe-requirements.repo";
import { listPpes } from "@/lib/data/ppes.repo";
import { StatusBadge } from "@/shared/components/status-badge";
import { UserChip } from "@/shared/components/avatar-group";
import { daysUntil, formatCurrency, formatDate, formatRelative } from "@/shared/utils/format";

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
  const { data: movements = [] } = useQuery({
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
  const { data: movements = [] } = useQuery({
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

/**
 * "Quem está com o quê" — agrupa `assets` por `assignee_id` (qualquer tipo: notebook, móvel,
 * veículo... EPI fica de fora de propósito, mora em `ppes` e é uso individual, não faz sentido
 * listar como "patrimônio na mão de alguém"). Ao lado de cada colaborador, mostra o EPI que a
 * função dele exige (`ppe_requirements`, casado por texto com `employees.role`) — só a lista do
 * que é exigido, sem cruzar com o que já foi entregue (ver docs/rbac-papeis.md pra outras
 * decisões desse tipo neste projeto).
 */
export function AssignedEquipmentPanel() {
  const { data: assets = [] } = useQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees", "list"],
    queryFn: listEmployees,
  });
  const { data: requirements = [] } = useQuery({
    queryKey: ["ppe_requirements", "list"],
    queryFn: listPpeRequirements,
  });

  const holders = useMemo(() => {
    const assetsByEmployeeId = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (!asset.assignee_id) continue;
      const held = assetsByEmployeeId.get(asset.assignee_id) ?? [];
      held.push(asset);
      assetsByEmployeeId.set(asset.assignee_id, held);
    }

    return employees
      .map((employee) => ({ employee, assets: assetsByEmployeeId.get(employee.id) ?? [] }))
      .filter((entry) => entry.assets.length > 0)
      .sort((a, b) => b.assets.length - a.assets.length)
      .slice(0, 6);
  }, [assets, employees]);

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
      <PanelHeader title="Quem está com o quê" to="/employees" />
      <ul className="divide-y divide-border">
        {holders.map(({ employee, assets: heldAssets }) => {
          const requiredPpe = requiredPpeByFunction.get(employee.role.trim().toLowerCase());
          const shown = heldAssets.slice(0, 4);
          const extra = heldAssets.length - shown.length;

          return (
            <li key={employee.id} className="px-4 py-3">
              <UserChip name={employee.name} subtitle={employee.role} />
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
  const { data: assets = [] } = useQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: licenses = [] } = useQuery({
    queryKey: ["licenses", "list"],
    queryFn: listLicenses,
  });
  const { data: ppes = [] } = useQuery({ queryKey: ["ppes", "list"], queryFn: listPpes });

  const warranties = assets
    .filter((asset) => {
      const days = daysUntil(asset.warranty_until);
      return days !== null && days > 0 && days < 120;
    })
    .slice(0, 4);

  const expiringLicenses = licenses.filter((license) => license.status !== "active").slice(0, 3);
  const expiringPpe = ppes.filter((ppe) => ppe.status !== "valid").slice(0, 3);

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
              status={license.status}
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
              status={ppe.status}
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
  const { data: licenses = [] } = useQuery({
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
  const { data: maintenanceOrders = [] } = useQuery({
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
