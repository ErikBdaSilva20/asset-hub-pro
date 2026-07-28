import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { SuppliersPage } from "@/modules/registry";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Fornecedores · AssetHub" },
      { name: "description", content: "Parceiros de compra, contrato e manutenção." },
      { property: "og:title", content: "Fornecedores · AssetHub" },
      { property: "og:description", content: "Parceiros de compra, contrato e manutenção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuppliersPageRoute,
});

function SuppliersPageRoute() {
  return (
    <AppLayout>
      <SuppliersPage />
    </AppLayout>
  );
}
