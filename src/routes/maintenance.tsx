import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { MaintenancePage } from "@/modules/registry";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Manutenções · AssetHub" },
      { name: "description", content: "Ordens preventivas e corretivas com prazo e custo." },
      { property: "og:title", content: "Manutenções · AssetHub" },
      { property: "og:description", content: "Ordens preventivas e corretivas com prazo e custo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaintenancePageRoute,
});

function MaintenancePageRoute() {
  return (
    <AppLayout>
      <MaintenancePage />
    </AppLayout>
  );
}
