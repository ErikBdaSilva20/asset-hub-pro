import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { EmployeesPage } from "@/modules/registry";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "Colaboradores · AssetHub" },
      { name: "description", content: "Pessoas, departamentos e ativos sob responsabilidade." },
      { property: "og:title", content: "Colaboradores · AssetHub" },
      { property: "og:description", content: "Pessoas, departamentos e ativos sob responsabilidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmployeesPageRoute,
});

function EmployeesPageRoute() {
  return (
    <AppLayout>
      <EmployeesPage />
    </AppLayout>
  );
}
