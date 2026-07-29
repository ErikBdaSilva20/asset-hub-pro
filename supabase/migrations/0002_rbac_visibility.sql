-- =====================================================
-- RBAC de visibilidade — template "asset-hub" (fundação Masia)
-- Ativos/EPIs/Assinaturas viram tabelas lookup (sem owner_id): leitura liberada a
-- qualquer usuário logado, escrita continua restrita a admin/manager pelo gateway.
-- Ver Importantdoc.md §B4.6 e docs/rbac-papeis.md para o racional completo.
-- =====================================================

-- ---------------------------------------------------
-- assets — vira lookup (rep precisa ler pra ver o que foi atribuído a ele)
-- ---------------------------------------------------

drop index if exists idx_assets_owner;
alter table assets drop column if exists owner_id;

-- ---------------------------------------------------
-- ppes — vira lookup; ganha assignee_id (denormalizado em assignee, que já existia)
-- ---------------------------------------------------

drop index if exists idx_ppes_owner;
alter table ppes drop column if exists owner_id;

alter table ppes
  add column if not exists assignee_id uuid references employees(id) on delete set null;

create index if not exists idx_ppes_assignee on ppes(assignee_id);

-- ---------------------------------------------------
-- licenses — vira lookup; ganha assignee_id + assignee (não tinha vínculo por pessoa)
-- ---------------------------------------------------

drop index if exists idx_licenses_owner;
alter table licenses drop column if exists owner_id;

alter table licenses
  add column if not exists assignee_id uuid references employees(id) on delete set null,
  add column if not exists assignee text;

create index if not exists idx_licenses_assignee on licenses(assignee_id);
