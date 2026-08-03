# AssetHub

Gestão corporativa de ativos: ativos/equipamentos, licenças, EPIs, manutenções, movimentações,
auditorias, departamentos e categorias — com papéis admin/manager/rep.

SPA estático (Vite + React 19), sem backend próprio. Toda persistência e autenticação passam
pelo **tenant-gateway** (serviço compartilhado, Better-Auth + `/data/:table` genérico); este repo
não sobe nenhum servidor.

## Rodando localmente

Aponte pra um tenant-gateway já existente (não há backend local neste repo):

```bash
npm install
cp .env.example .env   # preencha VITE_GATEWAY_URL e VITE_TENANT_ID
npm run dev
```

## Build

```bash
npm run build   # tsc && vite build — precisa passar limpo, zero import não usado
```

## Schema

`supabase/setup.sql` é a fonte-da-verdade do schema (idempotente — seguro rodar mais de uma vez
no mesmo banco Postgres/Neon). Roda depois que o gateway já criou as tabelas do Better-Auth
(`"user"`, `session`, `account`, `verification`), já que várias tabelas referenciam `"user"(id)`.
`src/lib/data/types.gen.ts` reflete este schema — se o schema mudar, regenere os tipos junto.

## Estrutura

- `src/screens/**` — telas por rota (ver `src/app.routes.tsx`).
- `src/modules/dashboard/**` — dashboard.
- `src/lib/data/*.repo.ts` — acesso a dados por tabela, todos em cima de `src/lib/data/client.ts`
  (`db.table(name).list/create/update/remove` — o gateway não tem get-by-id nem filtro por
  query; telas fazem list-then-filter no client).
- `src/lib/auth.tsx` — sessão e papel (`admin`/`manager`/`rep`) via Better-Auth.
- `src/lib/data/preview-fixtures.ts` — fixtures usadas quando `window.__MASI_PREVIEW__` está
  ativo (preview/editor), sem chamar rede.

## Papéis

- `admin`/`manager` gerenciam o catálogo inteiro; `rep` só vê o que está atribuído a ele
  (`assignee_id`) nas tabelas lookup (ativos, EPIs, licenças).
- `license_assignments` ("quem tem qual assinatura") é admin-only garantido pelo servidor, não só
  pela UI.
- `role` no front é só pra UI (esconder botão, redirecionar rota) — a autorização real é sempre
  do gateway.
