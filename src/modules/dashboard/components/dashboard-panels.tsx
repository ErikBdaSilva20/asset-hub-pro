import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, KeyRound, ShieldAlert, Wrench } from "lucide-react";
import { activity, licenses, maintenanceOrders, movements, ppes, assets } from "@/mock";
import { StatusBadge } from "@/shared/components/status-badge";
import { MetricCard } from "@/shared/components/stat-card";
import { UserChip } from "@/shared/components/avatar-group";
import { daysUntil, formatDate, formatRelative } from "@/shared/utils/format";

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

export function RecentMovements() {
  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Últimas movimentações" to="/movements" />
      <ul className="divide-y divide-border">
        {movements.slice(0, 6).map((movement) => (
          <li key={movement.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{movement.assetName}</p>
              <p className="truncate text-xs text-muted-foreground">
                <span className="font-mono">{movement.assetTag}</span> · {movement.fromLabel} → {movement.toLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={movement.type} />
              <span className="w-16 text-right text-xs text-muted-foreground">{formatRelative(movement.occurredAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentActivity() {
  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Atividades recentes" to="/movements" />
      <ul className="divide-y divide-border">
        {activity.slice(0, 6).map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-2">
            <UserChip name={entry.actor} subtitle={`${entry.action} ${entry.target}`} />
            <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(entry.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExpiringPanel() {
  const warranties = assets
    .filter((asset) => {
      const days = daysUntil(asset.warrantyUntil);
      return days !== null && days > 0 && days < 120;
    })
    .slice(0, 4);

  const expiringLicenses = licenses.filter((license) => license.status !== "active").slice(0, 3);
  const expiringPpe = ppes.filter((ppe) => ppe.status !== "valid").slice(0, 3);

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">Itens vencendo</h3>
        <p className="text-xs text-muted-foreground">Garantias, licenças e EPIs com prazo crítico</p>
      </div>
      <div className="divide-y divide-border">
        <AlertGroup icon={CalendarClock} label="Garantias próximas">
          {warranties.map((asset) => (
            <AlertRow
              key={asset.id}
              title={asset.name}
              subtitle={asset.tag}
              value={`${daysUntil(asset.warrantyUntil)} dias`}
            />
          ))}
        </AlertGroup>
        <AlertGroup icon={KeyRound} label="Licenças">
          {expiringLicenses.map((license) => (
            <AlertRow
              key={license.id}
              title={license.name}
              subtitle={license.vendor}
              value={formatDate(license.renewalDate)}
              status={license.status}
            />
          ))}
        </AlertGroup>
        <AlertGroup icon={ShieldAlert} label="EPIs">
          {expiringPpe.map((ppe) => (
            <AlertRow key={ppe.id} title={ppe.name} subtitle={ppe.assignee} value={formatDate(ppe.expiresAt)} status={ppe.status} />
          ))}
        </AlertGroup>
      </div>
    </div>
  );
}

function AlertGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarClock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" /> {label}
      </p>
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

export function LicenseSeats() {
  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Licenças disponíveis" to="/licenses" />
      <div className="space-y-3 px-4 py-3">
        {licenses.slice(0, 5).map((license) => (
          <MetricCard
            key={license.id}
            label={license.name}
            value={license.seatsUsed}
            total={license.seatsTotal}
            tone={license.seatsUsed / license.seatsTotal > 0.9 ? "warning" : "primary"}
          />
        ))}
      </div>
    </div>
  );
}

export function MaintenanceQueue() {
  const queue = maintenanceOrders
    .filter((order) => order.status !== "done")
    .slice(0, 5);

  return (
    <div className="panel overflow-hidden">
      <PanelHeader title="Fila de manutenção" to="/maintenance" />
      <ul className="divide-y divide-border">
        {queue.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Wrench className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{order.assetName}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{order.code} · {order.assetTag}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={order.status} />
              <span className="tabular w-16 text-right text-xs text-muted-foreground">{formatDate(order.dueAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
