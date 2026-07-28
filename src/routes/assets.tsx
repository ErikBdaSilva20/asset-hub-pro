import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { AssetsPage } from "@/modules/registry";

export const Route = createFileRoute("/assets")({
  head: () => ({
    meta: [
      { title: "Ativos · AssetHub" },
      { name: "description", content: "Inventário completo de ativos com status, alocação e histórico." },
      { property: "og:title", content: "Ativos · AssetHub" },
      { property: "og:description", content: "Inventário completo de ativos com status, alocação e histórico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssetsPageRoute,
});

function AssetsPageRoute() {
  return (
    <AppLayout>
      <AssetsPage />
    </AppLayout>
  );
}
