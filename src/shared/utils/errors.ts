import { ApiError } from "@/lib/data/client";

/**
 * Traduz erros do gateway (Better-Auth `{message,code}` ou o modo genérico `{error}`) pra texto
 * em português. Usado em todo lugar que mostra erro pro usuário (login, cadastro, modais de
 * criação) — um só lugar pra manter as mensagens conhecidas, em vez de cada tela reinventar.
 */

// Códigos confirmados batendo direto no dev-gateway (curl), não chutados — ver histórico da
// sessão. Se o Better-Auth adicionar um código novo que não está aqui, cai no `message` dele
// (em inglês, mas legível) antes de cair no fallback genérico por status.
const KNOWN_MESSAGES: Record<string, string> = {
  // Better-Auth (login/cadastro)
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha inválidos.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Já existe uma conta com esse e-mail.",
  PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
  PASSWORD_TOO_LONG: "A senha é longa demais.",
  // Gateway genérico (CRUD)
  unauthorized: "Sua sessão expirou. Entre novamente.",
  forbidden: "Você não tem permissão para fazer isso.",
  "unknown table": "Esse tipo de registro não existe no gateway.",
  "empty patch": "Nada para atualizar.",
  "not found": "Registro não encontrado — pode já ter sido removido por outra pessoa.",
};

const STATUS_FALLBACK: Record<number, string> = {
  400: "Não foi possível entender os dados enviados.",
  401: "Sua sessão expirou. Entre novamente.",
  403: "Você não tem permissão para fazer isso.",
  404: "Registro não encontrado.",
  409: "Já existe um registro com esses dados.",
  500: "Erro no servidor. Tente novamente em instantes.",
};

export function getErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir a ação.",
): string {
  if (error instanceof ApiError) {
    const code = typeof error.body?.code === "string" ? error.body.code : undefined;
    const rawError = typeof error.body?.error === "string" ? error.body.error : undefined;
    const message = typeof error.body?.message === "string" ? error.body.message : undefined;

    if (code && KNOWN_MESSAGES[code]) return KNOWN_MESSAGES[code];
    if (rawError && KNOWN_MESSAGES[rawError]) return KNOWN_MESSAGES[rawError];
    // VALIDATION_ERROR vem tipo "[body.email] Invalid email address" — tira o prefixo técnico.
    if (code === "VALIDATION_ERROR" && message) return message.replace(/^\[[^\]]+\]\s*/, "");
    if (message) return message;
    if (rawError) return rawError;
    return STATUS_FALLBACK[error.status] ?? fallback;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
