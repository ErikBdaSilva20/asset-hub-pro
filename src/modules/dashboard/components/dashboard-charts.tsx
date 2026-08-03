import { useMemo } from "react";
import { useListQuery } from "@/shared/hooks/use-list-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listAssets } from "@/lib/data/assets.repo";
import { listMaintenanceOrders } from "@/lib/data/maintenance.repo";
import { listPpes } from "@/lib/data/ppes.repo";
import { listLicenses } from "@/lib/data/licenses.repo";
import { formatCompactCurrency, formatCurrency } from "@/shared/utils/format";

/** licenses.cost é o valor de UM período (billing_period), não sempre anual — precisa
 * normalizar antes de somar junto com custos já anuais (compra de ativo, EPI), senão uma
 * assinatura mensal de R$100 entraria como R$100/ano em vez de R$1200/ano. */
function annualizedLicenseCost(cost: number, billingPeriod: "monthly" | "annual") {
  return billingPeriod === "monthly" ? cost * 12 : cost;
}

const MAX_CHART_BARS = 8;

/** Com poucos dados, "categoria" é uma dimensão de poucos valores — mas com volume real (visto
 * com o seed pesado: 19 categorias distintas só em Ativos) o gráfico de barras vira uma parede
 * de rótulos ilegíveis. Mantém as maiores e soma o resto em "Outras", igual qualquer dashboard
 * de verdade lida com cardinalidade alta numa dimensão categórica. */
function topNWithOthers(
  entries: { name: string; total: number }[],
  max = MAX_CHART_BARS,
): { name: string; total: number }[] {
  if (entries.length <= max) return entries;
  const top = entries.slice(0, max - 1);
  const rest = entries.slice(max - 1).reduce((sum, entry) => sum + entry.total, 0);
  return [...top, { name: "Outras", total: rest }];
}

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

/**
 * Admin-only (gate fica em dashboard-page.tsx, não aqui — este componente só desenha).
 * Soma 4 fontes de gasto por categoria: compra de ativos (assets.purchase_value), manutenção
 * (maintenance_orders.cost, sem categoria própria — herda a do ativo via asset_id), reposição
 * de EPI (ppes.cost) e assinaturas (licenses.cost, anualizado — ver annualizedLicenseCost).
 * "Categoria" aqui é sempre o texto denormalizado (modo genérico do gateway não faz join) —
 * vem de `categories`, dinâmico, sem nada fixo no código.
 */
export function SpendByCategoryChart() {
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: maintenanceOrders = [] } = useListQuery({
    queryKey: ["maintenance_orders", "list"],
    queryFn: listMaintenanceOrders,
  });
  const { data: ppes = [] } = useListQuery({ queryKey: ["ppes", "list"], queryFn: listPpes });
  const { data: licenses = [] } = useListQuery({
    queryKey: ["licenses", "list"],
    queryFn: listLicenses,
  });

  const spendByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    // Sem categoria = fica de fora do gráfico (não vira um balde "Sem categoria") — categorizar
    // é o que dá sentido ao rateio, então item sem categoria não tem "onde" contar o gasto dele.
    const addSpend = (category: string | null, amount: number) => {
      if (!category) return;
      totals.set(category, (totals.get(category) ?? 0) + amount);
    };

    const categoryByAssetId = new Map(assets.map((asset) => [asset.id, asset.category]));
    for (const asset of assets) addSpend(asset.category, asset.purchase_value);
    for (const order of maintenanceOrders) {
      addSpend(categoryByAssetId.get(order.asset_id) ?? null, order.cost);
    }
    for (const ppe of ppes) addSpend(ppe.category, ppe.cost);
    for (const license of licenses) {
      addSpend(license.category, annualizedLicenseCost(license.cost, license.billing_period));
    }

    const sorted = Array.from(totals, ([name, total]) => ({ name, total })).sort(
      (a, b) => b.total - a.total,
    );
    return topNWithOthers(sorted);
  }, [assets, maintenanceOrders, ppes, licenses]);

  return (
    <div className="panel p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Gastos por categoria</h3>
        <p className="text-xs text-muted-foreground">
          Compra de ativos, manutenção, reposição de EPI e assinaturas
        </p>
      </div>
      <div className="h-[248px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spendByCategory} margin={{ left: 0, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              {...axisProps}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              {...axisProps}
              width={64}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
            />
            <ChartTooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--color-muted)" }}
              formatter={(value: number) => [formatCurrency(value), "Gasto"]}
            />
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

export function CategoryChart() {
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });

  const assetsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of assets) {
      const key = asset.category ?? "Sem categoria";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const sorted = Array.from(counts, ([name, total]) => ({ name, total })).sort(
      (a, b) => b.total - a.total,
    );
    return topNWithOthers(sorted);
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
