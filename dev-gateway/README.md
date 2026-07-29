# dev-gateway

Réplica local do `tenant-gateway` (Better-Auth + modo genérico `/data/:table`), só para
desenvolvimento — enquanto o time não tem acesso ao gateway/Neon reais do hub. Implementa o
mesmo contrato que `../Importantdoc.md` §B5/§B8 descreve, contra um Postgres local (fazendo o
papel do Neon do tenant).

**Não é o `tenant-gateway` de produção.** É single-tenant (1 banco local = 1 tenant), sem
multi-tenant routing por `X-Tenant-Id` (o header é aceito mas ignorado), com um `secret` de
Better-Auth fraco de propósito. Não usar em produção nem expor pra internet.

## Rodando pela primeira vez

Da raiz do repo (`asset-hub-pro/`):

```bash
docker compose up -d postgres        # sobe o Postgres 16 local (porta 5432)
cd dev-gateway
cp .env.example .env
npm install
npm run migrate                       # cria tabelas do Better-Auth (+ plugin admin) e roda supabase/migrations/*.sql
npm run dev                           # sobe o gateway em http://localhost:8787
```

Em outro terminal, na raiz do repo (o front):

```bash
cp .env.example .env                  # VITE_GATEWAY_URL=http://localhost:8787, VITE_TENANT_ID=local-dev
npm install
npm run dev                           # SPA em http://localhost:8080 (ou 8081 se a porta estiver ocupada)
```

Acesse o front, clique em "Criar workspace" e cadastre o primeiro usuário — ele vira **admin**
automaticamente (§B8). Os próximos cadastros entram como **rep**. Pra virar `manager`, o admin
usa a tela **Usuários** (`/users`, ou o item no menu da conta) — ela já funciona de ponta a ponta
aqui no local (plugin `admin` do Better-Auth habilitado em `src/auth.ts`, ver
`../GATEWAY-ADMIN-ENDPOINTS.md`). Promover a `admin` continua sendo manual, de propósito (a tela
não deixa — ver `../docs/rbac-papeis.md`):

```bash
docker exec -it asset-hub-pro-postgres-1 psql -U postgres -d assethub \
  -c "update \"user\" set role = 'admin' where email = 'voce@exemplo.com';"
```

## O que este gateway garante (testado manualmente)

- `owner_id` é sempre setado a partir da sessão — um `owner_id` mandado no corpo da requisição
  é ignorado, nunca confiado.
- `admin`/`manager` veem todas as linhas de tabelas com `owner_id`; `rep` só vê (e só edita/deleta)
  as próprias. Ativos/EPIs/Assinaturas são exceção deliberada: viraram tabelas "lookup" sem
  `owner_id` (leitura aberta a todo logado, escrita só admin/manager — ver
  `../docs/rbac-papeis.md`).
- Sem sessão válida, toda rota `/data/*` responde `401`.
- Tabela fora da lista branca (`src/schema.ts`) responde `404` — não existe SQL dinâmico sobre
  nome de tabela/coluna vindo do client sem passar por essa lista.
- `/api/auth/admin/list-users` e `/api/auth/admin/set-role` só respondem pra sessão com
  `role === "admin"` — testado promovendo um `rep` a `manager` e confirmando que esse `manager`
  continua recebendo `403` nessas rotas.

## Quando o time tiver acesso ao gateway/Neon reais

Nada no front precisa mudar além do `.env` (`VITE_GATEWAY_URL` apontando pro gateway real). Essa
pasta inteira (`dev-gateway/`) pode ser descartada — ela nunca foi parte do contrato do template,
é só a ponte de desenvolvimento local.
