-- =====================================================
-- Remove Fornecedor — template "asset-hub" (fundação Masia)
-- Decisão de produto: o app não rastreia fornecedores externos como cadastro próprio.
-- `assets.supplier_id`/`supplier` eram a única referência real à tabela suppliers — os campos
-- "Fornecedor" de Manutenções (`maintenance_orders.provider`) e Assinaturas (`licenses.vendor`)
-- são colunas de texto livre independentes e continuam existindo, sem relação com isto.
-- =====================================================

alter table assets drop column if exists supplier_id;
alter table assets drop column if exists supplier;

drop trigger if exists trg_suppliers_updated_at on suppliers;
drop index if exists idx_suppliers_owner;
drop table if exists suppliers;
