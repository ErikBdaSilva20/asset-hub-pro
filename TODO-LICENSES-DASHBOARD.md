# RESOLVIDO: gastos de Assinaturas no dashboard + atribuição a colaborador + privacidade

> Implementado em 2026-07-29. Este arquivo era o levantamento do pedido; os 3 itens abaixo foram
> decididos e implementados nesta sessão, em partes sequenciais. Mantido como registro da decisão
> tomada (útil se alguém perguntar "por que existe uma tabela `license_assignments`?").

## Pedido 1 — Gasto com Assinaturas no dashboard

**Decisão: opção (a)** — `licenses` ganhou `category_id`/`category` (migration
`0007_license_category.sql`, mesmo padrão de `ppes` em `0003`). `SpendByCategoryChart`
(`dashboard-charts.tsx`) agora soma `licenses.cost` por categoria, anualizando (`× 12`) quando
`billing_period === "monthly"` via `annualizedLicenseCost()`. Campo "Categoria" (texto livre)
adicionado ao formulário em `LicensesScreen.tsx` para o dado existir.

## Pedido 2 — Atribuir assinatura a um colaborador via select

`ResourceFormDialog` (`resource-form-dialog.tsx`) ganhou `FormFieldDef.deriveFields` — um select
pode mesclar campos extra no formulário ao escolher uma opção (reutilizável por qualquer campo
futuro do mesmo formato: categoria, fornecedor, etc., não só colaborador). `LicensesScreen.tsx`
usa isso no campo `assignee_id` (admin-only, ver Pedido 3): ao escolher um `employee`, preenche
`assignee` (nome denormalizado) junto.

## Pedido 3 — só admin pode ver quem tem qual assinatura

**Decisão: opção 3 (com garantia de servidor)** — `assignee_id`/`assignee` saíram de `licenses` e
viraram a tabela `license_assignments` (migration `0006_license_assignments.sql`, 1:1 com
`licenses` via `unique(license_id)`). O gateway (`dev-gateway/src/schema.ts` +
`data-routes.ts`) ganhou um 3º modo de acesso reutilizável, `TableDef.adminOnly`: nenhum verbo
(GET/POST/PATCH/DELETE) é liberado pra quem não é `admin`, nem `manager` — diferente de
`ownerScoped`. `licenses` continua lookup normal (nome, custo, vendor, status — todo mundo vê).

Efeito colateral aceito: `manager` deixou de conseguir atribuir responsável (só vê/gerencia o
resto da assinatura); só `admin` atribui, via o mesmo formulário de criação.

Também corrigido de quebra: `ActiveSubscriptions` (`dashboard-panels.tsx`) mostrava
`license.assignee` pra **todo mundo** no dashboard (fora de qualquer gate de admin) — vazamento
pré-existente do mesmo dado que este pedido queria proteger. Trocado por `license.vendor`.

## Verificação

`npx tsc --noEmit -p .` (raiz), `npx tsc --noEmit` (`dev-gateway/`), `npx eslint .` e
`npm run build` rodados sem erros novos. `npm run migrate` aplicado com sucesso contra Postgres
local (0006 e 0007 em cima de um banco já com 0001-0005).
