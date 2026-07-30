-- =====================================================
-- Requisitos de EPI por função — template "asset-hub" (fundação Masia)
-- Tabela lookup (sem owner_id): leitura liberada a qualquer logado, escrita só
-- admin/manager (Importantdoc.md §B4.6) — mesmo padrão de 0002_rbac_visibility.sql.
-- `function_name` casa com o texto livre de `employees.role` (cargo); não é FK porque
-- `role` ali é texto livre, sem tabela própria.
-- =====================================================

create table if not exists ppe_requirements (
  id            uuid primary key default gen_random_uuid(),
  function_name text not null,
  ppe_name      text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint ppe_requirements_function_ppe_key unique (function_name, ppe_name)
);

create index if not exists idx_ppe_requirements_function on ppe_requirements(function_name);

drop trigger if exists trg_ppe_requirements_updated_at on ppe_requirements;
create trigger trg_ppe_requirements_updated_at
  before update on ppe_requirements
  for each row execute function touch_updated_at();
