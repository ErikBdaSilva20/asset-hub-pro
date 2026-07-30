-- =====================================================
-- Assinaturas ganham categoria — template "asset-hub" (fundação Masia)
-- Mesmo padrão já usado em ppes (migration 0003_ppe_cost_category.sql): category_id/category
-- denormalizado (Importantdoc.md §B5 — sem join no modo genérico). Sem isso, gasto com
-- Assinaturas nunca entrava no gráfico "Gastos por categoria" (admin-only, dashboard) — só
-- ativos, manutenção e EPI, mesmo sendo um custo real e recorrente.
-- =====================================================

alter table licenses
  add column if not exists category_id uuid references categories(id) on delete set null,
  add column if not exists category text;

create index if not exists idx_licenses_category on licenses(category_id);
