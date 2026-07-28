import { useState, type ReactNode } from "react";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { DataTable, TableToolbar, type Column, type FilterOption } from "@/shared/components/data-table";
import { Timeline } from "@/shared/components/timeline";
import { useListState } from "@/shared/hooks/use-list-state";
import { useResourceList } from "@/shared/hooks/use-resource-list";
import type { Repository } from "@/shared/services/resource-repository";
import { timeline } from "@/mock";

interface ResourcePageProps<T extends { id: string }> {
  title: string;
  description: string;
  resource: string;
  repository: Repository<T>;
  columns: Column<T>[];
  statusOptions?: FilterOption[];
  searchPlaceholder?: string;
  createLabel?: string;
  detail?: (row: T) => { title: string; subtitle: string; content: ReactNode };
}

export function ResourcePage<T extends { id: string }>({
  title,
  description,
  resource,
  repository,
  columns,
  statusOptions,
  searchPlaceholder,
  createLabel = "Novo registro",
  detail,
}: ResourcePageProps<T>) {
  const list = useListState();
  const query = useResourceList<T>(resource, repository, list.params);
  const [selected, setSelected] = useState<T | null>(null);
  const detailData = selected && detail ? detail(selected) : null;

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
            <Button size="sm">
              <Plus className="size-4" /> {createLabel}
            </Button>
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
              <ScrollArea className="h-[calc(100vh-96px)]">
                <Tabs defaultValue="details" className="p-4">
                  <TabsList>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="pt-4">
                    {detailData.content}
                  </TabsContent>
                  <TabsContent value="timeline" className="pt-4">
                    <Timeline entries={timeline.slice(0, 4)} />
                  </TabsContent>
                  <TabsContent value="history" className="pt-4">
                    <Timeline entries={timeline.slice(4, 10)} />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
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
