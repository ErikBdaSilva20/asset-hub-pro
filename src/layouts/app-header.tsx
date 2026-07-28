import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, CircleHelp, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { brandIcon as BrandIcon, navItems } from "./navigation";
import { notifications } from "@/mock/notifications";
import { formatRelative } from "@/shared/utils/format";

interface AppHeaderProps {
  onOpenHelp: () => void;
  onOpenSearch: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function AppHeader({ onOpenHelp, onOpenSearch, theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BrandIcon className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Asset<span className="text-primary">Hub</span>
          </span>
          <span className="ml-1 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ENTERPRISE
          </span>
        </Link>

        <button
          onClick={onOpenSearch}
          className="mx-auto flex h-8 w-full max-w-md items-center gap-2 rounded-md border border-border bg-muted/60 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="size-3.5" />
          Buscar ativos, colaboradores, licenças…
          <kbd className="ml-auto rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>

        <div className="flex items-center gap-1">
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
              <Button variant="ghost" size="sm" className="size-8 p-0" onClick={onOpenHelp}>
                <CircleHelp className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Guia do sistema</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-1 h-8 gap-2 px-1.5">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">MD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">Marina Duarte</p>
                <p className="text-xs text-muted-foreground">marina.duarte@assethub.co</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="size-4" /> Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Configurações</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/">
                  <LogOut className="size-4" /> Sair
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TopBar />
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
                    item.severity === "critical" ? "bg-destructive" : item.severity === "warning" ? "bg-warning" : "bg-info",
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

function TopBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-0.5 overflow-x-auto px-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
