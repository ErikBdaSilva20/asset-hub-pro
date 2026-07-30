// AssetHub é um app de operação Brasil — datas sempre em UTC-3 (America/Sao_Paulo), fixo, não o
// fuso do sistema operacional de quem está com o navegador aberto. Sem `timeZone` explícito, o
// `Intl.DateTimeFormat` usa o fuso local do browser: em produção, alguém acessando de outro fuso
// veria uma data diferente pro mesmo dado — bug silencioso, cada usuário vendo algo diferente.
const SAO_PAULO_TZ = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: SAO_PAULO_TZ,
});
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: SAO_PAULO_TZ,
});
const civilDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: SAO_PAULO_TZ });
// Sempre 2 casas decimais — nunca 0. Cortar os centavos (como era antes) deixa o valor ambíguo:
// olhando só "R$ 13.311" não dá pra saber se é R$ 13.311,00 ou se sobrou um resto de centavos
// escondido; e sem casa decimal fixa, um valor pequeno como "R$ 100" fica indistinguível de
// R$ 1,00 mostrado errado. Único util de moeda do app — toda tela usa este, nenhuma formata
// R$ por conta própria.
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat("pt-BR");

export const formatDate = (value?: string | null) =>
  value ? dateFormatter.format(new Date(value)) : "—";
export const formatDateTime = (value?: string | null) =>
  value ? dateTimeFormatter.format(new Date(value)) : "—";
export const formatCurrency = (value: number) => currencyFormatter.format(value);
export const formatNumber = (value: number) => numberFormatter.format(value);

/** "AAAA-MM-DD" do dia civil em UTC-3 pra um instante qualquer — mesmo formato que
 * `<input type="date">` usa. Base pra qualquer conta de "quantos dias faltam" (não pode depender
 * da hora-do-dia embutida no timestamp nem do fuso de quem está olhando) e pra pré-popular um
 * campo de data num formulário de edição sem o valor "andar" um dia por causa do fuso. */
export function toDateInputValue(value: string | number | Date): string {
  return civilDateFormatter.format(new Date(value));
}

/**
 * Converte o valor cru de um `<input type="date">` ("AAAA-MM-DD", sem fuso) pro instante que
 * representa meia-noite **em UTC-3** daquele dia — não meia-noite UTC. Sem isso: o valor vai pro
 * gateway como "AAAA-MM-DD" puro, o Postgres (sessão em UTC) entende como meia-noite UTC, e o dia
 * exibido de volta em UTC-3 fica **um dia atrás** do que a pessoa digitou (ex.: escolheu 29/08,
 * salvou, reabriu e via 28/08 — a origem real dos itens "vencendo" errado). Brasil não tem mais
 * horário de verão (abolido em 2019) — o offset -03:00 é fixo, sem precisar de lib de fuso.
 */
export function dateInputValueToISO(value: string): string {
  return `${value}T00:00:00-03:00`;
}

export function formatRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days} d`;
  return formatDate(value);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Diferença em dias de calendário (UTC-3) entre hoje e `value` — não é a divisão ingênua de
 * milissegundos por 86.400.000. Aquela conta erra por causa da hora-do-dia embutida em cada
 * timestamp: um vencimento salvo como meia-noite UTC comparado com "agora" às 17h UTC-3 podia
 * arredondar pro dia errado, fazendo um item aparecer "vencendo" um dia antes ou depois do real.
 * Aqui os dois lados viram "AAAA-MM-DD" em UTC-3 primeiro — a diferença é sempre o dia civil.
 */
export function daysUntil(value?: string | null): number | null {
  if (!value) return null;
  const today = toDateInputValue(Date.now());
  const target = toDateInputValue(value);
  const diffMs = Date.parse(`${target}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(diffMs / 86_400_000);
}

/** "Vencendo" em qualquer tela do sistema = falta 1 mês (30 dias) ou menos. Um só lugar pra essa
 * regra — reaproveitada por Assinaturas, EPIs, garantias de Ativos e qualquer coisa futura com
 * data de vencimento, em vez de cada tela cravar um número diferente (era o caso antes: EPIs e
 * Assinaturas nunca recalculavam a partir da data, e o painel de garantias usava 120 dias). */
export const EXPIRING_SOON_DAYS = 30;

export type ExpiryState = "expired" | "expiring" | "ok";

export function expiryState(daysLeft: number | null): ExpiryState {
  if (daysLeft === null) return "ok";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= EXPIRING_SOON_DAYS) return "expiring";
  return "ok";
}
