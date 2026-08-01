# [RESOLVIDO 2026-07-31] Eliminar o diretório de RH (`employees`), atrelar tudo ao Usuário

> **Implementado nesta sessão.** A pergunta em aberto (§"Pergunta em aberto") foi respondida pelo
> Erik: cargo mora em `user.cargo` (additionalField do Better-Auth), selecionável em `/users`,
> definido por admin/manager (nunca no próprio cadastro). Ver plano completo em
> `GATEWAY-ADMIN-ENDPOINTS.md` (adendo 2026-07-31) pro que falta no `tenant-gateway` de produção
> (rota `/data/users_lite` + coluna `cargo` na tabela `user`). Migration:
> `supabase/migrations/0009_employees_to_user.sql`. Resto deste arquivo fica como registro
> histórico da decisão e do levantamento de impacto original.

## A decisão (confirmada com o Erik nesta sessão)

O AssetHub tem hoje dois conceitos de "pessoa" separados, que geraram confusão real durante a
sessão (ver histórico: perguntas repetidas tipo "quem é colaborador nessa plataforma?"):

1. **`employees`** ("Colaborador", `/employees`) — diretório de RH: nome, e-mail, cargo,
   departamento, status, admissão. Não precisa de login pra existir.
2. **`user`** (Better-Auth, "Usuário", `/users`) — credencial de login + papel de acesso
   (admin/manager/rep).

Ligados só por e-mail batendo (sem FK), o que já causou confusão de UX (users/employees em
grupos opostos do menu — parcialmente resolvido com `PeopleNavTabs`, ver commits recentes).

**O Erik decidiu**: **não faz sentido ter um diretório de RH separado.** A aplicação existe pra
**controlar** ativos/EPI/assinaturas, não pra gerir RH. Resumo do modelo que ele quer:

- **Admin**: vê tudo.
- **Manager**: pode atrelar (atribuir) ativo/EPI/assinatura a uma pessoa já existente.
- **Rep**: é o funcionário que **recebe** essas coisas — ou seja, **rep = a pessoa que hoje é
  "colaborador"**. Todo mundo que recebe ativo/EPI/assinatura **precisa ter conta de login**
  (papel `rep`) — confirmado explicitamente: **"Sim, todo mundo que recebe algo vai ter login
  mesmo."**

**Fica pra depois (não implementar agora, é feature separada)**: permitir que admin/manager
cadastre/atrele informação pra uma pessoa que **ainda não tem conta** — nesse caso ficaria um
alerta tipo "usuário sem cadastro" pendente, até a pessoa criar a conta. O Erik foi explícito:
"isso deixa pra depois". A proposta principal, pra já implementar, é **login obrigatório**.

## Pergunta em aberto que NÃO foi respondida ainda — perguntar antes de implementar

`employees.role` hoje guarda o **cargo** (ex.: "Head de Engenharia", "Técnica de Segurança"), e é
casado por texto com `ppe_requirements.function_name` pra saber qual EPI cada função exige (ver
`AssignedEquipmentPanel`, `RepDashboardPage.usePpeCompliance`). **Sem uma tabela `employees`, onde
mora o cargo de cada rep?**

A tabela `user` do Better-Auth é gerenciada pela lib de auth — não é o lugar recomendado pra
guardar campo de negócio arbitrário (é o mesmo motivo de `employees` ter sido criada separada
desde o início, ver Importantdoc.md). Duas saídas possíveis, **não decidir sozinho, perguntar**:

1. Better-Auth tem suporte a `additionalFields` na config do usuário — poderia adicionar um campo
   `cargo`/`function_name` ali. Mexe em `dev-gateway/src/auth.ts` (fora do escopo normal de edição
   da IA nesta sessão) e no fluxo de cadastro (`RegisterScreen`/admin promovendo usuário).
2. Criar uma tabela nova pequena, tipo `user_profile` (`owner_id`? não, seria por `user_id text
   references "user"(id)`), só com `cargo`/`department` — mantém `user` intocada, mas ainda é uma
   tabela "quase-employees" (avaliar se não estamos só recriando o problema com outro nome).

## Mapa de impacto (o que precisa mudar, pra quem pegar isso depois)

Tudo que referencia `employees.id` hoje precisa passar a referenciar `user.id` (que é **text**,
não uuid — Importantdoc.md §B4: `owner_id text not null references "user"(id)`). Isso é migration
de verdade, com mudança de tipo de coluna, não só flag de config:

- **Migrations**: `assets.assignee_id` (uuid → text, fk pra `"user"`), `ppes.assignee_id` (idem),
  `license_assignments.assignee_id` (idem). Precisa de migration nova (`0009_...sql`), decidir se
  dropa `employees` de vez (como fizemos com `suppliers` em `0008_drop_suppliers.sql` — mesmo
  padrão, mesmo processo: `alter table ... drop column`, `drop table if exists employees`).
- **`dev-gateway/src/schema.ts`**: `TABLES.employees` sai; `assignee_id` de assets/ppes/
  license_assignments muda de significado (aponta pra `user`, não mais pra uma tabela de negócio
  comum — isso é diferente de tudo que o modo genérico faz hoje, porque `user` não é servida por
  `/data/:table`; provavelmente precisa de uma rota nova tipo `/data/users-lite` só com
  id/name/email/role, ou reaproveitar `/api/auth/admin/list-users` — **isto é extensão real de
  gateway, não só um flag, ver Importantdoc.md §A3 "PRECISA ESTENDER A FUNDAÇÃO"**).
- **`types.gen.ts`**: remove `employees`, ajusta tipo de `assignee_id` nas 3 tabelas.
- **Telas que somem ou mudam muito**: `EmployeesScreen.tsx` (deixa de existir como tela de RH —
  vira, na prática, o que já é `UsersScreen.tsx` mais os dados de atribuição); `AssetsScreen.tsx`,
  `PpeScreen.tsx`, `LicensesScreen.tsx` (campo "Responsável"/"Colaborador" passa a vir de
  usuários, não mais de `useEmployeeOptions`/`employees.repo.ts`).
- **Hooks/utils que ficam obsoletos ou precisam mudar de fonte**: `use-employee-options.ts`,
  `find-employee-by-email.ts`, `use-current-employee.ts` (o "quem sou eu" do rep fica MAIS
  simples se rep = usuário — não precisa mais casar por e-mail contra outra tabela!),
  `use-role-scoped-resource.ts` (o filtro "só o que é meu" passaria a comparar direto contra
  `user.id` da sessão, não contra um `employee.id` resolvido por e-mail — simplifica bastante).
- **`RepDashboardPage`/`dashboard-panels.tsx`**: `usePpeCompliance` precisa da resposta da
  pergunta em aberto acima (de onde vem o cargo) pra continuar funcionando.
- **Seeds**: `seed-demo-data.ts` e `seed-heavy.ts` criam `employees` hoje — precisam virar
  criação de usuários de verdade (Better-Auth signUp), o que é bem mais lento/diferente de um
  `INSERT` simples.

## Por que isto não foi feito nesta sessão

Contexto ficou curto demais pra uma mudança deste tamanho (mexe em FK, tipos de coluna, gateway,
e possivelmente auth) com segurança. Fazer pela metade é pior que não fazer.

## Próximos passos sugeridos (na ordem)

1. **Perguntar ao Erik** a pergunta em aberto (onde mora o cargo) antes de tocar em código.
2. Desenhar a extensão de gateway necessária pra expor lista de usuários (papel rep) sem ser via
   `/api/auth/admin/*` (admin-only hoje) — `manager` também precisa listar reps pra atribuir
   coisas a eles.
3. Escrever a migration `0009_...sql` seguindo o padrão de `0008_drop_suppliers.sql`.
4. Atualizar `dev-gateway/src/schema.ts` + `types.gen.ts`.
5. Reescrever hooks (`use-employee-options.ts` etc.) e telas uma por vez, com `tsc`/`build`
   limpos a cada parte — não tentar tudo de uma vez.
6. Feature de "atrelar sem conta ainda + alerta" fica pra uma rodada seguinte, só depois do core
   funcionando.
