-- =====================================================
-- EPIs ganham custo e categoria — template "asset-hub" (fundação Masia)
-- Sem isso, gasto com EPI não tinha como entrar no gráfico de gastos por categoria
-- (admin-only, dashboard). `category_id`/`category` seguem o mesmo padrão denormalizado
-- já usado em assets (Importantdoc.md §B5 — sem join no modo genérico).
-- =====================================================

alter table ppes
  add column if not exists cost numeric(14, 2) not null default 0,
  add column if not exists category_id uuid references categories(id) on delete set null,
  add column if not exists category text;

create index if not exists idx_ppes_category on ppes(category_id);
