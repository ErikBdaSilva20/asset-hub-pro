-- =====================================================
-- Schema consolidado — template "asset-hub" (fundação Masia)
-- Sem RLS, sem auth.uid(), sem tabela profiles — autorização é 100% do
-- tenant-gateway (app-layer). Ver Importantdoc.md §B4.
-- =====================================================

-- ---------------------------------------------------
-- Enums (guarda idempotente — create type não aceita "if not exists")
-- ---------------------------------------------------

do $$ begin
  create type asset_kind as enum ('notebook', 'desktop', 'phone', 'furniture', 'ppe', 'license', 'tool', 'vehicle', 'peripheral');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type asset_status as enum ('available', 'in_use', 'maintenance', 'reserved', 'retired', 'lost');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type asset_condition as enum ('new', 'good', 'fair', 'damaged');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type employee_status as enum ('active', 'on_leave', 'offboarded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type license_status as enum ('active', 'expiring', 'expired', 'unassigned');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type movement_type as enum ('checkout', 'checkin', 'transfer', 'maintenance', 'disposal');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type maintenance_kind as enum ('preventive', 'corrective');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type maintenance_status as enum ('scheduled', 'in_progress', 'done', 'late');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type ppe_status as enum ('valid', 'expiring', 'expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type audit_status as enum ('planned', 'running', 'closed');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------
-- Função compartilhada de updated_at
-- ---------------------------------------------------

create or replace function touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------
-- departments
-- ---------------------------------------------------

create table if not exists departments (
  id            uuid primary key default gen_random_uuid(),
  owner_id      text not null references "user"(id) on delete cascade,
  name          text not null,
  manager       text,
  cost_center   text,
  headcount     integer not null default 0,
  assets_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_departments_owner on departments(owner_id);

drop trigger if exists trg_departments_updated_at on departments;
create trigger trg_departments_updated_at
  before update on departments
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- categories
-- ---------------------------------------------------

create table if not exists categories (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              text not null references "user"(id) on delete cascade,
  name                  text not null,
  kind                  asset_kind not null,
  depreciation_months   integer not null default 0,
  assets_count          integer not null default 0,
  requires_maintenance  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_categories_owner on categories(owner_id);

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
  before update on categories
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- suppliers
-- ---------------------------------------------------

create table if not exists suppliers (
  id             uuid primary key default gen_random_uuid(),
  owner_id       text not null references "user"(id) on delete cascade,
  name           text not null,
  document       text,
  contact        text,
  email          text,
  category       text,
  contract_until timestamptz,
  active_assets  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_suppliers_owner on suppliers(owner_id);

drop trigger if exists trg_suppliers_updated_at on suppliers;
create trigger trg_suppliers_updated_at
  before update on suppliers
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- employees
-- ---------------------------------------------------

create table if not exists employees (
  id             uuid primary key default gen_random_uuid(),
  owner_id       text not null references "user"(id) on delete cascade,
  name           text not null,
  email          text not null,
  role           text not null,
  department_id  uuid references departments(id) on delete set null,
  department     text,
  status         employee_status not null default 'active',
  hired_at       timestamptz not null default now(),
  assets_count   integer not null default 0,
  location       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_employees_owner on employees(owner_id);
create index if not exists idx_employees_department on employees(department_id);

comment on column employees.role is 'Cargo do colaborador (texto livre) — não confundir com o papel de sistema (admin/manager/rep) do Better-Auth.';

drop trigger if exists trg_employees_updated_at on employees;
create trigger trg_employees_updated_at
  before update on employees
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- assets
-- ---------------------------------------------------

create table if not exists assets (
  id               uuid primary key default gen_random_uuid(),
  owner_id         text not null references "user"(id) on delete cascade,
  tag              text not null,
  name             text not null,
  kind             asset_kind not null,
  category_id      uuid references categories(id) on delete set null,
  category         text,
  status           asset_status not null default 'available',
  condition        asset_condition not null default 'new',
  serial_number    text,
  model            text,
  manufacturer     text,
  supplier_id      uuid references suppliers(id) on delete set null,
  supplier         text,
  department_id    uuid references departments(id) on delete set null,
  department       text,
  assignee_id      uuid references employees(id) on delete set null,
  assignee         text,
  location         text,
  purchase_date    timestamptz,
  purchase_value   numeric(14, 2) not null default 0,
  warranty_until   timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint assets_tag_key unique (tag)
);

create index if not exists idx_assets_owner on assets(owner_id);
create index if not exists idx_assets_category on assets(category_id);
create index if not exists idx_assets_kind on assets(kind);

comment on column assets.category is 'Denormalizado a partir de categories.name — modo genérico do gateway não faz join (Importantdoc.md §B5). "Equipamentos" é um recorte client-side desta mesma tabela por kind, não uma tabela separada.';

drop trigger if exists trg_assets_updated_at on assets;
create trigger trg_assets_updated_at
  before update on assets
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- licenses
-- ---------------------------------------------------

create table if not exists licenses (
  id                uuid primary key default gen_random_uuid(),
  owner_id          text not null references "user"(id) on delete cascade,
  name              text not null,
  vendor            text,
  key               text,
  seats_total       integer not null default 0,
  seats_used        integer not null default 0,
  status            license_status not null default 'active',
  renewal_date      timestamptz,
  annual_cost       numeric(14, 2) not null default 0,
  owner_department  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_licenses_owner on licenses(owner_id);

drop trigger if exists trg_licenses_updated_at on licenses;
create trigger trg_licenses_updated_at
  before update on licenses
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- movements (tabela-filha de assets — precisa de owner_id próprio, §B4.1)
-- ---------------------------------------------------

create table if not exists movements (
  id           uuid primary key default gen_random_uuid(),
  owner_id     text not null references "user"(id) on delete cascade,
  asset_id     uuid not null references assets(id) on delete cascade,
  asset_tag    text,
  asset_name   text,
  type         movement_type not null,
  from_label   text,
  to_label     text,
  performed_by text,
  occurred_at  timestamptz not null default now(),
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_movements_owner on movements(owner_id);
create index if not exists idx_movements_asset on movements(asset_id);

-- ---------------------------------------------------
-- maintenance_orders (tabela-filha de assets — precisa de owner_id próprio, §B4.1)
-- ---------------------------------------------------

create table if not exists maintenance_orders (
  id           uuid primary key default gen_random_uuid(),
  owner_id     text not null references "user"(id) on delete cascade,
  code         text not null,
  asset_id     uuid not null references assets(id) on delete cascade,
  asset_tag    text,
  asset_name   text,
  type         maintenance_kind not null,
  status       maintenance_status not null default 'scheduled',
  provider     text,
  opened_at    timestamptz not null default now(),
  due_at       timestamptz,
  cost         numeric(14, 2) not null default 0,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint maintenance_orders_code_key unique (code)
);

create index if not exists idx_maintenance_orders_owner on maintenance_orders(owner_id);
create index if not exists idx_maintenance_orders_asset on maintenance_orders(asset_id);

drop trigger if exists trg_maintenance_orders_updated_at on maintenance_orders;
create trigger trg_maintenance_orders_updated_at
  before update on maintenance_orders
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- ppes
-- ---------------------------------------------------

create table if not exists ppes (
  id           uuid primary key default gen_random_uuid(),
  owner_id     text not null references "user"(id) on delete cascade,
  name         text not null,
  ca           text,
  assignee     text,
  department   text,
  delivered_at timestamptz,
  expires_at   timestamptz,
  status       ppe_status not null default 'valid',
  stock        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_ppes_owner on ppes(owner_id);

drop trigger if exists trg_ppes_updated_at on ppes;
create trigger trg_ppes_updated_at
  before update on ppes
  for each row execute function touch_updated_at();

-- ---------------------------------------------------
-- audits
-- ---------------------------------------------------

create table if not exists audits (
  id              uuid primary key default gen_random_uuid(),
  owner_id        text not null references "user"(id) on delete cascade,
  code            text not null,
  scope           text,
  responsible     text,
  status          audit_status not null default 'planned',
  started_at      timestamptz not null default now(),
  items_planned   integer not null default 0,
  items_checked   integer not null default 0,
  divergences     integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint audits_code_key unique (code)
);

create index if not exists idx_audits_owner on audits(owner_id);

drop trigger if exists trg_audits_updated_at on audits;
create trigger trg_audits_updated_at
  before update on audits
  for each row execute function touch_updated_at();
