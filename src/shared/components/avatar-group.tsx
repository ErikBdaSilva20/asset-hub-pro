import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { initials } from "@/shared/utils/format";

export function UserChip({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7 border border-border">
        <AvatarFallback className="bg-muted text-[11px] font-medium">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="leading-tight">
        <p className="text-sm font-medium">{name}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

export function AvatarGroup({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;

  return (
    <div className="flex -space-x-2">
      {shown.map((name) => (
        <Tooltip key={name}>
          <TooltipTrigger asChild>
            <Avatar className="size-7 border-2 border-surface">
              <AvatarFallback className="bg-muted text-[10px] font-medium">{initials(name)}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
      ))}
      {rest > 0 && (
        <span className={cn("flex size-7 items-center justify-center rounded-full border-2 border-surface bg-muted text-[10px] font-medium")}>
          +{rest}
        </span>
      )}
    </div>
  );
}
