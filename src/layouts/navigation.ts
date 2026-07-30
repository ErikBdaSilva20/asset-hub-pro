import type { Role } from "@/lib/auth";
import { hasAnyRole } from "@/shared/utils/permissions";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Building2,
  ClipboardCheck,
  Cpu,
  HardHat,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Package,
  Repeat,
  Shapes,
  Truck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export type NavGroup =
  | "geral"
  | "dispositivos"
  | "seguranca"
  | "financeiro"
  | "organizacao"
  | "conformidade"
  | "sistema";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group: NavGroup;
  /** Pra que serve a tela, em no máximo 4 palavras — mostrado no painel de navegação
   * pra quem nunca abriu aquela rota entender o propósito antes de clicar. */
  blurb: string;
  /** Papéis que veem este item no menu. `undefined` = todo mundo logado (padrão). Rotas que só
   * admin/manager conseguem usar de verdade (gerenciam registros owner_id-restritos que o rep
   * nunca vê) ficam de fora do menu do rep — clique morto não ajuda ninguém. */
  roles?: Role[];
}

// "geral" não ganha cabeçalho de seção no painel de navegação (é só o Dashboard, sozinho no
// topo) — o resto é agrupado por tema pra facilitar quem tá vendo o menu pela primeira vez.
export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    group: "geral",
    blurb: "Visão geral do parque",
  },
  {
    label: "Ativos",
    to: "/assets",
    icon: Package,
    group: "dispositivos",
    blurb: "Registro de patrimônio",
  },
  {
    label: "Equipamentos",
    to: "/equipment",
    icon: Cpu,
    group: "dispositivos",
    blurb: "Notebooks e periféricos",
  },
  {
    label: "Manutenções",
    to: "/maintenance",
    icon: Wrench,
    group: "dispositivos",
    blurb: "Preventivas e corretivas",
    roles: ["admin", "manager"],
  },
  {
    label: "EPIs",
    to: "/ppe",
    icon: HardHat,
    group: "seguranca",
    blurb: "Proteção e validade",
  },
  {
    label: "Requisitos de EPI",
    to: "/ppe-requirements",
    icon: ListChecks,
    group: "seguranca",
    blurb: "EPI exigido por função",
  },
  {
    label: "Movimentações",
    to: "/movements",
    icon: Repeat,
    group: "financeiro",
    blurb: "Entregas e devoluções",
    roles: ["admin", "manager"],
  },
  {
    label: "Assinaturas",
    to: "/licenses",
    icon: KeyRound,
    group: "financeiro",
    blurb: "Assentos e renovação",
  },
  {
    label: "Fornecedores",
    to: "/suppliers",
    icon: Truck,
    group: "financeiro",
    blurb: "Parceiros de compra",
    roles: ["admin", "manager"],
  },
  {
    label: "Colaboradores",
    to: "/employees",
    icon: Users,
    group: "organizacao",
    blurb: "Pessoas e seus ativos",
    roles: ["admin", "manager"],
  },
  {
    label: "Departamentos",
    to: "/departments",
    icon: Building2,
    group: "organizacao",
    blurb: "Centros de custo",
    roles: ["admin", "manager"],
  },
  {
    label: "Auditorias",
    to: "/audits",
    icon: ClipboardCheck,
    group: "conformidade",
    blurb: "Conferência física",
    roles: ["admin", "manager"],
  },
  {
    label: "Categorias",
    to: "/categories",
    icon: Shapes,
    group: "sistema",
    blurb: "Taxonomia dos ativos",
    roles: ["admin", "manager"],
  },
  {
    label: "Usuários",
    to: "/users",
    icon: UserCog,
    group: "sistema",
    blurb: "Papéis e permissões",
    roles: ["admin"],
  },
];

export const brandIcon = Boxes;

/**
 * Fonte única de verdade pra "quais itens este papel vê no menu" — os dois consumidores
 * (mega-menu do header e command palette) chamam isto em vez de filtrar `navItems` cada um do
 * seu jeito, senão a regra de visibilidade acaba divergindo entre os dois lugares com o tempo.
 */
export function getNavItems(role: Role | null): NavItem[] {
  return navItems.filter((item) => !item.roles || hasAnyRole(role, item.roles));
}
