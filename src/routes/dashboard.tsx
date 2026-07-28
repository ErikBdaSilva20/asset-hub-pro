import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { DashboardPage } from "@/modules/dashboard/dashboard-page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · AssetHub" },
      { name: "description", content: "Visão geral do parque de ativos, vencimentos e operação diária." },
      { property: "og:title", content: "Dashboard · AssetHub" },
      { property: "og:description", content: "Visão geral do parque de ativos, vencimentos e operação diária." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPageRoute,
});

function DashboardPageRoute() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}
