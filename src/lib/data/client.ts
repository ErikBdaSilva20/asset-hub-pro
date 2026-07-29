// PROTEGIDO — não editável pela IA (masi.template.json, editable.protect).
// Contrato: Importantdoc.md §B5. Não redesenhar sem atualizar o manifesto.

declare global {
  interface Window {
    __MASI_GW__?: string;
    __MASI_TENANT__?: string;
    __MASI_PREVIEW__?: boolean;
  }
}

export function resolveConfig(): { gatewayUrl: string; tenantId: string } {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const qsGateway = params.get("gw");
    const qsTenant = params.get("t");
    if (qsGateway && qsTenant) {
      return { gatewayUrl: qsGateway, tenantId: qsTenant };
    }
  }

  const envGateway = import.meta.env.VITE_GATEWAY_URL as string | undefined;
  const envTenant = import.meta.env.VITE_TENANT_ID as string | undefined;
  if (envGateway && envTenant) {
    return { gatewayUrl: envGateway, tenantId: envTenant };
  }

  if (typeof window !== "undefined" && window.__MASI_GW__ && window.__MASI_TENANT__) {
    return { gatewayUrl: window.__MASI_GW__, tenantId: window.__MASI_TENANT__ };
  }

  return { gatewayUrl: envGateway ?? "", tenantId: envTenant ?? "" };
}

function isPreviewMode(): boolean {
  return typeof window !== "undefined" && window.__MASI_PREVIEW__ === true;
}

function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  /** Corpo da resposta de erro já parseado (Better-Auth manda {message,code}; o gateway
   * genérico manda {error}), quando dá pra parsear como JSON. Use src/shared/utils/errors.ts
   * pra transformar isso num texto amigável — não formate erro lendo isso direto na tela. */
  readonly body: Record<string, unknown> | null;

  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.body = tryParseJson(message);
  }
}

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (isPreviewMode()) {
    const { previewRequest } = await import("./preview-fixtures");
    return previewRequest<T>(method, path, body);
  }

  const { gatewayUrl, tenantId } = resolveConfig();

  const res = await fetch(`${gatewayUrl}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// --- db: modo genérico do gateway (§B5) ---
// list/create/update/remove — sem get-by-id, sem filtro por query, sem joins.
export const db = {
  table<R = unknown>(name: string) {
    return {
      list: () => api<R[]>("GET", `/data/${name}`),
      create: (input: Partial<R>) => api<R>("POST", `/data/${name}`, input),
      update: (id: string, patch: Partial<R>) => api<R>("PATCH", `/data/${name}/${id}`, patch),
      remove: (id: string) => api<void>("DELETE", `/data/${name}/${id}`),
    };
  },
};

// --- auth: Better-Auth do tenant-gateway (§B8) ---
export interface GatewaySessionUser {
  id: string;
  email: string;
  name?: string | null;
  role?: "admin" | "manager" | "rep";
}

// ⚠️ listUsers/setRole abaixo NÃO ESTÃO CONFIRMADOS contra o tenant-gateway real — ver
// GATEWAY-ADMIN-ENDPOINTS.md na raiz do repo pro histórico completo e o passo a passo de
// verificação. Resumo: pedimos documentação desses endpoints pro time do tenant-gateway e não
// veio resposta; os caminhos/formatos abaixo seguem a convenção *padrão* do plugin "admin" do
// Better-Auth (https://www.better-auth.com/docs/plugins/admin), mas ninguém confirmou que esse
// plugin está habilitado no tenant-gateway, nem que está montado nesses caminhos exatos.
// Antes de depender disto em produção: logue como admin, abra /users, e veja se lista/troca de
// papel funcionam de verdade. Se der 404 ou formato de resposta diferente, o conserto é só
// aqui — UsersScreen.tsx consome só `auth.listUsers`/`auth.setRole`, não sabe da rota por trás.
export interface AdminUserSummary {
  id: string;
  name: string | null;
  email: string;
  role: "admin" | "manager" | "rep" | null;
}

interface AdminListUsersResponse {
  users: AdminUserSummary[];
  total?: number;
}

export const auth = {
  signIn: (email: string, password: string) =>
    api<{ user: GatewaySessionUser }>("POST", "/api/auth/sign-in/email", { email, password }),
  signUp: (email: string, password: string, name: string) =>
    api<{ user: GatewaySessionUser }>("POST", "/api/auth/sign-up/email", { email, password, name }),
  signOut: () => api<void>("POST", "/api/auth/sign-out"),
  me: () => api<{ user: GatewaySessionUser | null }>("GET", "/api/auth/get-session"),
  // `?limit=200` é defensivo: várias implementações do plugin admin paginam com um limite
  // pequeno por padrão (10~20), o que faria a tela de Usuários mostrar só uma fração do tenant
  // sem nenhum aviso. Se o tenant crescer além disso, isto também vai precisar de paginação de
  // verdade — não é o caso hoje.
  listUsers: () => api<AdminListUsersResponse>("GET", "/api/auth/admin/list-users?limit=200"),
  setRole: (userId: string, role: "manager" | "rep") =>
    api<{ user: AdminUserSummary }>("POST", "/api/auth/admin/set-role", { userId, role }),
};
