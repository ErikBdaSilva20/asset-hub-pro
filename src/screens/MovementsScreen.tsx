import { useListQuery } from "@/shared/hooks/use-list-query";
import { StatusBadge } from "@/shared/components/status-badge";
import { ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import { createMovement, listMovements, type Movement } from "@/lib/data/movements.repo";
import { listAssets } from "@/lib/data/assets.repo";
import { formatDate } from "@/shared/utils/format";

const mono = (value: string | null) => <span className="font-mono text-xs">{value ?? "—"}</span>;
const muted = (value: string | null) => (
  <span className="text-muted-foreground">{value ?? "—"}</span>
);

const typeOptions = [
  { value: "all", label: "Todos os tipos" },
  { value: "checkout", label: "Entrega" },
  { value: "checkin", label: "Devolução" },
  { value: "transfer", label: "Transferência" },
  { value: "maintenance", label: "Manutenção" },
  { value: "disposal", label: "Descarte" },
];

const columns: Column<Movement>[] = [
  { key: "tag", header: "Etiqueta", cell: (row) => mono(row.asset_tag), width: "110px" },
  {
    key: "asset",
    header: "Ativo",
    cell: (row) => <span className="font-medium">{row.asset_name}</span>,
  },
  { key: "type", header: "Tipo", cell: (row) => <StatusBadge status={row.type} /> },
  { key: "from", header: "Origem", cell: (row) => muted(row.from_label) },
  { key: "to", header: "Destino", cell: (row) => muted(row.to_label) },
  { key: "by", header: "Registrado por", cell: (row) => muted(row.performed_by) },
  {
    key: "at",
    header: "Data",
    align: "right",
    cell: (row) => <span className="tabular">{formatDate(row.occurred_at)}</span>,
  },
];

export function MovementsScreen() {
  // movements.asset_id é FK not null — o formulário precisa de um seletor de ativo existente,
  // não dá pra criar uma movimentação "solta". Reaproveita o cache de ["assets","list"].
  const { data: assets = [] } = useListQuery({ queryKey: ["assets", "list"], queryFn: listAssets });

  const createFields: FormFieldDef[] = [
    {
      name: "asset_id",
      label: "Ativo",
      type: "select",
      required: true,
      options: assets.map((asset) => ({ value: asset.id, label: `${asset.tag} — ${asset.name}` })),
    },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      required: true,
      options: typeOptions.filter((o) => o.value !== "all"),
    },
    { name: "from_label", label: "Origem" },
    { name: "to_label", label: "Destino" },
    { name: "performed_by", label: "Registrado por" },
    { name: "note", label: "Observação", type: "textarea" },
  ];

  const handleCreate = async (values: Record<string, unknown>) => {
    const asset = assets.find((item) => item.id === values.asset_id);
    return createMovement({
      ...values,
      asset_tag: asset?.tag ?? null,
      asset_name: asset?.name ?? null,
    } as Partial<Movement>);
  };

  return (
    <ResourcePage
      title="Movimentações"
      description="Trilha imutável de entregas, devoluções, transferências e descartes."
      resource="movements"
      list={listMovements}
      statusOf={(row) => row.type}
      createLabel="Nova movimentação"
      createFields={createFields}
      onCreate={handleCreate}
      statusOptions={typeOptions}
      columns={columns}
    />
  );
}
