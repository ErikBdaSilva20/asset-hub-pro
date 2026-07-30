import { ResourcePage } from "@/shared/components/resource-page";
import {
  createAsset,
  listEquipment,
  removeAsset,
  updateAsset,
  EQUIPMENT_KINDS,
  type Asset,
} from "@/lib/data/assets.repo";
import { useRoleScopedResource } from "@/shared/hooks/use-role-scoped-resource";
import {
  assetColumns,
  assetDetail,
  assetKindOptions,
  assetStatusOptions,
  buildAssetFields,
  useEmployeeOptions,
} from "./AssetsScreen";

const equipmentKindOptions = assetKindOptions.filter((option) =>
  (EQUIPMENT_KINDS as string[]).includes(option.value),
);

export function EquipmentScreen() {
  const { list, readOnly, emptyState } = useRoleScopedResource(
    listEquipment,
    (row) => row.assignee_id,
  );
  const employeeOptions = useEmployeeOptions();

  return (
    <ResourcePage
      title="Equipamentos"
      description="Recorte de TI e ferramentas: notebooks, desktops, periféricos e ferramentas."
      resource="equipment"
      list={list}
      statusOf={(row) => row.status}
      columns={assetColumns}
      statusOptions={assetStatusOptions}
      createLabel="Novo equipamento"
      createFields={buildAssetFields(equipmentKindOptions, employeeOptions)}
      onCreate={(values) => createAsset(values as Partial<Asset>)}
      onUpdate={(id, values) => updateAsset(id, values as Partial<Asset>)}
      onDelete={(id) => removeAsset(id)}
      detail={assetDetail}
      readOnly={readOnly}
      emptyTitle={emptyState?.title}
      emptyDescription={emptyState?.description}
    />
  );
}
