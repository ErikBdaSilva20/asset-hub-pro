import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/app-layout";
import { PageContainer, PageHeader, Section } from "@/shared/components/page-header";
import { DetailGrid } from "@/shared/components/resource-page";
import { httpClient } from "@/shared/services/http-client";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações · AssetHub" },
      { name: "description", content: "Preferências do workspace, integração com a API e políticas de inventário." },
      { property: "og:title", content: "Configurações · AssetHub" },
      { property: "og:description", content: "Preferências do workspace e integração com a API." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <AppLayout>
      <PageContainer>
        <PageHeader
          title="Configurações"
          description="Preferências do workspace e integração com o backend."
          breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Configurações" }]}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Integração com a API">
            <div className="panel p-4">
              <DetailGrid
                items={[
                  { label: "Variável", value: <span className="font-mono text-xs">VITE_API_URL</span> },
                  {
                    label: "Status",
                    value: httpClient.isConfigured() ? "Conectado à API" : "Usando dataset mock local",
                  },
                  { label: "Camada de transporte", value: "httpClient (substituível)" },
                  { label: "Autenticação", value: "Delegada ao backend" },
                ]}
              />
            </div>
          </Section>
          <Section title="Políticas de inventário">
            <div className="panel p-4">
              <DetailGrid
                items={[
                  { label: "Padrão de etiqueta", value: "AH-0000" },
                  { label: "Ciclo de auditoria", value: "Trimestral" },
                  { label: "Alerta de garantia", value: "120 dias" },
                  { label: "Alerta de licença", value: "30 dias" },
                ]}
              />
            </div>
          </Section>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
