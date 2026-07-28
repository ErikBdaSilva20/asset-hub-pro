import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  delta?: number;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, hint, delta, icon: Icon, className }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const DeltaIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={cn("panel flex flex-col gap-3 p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="tabular text-2xl font-semibold tracking-tight">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-success" : "text-destructive",
            )}
          >
            <DeltaIcon className="size-3" />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  total,
  tone = "primary",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "primary" | "warning" | "destructive" | "success";
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const toneClass = {
    primary: "bg-primary",
    warning: "bg-warning",
    destructive: "bg-destructive",
    success: "bg-success",
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-medium">
          {value}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", toneClass)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
