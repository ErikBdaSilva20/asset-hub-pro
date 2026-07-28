/** Mock notifications. Remove with the rest of `src/mock` once the API is live. */
export interface Notification {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  at: string;
}

const iso = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const notifications: Notification[] = [
  { id: "n1", title: "4 licenças vencem em 30 dias", description: "Jira Premium e AutoCAD LT precisam de renovação.", severity: "warning", read: false, at: iso(12) },
  { id: "n2", title: "OS-2403 atrasada", description: "Manutenção corretiva do AH-1009 passou do prazo.", severity: "critical", read: false, at: iso(95) },
  { id: "n3", title: "Auditoria AUD-2025-003 iniciada", description: "Escopo Frota, responsável Helena Castro.", severity: "info", read: false, at: iso(320) },
  { id: "n4", title: "3 EPIs vencidos", description: "Substituição obrigatória antes da próxima jornada.", severity: "warning", read: true, at: iso(1400) },
];
