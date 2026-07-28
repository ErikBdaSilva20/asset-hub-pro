import { StatusBadge } from "@/shared/components/status-badge";
import { DetailGrid, ResourcePage } from "@/shared/components/resource-page";
import type { Column } from "@/shared/components/data-table";
import {
  assetsService,
  auditsService,
  categoriesService,
  departmentsService,
  employeesService,
  equipmentService,
  licensesService,
  maintenanceService,
  movementsService,
  ppeService,
  suppliersService,
} from "@/shared/services";
import type {
  Asset,
  Audit,
  Category,
  Department,
  Employee,
  License,
  MaintenanceOrder,
  Movement,
  Ppe,
  Supplier,
} from "@/shared/types";
import { formatCurrency, formatDate } from "@/shared/utils/format";

const mono = (value: string) => <span className="font-mono text-xs">{value}</span>;
const muted = (value: string) => <span className="text-muted-foreground">{value}</span>;

const assetColumns: Column<Asset>[] = [
  { key: "tag", header: "Etiqueta", cell: (row) => mono(row.tag), width: "110px" },
  { key: "name", header: "Ativo", cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: "category", header: "Categoria", cell: (row) => muted(row.category) },
  { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  { key: "assignee", header: "Responsável", cell: (row) => muted(row.assignee ?? "—") },
  { key: "location", header: "Local", cell: (row) => muted(row.location) },
  { key: "value", header: "Valor", align: "right", cell: (row) => <span className="tabular">{formatCurrency(row.purchaseValue)}</span> },
];

const assetStatusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "available", label: "Disponível" },
  { value: "in_use", label: "Em uso" },
  { value: "maintenance", label: "Manutenção" },
  { value: "reserved", label: "Reservado" },
  { value: "retired", label: "Baixado" },
];

function assetDetail(row: Asset) {
  return {
    title: row.name,
    subtitle: `${row.tag} · ${row.category}`,
    content: (
      <DetailGrid
        items={[
          { label: "Status", value: <StatusBadge status={row.status} /> },
          { label: "Condição", value: <StatusBadge status={row.condition} /> },
          { label: "Número de série", value: mono(row.serialNumber) },
          { label: "Modelo", value: `${row.manufacturer} ${row.model}` },
          { label: "Responsável", value: row.assignee ?? "—" },
          { label: "Departamento", value: row.department ?? "—" },
          { label: "Local", value: row.location },
          { label: "Fornecedor", value: row.supplier ?? "—" },
          { label: "Compra", value: formatDate(row.purchaseDate) },
          { label: "Valor", value: formatCurrency(row.purchaseValue) },
          { label: "Garantia até", value: formatDate(row.warrantyUntil) },
          { label: "Atualizado", value: formatDate(row.updatedAt) },
        ]}
      />
    ),
  };
}

export const AssetsPage = () => (
  <ResourcePage
    title="Ativos"
    description="Registro central do patrimônio, com status, alocação e ciclo de vida completo."
    resource="assets"
    repository={assetsService}
    columns={assetColumns}
    statusOptions={assetStatusOptions}
    createLabel="Novo ativo"
    detail={assetDetail}
  />
);

export const EquipmentPage = () => (
  <ResourcePage
    title="Equipamentos"
    description="Recorte de TI e ferramentas: notebooks, desktops, periféricos e ferramentas."
    resource="equipment"
    repository={equipmentService}
    columns={assetColumns}
    statusOptions={assetStatusOptions}
    createLabel="Novo equipamento"
    detail={assetDetail}
  />
);

export const EmployeesPage = () => (
  <ResourcePage
    title="Colaboradores"
    description="Pessoas aptas a receber ativos, com departamento, centro de custo e carga atual."
    resource="employees"
    repository={employeesService}
    createLabel="Novo colaborador"
    statusOptions={[
      { value: "all", label: "Todos os status" },
      { value: "active", label: "Ativo" },
      { value: "on_leave", label: "Afastado" },
      { value: "offboarded", label: "Desligado" },
    ]}
    columns={[
      { key: "name", header: "Colaborador", cell: (row: Employee) => <span className="font-medium">{row.name}</span> },
      { key: "email", header: "E-mail", cell: (row: Employee) => muted(row.email) },
      { key: "role", header: "Cargo", cell: (row: Employee) => muted(row.role) },
      { key: "department", header: "Departamento", cell: (row: Employee) => muted(row.department) },
      { key: "status", header: "Status", cell: (row: Employee) => <StatusBadge status={row.status} /> },
      { key: "assets", header: "Ativos", align: "right", cell: (row: Employee) => <span className="tabular">{row.assetsCount}</span> },
    ]}
    detail={(row: Employee) => ({
      title: row.name,
      subtitle: `${row.role} · ${row.department}`,
      content: (
        <DetailGrid
          items={[
            { label: "E-mail", value: row.email },
            { label: "Status", value: <StatusBadge status={row.status} /> },
            { label: "Local", value: row.location },
            { label: "Admissão", value: formatDate(row.hiredAt) },
            { label: "Ativos sob responsabilidade", value: row.assetsCount },
            { label: "Departamento", value: row.department },
          ]}
        />
      ),
    })}
  />
);

export const MovementsPage = () => (
  <ResourcePage
    title="Movimentações"
    description="Trilha imutável de entregas, devoluções, transferências e descartes."
    resource="movements"
    repository={movementsService}
    createLabel="Nova movimentação"
    statusOptions={[
      { value: "all", label: "Todos os tipos" },
      { value: "checkout", label: "Entrega" },
      { value: "checkin", label: "Devolução" },
      { value: "transfer", label: "Transferência" },
      { value: "maintenance", label: "Manutenção" },
      { value: "disposal", label: "Descarte" },
    ]}
    columns={[
      { key: "tag", header: "Etiqueta", cell: (row: Movement) => mono(row.assetTag), width: "110px" },
      { key: "asset", header: "Ativo", cell: (row: Movement) => <span className="font-medium">{row.assetName}</span> },
      { key: "type", header: "Tipo", cell: (row: Movement) => <StatusBadge status={row.type} /> },
      { key: "from", header: "Origem", cell: (row: Movement) => muted(row.fromLabel) },
      { key: "to", header: "Destino", cell: (row: Movement) => muted(row.toLabel) },
      { key: "by", header: "Registrado por", cell: (row: Movement) => muted(row.performedBy) },
      { key: "at", header: "Data", align: "right", cell: (row: Movement) => <span className="tabular">{formatDate(row.occurredAt)}</span> },
    ]}
  />
);

export const LicensesPage = () => (
  <ResourcePage
    title="Licenças"
    description="Contratos de software, assentos consumidos, renovação e custo anual."
    resource="licenses"
    repository={licensesService}
    createLabel="Nova licença"
    statusOptions={[
      { value: "all", label: "Todos os status" },
      { value: "active", label: "Ativa" },
      { value: "expiring", label: "Vencendo" },
      { value: "expired", label: "Vencida" },
      { value: "unassigned", label: "Sem alocação" },
    ]}
    columns={[
      { key: "name", header: "Licença", cell: (row: License) => <span className="font-medium">{row.name}</span> },
      { key: "vendor", header: "Fornecedor", cell: (row: License) => muted(row.vendor) },
      { key: "seats", header: "Assentos", cell: (row: License) => <span className="tabular">{row.seatsUsed}/{row.seatsTotal}</span> },
      { key: "status", header: "Status", cell: (row: License) => <StatusBadge status={row.status} /> },
      { key: "renewal", header: "Renovação", cell: (row: License) => <span className="tabular">{formatDate(row.renewalDate)}</span> },
      { key: "cost", header: "Custo anual", align: "right", cell: (row: License) => <span className="tabular">{formatCurrency(row.annualCost)}</span> },
    ]}
    detail={(row: License) => ({
      title: row.name,
      subtitle: `${row.vendor} · ${row.ownerDepartment}`,
      content: (
        <DetailGrid
          items={[
            { label: "Chave", value: mono(row.key) },
            { label: "Status", value: <StatusBadge status={row.status} /> },
            { label: "Assentos", value: `${row.seatsUsed} de ${row.seatsTotal}` },
            { label: "Renovação", value: formatDate(row.renewalDate) },
            { label: "Custo anual", value: formatCurrency(row.annualCost) },
            { label: "Departamento", value: row.ownerDepartment },
          ]}
        />
      ),
    })}
  />
);

export const PpePage = () => (
  <ResourcePage
    title="EPIs"
    description="Equipamentos de proteção individual com CA, validade e comprovação de entrega."
    resource="ppes"
    repository={ppeService}
    createLabel="Nova entrega de EPI"
    statusOptions={[
      { value: "all", label: "Todos os status" },
      { value: "valid", label: "Válido" },
      { value: "expiring", label: "Vencendo" },
      { value: "expired", label: "Vencido" },
    ]}
    columns={[
      { key: "name", header: "EPI", cell: (row: Ppe) => <span className="font-medium">{row.name}</span> },
      { key: "ca", header: "CA", cell: (row: Ppe) => mono(row.ca) },
      { key: "assignee", header: "Colaborador", cell: (row: Ppe) => muted(row.assignee) },
      { key: "department", header: "Departamento", cell: (row: Ppe) => muted(row.department) },
      { key: "status", header: "Status", cell: (row: Ppe) => <StatusBadge status={row.status} /> },
      { key: "expires", header: "Validade", align: "right", cell: (row: Ppe) => <span className="tabular">{formatDate(row.expiresAt)}</span> },
    ]}
  />
);

export const MaintenancePage = () => (
  <ResourcePage
    title="Manutenções"
    description="Ordens preventivas e corretivas com prazo, fornecedor e custo real."
    resource="maintenance"
    repository={maintenanceService}
    createLabel="Nova ordem"
    statusOptions={[
      { value: "all", label: "Todos os status" },
      { value: "scheduled", label: "Agendada" },
      { value: "in_progress", label: "Em execução" },
      { value: "done", label: "Concluída" },
      { value: "late", label: "Atrasada" },
    ]}
    columns={[
      { key: "code", header: "OS", cell: (row: MaintenanceOrder) => mono(row.code), width: "100px" },
      { key: "asset", header: "Ativo", cell: (row: MaintenanceOrder) => <span className="font-medium">{row.assetName}</span> },
      { key: "type", header: "Tipo", cell: (row: MaintenanceOrder) => <StatusBadge status={row.type} /> },
      { key: "status", header: "Status", cell: (row: MaintenanceOrder) => <StatusBadge status={row.status} /> },
      { key: "provider", header: "Fornecedor", cell: (row: MaintenanceOrder) => muted(row.provider) },
      { key: "due", header: "Prazo", cell: (row: MaintenanceOrder) => <span className="tabular">{formatDate(row.dueAt)}</span> },
      { key: "cost", header: "Custo", align: "right", cell: (row: MaintenanceOrder) => <span className="tabular">{formatCurrency(row.cost)}</span> },
    ]}
    detail={(row: MaintenanceOrder) => ({
      title: row.code,
      subtitle: `${row.assetName} · ${row.assetTag}`,
      content: (
        <DetailGrid
          items={[
            { label: "Tipo", value: <StatusBadge status={row.type} /> },
            { label: "Status", value: <StatusBadge status={row.status} /> },
            { label: "Fornecedor", value: row.provider },
            { label: "Abertura", value: formatDate(row.openedAt) },
            { label: "Prazo", value: formatDate(row.dueAt) },
            { label: "Custo", value: formatCurrency(row.cost) },
            { label: "Descrição", value: row.description },
          ]}
        />
      ),
    })}
  />
);

export const AuditsPage = () => (
  <ResourcePage
    title="Auditorias"
    description="Ciclos de conferência física do inventário e tratamento de divergências."
    resource="audits"
    repository={auditsService}
    createLabel="Nova auditoria"
    statusOptions={[
      { value: "all", label: "Todos os status" },
      { value: "planned", label: "Planejada" },
      { value: "running", label: "Em andamento" },
      { value: "closed", label: "Encerrada" },
    ]}
    columns={[
      { key: "code", header: "Código", cell: (row: Audit) => mono(row.code), width: "140px" },
      { key: "scope", header: "Escopo", cell: (row: Audit) => <span className="font-medium">{row.scope}</span> },
      { key: "responsible", header: "Responsável", cell: (row: Audit) => muted(row.responsible) },
      { key: "status", header: "Status", cell: (row: Audit) => <StatusBadge status={row.status} /> },
      { key: "progress", header: "Conferidos", cell: (row: Audit) => <span className="tabular">{row.itemsChecked}/{row.itemsPlanned}</span> },
      { key: "div", header: "Divergências", align: "right", cell: (row: Audit) => <span className="tabular">{row.divergences}</span> },
    ]}
  />
);

export const SuppliersPage = () => (
  <ResourcePage
    title="Fornecedores"
    description="Parceiros de compra, contrato e manutenção vinculados ao patrimônio."
    resource="suppliers"
    repository={suppliersService}
    createLabel="Novo fornecedor"
    columns={[
      { key: "name", header: "Fornecedor", cell: (row: Supplier) => <span className="font-medium">{row.name}</span> },
      { key: "doc", header: "CNPJ", cell: (row: Supplier) => mono(row.document) },
      { key: "contact", header: "Contato", cell: (row: Supplier) => muted(row.contact) },
      { key: "category", header: "Categoria", cell: (row: Supplier) => muted(row.category) },
      { key: "contract", header: "Contrato até", cell: (row: Supplier) => <span className="tabular">{formatDate(row.contractUntil)}</span> },
      { key: "assets", header: "Ativos", align: "right", cell: (row: Supplier) => <span className="tabular">{row.activeAssets}</span> },
    ]}
  />
);

export const DepartmentsPage = () => (
  <ResourcePage
    title="Departamentos"
    description="Estrutura organizacional, centros de custo e distribuição de ativos."
    resource="departments"
    repository={departmentsService}
    createLabel="Novo departamento"
    columns={[
      { key: "name", header: "Departamento", cell: (row: Department) => <span className="font-medium">{row.name}</span> },
      { key: "manager", header: "Gestor", cell: (row: Department) => muted(row.manager) },
      { key: "cc", header: "Centro de custo", cell: (row: Department) => mono(row.costCenter) },
      { key: "headcount", header: "Pessoas", align: "right", cell: (row: Department) => <span className="tabular">{row.headcount}</span> },
      { key: "assets", header: "Ativos", align: "right", cell: (row: Department) => <span className="tabular">{row.assetsCount}</span> },
    ]}
  />
);

export const CategoriesPage = () => (
  <ResourcePage
    title="Categorias"
    description="Taxonomia dos ativos, regras de depreciação e exigência de manutenção."
    resource="categories"
    repository={categoriesService}
    createLabel="Nova categoria"
    columns={[
      { key: "name", header: "Categoria", cell: (row: Category) => <span className="font-medium">{row.name}</span> },
      { key: "kind", header: "Tipo", cell: (row: Category) => muted(row.kind) },
      { key: "dep", header: "Depreciação", cell: (row: Category) => <span className="tabular">{row.depreciationMonths} meses</span> },
      { key: "maint", header: "Manutenção", cell: (row: Category) => muted(row.requiresMaintenance ? "Obrigatória" : "Opcional") },
      { key: "assets", header: "Ativos", align: "right", cell: (row: Category) => <span className="tabular">{row.assetsCount}</span> },
    ]}
  />
);
