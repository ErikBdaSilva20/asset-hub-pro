import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { FormFieldDef } from "@/shared/components/resource-form-dialog";
import type { Column } from "@/shared/components/data-table";
import {
  createPpeRequirement,
  listPpeRequirements,
  removePpeRequirement,
  updatePpeRequirement,
  type PpeRequirement,
} from "@/lib/data/ppe-requirements.repo";
import { useAuth } from "@/lib/auth";
import { canManageCatalog } from "@/shared/utils/permissions";

const columns: Column<PpeRequirement>[] = [
  {
    key: "function_name",
    header: "Função",
    cell: (row) => <span className="font-medium">{row.function_name}</span>,
  },
  { key: "ppe_name", header: "EPI exigido", cell: (row) => row.ppe_name },
];

const createFields: FormFieldDef[] = [
  {
    name: "function_name",
    label: "Função",
    required: true,
    placeholder: "Mesmo texto usado em Colaboradores > Cargo",
  },
  { name: "ppe_name", label: "EPI exigido", required: true },
];

/**
 * Tabela lookup (sem owner_id, ver 0004_ppe_requirements.sql) — leitura liberada a todo mundo
 * (rep pode conferir o que a própria função exige), escrita só admin/manager. `function_name`
 * casa por texto com `employees.role`; usado pelo painel "Quem está com o quê" do dashboard
 * (dashboard-panels.tsx) pra mostrar o EPI exigido ao lado dos ativos de cada colaborador.
 */
export function PpeRequirementsScreen() {
  const { role } = useAuth();
  const readOnly = !canManageCatalog(role);

  return (
    <ResourcePage
      title="Requisitos de EPI"
      description="Qual EPI cada função exige — aparece ao lado de cada colaborador no dashboard."
      resource="ppe_requirements"
      list={listPpeRequirements}
      columns={columns}
      searchPlaceholder="Buscar por função ou EPI…"
      createLabel="Novo requisito"
      createFields={createFields}
      onCreate={(values) => createPpeRequirement(values as Partial<PpeRequirement>)}
      onUpdate={(id, values) => updatePpeRequirement(id, values as Partial<PpeRequirement>)}
      onDelete={(id) => removePpeRequirement(id)}
      readOnly={readOnly}
      detail={(row) => ({
        title: row.function_name,
        subtitle: row.ppe_name,
        content: (
          <DetailGrid
            items={[
              { label: "Função", value: row.function_name },
              { label: "EPI exigido", value: row.ppe_name },
            ]}
          />
        ),
      })}
    />
  );
}
