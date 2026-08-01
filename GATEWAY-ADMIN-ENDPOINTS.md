# Endpoints de admin do tenant-gateway — confirmados localmente, não em produção

**TL;DR:** o formato que a gente assumiu pra `auth.listUsers`/`auth.setRole` (`src/lib/data/client.ts`)
está **confirmado correto** — testei rodando o `dev-gateway` local de verdade (Better-Auth +
Postgres), não mock. O que falta é só: **o `tenant-gateway` de produção precisa ter o plugin
"admin" do Better-Auth habilitado** — sem isso, continua dando 404 lá, mesmo com o formato certo.

## Como chegamos aqui

Pra promover um `rep` a `manager` (ver `docs/rbac-papeis.md`), a UI precisa de dois endpoints que
não existiam no template: listar os usuários do tenant e trocar o papel de um deles. Isso não é
CRUD genérico (`/data/:table`) — é auth, e Better-Auth resolve isso via um plugin chamado
**"admin"** (https://www.better-auth.com/docs/plugins/admin).

Pedimos documentação de quais endpoints do `tenant-gateway` estão disponíveis pra isso e não veio
resposta até agora (2026-07-29). Implementamos `auth.listUsers`/`auth.setRole` seguindo a
convenção padrão do plugin, testamos em `/users` e bateu **404** contra o gateway real — o plugin
não está habilitado lá (ou não está montado nesse caminho).

## O que foi verificado (2026-07-29, contra o `dev-gateway` local)

Habilitei o plugin `admin()` no `dev-gateway` (`dev-gateway/src/auth.ts`) — é nosso, controlamos,
roda o **mesmo** `better-auth@1.2.7` que o `tenant-gateway` real presumivelmente usa. Rodei o
fluxo inteiro contra Postgres de verdade:

1. Cadastro do 1º usuário → vira `admin` automaticamente (nosso hook de "1º usuário" convive bem
   com o plugin, sem conflito de `databaseHooks`).
2. Cadastro do 2º usuário → vira `rep` automaticamente.
3. Login como admin, `GET /api/auth/admin/list-users?limit=200` → **200**, `{ users: [...] }`
   com `{ id, name, email, role }` por usuário — exatamente o formato assumido.
4. `POST /api/auth/admin/set-role` com `{ userId, role: "manager" }` → **200**,
   `{ user: {...} }` com o papel já atualizado.
5. Confirmei persistência de verdade: novo `list-users` depois mostra o papel novo; reload
   completo da página `/users` (não só estado do React) também mostra `Manager`.
6. Testei também pela tela `/users` de verdade (não só `curl`): logou, abriu a tela, promoveu um
   usuário pelo seletor, toast de sucesso, sobreviveu a reload.
7. Bônus de segurança confirmado: usuário promovido a `manager` **não** consegue chamar
   `/api/auth/admin/list-users` (dá 403) — o plugin só libera pra `role === "admin"`
   (`adminRoles` default), então mesmo que alguém burle a UI e chame a API direto, só admin de
   verdade consegue gerenciar papéis. Não é só a tela que esconde o botão.

**Conclusão:** `src/lib/data/client.ts` está certo. **Não precisa mudar nada no código do
template.** O que falta é 100% do lado do `tenant-gateway` de produção.

## O que fazer no `tenant-gateway` de produção

1. Confirmar/pedir pra habilitar o plugin admin: `betterAuth({ ..., plugins: [admin()] })`
   (import de `better-auth/plugins`). Ver `dev-gateway/src/auth.ts` neste repo como referência
   exata do que foi testado.
2. Rodar a migration do Better-Auth de novo depois de habilitar o plugin — ele adiciona 3 colunas
   na tabela `user` (`banned`, `banReason`, `banExpires`) que não existiam antes. Sem isso os
   endpoints de admin dão erro 500 tentando ler/gravar essas colunas.
3. Testar com um usuário `admin` de verdade do tenant: `GET /api/auth/admin/list-users` deve
   voltar 200 com a lista, não mais 404.

Se quiser reproduzir o teste local antes de pedir pro time do gateway: `dev-gateway/README.md`
tem o passo a passo (`docker compose up -d postgres`, `npm run migrate`, `npm run dev`).

## Está tudo mais bloqueado por causa disso?

Não. Todo o resto do RBAC (tabelas lookup, telas somente-leitura pro rep, navegação e bloqueio de
rota por papel — ver `docs/rbac-papeis.md`) já funciona hoje e não depende de nada disto. A tela
`/users` também já está pronta e testada — só falta o `tenant-gateway` de produção ligar o plugin.

## Adendo (2026-07-31) — merge employees→user: `cargo` + `/data/users_lite`

O template eliminou o diretório de RH `employees` (ver `TODO-MERGE-COLABORADOR-USUARIO.md`): todo
`rep` agora é só um `user` do Better-Auth, e o cargo dele (antes `employees.role`) virou um campo
na própria sessão. Isso adiciona **duas coisas novas** ao contrato do gateway, além do que já
estava documentado acima — testadas contra o `dev-gateway` local, **não confirmadas em produção**:

### 1. Campo `cargo` no `user` (additionalField do Better-Auth)

`dev-gateway/src/auth.ts` define `cargo` em `user.additionalFields` (mesmo molde de `role`,
`input: false`). Isso adiciona **mais uma coluna** na tabela `"user"` (`cargo text`), do mesmo
jeito que `role`/`banned`/`banReason`/`banExpires` já precisaram de migration do Better-Auth
depois de mudar a config (ver §2 acima). **No `tenant-gateway` de produção, isso precisa da mesma
migration do Better-Auth de novo** depois de replicar a config de `additionalFields`, senão
qualquer leitura/escrita de `cargo` dá erro 500 (coluna não existe).

### 2. Rotas novas `GET /data/users_lite` e `PATCH /data/users_lite/:id`

Não são do plugin admin do Better-Auth — são rotas Hono **próprias** do template
(`dev-gateway/src/users-lite-routes.ts`), porque a tabela `"user"` não é servida pelo modo
genérico `/data/:table` (esse só cobre `schema.ts`/`supabase/migrations`). Cobrem duas lacunas
que o plugin admin não resolve:

- **`manager` listar reps** pra atribuir ativo/EPI/assinatura — `list-users` (§ acima) é
  admin-only de verdade (confirmado: manager toma 403), então sem esta rota o manager não tinha
  como escolher pra quem atribuir algo.
- **admin/manager definir o cargo de um rep** sem depender de `POST /admin/update-user`
  (`authClient.admin.updateUser`) do Better-Auth — que existe na lib mas tem o mesmo problema de
  versão não confirmada citado acima (`better-auth` pinado em `^1.2.7`, endpoint testado localmente
  contra `1.6.25`).

Contrato exato (ver `dev-gateway/src/users-lite-routes.ts` pra copiar pro `tenant-gateway`):

- `GET /data/users_lite` → admin+manager (mesma regra `isPrivileged()` das tabelas lookup),
  `select id, name, email, role, cargo from "user" order by name`.
- `PATCH /data/users_lite/:id` → admin+manager, body só aceita `{ cargo }` — nunca `role`/`email`/
  senha, que continuam exclusivos do plugin admin.

**No `tenant-gateway` de produção**: precisa montar essas duas rotas (ou equivalentes) além de
habilitar o plugin admin. Sem elas: `/users` (edição de cargo) e qualquer combobox de
"Responsável"/"Repassar para" que dependa de `listUsersLite()` (`src/lib/data/users-lite.repo.ts`)
ficam quebrados — mesmo sintoma de 404 que `list-users`/`set-role` davam antes de o plugin ser
habilitado.

### 3. `admin.createUser` (usado só pelo seed de dados de exemplo)

`src/shared/utils/seed-demo-data.ts` usa `auth.createUser` (`POST /api/auth/admin/create-user`,
plugin admin) pra criar reps de teste sem trocar a sessão de quem clicou em "Popular com dados de
exemplo" (diferente de `signUp`, que loga como a conta nova). Só importa pra quem for testar o
botão de seed contra o `tenant-gateway` de produção — o resto do app não depende disto.
