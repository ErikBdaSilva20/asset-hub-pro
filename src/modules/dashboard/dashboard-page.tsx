import { Boxes, CircleDollarSign, PackageCheck, Wrench } from "lucide-react";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import { CategoryChart, MovementsChart } from "./components/dashboard-charts";
import {
  ExpiringPanel,
  LicenseSeats,
  MaintenanceQueue,
  RecentActivity,
  RecentMovements,
} from "./components/dashboard-panels";
import { assets, maintenanceOrders } from "@/mock";
import { formatCurrency, formatNumber } from "@/shared/utils/format";

export function DashboardPage() {
  const inUse = assets.filter((asset) => asset.status === "in_use").length;
  const value = assets.reduce((total, asset) => total + asset.purchaseValue, 0);
  const openOrders = maintenanceOrders.filter((order) => order.status !== "done").length;

  return (
    <PageContainer>
      <PageHeader
        title="Visão geral"
        description="Indicadores consolidados do parque de ativos, vencimentos e operação do dia."
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Dashboard" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ativos totais" value={formatNumber(assets.length * 27)} delta={4.2} hint="Inventário consolidado" icon={Boxes} />
        <StatCard label="Em uso" value={formatNumber(inUse * 27)} delta={2.1} hint="Alocados a colaboradores" icon={PackageCheck} />
        <StatCard label="Manutenções abertas" value={formatNumber(openOrders)} delta={-8.4} hint="Preventivas e corretivas" icon={Wrench} />
        <StatCard label="Valor patrimonial" value={formatCurrency(value * 27)} delta={1.6} hint="Custo de aquisição" icon={CircleDollarSign} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MovementsChart />
        </div>
        <ExpiringPanel />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CategoryChart />
        <RecentMovements />
        <MaintenanceQueue />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecentActivity />
        <LicenseSeats />
      </div>
    </PageContainer>
  );
}
