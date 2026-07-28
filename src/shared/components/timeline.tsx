import { CheckCircle2, FileText, PackageCheck, RotateCcw, StickyNote, Wrench } from "lucide-react";
import type { TimelineEntry } from "@/shared/types";
import { formatDateTime } from "@/shared/utils/format";

const icons = {
  created: FileText,
  assigned: PackageCheck,
  returned: RotateCcw,
  maintenance: Wrench,
  audit: CheckCircle2,
  note: StickyNote,
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {entries.map((entry) => {
        const Icon = icons[entry.kind];
        return (
          <li key={entry.id} className="relative">
            <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full border border-border bg-surface">
              <Icon className="size-3 text-muted-foreground" />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{entry.title}</p>
                <span className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{entry.description}</p>
              <p className="text-xs text-muted-foreground/80">por {entry.actor}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
