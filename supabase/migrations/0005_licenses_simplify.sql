-- =====================================================
-- Simplifica Assinaturas — template "asset-hub" (fundação Masia)
-- O modelo original (assentos, chave de ativação) era pensado pra licença corporativa
-- tipo "50 assentos do GitHub". Na prática o admin usa isto pra centralizar QUALQUER
-- assinatura (Claude, GPT, Netflix...): nome, custo, periodicidade e responsável — sem
-- conceito de assento nem chave de licença.
-- =====================================================

do $$ begin
  create type license_billing_period as enum ('monthly', 'annual');
exception when duplicate_object then null;
end $$;

alter table licenses
  drop column if exists key,
  drop column if exists seats_total,
  drop column if exists seats_used,
  add column if not exists billing_period license_billing_period not null default 'annual';

do $$ begin
  alter table licenses rename column annual_cost to cost;
exception when undefined_column then null;
end $$;

comment on column licenses.cost is 'Custo do período indicado em billing_period (mensal ou anual) — não é sempre anual.';
