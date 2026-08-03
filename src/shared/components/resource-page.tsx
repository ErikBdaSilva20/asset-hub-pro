import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DataTable,
  TableToolbar,
  type Column,
  type FilterOption,
} from "@/shared/components/data-table";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { ResourceFormDialog, type FormFieldDef } from "@/shared/components/resource-form-dialog";
import { useListState } from "@/shared/hooks/use-list-state";
import { useResourceList } from "@/shared/hooks/use-resource-list";
import type { RangeFilterDef } from "@/shared/types";
import { downloadCsv, parseCsv, runWithConcurrency, toCsv } from "@/shared/utils/csv";
import { getErrorMessage } from "@/shared/utils/errors";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

interface ResourcePageProps<T extends { id: string }> {
  title: string;
  description: string;
  resource: string;
  list: () => Promise<T[]>;
  statusOf?: (item: T) => string;
  columns: Column<T>[];
  statusOptions?: FilterOption[];
  /** Campos filtráveis por intervalo (data/número), ex.: custo ou data de renovação entre X e Y. */
  rangeFilters?: RangeFilterDef[];
  searchPlaceholder?: string;
  createLabel?: string;
  /** Config do formulário do modal "Novo X". Sem isso (ou sem onCreate), o botão fica desabilitado. */
  createFields?: FormFieldDef[];
  onCreate?: (input: Record<string, unknown>) => Promise<unknown>;
  /** Config do formulário de edição. Sem isso, reaproveita `createFields` — a maioria das telas
   * edita o mesmo conjunto de campos que cria. Só declare esta prop se a edição precisar de um
   * conjunto diferente. */
  editFields?: FormFieldDef[];
  /** Presente + `detail` → botão "Editar" aparece no drawer de detalhe. */
  onUpdate?: (id: string, input: Record<string, unknown>) => Promise<unknown>;
  /** Por padrão o formulário de edição parte do próprio registro (`row`). Só declare isto se
   * algum campo editável não vier do `row` — ex.: um valor que mora numa tabela relacionada,
   * mesclado à parte (ver `LicensesScreen`, `assignee` em `license_assignments`). */
  editInitialValues?: (row: T) => Record<string, unknown>;
  /** Presente + `detail` → botão "Excluir" aparece no drawer de detalhe, com confirmação. */
  onDelete?: (id: string) => Promise<unknown>;
  detail?: (row: T) => { title: string; subtitle: string; content: ReactNode };
  /** Conteúdo extra logo abaixo do título/descrição no cabeçalho (ex.: um seletor de navegação
   * entre telas irmãs). Repassado direto pro `meta` do `PageHeader`. */
  meta?: ReactNode;
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
  rangeFilters,
  searchPlaceholder,
  createLabel = "Novo registro",
  createFields,
  onCreate,
  editFields,
  onUpdate,
  editInitialValues,
  onDelete,
  detail,
  meta,
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
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const detailData = selected && detail ? detail(selected) : null;
  const queryClient = useQueryClient();
  const canCreate = Boolean(createFields && onCreate) && !readOnly;
  const resolvedEditFields = editFields ?? createFields;
  const canEdit = Boolean(resolvedEditFields && onUpdate) && !readOnly;
  const canDelete = Boolean(onDelete) && !readOnly;
  const canImport = canCreate;

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: [resource, "list"] });

  // Exporta o dataset inteiro (não só a página atual) — busca de novo em vez de reaproveitar a
  // lista paginada/filtrada em tela, que é só um recorte do que tem no servidor.
  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await fetchList();
      if (rows.length === 0) {
        toast.info("Nada pra exportar ainda.");
        return;
      }
      downloadCsv(resource, toCsv(rows as unknown as Record<string, unknown>[]));
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite re-selecionar o mesmo arquivo depois
    if (!file || !onCreate) return;

    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      if (rows.length === 0) {
        toast.info("Nenhuma linha reconhecida no CSV.");
        return;
      }
      // Concorrência limitada: uma a uma seria lento pra centenas de linhas; todas de uma vez
      // sobrecarrega o gateway com centenas de POSTs simultâneos.
      const { ok, failed } = await runWithConcurrency(rows, 8, (row) => onCreate(row));
      await invalidateList();
      if (failed === 0) toast.success(`${ok} registros importados.`);
      else toast.warning(`${ok} importados, ${failed} falharam (dado inválido ou incompleto).`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível ler o CSV."));
    } finally {
      setImporting(false);
    }
  };

  const handleCreate = async (values: Record<string, unknown>) => {
    if (!onCreate) return;
    await onCreate(values);
    await invalidateList();
    toast.success("Registro salvo com sucesso.");
  };

  const handleUpdate = async (values: Record<string, unknown>) => {
    if (!onUpdate || !selected) return;
    const updated = await onUpdate(selected.id, values);
    await invalidateList();
    toast.success("Alterações salvas.");
    // Sem isto, o drawer de detalhe (que continua aberto atrás do modal de edição) ficaria
    // mostrando os valores antigos até o usuário fechar e reabrir.
    if (updated) setSelected(updated as T);
  };

  const handleDelete = async () => {
    if (!onDelete || !selected) return;
    setDeleting(true);
    try {
      await onDelete(selected.id);
      await invalidateList();
      toast.success("Registro excluído.");
      setDeleteOpen(false);
      setSelected(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível excluir."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: title }]}
        meta={meta}
        actions={
          <>
            {
              // `readOnly` (rep nas tabelas lookup) esconde Exportar de propósito — o CSV pega a
              // linha inteira (toCsv(rows)), inclusive campos sensíveis (purchase_value, cost)
              // que as colunas já escondem pra esse papel. Esconder só a coluna não bastava.
              !readOnly && (
                <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                  {exporting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Exportar
                </Button>
              )
            }
            {canImport && (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={importing}
                  onClick={() => importInputRef.current?.click()}
                >
                  {importing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Importar CSV
                </Button>
              </>
            )}
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
            rangeFilters={rangeFilters}
            ranges={list.ranges}
            onRangeChange={list.setRange}
            onReset={list.reset}
          />
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          {detailData && (
            <>
              <SheetHeader className="border-b border-border">
                <SheetTitle>{detailData.title}</SheetTitle>
                <SheetDescription>{detailData.subtitle}</SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1 p-4">{detailData.content}</ScrollArea>
              {(canEdit || canDelete) && (
                <SheetFooter className="border-t border-border p-4">
                  {canDelete && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-4" /> Excluir
                    </Button>
                  )}
                  {canEdit && (
                    <Button onClick={() => setEditOpen(true)}>
                      <Pencil className="size-4" /> Editar
                    </Button>
                  )}
                </SheetFooter>
              )}
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

      {canEdit && resolvedEditFields && selected && (
        <ResourceFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          title={`Editar ${detailData?.title ?? ""}`}
          fields={resolvedEditFields}
          initialValues={editInitialValues ? editInitialValues(selected) : selected}
          submitLabel="Salvar alterações"
          onSubmit={handleUpdate}
        />
      )}

      {canDelete && (
        <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {detailData?.title ?? "este registro"}?</AlertDialogTitle>
              <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="size-4 animate-spin" />}
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
