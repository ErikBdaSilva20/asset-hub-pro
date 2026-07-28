import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/12 text-warning",
        danger: "border-destructive/25 bg-destructive/10 text-destructive",
        info: "border-info/25 bg-info/10 text-info",
        primary: "border-primary/25 bg-primary/10 text-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type StatusTone = NonNullable<VariantProps<typeof badge>["tone"]>;

const registry: Record<string, { label: string; tone: StatusTone }> = {
  available: { label: "Disponível", tone: "success" },
  in_use: { label: "Em uso", tone: "info" },
  maintenance: { label: "Manutenção", tone: "warning" },
  reserved: { label: "Reservado", tone: "primary" },
  retired: { label: "Baixado", tone: "neutral" },
  lost: { label: "Extraviado", tone: "danger" },
  new: { label: "Novo", tone: "success" },
  good: { label: "Bom", tone: "info" },
  fair: { label: "Regular", tone: "warning" },
  damaged: { label: "Danificado", tone: "danger" },
  active: { label: "Ativo", tone: "success" },
  on_leave: { label: "Afastado", tone: "warning" },
  offboarded: { label: "Desligado", tone: "neutral" },
  expiring: { label: "Vencendo", tone: "warning" },
  expired: { label: "Vencido", tone: "danger" },
  unassigned: { label: "Sem alocação", tone: "neutral" },
  valid: { label: "Válido", tone: "success" },
  scheduled: { label: "Agendada", tone: "info" },
  in_progress: { label: "Em execução", tone: "primary" },
  done: { label: "Concluída", tone: "success" },
  late: { label: "Atrasada", tone: "danger" },
  planned: { label: "Planejada", tone: "info" },
  running: { label: "Em andamento", tone: "primary" },
  closed: { label: "Encerrada", tone: "neutral" },
  checkout: { label: "Entrega", tone: "info" },
  checkin: { label: "Devolução", tone: "success" },
  transfer: { label: "Transferência", tone: "primary" },
  disposal: { label: "Descarte", tone: "danger" },
  preventive: { label: "Preventiva", tone: "info" },
  corrective: { label: "Corretiva", tone: "warning" },
};

export function statusLabel(status: string) {
  return registry[status]?.label ?? status;
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const entry = registry[status] ?? { label: status, tone: "neutral" as StatusTone };
  return (
    <span className={cn(badge({ tone: entry.tone }), className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {entry.label}
    </span>
  );
}
