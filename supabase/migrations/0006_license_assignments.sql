-- =====================================================
-- Isola "quem tem qual assinatura" numa tabela admin-only — template "asset-hub" (fundação Masia)
-- Pedido explícito: rep e manager nunca podem saber o responsável de uma assinatura, nem
-- chamando a API direto. licenses continua lookup (nome, custo, vendor, status — informação que
-- todo mundo pode ver); assignee_id/assignee saem daqui e viram license_assignments, tabela cujo
-- acesso o gateway restringe a admin em qualquer verbo (ver TableDef.adminOnly em
-- dev-gateway/src/schema.ts) — garantia de servidor, não só de UI.
-- =====================================================

alter table licenses
  drop column if exists assignee_id,
  drop column if exists assignee;

drop index if exists idx_licenses_assignee;

create table if not exists license_assignments (
  id           uuid primary key default gen_random_uuid(),
  license_id   uuid not null references licenses(id) on delete cascade,
  assignee_id  uuid references employees(id) on delete set null,
  assignee     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint license_assignments_license_key unique (license_id)
);

create index if not exists idx_license_assignments_assignee on license_assignments(assignee_id);

drop trigger if exists trg_license_assignments_updated_at on license_assignments;
create trigger trg_license_assignments_updated_at
  before update on license_assignments
  for each row execute function touch_updated_at();
