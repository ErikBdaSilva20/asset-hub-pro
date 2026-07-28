import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { DepartmentsPage } from "@/modules/registry";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departamentos · AssetHub" },
      { name: "description", content: "Estrutura organizacional e centros de custo." },
      { property: "og:title", content: "Departamentos · AssetHub" },
      { property: "og:description", content: "Estrutura organizacional e centros de custo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepartmentsPageRoute,
});

function DepartmentsPageRoute() {
  return (
    <AppLayout>
      <DepartmentsPage />
    </AppLayout>
  );
}
