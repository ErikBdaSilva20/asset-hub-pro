import { useListQuery } from "@/shared/hooks/use-list-query";
import { Boxes, CircleDollarSign, PackageCheck, Wrench } from "lucide-react";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { StatCard } from "@/shared/components/stat-card";
import { CategoryChart, SpendByCategoryChart } from "./components/dashboard-charts";
import {
  ActiveSubscriptions,
  AssignedEquipmentPanel,
  ExpiringPanel,
  MaintenanceQueue,
  PendingHandoffsPanel,
  RecentActivity,
  RecentMovements,
} from "./components/dashboard-panels";
import { RepDashboardPage } from "./rep-dashboard-page";
import { listAssets } from "@/lib/data/assets.repo";
import { listMaintenanceOrders } from "@/lib/data/maintenance.repo";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
import { useAuth } from "@/lib/auth";
import { isAdmin } from "@/shared/utils/permissions";

/**
 * O rep é quem "é o parque" (usa os ativos, não os gerencia) — a diferença do que ele precisa
 * ver (o que muda, a ordem, o destaque de segurança) é grande o suficiente pra virar um
 * componente dedicado (`RepDashboardPage`) em vez de mais um ternário aqui dentro. Ver
 * TODO-REP-DASHBOARD.md pro levantamento original.
 */
export function DashboardPage() {
  const { role } = useAuth();
  if (role === "rep") return <RepDashboardPage />;
  return <AdminManagerDashboard />;
}

function AdminManagerDashboard() {
  const { role } = useAuth();
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });
  const { data: maintenanceOrders = [] } = useListQuery({
    queryKey: ["maintenance_orders", "list"],
    queryFn: listMaintenanceOrders,
  });

  const inUse = assets.filter((asset) => asset.status === "in_use").length;
  const value = assets.reduce((total, asset) => total + asset.purchase_value, 0);
  const openOrders = maintenanceOrders.filter((order) => order.status !== "done").length;

  return (
    <PageContainer>
      <PageHeader
        title="Visão geral"
        description="Indicadores consolidados do parque de ativos, vencimentos e operação do dia."
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Dashboard" }]}
      />

      <PendingHandoffsPanel />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ativos totais"
          value={formatNumber(assets.length)}
          hint="Inventário consolidado"
          icon={Boxes}
        />
        <StatCard
          label="Em uso"
          value={formatNumber(inUse)}
          hint="Alocados a colaboradores"
          icon={PackageCheck}
        />
        <StatCard
          label="Manutenções abertas"
          value={formatNumber(openOrders)}
          hint="Preventivas e corretivas"
          icon={Wrench}
        />
        <StatCard
          label="Valor patrimonial"
          value={formatCurrency(value)}
          hint="Custo de aquisição"
          icon={CircleDollarSign}
        />
      </div>

      {isAdmin(role) ? (
        // Gastos por categoria (admin-only) fica ao lado de Itens vencendo — essa coluna sozinha
        // costumava ficar bem mais curta que a outra, deixando um vão enorme. Empilhando
        // Distribuição por categoria + Últimas movimentações embaixo, a coluna cresce até ficar
        // parecida com a altura de Itens vencendo, em vez de deixar espaço vazio.
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SpendByCategoryChart />
            <div className="grid gap-4 sm:grid-cols-2">
              <CategoryChart />
              <RecentMovements />
            </div>
          </div>
          <ExpiringPanel />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <ExpiringPanel />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CategoryChart />
            <RecentMovements />
          </div>
        </>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <MaintenanceQueue />
        <AssignedEquipmentPanel />
        <RecentActivity />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ActiveSubscriptions />
      </div>
    </PageContainer>
  );
}
