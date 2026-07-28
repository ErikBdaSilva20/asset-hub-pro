import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Boxes, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AssetHub · Gestão corporativa de ativos" },
      {
        name: "description",
        content:
          "Plataforma enterprise para controlar o ciclo de vida de equipamentos, licenças, EPIs e frota com histórico auditável.",
      },
      { property: "og:title", content: "AssetHub · Gestão corporativa de ativos" },
      {
        property: "og:description",
        content: "Controle completo de ativos, movimentações, manutenções e auditorias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntryRoute,
});

function EntryRoute() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  return booting ? <SplashScreen /> : <LoginScreen />;
}

function SplashScreen() {
  return (
    <div className="grid-backdrop flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Boxes className="size-6" />
      </span>
      <p className="text-lg font-semibold tracking-tight">
        Asset<span className="text-primary">Hub</span>
      </p>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Inicializando workspace…
      </span>
    </div>
  );
}

function LoginScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 500);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">Entrar no AssetHub</h1>
            <p className="text-sm text-muted-foreground">
              Autenticação delegada ao backend corporativo. Use suas credenciais de rede.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail corporativo</Label>
              <Input id="email" type="email" defaultValue="marina.duarte@assethub.co" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" defaultValue="assethub" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Entrar
          </Button>

          <p className="text-xs text-muted-foreground">
            Ambiente de demonstração com dados mockados — nenhuma credencial é enviada.
          </p>
        </form>
      </div>

      <aside className="grid-backdrop relative hidden border-l border-border bg-muted/30 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <blockquote className="max-w-md space-y-4">
          <p className="text-2xl leading-snug font-medium tracking-tight">
            Todo ativo tem identidade, responsável e histórico auditável — do cadastro ao descarte.
          </p>
          <p className="text-sm text-muted-foreground">
            Equipamentos, licenças, EPIs, ferramentas, mobiliário e frota em uma única operação.
          </p>
        </blockquote>
      </aside>
    </div>
  );
}
