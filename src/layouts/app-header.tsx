import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { notifications } from "@/mock/notifications";
import { formatRelative, initials } from "@/shared/utils/format";
import { isAdmin } from "@/shared/utils/permissions";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brandIcon as BrandIcon, navItems, getNavItems, type NavItem } from "./navigation";

interface AppHeaderProps {
  onOpenHelp: () => void;
  onOpenSearch: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const GROUP_LABELS: Record<NavItem["group"], string> = {
  geral: "",
  dispositivos: "Dispositivos",
  seguranca: "Segurança",
  financeiro: "Financeiro",
  organizacao: "Organização",
  conformidade: "Conformidade",
  sistema: "Sistema",
};

export function AppHeader({ onOpenHelp, onOpenSearch, theme, onToggleTheme }: AppHeaderProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const visibleNavItems = getNavItems(role);

  // Fecha o painel de navegação sempre que a rota muda (clique num item, back/forward, etc).
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const activeItem = navItems.find((item) => location.pathname.startsWith(item.to));

  const logout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BrandIcon className="size-4" />
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Asset<span className="text-primary">Hub</span>
          </span>
          <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
            ENTERPRISE
          </span>
        </Link>

        <Popover open={navOpen} onOpenChange={setNavOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Navegação"
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors ",
                navOpen
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
              )}
            >
              {navOpen ? <X className="size-3.5" /> : <Menu className="size-3.5" />}
              <span className="hidden sm:inline">{activeItem?.label ?? "Menu"}</span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", navOpen && "rotate-180")}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            collisionPadding={12}
            className="max-h-[min(75vh,34rem)] w-[720px] max-w-[var(--radix-popover-content-available-width)] overflow-y-auto p-3"
          >
            <NavPanel items={visibleNavItems} onNavigate={() => setNavOpen(false)} />
          </PopoverContent>
        </Popover>

        <button
          onClick={onOpenSearch}
          className="hidden h-8 flex-1 items-center gap-2 rounded-md border border-border bg-muted/60 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted md:flex md:max-w-md"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="truncate">Buscar ativos, colaboradores, licenças…</span>
          <kbd className="ml-auto shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button variant="ghost" size="sm" className="size-8 p-0 md:hidden" onClick={onOpenSearch}>
            <Search className="size-4" />
          </Button>

          <NotificationsMenu />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0" onClick={onToggleTheme}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tema {theme === "dark" ? "claro" : "escuro"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden size-8 p-0 sm:inline-flex"
                onClick={onOpenHelp}
              >
                <CircleHelp className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Guia do sistema</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-1 h-8 gap-2 px-1.5">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {user?.name
                      ? initials(user.name)
                      : (user?.email?.slice(0, 2).toUpperCase() ?? "?")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.name ?? "Minha conta"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="size-4" /> Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Configurações</Link>
              </DropdownMenuItem>
              {isAdmin(role) && (
                <DropdownMenuItem asChild>
                  <Link to="/users">
                    <UserCog className="size-4" /> Usuários
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onOpenHelp} className="sm:hidden">
                <CircleHelp className="size-4" /> Guia do sistema
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="size-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NotificationsMenu() {
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative size-8 p-0">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-medium">Notificações</p>
          <span className="text-xs text-muted-foreground">{unread} não lidas</span>
        </div>
        <ul className="max-h-80 divide-y divide-border overflow-y-auto">
          {notifications.map((item) => (
            <li key={item.id} className="px-3 py-2.5">
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    item.severity === "critical"
                      ? "bg-destructive"
                      : item.severity === "warning"
                        ? "bg-warning"
                        : "bg-info",
                  )}
                />
                <div className="space-y-0.5">
                  <p className="text-sm leading-snug">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground/70">{formatRelative(item.at)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/** Mega-menu de navegação: abre como popover ancorado no trigger do header (fecha sozinho em
 * clique fora / Esc / troca de rota, via Radix Popover). Cada rota vira um cartão com ícone,
 * nome e uma descrição de até 4 palavras — pra quem nunca clicou ali já saber pra que serve
 * antes de entrar. Grade com largura mínima por coluna (auto-fill) em vez de breakpoints fixos,
 * então se ajusta sozinha do popover estreito no mobile até a versão larga no desktop. */
function NavPanel({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const groups: NavItem["group"][] = [
    "geral",
    "dispositivos",
    "seguranca",
    "financeiro",
    "organizacao",
    "conformidade",
    "sistema",
  ];

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;
        const label = GROUP_LABELS[group];

        return (
          <div key={group}>
            {label && (
              <p className="mb-1.5 px-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
              </p>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-1">
              {groupItems.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-start gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors",
                      active ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-surface",
                      )}
                    >
                      <item.icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block truncate text-xs font-semibold",
                          active ? "text-primary" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="block text-[10.5px] leading-tight text-muted-foreground">
                        {item.blurb}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
