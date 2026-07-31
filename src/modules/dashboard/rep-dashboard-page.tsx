import { Button } from "@/components/ui/button";
import { listAssets, type Asset } from "@/lib/data/assets.repo";
import { createMovement, type Movement } from "@/lib/data/movements.repo";
import { listPpeRequirements } from "@/lib/data/ppe-requirements.repo";
import { effectivePpeStatus, listPpes, type Ppe } from "@/lib/data/ppes.repo";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/shared/components/page-header";
import { ResourceFormDialog, type FormFieldDef } from "@/shared/components/resource-form-dialog";
import { StatCard } from "@/shared/components/stat-card";
import { EmptyState } from "@/shared/components/states";
import { StatusBadge } from "@/shared/components/status-badge";
import { useCurrentEmployee } from "@/shared/hooks/use-current-employee";
import { useEmployeeOptions } from "@/shared/hooks/use-employee-options";
import { useListQuery } from "@/shared/hooks/use-list-query";
import { formatDate, formatNumber } from "@/shared/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Building2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const REP_MOVEMENT_TYPES = [
  { value: "checkout", label: "Peguei / retirei" },
  { value: "checkin", label: "Devolvi" },
  { value: "transfer", label: "Repassei a outro colaborador" },
];

interface ComplianceItem {
  name: string;
  state: "ok" | "attention" | "missing";
  expiresAt?: string | null;
}

/**
 * Compara o que a função do rep exige (`ppe_requirements.function_name`, casado por texto com
 * `employees.role` — mesmo critério já usado em `AssignedEquipmentPanel`) contra os EPIs
 * efetivamente entregues a ele (`ppes.assignee_id`). Só cobre EPI por enquanto — ativos em geral
 * não têm um conceito de "exigido pela função" no schema hoje (ver TODO-REP-DASHBOARD.md).
 */
function usePpeCompliance(
  functionName: string | undefined,
  requirements: { function_name: string; ppe_name: string }[],
  myPpes: Ppe[],
): ComplianceItem[] {
  return useMemo(() => {
    if (!functionName) return [];
    const key = functionName.trim().toLowerCase();
    const required = requirements.filter((r) => r.function_name.trim().toLowerCase() === key);

    return required.map((requirement): ComplianceItem => {
      const match = myPpes.find(
        (ppe) => ppe.name.trim().toLowerCase() === requirement.ppe_name.trim().toLowerCase(),
      );
      if (!match) return { name: requirement.ppe_name, state: "missing" };
      const status = effectivePpeStatus(match);
      const state = status === "valid" ? "ok" : "attention";
      return { name: requirement.ppe_name, state, expiresAt: match.expires_at };
    });
  }, [functionName, requirements, myPpes]);
}

function MissingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-destructive">
      <span className="size-1.5 rounded-full bg-current" />
      Faltando
    </span>
  );
}

function SafetyPanel({ compliance, loading }: { compliance: ComplianceItem[]; loading: boolean }) {
  if (loading) {
    return <div className="panel h-24 animate-pulse" />;
  }

  if (compliance.length === 0) {
    return (
      <div className="panel flex items-center gap-3 p-4">
        <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Nenhum EPI obrigatório cadastrado pra sua função</p>
          <p className="text-xs text-muted-foreground">
            Se você acha que isto não estiver certo. Consulte imediatamente a equipe de segurança ou
            seu superior!
          </p>
        </div>
      </div>
    );
  }

  const pending = compliance.filter((item) => item.state !== "ok");
  const hasIssue = pending.length > 0;

  return (
    <div
      className={cn(
        "panel overflow-hidden border-2",
        hasIssue ? "border-destructive/40" : "border-success/30",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border px-4 py-3",
          hasIssue ? "bg-destructive/5" : "bg-success/5",
        )}
      >
        {hasIssue ? (
          <ShieldAlert className="size-5 shrink-0 text-destructive" />
        ) : (
          <ShieldCheck className="size-5 shrink-0 text-success" />
        )}
        <div>
          <h2 className="text-sm font-semibold">
            Equipamentos de segurança que você deveria estar usando
          </h2>
          <p className="text-xs text-muted-foreground">
            {hasIssue
              ? `${pending.length} de ${compliance.length} precisam de atenção`
              : "Tudo em dia"}
          </p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {compliance.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm font-medium">{item.name}</span>
            {item.state === "missing" && <MissingBadge />}
            {item.state === "attention" && (
              <div className="flex items-center gap-2">
                <span className="tabular text-xs text-muted-foreground">
                  {formatDate(item.expiresAt)}
                </span>
                <StatusBadge status={effectivePpeStatusLabel(item)} />
              </div>
            )}
            {item.state === "ok" && <StatusBadge status="valid" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

// `attention` cobre tanto "vencendo" quanto "vencido" — o `ComplianceItem` só guarda o estado
// simplificado (ok/attention/missing), então re-deriva o rótulo certo a partir da data aqui em
// vez de carregar mais um campo no item só pra isso.
function effectivePpeStatusLabel(item: ComplianceItem): "expiring" | "expired" {
  if (!item.expiresAt) return "expiring";
  return new Date(item.expiresAt).getTime() < Date.now() ? "expired" : "expiring";
}

function MyEquipmentPanel({
  allAssets,
  myAssets,
  employeeName,
}: {
  allAssets: Asset[];
  myAssets: Asset[];
  employeeName: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const employeeOptions = useEmployeeOptions();

  const fields: FormFieldDef[] = [
    {
      name: "asset_id",
      label: "Equipamento",
      type: "select",
      required: true,
      options: allAssets.map((asset) => ({
        value: asset.id,
        label: `${asset.tag} — ${asset.name}`,
      })),
    },
    {
      name: "type",
      label: "O que você fez",
      type: "select",
      required: true,
      options: REP_MOVEMENT_TYPES,
    },
    {
      name: "to_employee_id",
      label: "Repassar para",
      type: "combobox",
      placeholder: 'Só se for "Repassei a outro colaborador"',
      options: employeeOptions,
      deriveFields: (option) => ({ to_label: option.label }),
    },
    { name: "note", label: "Observação", type: "textarea" },
  ];

  // O admin ainda precisa confirmar (ver PendingHandoffsPanel em dashboard-panels.tsx) — o rep
  // não tem permissão de escrita em `assets` (é tabela lookup, admin/manager only), então isto
  // só grava a intenção em `movements`. `to_label` é o dado que o painel do admin usa pra saber
  // pra quem aplicar: em "Peguei" o alvo é sempre quem está registrando, em "Devolvi" não tem
  // alvo (limpa o responsável), em "Repassei" é quem foi escolhido no combobox acima.
  const handleLog = async (values: Record<string, unknown>) => {
    const asset = allAssets.find((item) => item.id === values.asset_id);
    const type = values.type as string;
    const toLabel =
      type === "checkout"
        ? employeeName
        : type === "checkin"
          ? null
          : ((values.to_label as string) ?? null);
    await createMovement({
      ...values,
      to_label: toLabel,
      asset_tag: asset?.tag ?? null,
      asset_name: asset?.name ?? null,
      performed_by: employeeName,
    } as Partial<Movement>);
    await queryClient.invalidateQueries({ queryKey: ["movements", "list"] });
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold">Meus equipamentos agora</h3>
        <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
          Avisar movimentação
        </Button>
      </div>
      {myAssets.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nada com você no momento"
          description="Quando um equipamento for atribuído a você, ele aparece aqui."
        />
      ) : (
        <ul className="divide-y divide-border">
          {myAssets.map((asset) => (
            <li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{asset.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{asset.tag}</p>
              </div>
              <StatusBadge status={asset.status} />
            </li>
          ))}
        </ul>
      )}
      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Avisar movimentação"
        description="Isto avisa o admin que você pegou, devolveu ou repassou algo — o responsável só muda de verdade depois que ele confirmar."
        fields={fields}
        onSubmit={handleLog}
        submitLabel="Avisar"
      />
    </div>
  );
}

export function RepDashboardPage() {
  const { employee, isLoading: employeeLoading, hasLink } = useCurrentEmployee();
  const { data: assets = [], isLoading: assetsLoading } = useListQuery({
    queryKey: ["assets", "list"],
    queryFn: listAssets,
  });
  const { data: ppes = [], isLoading: ppesLoading } = useListQuery({
    queryKey: ["ppes", "list"],
    queryFn: listPpes,
  });
  const { data: requirements = [], isLoading: requirementsLoading } = useListQuery({
    queryKey: ["ppe_requirements", "list"],
    queryFn: listPpeRequirements,
  });

  const myAssets = useMemo(
    () => (employee ? assets.filter((asset) => asset.assignee_id === employee.id) : []),
    [assets, employee],
  );
  const myPpes = useMemo(
    () => (employee ? ppes.filter((ppe) => ppe.assignee_id === employee.id) : []),
    [ppes, employee],
  );
  const compliance = usePpeCompliance(employee?.role, requirements, myPpes);

  const loading = employeeLoading || assetsLoading || ppesLoading || requirementsLoading;

  return (
    <PageContainer>
      <PageHeader
        title="Meu painel"
        description="Seus equipamentos, o que sua função exige de EPI e o que precisa de atenção."
        breadcrumbs={[{ label: "AssetHub", to: "/dashboard" }, { label: "Dashboard" }]}
      />

      {!loading && !hasLink ? (
        <EmptyState
          icon={AlertTriangle}
          title="Sua conta não está vinculada a um colaborador"
          description="Peça ao administrador para confirmar seu e-mail em Colaboradores. Esse vínculo é necessário para identificar quais equipamentos e EPIs estão associados a você."
        />
      ) : (
        <div className="space-y-4">
          <SafetyPanel compliance={compliance} loading={loading} />

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Ativos totais"
              value={formatNumber(myAssets.length)}
              hint="Sob sua responsabilidade"
              icon={Boxes}
            />
            <StatCard
              label="Meu setor"
              value={employee?.department ?? "Não informado"}
              icon={Building2}
            />
          </div>

          <MyEquipmentPanel
            allAssets={assets}
            myAssets={myAssets}
            employeeName={employee?.name ?? ""}
          />
        </div>
      )}
    </PageContainer>
  );
}
