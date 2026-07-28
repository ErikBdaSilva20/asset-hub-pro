import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { PpePage } from "@/modules/registry";

export const Route = createFileRoute("/ppe")({
  head: () => ({
    meta: [
      { title: "EPIs · AssetHub" },
      { name: "description", content: "Equipamentos de proteção individual, CA e validade." },
      { property: "og:title", content: "EPIs · AssetHub" },
      { property: "og:description", content: "Equipamentos de proteção individual, CA e validade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PpePageRoute,
});

function PpePageRoute() {
  return (
    <AppLayout>
      <PpePage />
    </AppLayout>
  );
}
