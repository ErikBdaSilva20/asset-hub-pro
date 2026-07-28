import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { MovementsPage } from "@/modules/registry";

export const Route = createFileRoute("/movements")({
  head: () => ({
    meta: [
      { title: "Movimentações · AssetHub" },
      { name: "description", content: "Entregas, devoluções, transferências e descartes de ativos." },
      { property: "og:title", content: "Movimentações · AssetHub" },
      { property: "og:description", content: "Entregas, devoluções, transferências e descartes de ativos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MovementsPageRoute,
});

function MovementsPageRoute() {
  return (
    <AppLayout>
      <MovementsPage />
    </AppLayout>
  );
}
