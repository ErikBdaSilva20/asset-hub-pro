import {
  Boxes,
  Building2,
  ClipboardCheck,
  Cpu,
  HardHat,
  KeyRound,
  LayoutDashboard,
  Package,
  Repeat,
  Settings,
  Shapes,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group: "operacao" | "cadastros" | "sistema";
}

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "operacao" },
  { label: "Ativos", to: "/assets", icon: Package, group: "operacao" },
  { label: "Colaboradores", to: "/employees", icon: Users, group: "operacao" },
  { label: "Movimentações", to: "/movements", icon: Repeat, group: "operacao" },
  { label: "Licenças", to: "/licenses", icon: KeyRound, group: "operacao" },
  { label: "Equipamentos", to: "/equipment", icon: Cpu, group: "operacao" },
  { label: "EPIs", to: "/ppe", icon: HardHat, group: "operacao" },
  { label: "Manutenções", to: "/maintenance", icon: Wrench, group: "operacao" },
  { label: "Auditorias", to: "/audits", icon: ClipboardCheck, group: "operacao" },
  { label: "Fornecedores", to: "/suppliers", icon: Truck, group: "cadastros" },
  { label: "Departamentos", to: "/departments", icon: Building2, group: "cadastros" },
  { label: "Categorias", to: "/categories", icon: Shapes, group: "cadastros" },
  { label: "Configurações", to: "/settings", icon: Settings, group: "sistema" },
];

export const brandIcon = Boxes;
