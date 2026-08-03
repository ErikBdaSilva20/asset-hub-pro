import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";
import { hasAnyRole } from "@/shared/utils/permissions";

interface RequireAuthProps {
  children: ReactNode;
  /** Restringe a rota a papéis específicos. Omitido = qualquer usuário logado (padrão). Some do
   * menu (navigation.ts) já evita o clique morto; isto aqui é o que impede chegar lá digitando
   * a URL direto. */
  roles?: Role[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Demo mock (Vercel) — sem restrição de tela por papel, pra dar pra navegar livre trocando de
  // identidade pelo PreviewRoleSwitcher sem cair fora de nenhuma rota. Sujo de propósito.
  void roles;
  void hasAnyRole;

  return <>{children}</>;
}
