import type { ReactNode } from "react";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RangeFilterDef, RangeValue } from "@/shared/types";
import { EmptyState, ErrorState, LoadingOverlay, TableSkeleton } from "./states";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right";
  cell: (row: T) => ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

interface TableToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  status?: string;
  onStatus?: (value: string) => void;
  statusOptions?: FilterOption[];
  /** Campos filtráveis por intervalo (data ou número) — ex.: custo entre X e Y, renovação entre
   * datas. Reutilizável por qualquer tela que declare `rangeFilters`, sem lógica própria. */
  rangeFilters?: RangeFilterDef[];
  ranges?: Record<string, RangeValue>;
  onRangeChange?: (key: string, value: RangeValue) => void;
  actions?: ReactNode;
  onReset?: () => void;
}

export function TableToolbar({
  search,
  onSearch,
  placeholder = "Buscar…",
  status,
  onStatus,
  statusOptions,
  rangeFilters,
  ranges = {},
  onRangeChange,
  actions,
  onReset,
}: TableToolbarProps) {
  const activeRanges = Object.values(ranges).filter((r) => r?.min || r?.max).length;
  const dirty = Boolean(search) || (status && status !== "all") || activeRanges > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          className="h-8 border-transparent bg-muted pl-8 text-sm shadow-none focus-visible:border-ring"
        />
      </div>

      {statusOptions && onStatus && (
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger className="h-8 w-[168px] bg-muted">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {rangeFilters && rangeFilters.length > 0 && onRangeChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-muted text-xs">
              <CalendarRange className="size-3.5" />
              Filtros
              {activeRanges > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {activeRanges}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-3">
            {rangeFilters.map((filter) => {
              const value = ranges[filter.key] ?? {};
              return (
                <div key={filter.key} className="space-y-1.5">
                  <Label className="text-xs">{filter.label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={filter.type}
                      value={value.min ?? ""}
                      onChange={(event) =>
                        onRangeChange(filter.key, { ...value, min: event.target.value })
                      }
                      placeholder="De"
                      className="h-8 text-xs"
                    />
                    <Input
                      type={filter.type}
                      value={value.max ?? ""}
                      onChange={(event) =>
                        onRangeChange(filter.key, { ...value, max: event.target.value })
                      }
                      placeholder="Até"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </PopoverContent>
        </Popover>
      )}

      {dirty && onReset && (
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onReset}>
          <X className="size-3.5" /> Limpar
        </Button>
      )}

      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </div>
  );
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  errorTitle?: string;
  errorDescription?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  isLoading,
  isFetching,
  isError,
  onRetry,
  errorTitle,
  errorDescription,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Ajuste os filtros ou a busca para ver outros resultados.",
  toolbar,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
}: DataTableProps<T>) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="panel relative overflow-hidden">
      {toolbar}
      {isFetching && !isLoading && <LoadingOverlay />}

      {isError ? (
        <ErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
      ) : isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                      "px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase",
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-2.5 align-middle",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onPageChange && total > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span className="tabular">
            {from}–{to} de {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="tabular px-2">
              {page} / {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              disabled={page >= lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
