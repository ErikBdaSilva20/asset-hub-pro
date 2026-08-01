-- =====================================================
-- Elimina o diretório de RH `employees` — template "asset-hub" (fundação Masia)
-- Decisão: rep = a pessoa que recebe ativo/EPI/assinatura, e todo rep tem login
-- (ver TODO-MERGE-COLABORADOR-USUARIO.md). Cargo passou a viver em `user.cargo`
-- (additionalField do Better-Auth, ver dev-gateway/src/auth.ts) em vez de `employees.role`.
--
-- Diferente de 0008_drop_suppliers.sql (drop puro): `assignee_id` precisa sobreviver em
-- assets/ppes/license_assignments, só muda de tipo (uuid→text) e de referência
-- (employees(id)→"user"(id)). Backfill por e-mail (case-insensitive): colaborador cujo e-mail
-- bate com um "user" existente herda o user.id; sem match, assignee_id fica null — vira "sem
-- responsável" (atribuir a quem ainda não tem conta é feature adiada, fora de escopo aqui).
-- =====================================================

-- ---------------------------------------------------
-- assets.assignee_id
-- ---------------------------------------------------

alter table assets add column if not exists assignee_id_new text references "user"(id) on delete set null;

update assets a set assignee_id_new = u.id
  from employees e
  join "user" u on lower(u.email) = lower(e.email)
  where a.assignee_id = e.id;

-- Colaborador sem user correspondente: assignee_id_new fica null, mas o texto denormalizado
-- `assignee` (nome) sobreviveria sozinho sem ninguém por trás dele se não for limpo aqui — a
-- tela mostraria um responsável que não existe mais no sistema.
update assets set assignee = null where assignee_id is not null and assignee_id_new is null;

drop index if exists idx_assets_assignee;
alter table assets drop column if exists assignee_id;
alter table assets rename column assignee_id_new to assignee_id;
create index if not exists idx_assets_assignee on assets(assignee_id);

-- ---------------------------------------------------
-- ppes.assignee_id
-- ---------------------------------------------------

alter table ppes add column if not exists assignee_id_new text references "user"(id) on delete set null;

update ppes p set assignee_id_new = u.id
  from employees e
  join "user" u on lower(u.email) = lower(e.email)
  where p.assignee_id = e.id;

update ppes set assignee = null where assignee_id is not null and assignee_id_new is null;

drop index if exists idx_ppes_assignee;
alter table ppes drop column if exists assignee_id;
alter table ppes rename column assignee_id_new to assignee_id;
create index if not exists idx_ppes_assignee on ppes(assignee_id);

-- ---------------------------------------------------
-- license_assignments.assignee_id
-- ---------------------------------------------------

alter table license_assignments add column if not exists assignee_id_new text references "user"(id) on delete set null;

update license_assignments la set assignee_id_new = u.id
  from employees e
  join "user" u on lower(u.email) = lower(e.email)
  where la.assignee_id = e.id;

update license_assignments set assignee = null
  where assignee_id is not null and assignee_id_new is null;

drop index if exists idx_license_assignments_assignee;
alter table license_assignments drop column if exists assignee_id;
alter table license_assignments rename column assignee_id_new to assignee_id;
create index if not exists idx_license_assignments_assignee on license_assignments(assignee_id);

-- ---------------------------------------------------
-- employees — some (índices e trigger somem junto com a tabela)
-- ---------------------------------------------------

drop table if exists employees;
