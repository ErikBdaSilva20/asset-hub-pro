import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import {
  DataTable,
  TableToolbar,
  type Column,
  type FilterOption,
} from "@/shared/components/data-table";
import { ResourceFormDialog, type FormFieldDef } from "@/shared/components/resource-form-dialog";
import { useListState } from "@/shared/hooks/use-list-state";
import { useResourceList } from "@/shared/hooks/use-resource-list";

interface ResourcePageProps<T extends { id: string }> {
  title: string;
  description: string;
  resource: string;
  list: () => Promise<T[]>;
  statusOf?: (item: T) => string;
  columns: Column<T>[];
  statusOptions?: FilterOption[];
  searchPlaceholder?: string;
  createLabel?: string;
  /** Config do formulário do modal "Novo X". Sem isso (ou sem onCreate), o botão fica desabilitado. */
  createFields?: FormFieldDef[];
  onCreate?: (input: Record<string, unknown>) => Promise<unknown>;
  detail?: (row: T) => { title: string; subtitle: string; content: ReactNode };
  /** Força o botão "Novo X" a ficar escondido/desabilitado independente de `createFields`/
   * `onCreate` — pra papéis que só consultam (ex.: `rep` em tabelas lookup, ver
   * `useRoleScopedResource`). Diferente de omitir `createFields`: aquilo é "esta tela não tem
   * criação"; isto é "esta sessão não tem permissão pra criar". */
  readOnly?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  /** Repassado pro React Query. `false` pra fontes sabidamente indisponíveis (ver
   * `useResourceList`) — evita insistir sozinho num erro que já sabemos que vai repetir. */
  retry?: boolean | number;
}

export function ResourcePage<T extends { id: string }>({
  title,
  description,
  resource,
  list: fetchList,
  statusOf,
  columns,
  statusOptions,
  searchPlaceholder,
  createLabel = "Novo registro",
  createFields,
  onCreate,
  detail,
  readOnly = false,
  emptyTitle,
  emptyDescription,
  errorTitle,
  errorDescription,
  retry,
}: ResourcePageProps<T>) {
  const list = useListState();
  const query = useResourceList<T>(resource, fetchList, list.params, statusOf, { retry });
  const [selected, setSelected] = useState<T | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const detailData = selected && detail ? detail(selected) : null;
  const queryClient = useQueryClient();
  const canCreate = Boolean(createFields && onCreate) && !readOnly;

  const handleCreate = async (values: Record<string, unknown>) => {
    if (!onCreate) return;
    await onCreate(values);
    await queryClient.invalidateQueries({ queryKey: [resource, "list"] });
    toast.success("Registro salvo com sucesso.");
  };

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: title }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="size-4" /> Exportar
            </Button>
            {!readOnly && (
              <Button size="sm" disabled={!canCreate} onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" /> {createLabel}
              </Button>
            )}
          </>
        }
      />

      <DataTable
        columns={columns}
        rows={query.data?.items ?? []}
        rowKey={(row) => row.id}
        onRowClick={detail ? (row) => setSelected(row) : undefined}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => query.refetch()}
        errorTitle={errorTitle}
        errorDescription={errorDescription}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        page={query.data?.page}
        pageSize={query.data?.pageSize}
        total={query.data?.total ?? 0}
        onPageChange={list.setPage}
        toolbar={
          <TableToolbar
            search={list.search}
            onSearch={list.setSearch}
            placeholder={searchPlaceholder ?? `Buscar em ${title.toLowerCase()}…`}
            status={list.status}
            onStatus={list.setStatus}
            statusOptions={statusOptions}
            onReset={list.reset}
          />
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl">
          {detailData && (
            <>
              <SheetHeader className="border-b border-border">
                <SheetTitle>{detailData.title}</SheetTitle>
                <SheetDescription>{detailData.subtitle}</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-96px)] p-4">{detailData.content}</ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {canCreate && createFields && (
        <ResourceFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title={createLabel}
          fields={createFields}
          onSubmit={handleCreate}
        />
      )}
    </PageContainer>
  );
}

export function DetailGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <dt className="text-xs tracking-wide text-muted-foreground uppercase">{item.label}</dt>
          <dd className="text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
