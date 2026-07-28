import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listAssets } from "@/lib/data/assets.repo";
import { listMovements } from "@/lib/data/movements.repo";

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--color-popover-foreground)",
};

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function MovementsChart() {
  const { data: movements = [] } = useQuery({
    queryKey: ["movements", "list"],
    queryFn: listMovements,
  });

  const monthlyMovements = useMemo(() => {
    const buckets = new Map<string, { month: string; entradas: number; saidas: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const cursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(`${cursor.getFullYear()}-${cursor.getMonth()}`, {
        month: MONTH_LABELS[cursor.getMonth()],
        entradas: 0,
        saidas: 0,
      });
    }
    for (const movement of movements) {
      const occurred = new Date(movement.occurred_at);
      const bucket = buckets.get(`${occurred.getFullYear()}-${occurred.getMonth()}`);
      if (!bucket) continue;
      if (movement.type === "checkin") bucket.entradas += 1;
      else if (movement.type === "checkout") bucket.saidas += 1;
    }
    return Array.from(buckets.values());
  }, [movements]);

  return (
    <div className="panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Movimentações por mês</h3>
          <p className="text-xs text-muted-foreground">Entradas e saídas do inventário</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-1" /> Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-2" /> Saídas
          </span>
        </div>
      </div>
      <div className="h-[248px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyMovements} margin={{ left: -20, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <ChartTooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--color-border)" }} />
            <Area
              type="monotone"
              dataKey="entradas"
              stroke="var(--color-chart-1)"
              fill="url(#in)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="saidas"
              stroke="var(--color-chart-2)"
              fill="url(#out)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryChart() {
  const { data: assets = [] } = useQuery({ queryKey: ["assets", "list"], queryFn: listAssets });

  const assetsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) {
      const key = asset.category ?? "Sem categoria";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts, ([name, total]) => ({ name, total }));
  }, [assets]);

  return (
    <div className="panel p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Distribuição por categoria</h3>
        <p className="text-xs text-muted-foreground">Total de ativos registrados</p>
      </div>
      <div className="h-[248px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={assetsByCategory} margin={{ left: -20, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              {...axisProps}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis {...axisProps} />
            <ChartTooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
            <Bar
              dataKey="total"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
