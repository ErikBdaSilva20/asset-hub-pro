# Pendente: Dashboard do `rep`

> Registrado em 2026-07-30 a pedido do Erik — sessão terminando por limite de contexto, ele vai
> abrir uma sessão nova pra continuar isso. Este arquivo precisa se bastar sozinho.
> **Nada disto foi implementado ainda** — é o levantamento do pedido + decisões em aberto.
> Escopo: **só o Dashboard** (`/dashboard`). Outras telas do rep (Ativos, EPIs, Movimentações...)
> ficam de fora por enquanto.

## Contexto — por que o rep precisa de um dashboard diferente

Hoje `DashboardPage` (`src/modules/dashboard/dashboard-page.tsx`) é praticamente a mesma tela
pra `admin`, `manager` e `rep` — o único role-gating que existe hoje é `SpendByCategoryChart`
(admin-only). Todo o resto (4 StatCards, `ExpiringPanel`, `CategoryChart`, `RecentMovements`,
`MaintenanceQueue`, `AssignedEquipmentPanel`, `RecentActivity`, `ActiveSubscriptions`) renderiza
igual pra todo mundo.

Isso não faz sentido pro `rep`: ele não gerencia o parque, ele **é o parque** — o dashboard dele
devia responder "o que eu tenho, o que eu deveria ter, e isso bate?", não mostrar indicadores de
gestão que só fazem sentido pra quem administra o catálogo inteiro.

## O pedido, como o Erik descreveu

O `rep` é quem faz a **validação dos equipamentos na prática**: ele registra qual equipamento
está com ele naquele momento, dá baixa quando pega/entrega/devolve algo, vê qual assinatura ele
possui (de qual serviço), qual o setor dele, e — **isto é destaque, é bem mais importante que o
resto** — quais equipamentos ele **deveria** estar usando. Segurança do trabalho vem em primeiro
lugar nessa prioridade.

### O que o rep DEVE ver (em ordem de importância)

1. **[DESTAQUE MÁXIMO] Quais equipamentos ele deveria estar usando** — comparado com o que ele
   de fato tem. Ligado a segurança do trabalho (EPI exigido pela função) — isso é o mais
   importante da tela toda, tem que ser o primeiro bloco visual, não um card qualquer no meio.
2. Quais equipamentos estão com ele agora (custódia atual).
3. Ação de dar baixa: **pegou / entregou / devolveu** um equipamento.
4. Qual assinatura ele possui, de qual serviço (ver conflito na seção de decisões abaixo).
5. Qual o setor (departamento) dele.
6. Card "Ativos totais" — só esse dentre os StatCards atuais.

### O que o rep NÃO deve ver

**Dos StatCards atuais** (`dashboard-page.tsx`, topo da tela):
- ❌ "Valor patrimonial" (`formatCurrency(value)`, soma de `purchase_value`)
- ❌ "Manutenções abertas"
- ❌ "Em uso" (e o hint "Alocados a colaboradores")
- ✅ Mantém só "Ativos totais" — mas nesse caso deveria contar só os ativos **dele**, não o
  total da empresa (a rever: hoje `assets.length` é o array inteiro vindo de `listAssets()`, sem
  filtro — pro rep isso precisa ser escopado, provavelmente reaproveitando
  `useRoleScopedResource`/`scopeToAssignee`, ver seção "Onde mexer").

**Dos painéis/cards abaixo:**
- ❌ "Fila de manutenção" (`MaintenanceQueue`)
- ❌ "Quem está com o quê" (`AssignedEquipmentPanel`) — esse é literalmente sobre os *outros*
  colaboradores, não faz sentido nenhum pro rep ver.
- ❌ "Atividades recentes" (`RecentActivity`) — trilha de auditoria de todo mundo, não é dele.

A ideia geral, nas palavras do Erik: **"o rep só ver o que ele tem, que é importante pra ele
saber"** — nada de indicador de gestão, só o que afeta o dia a dia dele.

## Conflito com decisão anterior (resolver antes de implementar)

O pedido de hoje inclui **"qual assinatura ele possui, de qual serviço"** — ou seja, o rep vendo
a **própria** atribuição de assinatura.

Isso contradiz uma decisão já tomada e implementada nesta mesma sessão (Pedido 3 do
`TODO-LICENSES-DASHBOARD.md`, já resolvido e commitado): **"Isso é apenas pra admin ver quem tá
com assinatura. Rep ou manager não deve saber disso jamais."** — frase exata do pedido original.
Implementamos isso com garantia de **servidor**: `license_assignments` é uma tabela `adminOnly`
no gateway (`dev-gateway/src/schema.ts`/`data-routes.ts`) — nenhum verbo (GET incluso) é liberado
pra quem não é `admin`. Um `rep` chamando `GET /data/license_assignments` toma **403**, sempre,
mesmo pra ver a própria linha.

**Isso precisa ser resolvido explicitamente com o Erik antes de codar.** Duas leituras possíveis
do pedido de hoje:

1. **Mudança de decisão**: agora o rep pode ver a própria assinatura (só não a dos outros). Nesse
   caso, `adminOnly` como está hoje é rígido demais — precisaria de um meio-termo tipo "admin vê
   tudo, dono da linha vê só a própria", o que o modo genérico do gateway não suporta hoje sem
   extensão (ele não tem filtro por query — ver Importantdoc.md §B5). **Isso esbarra direto na
   regra que temos de não mexer no gateway.**
2. **O pedido é só sobre licenças atribuídas a ele que ele mesmo já vê por outro canal** — ex.:
   se no futuro a UI de "meus equipamentos" também listar licenças de software como um tipo de
   "ativo" que ele usa, sem precisar consultar `license_assignments` (que é só o vínculo
   admin-only) — precisaria de um modelo de dado diferente pra isso.

**Não decidir isso sozinho na próxima sessão — perguntar antes de implementar.** É exatamente o
tipo de escolha que já erramos de assumir uma vez nesta sessão (ver rbac-papeis.md pra outros
casos parecidos).

## Onde mexer (mapa pra quem pegar isso depois)

- `src/modules/dashboard/dashboard-page.tsx` — hoje é uma tela só pra todo mundo com 1 ponto de
  role-gating (`isAdmin`). Pro rep, a diferença é grande o suficiente (o que mostra, a ordem, o
  destaque) que pode valer a pena um componente **dedicado** (`RepDashboardPage` ou similar) em
  vez de encher `DashboardPage` de ternários — decisão de arquitetura a tomar na hora, mas dado
  quanta coisa muda (~6 elementos escondidos + 1 novo bloco em destaque), um componente separado
  tende a ficar mais legível que condicional espalhada.
- `src/shared/hooks/use-current-employee.ts` (`useCurrentEmployee`) — já liga a sessão logada a
  um registro de `employees` por e-mail. É a base pra saber "quem sou eu" no domínio de negócio;
  qualquer coisa nova aqui parte disso.
- `src/shared/hooks/use-role-scoped-resource.ts` + `src/shared/utils/scope-to-assignee.ts` — já
  filtram uma lista pra "só o que é meu" via `assignee_id`. Reaproveitável tanto pro StatCard de
  "Ativos totais" escopado quanto pro bloco de "equipamentos comigo agora".
- `src/lib/data/ppe-requirements.repo.ts` (`ppe_requirements`, `function_name` → `ppe_name`) — já
  modela "o que a função exige" pra EPI. É a base natural pro bloco de destaque "equipamentos que
  eu deveria estar usando", mas **hoje só cobre EPI, não ativos/equipamentos em geral**. Se o
  destaque quer comparar contra ativos esperados (não só EPI), pode precisar de um conceito novo
  — avaliar primeiro se dá pra modelar isso plano/client-side (ex.: nenhuma tabela nova, só uma
  regra) antes de cogitar schema novo.
- `src/screens/MovementsScreen.tsx` + `src/lib/data/movements.repo.ts` — "dar baixa" (pegou /
  entregou / devolveu) já existe como conceito (`movement_type`: `checkout`/`checkin`/
  `transfer`/...). `movements` é `ownerScoped` no gateway, então **tecnicamente qualquer logado
  já pode criar sua própria movement** (sem bloqueio de servidor pra isso) — o que falta é a
  **UX**: hoje não existe um jeito rápido, a partir do dashboard, do rep registrar "devolvi o
  notebook X" sem passar pela tela cheia de Movimentações (que também não foi pensada pra esse
  fluxo simplificado).
- `src/modules/dashboard/components/dashboard-panels.tsx` — todos os painéis mencionados
  (`MaintenanceQueue`, `AssignedEquipmentPanel`, `RecentActivity`) já existem aqui, só precisam
  ficar fora da árvore renderizada pro rep (ou a tela dedicada nem importa eles).
- `src/shared/components/stat-card.tsx` (`StatCard`) — componente genérico, sem mudança
  necessária nele; é só uma questão de quais instâncias renderizar.

## Rascunho de estrutura visual (não validado com o Erik ainda)

1. **Bloco de destaque no topo** (antes de qualquer StatCard): "Equipamentos que você deveria
   estar usando" — comparação visual entre exigido vs. em posse, com alerta forte (cor de
   destaque/warning) pra qualquer EPI faltando. Segurança do trabalho em primeiro lugar, literal.
2. Card único "Ativos totais" (escopado ao rep).
3. Bloco "Meus equipamentos agora" (custódia atual) com ação rápida de dar baixa
   (pegou/entregou/devolveu).
4. Card "Minha assinatura" — **sujeito à decisão em aberto acima, não implementar sem alinhar.**
5. Card "Meu setor".
6. Nada de: Valor patrimonial, Manutenções abertas, Em uso, Fila de manutenção, Quem está com o
   quê, Atividades recentes.

## Próximos passos sugeridos (na ordem)

1. **Perguntar ao Erik** sobre o conflito de "assinatura própria" antes de tocar em código —
   não assumir nenhum dos dois caminhos sozinho.
2. Decidir: `RepDashboardPage` dedicado vs. `DashboardPage` com mais role-gating condicional.
3. Desenhar de onde vem "equipamentos que eu deveria estar usando" — hoje só existe o conceito
   pra EPI (`ppe_requirements`); decidir se o destaque cobre só EPI por enquanto (mais barato,
   reaproveita o que já existe) ou se precisa expandir pra ativos/equipamentos em geral (mais
   trabalho, pode exigir modelo novo).
4. Implementar por partes, uma de cada vez, com o mesmo padrão desta sessão: `tsc`/`eslint`/
   `npm run build` limpos a cada parte, sem mexer em `dev-gateway/`, `client.ts`, `types.gen.ts`,
   `App.tsx`, `main.tsx` ou `supabase/migrations/**` a menos que uma decisão explícita autorize.
