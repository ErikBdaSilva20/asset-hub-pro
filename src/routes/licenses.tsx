import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { LicensesPage } from "@/modules/registry";

export const Route = createFileRoute("/licenses")({
  head: () => ({
    meta: [
      { title: "Licenças · AssetHub" },
      { name: "description", content: "Contratos de software, assentos e renovações." },
      { property: "og:title", content: "Licenças · AssetHub" },
      { property: "og:description", content: "Contratos de software, assentos e renovações." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LicensesPageRoute,
});

function LicensesPageRoute() {
  return (
    <AppLayout>
      <LicensesPage />
    </AppLayout>
  );
}
