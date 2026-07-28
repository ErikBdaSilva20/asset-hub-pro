import { PageContainer, PageHeader, Section } from "@/shared/components/page-header";
import { DetailGrid } from "@/shared/components/resource-page";
import { resolveConfig } from "@/lib/data/client";
import { useAuth } from "@/lib/auth";

export function SettingsScreen() {
  const { user, role } = useAuth();
  const { gatewayUrl } = resolveConfig();

  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        description="Preferências do workspace e integração com o tenant-gateway."
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Configurações" }]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Integração com o gateway">
          <div className="panel p-4">
            <DetailGrid
              items={[
                {
                  label: "Variável",
                  value: <span className="font-mono text-xs">VITE_GATEWAY_URL</span>,
                },
                {
                  label: "Status",
                  value: gatewayUrl ? "Conectado ao tenant-gateway" : "Gateway não configurado",
                },
                { label: "Autenticação", value: "Better-Auth (tenant-gateway)" },
                { label: "Usuário", value: user?.email ?? "—" },
                { label: "Papel", value: role ?? "—" },
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
  );
}
