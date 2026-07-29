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
