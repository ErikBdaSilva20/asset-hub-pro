# Auditoria de Conformidade — AssetHub Pro vs. `Importantdoc.md`

**Metodologia:** `Masia Clone-Template Audit Framework.md` (fork do framework genérico, com classificação de escopo).
**Data:** 2026-07-28
**Escopo do projeto avaliado:** apenas frontend (confirmado — não há backend/gateway/schema no repo).

---

## Resumo executivo

O projeto **não está aderente ao contrato do hub** (`Importantdoc.md`). Ele foi construído como
um frontend enterprise **standalone**, aparentemente a partir do scaffold padrão do Lovable
(`@lovable.dev/vite-tanstack-config`, meta tags `author: Lovable`, pacote `tanstack_start_ts`,
`.lovable/project.json` — este último foi deletado do git nesta working tree, ver §7), e **nunca
foi adaptado** para o contrato "Apps Prontos". Não é um caso de "gaps pontuais" — é uma
arquitetura inteira incompatível com a fundação (`tenant-gateway` + Neon + Better-Auth):

- Roda **SSR via TanStack Start** (nitro, nós de servidor, `src/server.ts`, `src/start.ts`) — o
  guia proíbe explicitamente Next.js/SSR e exige **SPA Vite puro**.
- Usa **`@tanstack/react-router`** (file-based routing) em vez de **`react-router-dom 7`**.
- **Não existe `src/lib/data/client.ts`** nem `db`/`auth`. A camada de dados fala com uma API
  REST própria (`/:resource?page&pageSize&search&status`, `/:resource/:id`) que não tem nenhuma
  relação com o modo genérico do gateway (`/data/:table`, só `list/create/update/remove`).
- **Zero autenticação.** Não há Better-Auth, não há login, não há papéis admin/manager/rep, não
  há `owner_id` em lugar nenhum — porque não há sessão para setá-lo.
- **Não existe schema** (`supabase/migrations/`) nem `masi.template.json`.

Se a intenção é que este projeto **vire** um app pronto do hub, isso é essencialmente um
**re-trabalho de plataforma**, não uma lista de correções incrementais. Se a intenção é que ele
permaneça um SaaS próprio (fora do hub), então boa parte dos itens abaixo deixa de ser aplicável
— **essa é a pergunta em aberto mais importante** (ver §8).

---

## Legenda de escopo (do framework)

| Tag | Significado |
|---|---|
| 🔴 | Incompatibilidade arquitetural — corrigível neste repo, mas é reescrita grande, não um patch |
| 🟢 | Template-scope — pode ser corrigido agora, dentro deste repo |
| 🟠 | Precisa de alinhamento com o `tenant-gateway` (fora deste repo) |
| 🔒 | Arquivo protegido — nunca editar |
| ⚪ | Fora do repo / não é achado de auditoria |

---

## 1. Arquitetura e stack (Importantdoc §B3)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 1 | App roda como **SSR (TanStack Start + nitro)**, não SPA estática | `src/server.ts`, `src/start.ts`, `vite.config.ts` (`tanstackStart.server.entry`), dep `@tanstack/react-start`, `nitro` | "Vite 6 (SPA estático)... **Sem Next.js/SSR**" (§B3); "Proibido: Next.js, SSR/SSG, servidor/API por app" | 🔴 | **P0 bloqueador** |
| 2 | Roteamento usa **`@tanstack/react-router`** (file-based, `routeTree.gen.ts`) | `src/routeTree.gen.ts`, `src/routes/*.tsx` (`createFileRoute`) | "Rotas: **react-router-dom 7**, SPA, `BrowserRouter`" (§B3) | 🔴 | **P0 bloqueador** |
| 3 | `package.json.name` é `"tanstack_start_ts"` — não é um clone do scaffold `forms-nps` nem `wiki` | `package.json:2` | §B9 (só existem 2 pontos de partida válidos) | 🔴 | P1 |

**Por que isso é bloqueador e não um item de backlog:** todo o resto do contrato (manifest
`editable.allow`, `client.ts`, preview Sandpack, build compartilhado do §B10) assume a topologia
de arquivos do scaffold `vite-react-gateway`. Enquanto o app for SSR/TanStack Router, nada do
resto pode ser verificado de forma significativa — é a causa raiz de quase todos os outros itens.

---

## 2. Camada de dados / contrato do gateway (Importantdoc §B5)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 4 | Não existe `src/lib/data/client.ts` nem `db`/`auth`. A camada de dados é uma REST client própria | `src/shared/services/http-client.ts`, `resource-repository.ts` | §B5 (contrato `db.table(name).list/create/update/remove`) | 🔴 | **P0** |
| 5 | `list()` manda `page/pageSize/search/status` como query params | `resource-repository.ts:33-38` | "**NÃO há get-by-id nem filtro por query**" no modo genérico — filtragem tem que ser client-side sobre o `list()` completo (§B5) | 🔴 | **P0** |
| 6 | `Repository.byId()` chama `GET /:resource/:id` | `resource-repository.ts:23,56-60` | "Não desenhe telas que dependam de `GET /data/:table/:id`" / checklist "Telas fazem list-then-filter (sem get-by-id)" | 🟢 (código morto — não é chamado por nenhuma tela hoje) | P2 |
| 7 | Nenhum conceito de `owner_id` no client — nem para setar (correto, quem seta é o gateway) nem para filtrar visibilidade admin/manager vs rep, porque não há sessão | ausência de `auth`/sessão em todo `src/` | §B4.1 + §B8 (visibilidade) | 🔴 (depende do item 10) | **P0** |
| 8 | `envContract` deveria ser só `["VITE_GATEWAY_URL"]`; hoje o client lê `VITE_API_URL` | `http-client.ts:8` | §B3/§B7 | 🟢 (após reescrita do item 4) | P2 |

---

## 3. Schema (Importantdoc §B4)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 9 | **Não existe nenhuma migration** (`supabase/migrations/`) nem qualquer `.sql` no repo | busca por `*.sql` no repo inteiro: zero resultados | §B4 inteiro | 🟢 (a criar) | **P0** |
| 10 | `types.gen.ts` (arquivo gerado/protegido) também não existe | busca no repo: zero resultados | consequência do item 9 | 🟢 | P1 |
| 11 | 10 entidades de domínio hoje só existem como `interface` TS + dados mock — nenhuma delas mapeada para tabela com `owner_id text references "user"(id)` | `src/shared/types/index.ts` (Asset, Employee, License, Movement, MaintenanceOrder, Ppe, Audit, Supplier, Department, Category) | §B4 + §B4.1 (atenção especial: `Movement`/`MaintenanceOrder` referenciam `assetId` — são candidatas a tabela-filha e **precisam de `owner_id` próprio**, não herdado do asset) | 🟢 (a criar, mas exige modelagem) | P1 |

---

## 4. Autenticação e papéis (Importantdoc §B8)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 12 | **Zero autenticação implementada.** Nenhum login, nenhum `Better-Auth`, nenhum `auth.tsx`, nenhum `RequireAuth` | grep por `auth\|login\|role\|admin\|manager` em `src/`: os únicos hits reais são o campo de domínio `Employee.role: string` (cargo do funcionário, não papel de sistema) e textos de UI — nada de infraestrutura de auth | §B8 inteiro | 🔴 | **P0** |
| 13 | Nenhuma tela tem gate por papel (admin/manager vs rep) | consequência do item 12 — todas as 10 telas (`src/modules/registry.tsx`) estão abertas sem checagem | §B8 "Visibilidade... rep vê só os próprios" | 🔴 | **P0** |
| 14 | `src/routes/__root.tsx` não tem nenhum wrapper de sessão/contexto de auth — só `QueryClientProvider` | `src/routes/__root.tsx:123-132` | consequência do item 12 | 🔴 | — |

---

## 5. Manifest do template (Importantdoc §B7)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 15 | **`masi.template.json` não existe** em lugar nenhum do repo | busca `masi.template.json`: zero resultados | §B7 (arquivo obrigatório) | 🟢 (depende dos itens 1–2 primeiro, senão o `editable.allow` referencia uma estrutura de arquivos que não existe) | **P0** |
| 16 | Sem manifest, não há `editable.allow`/`protect` — o editor de IA descrito no guia não tem contrato nenhum para operar neste app | consequência do item 15 | §B1 "editável por IA... dentro de uma allow-list" | 🔴 | P1 |

---

## 6. Higiene de build (pré-requisitos do §B10)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 17 | `tsconfig.json` desliga **`noUnusedLocals`/`noUnusedParameters`**, e `eslint.config.js` desliga `no-unused-vars` | `tsconfig.json:19-20`, `eslint.config.js:36` | "TypeScript strict (`noUnusedLocals`)... **imports não usados quebram o build**" (§B3); pré-requisito de publish "**zero imports não usados**" (§B10) | 🟢 | **P1** |
| 18 | `package-lock.json` está **untracked** (git status); `bun.lock`/`bunfig.toml` foram deletados do índice nesta working tree — migração bun→npm em andamento, lockfile ainda não commitado | `git status` | "`package-lock.json` commitado" é pré-requisito explícito do §B10 | 🟢 | P1 |

---

## 7. Licenciamento / proveniência (Importantdoc §A2, checklist)

| # | Achado | Evidência | Regra violada | Escopo | Severidade |
|---|---|---|---|---|---|
| 19 | **Não existe `THIRD_PARTY.md`** em lugar nenhum do repo | busca `THIRD_PARTY.md`: zero resultados | checklist do framework marca este item como já resolvido (`[x]`), mas não há evidência disso aqui | 🟢/⚪ (depende da origem real do projeto — perguntar) | P2 |
| 20 | Arquivos de estado do Lovable/bun foram deletados nesta working tree (`.lovable/project.json`, `AGENTS.md`, `bun.lock`, `bunfig.toml`) — não é uma violação do `Importantdoc.md`, mas contexto relevante: sugere um pivô de tooling em andamento que vale confirmar antes de seguir | `git status` | — | ⚪ (fora do escopo da auditoria, só um flag) | — |

---

## 8. Achados de qualidade de código (template-scope, independentes do status "hub")

Estes valem a pena independentemente da decisão sobre migrar ou não para o contrato do hub —
são debt real do próprio frontend, per §4/§6.3 do framework:

| # | Achado | Evidência | Observação | Severidade |
|---|---|---|---|---|
| 21 | `src/modules/registry.tsx` (353 linhas) define colunas/detail-view das 10 telas de recurso num único arquivo — acopla mudanças independentes (God-file, falha no "Reason to Change Test" do §4) | `src/modules/registry.tsx` | Se este projeto virar template, o correto seria um arquivo por domínio em `components/<dominio>/**`, seguindo o padrão `screens`/`repo` por entidade | P3 |
| 22 | Interface `Repository<T>.byId` nunca é chamada por nenhuma tela — método morto que ainda modela um contrato incompatível com o gateway (ver item 6) | `resource-repository.ts:23` | Remover ou, se for reescrever a camada de dados, não recriar esse método | P3 |

---

## 9. O que **está** correto (não mexer sem necessidade)

- **Stack visual:** Tailwind v4 + shadcn/ui (`components.json`, `src/components/ui/**` com 46
  componentes) — isso bate exatamente com o scaffold **"wiki"/Pro** do §B9. Se este projeto for
  migrado para o contrato do hub, este é o ponto de partida visual correto, não precisa refazer.
- Domínio (ativos, colaboradores, licenças, movimentações, manutenção, EPI, auditorias,
  fornecedores, departamentos, categorias) é "dados + telas" — **cabe** no CRUD genérico do
  gateway conforme §A3 ("✅ CABE HOJE"). Não há nada aqui que exija realtime, webhooks, jobs,
  pagamento ou página pública — a extensão de fundação **não é necessária** para este domínio.

---

## 10. Priorização (matriz do framework §9)

```
       ALTA  ▲
             │  P0 — Bloqueadores estruturais:      │  P1 — Sequência após P0:
             │  #1 SSR→SPA, #2 router,               │  #3 alinhar ao scaffold,
             │  #4/#5 client.ts+contrato /data,       │  #9/#10/#11 schema+types,
  Impacto     │  #9 schema inexistente,                │  #16 allow/protect,
             │  #12/#13 auth inexistente,             │  #17/#18 build hygiene
             │  #15 masi.template.json inexistente    │
             ├────────────────────────────────────────┼─────────────────────────────
             │  P2 — Cabe fazer já, baixo esforço:    │  P3 — Cleanup, sem urgência:
             │  #6 remover byId morto,                │  #21 God-file registry.tsx,
             │  #8 envContract,                       │  #22 remover interface morta
   BAIXA      │  #19 THIRD_PARTY.md                    │
       └────────────────────────────────────────────┴─────────────────────────────
                          Esforço de implementação
```

**Nota sobre P0:** ao contrário do caso de uso típico deste framework (um template quase
conforme, com gaps isolados), aqui os P0 não são itens independentes — são **sequenciais e
tudo-ou-nada**: não dá para wire de auth (#12) sem antes ter `client.ts`/`db` (#4), que por sua
vez não faz sentido sem sair do SSR (#1) e sem schema (#9) para o gateway servir. **Efetivamente
é um projeto de re-plataformização, não uma sprint de correções.**

---

## 11. Pergunta em aberto para o dono do produto

Antes de agir em qualquer item acima: **este projeto tem intenção de virar um "App Pronto" do
hub Masia, ou é um SaaS enterprise standalone que só compartilha o nome/domínio com o
catálogo de ideias (`docs/CATALOGO-CLONES-IDEIAS.md`)?**

- Se **sim** (vira template do hub): os itens P0 acima definem o roadmap de re-plataformização
  (SPA + react-router-dom 7 + `client.ts`/`db`/`auth` + schema Neon + `masi.template.json`).
- Se **não**: a maior parte deste relatório deixa de ser "gap" e vira decisão de arquitetura
  legítima — restariam só os itens de qualidade de código puros (§8) e a inconsistência interna
  do próprio repo (lockfile não commitado, `noUnusedLocals` desligado).
