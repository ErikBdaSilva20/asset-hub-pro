import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { AuditsPage } from "@/modules/registry";

export const Route = createFileRoute("/audits")({
  head: () => ({
    meta: [
      { title: "Auditorias · AssetHub" },
      { name: "description", content: "Ciclos de conferência física e divergências." },
      { property: "og:title", content: "Auditorias · AssetHub" },
      { property: "og:description", content: "Ciclos de conferência física e divergências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditsPageRoute,
});

function AuditsPageRoute() {
  return (
    <AppLayout>
      <AuditsPage />
    </AppLayout>
  );
}
