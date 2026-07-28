import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Boxes, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/dashboard");
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
              Use as credenciais da sua conta no workspace.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogIn className="size-4" />
            )}
            Entrar
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Criar workspace
            </Link>
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
