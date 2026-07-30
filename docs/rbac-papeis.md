# RBAC: papéis e visibilidade no AssetHub

> Contexto de arquitetura pra quem (humano ou IA) mexer nisso depois. Complementa
> `Importantdoc.md` (contrato técnico do hub) — este doc é sobre as decisões específicas deste
> template, não sobre o contrato geral.

## Os 3 papéis

| Papel     | O que faz                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin`   | Vê tudo. Único papel que poderá promover alguém a `manager` (tela `/users`, ver "Pendências").                                                          |
| `manager` | Cadastra e gerencia o catálogo (Ativos, Equipamentos, EPIs, Assinaturas) e o resto do sistema, na prática com os mesmos poderes de escrita que o admin. |
| `rep`     | Consome: vê só os itens atribuídos a ele, não cria nada.                                                                                                |

Papel vem do Better-Auth (`useAuth()`, `src/lib/auth.tsx`). O 1º usuário do tenant vira `admin`
automaticamente; os demais entram como `rep` (Importantdoc.md §B8).

## Por que Ativos/Equipamentos/EPIs/Assinaturas viraram tabelas "lookup"

Schema original (`0001_business_schema.sql`): toda tabela de negócio tinha `owner_id`. A regra do
gateway pra visibilidade é "admin/manager veem tudo; `rep` vê só as próprias linhas (`owner_id`)".
Isso quebra a visibilidade da forma mais óbvia: se um manager cadastra um EPI, o `owner_id` fica
sendo dele — o `rep` pra quem aquele EPI foi entregue nunca receberia essa linha da API.

`0002_rbac_visibility.sql` removeu `owner_id` de `assets`, `ppes` e `licenses`. Sem essa coluna,
o gateway trata a tabela como **lookup**: leitura liberada a qualquer logado, escrita restrita a
admin/manager (Importantdoc.md §B4.6). Isso resolve os dois lados do problema de uma vez:

- **Leitura**: `rep` agora recebe as linhas da API (antes recebia lista vazia sempre).
- **Escrita**: vira proteção de **servidor**, não só botão escondido — o gateway recusa `POST`
  dessas tabelas pra quem não é admin/manager, goste ou não a tela.

`ppes` e `licenses` ganharam `assignee_id` (FK pra `employees`) no mesmo movimento — `assets` já
tinha. **Atualização:** em `licenses` isso durou pouco — `assignee_id`/`assignee` saíram de lá em
`0006_license_assignments.sql` e viraram a tabela `license_assignments`, admin-only de verdade
(ver seção "Decisão: isolamento do `rep` é UI-only" abaixo). `licenses` continua lookup normal
pro resto dos campos (nome, custo, vendor, status, `category`/`category_id` — mesmo padrão
denormalizado de `assets`).

**Se algum dia mais uma tabela precisar do mesmo tratamento** (rep precisando ler algo que hoje só
admin/manager cadastram): o padrão é dropar `owner_id`, garantir um jeito da linha "pertencer" a
alguém via um `assignee_id`-like plano (não Better-Auth ownership), e usar
`useRoleScopedResource` (`src/shared/hooks/use-role-scoped-resource.ts`) na tela — não reinventar
o filtro.

## Decisão: isolamento do `rep` é UI-only

Discutido e aceito explicitamente: a restrição "rep só vê o que é dele" é aplicada **no front**
(`useRoleScopedResource` filtra a lista por `assignee_id` depois de buscar tudo), não no gateway.

**Trade-off aceito:** qualquer `rep` autenticado tecnicamente consegue ler o catálogo inteiro da
empresa chamando a API direto (não passa pela UI, então não passa pelo filtro). Ele **não**
consegue escrever — isso é bloqueado de verdade pelo servidor (seção acima). Pra isolamento de
leitura garantido pelo servidor, seria necessário um endpoint customizado no `tenant-gateway`
(extensão de fundação, Importantdoc.md §A3) — fora do escopo deste template.

**Exceção:** "quem tem qual assinatura" (`license_assignments`) não segue esse trade-off — o
pedido era mais forte ("rep/manager não pode saber isso jamais"), então o gateway ganhou um 3º
modo de acesso, `TableDef.adminOnly` (`dev-gateway/src/schema.ts` + `canRead`/`canWrite` em
`data-routes.ts`): nenhum verbo é liberado pra quem não é `admin`, nem `manager`. Garantia de
servidor de verdade, não UI-only. Reutilizável por qualquer tabela sensível futura — não precisa
virar uma tabela-filha com `owner_id` pra isso, `adminOnly: true` já resolve.

## `assignee_id` com seletor real: Ativos, Equipamentos e Assinaturas — EPIs ainda não

Os formulários de Ativos/Equipamentos (`AssetsScreen.tsx`, `useEmployeeOptions`) e Assinaturas
(`LicensesScreen.tsx`, campo `assignee_id`, admin-only) já têm um `<Select>` de verdade puxando
`employees`, que preenche `assignee_id` **e** `assignee` (denormalizado) ao escolher — via
`FormFieldDef.deriveFields` em `resource-form-dialog.tsx` (genérico, reutilizável por qualquer
campo FK+texto denormalizado que apareça no futuro).

**EPIs (`PpeScreen.tsx`) continua com o campo "Colaborador" em texto livre** — `ppes.assignee_id`
fica `null` e o `rep` nunca vê o item nessa tela, mesmo com o resto do RBAC funcionando. Não foi
resolvido junto por não ter sido pedido; o padrão pra fechar isso é o mesmo já usado nas outras
três telas.

## Tela "Usuários" (promoção a manager) — testada localmente de ponta a ponta

Tela `/users` (`src/screens/UsersScreen.tsx`), só pro admin (`RequireAuth roles={["admin"]}` em
`app.routes.tsx`, item de menu com `roles: ["admin"]` em `navigation.ts`, e também um atalho no
menu da conta — avatar no canto superior direito — pra não depender só do mega-menu), com busca
por nome, que troca o papel de alguém entre `rep`↔`manager` (nunca mexe em `admin`, e qualquer
linha `admin` fica sem seletor — evita autopromoção/autorebaixamento e o risco de ficar sem
nenhum admin).

Pedimos documentação dos endpoints de admin pro time do `tenant-gateway` e não veio resposta.
Implementamos `auth.listUsers`/`auth.setRole` (`src/lib/data/client.ts`) seguindo a convenção
padrão do plugin "admin" do Better-Auth e **testamos o fluxo inteiro contra o `dev-gateway` local
de verdade** (Postgres real, não mock): cadastro, login, listar, promover, confirmar persistência
com reload completo, e até confirmamos que só `role === "admin"` consegue chamar essas rotas
(bloqueio de servidor, não só UI escondida). O formato bateu certinho — **o código está correto**.
O que falta é só o `tenant-gateway` de **produção** ter o plugin habilitado do lado dele. Detalhes
completos (inclusive o que pedir pra quem cuida do gateway): **`GATEWAY-ADMIN-ENDPOINTS.md`** na
raiz do repo.

O resto do RBAC (Stories 1-5 do plano original) não depende disso e já está implementado e
verificado: migration de lookup tables, telas somente-leitura + filtradas pro rep, navegação e
bloqueio de rota por papel.

## Onde mexer

- `src/shared/utils/permissions.ts` — única fonte de verdade de "quem pode gerenciar o catálogo"
  (`canManageCatalog`, `isAdmin`, `hasAnyRole`). Mudou a regra de papéis? Muda só aqui.
- `src/shared/hooks/use-role-scoped-resource.ts` — adapta uma tabela lookup à experiência de cada
  papel (lista filtrada + `readOnly` + mensagem de vazio contextual). Reaproveitado por
  `AssetsScreen`, `EquipmentScreen`, `PpeScreen`. `LicensesScreen` não usa mais — ver exceção
  `adminOnly` acima.
- `src/lib/data/license-assignments.repo.ts` — CRUD de `license_assignments`. Só resolve pra
  quem está logado como `admin`; qualquer outro papel toma 403 do gateway.
- `src/shared/hooks/use-current-employee.ts` — liga a sessão logada a um `employees` (por
  e-mail). Usado pra saber "quem eu sou" no domínio de negócio.
- `src/layouts/navigation.ts` (`getNavItems`) — o que cada papel vê no menu.
- `src/components/RequireAuth.tsx` (`roles` prop) — o que cada papel pode acessar por URL.
