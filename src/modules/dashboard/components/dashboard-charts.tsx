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
import { assetsByCategory, monthlyMovements } from "@/mock";

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

export function MovementsChart() {
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
            <Area type="monotone" dataKey="entradas" stroke="var(--color-chart-1)" fill="url(#in)" strokeWidth={2} />
            <Area type="monotone" dataKey="saidas" stroke="var(--color-chart-2)" fill="url(#out)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryChart() {
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
            <XAxis dataKey="name" {...axisProps} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis {...axisProps} />
            <ChartTooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
            <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
