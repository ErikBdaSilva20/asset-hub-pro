import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { EquipmentPage } from "@/modules/registry";

export const Route = createFileRoute("/equipment")({
  head: () => ({
    meta: [
      { title: "Equipamentos · AssetHub" },
      { name: "description", content: "Notebooks, desktops, periféricos e ferramentas." },
      { property: "og:title", content: "Equipamentos · AssetHub" },
      { property: "og:description", content: "Notebooks, desktops, periféricos e ferramentas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EquipmentPageRoute,
});

function EquipmentPageRoute() {
  return (
    <AppLayout>
      <EquipmentPage />
    </AppLayout>
  );
}
