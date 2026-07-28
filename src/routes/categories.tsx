import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { CategoriesPage } from "@/modules/registry";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categorias · AssetHub" },
      { name: "description", content: "Taxonomia de ativos e regras de depreciação." },
      { property: "og:title", content: "Categorias · AssetHub" },
      { property: "og:description", content: "Taxonomia de ativos e regras de depreciação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPageRoute,
});

function CategoriesPageRoute() {
  return (
    <AppLayout>
      <CategoriesPage />
    </AppLayout>
  );
}
