# Asset Hub Pro

## Desenvolvimento local (sem acesso ao tenant-gateway/Neon reais)

Este repo inclui um `dev-gateway/` — uma réplica local do `tenant-gateway` (Better-Auth +
`/data/:table` genérico) rodando contra um Postgres local via Docker. Serve pra desenvolver e
testar o front de ponta a ponta sem depender da infra compartilhada do hub. Ver
[`dev-gateway/README.md`](dev-gateway/README.md) para o passo a passo completo. Resumo:

```bash
docker compose up -d postgres
cd dev-gateway && cp .env.example .env && npm install && npm run migrate && npm run dev
# em outro terminal, na raiz:
cp .env.example .env && npm install && npm run dev
```

# Prompt — AssetHub Enterprise Frontend




## Objetivo




Criar o frontend completo do AssetHub.




O objetivo NÃO é construir um MVP.




O objetivo é criar uma base sólida para um software corporativo de gestão de ativos que poderá evoluir durante anos.




O projeto será posteriormente conectado a um backend desenvolvido separadamente.




Todo o frontend deve ser preparado para integração futura, sem misturar responsabilidades.




---




# Mentalidade




Imagine que este projeto será vendido para empresas de médio e grande porte.




A aplicação deve transmitir:




- organização

- robustez

- profissionalismo

- velocidade

- simplicidade




Evite aparência de dashboard genérico.




Evite aparência de template gratuito.




A interface deve lembrar softwares como:




- Linear

- Notion

- Jira

- ClickUp

- Atlassian

- GitHub

- Azure DevOps




Misturando simplicidade com alta densidade de informação.




---




# Objetivo do Produto




O AssetHub controla o ciclo de vida completo de ativos empresariais.




O sistema controla:




- equipamentos

- notebooks

- computadores

- celulares

- móveis

- EPIs

- licenças

- ferramentas

- veículos (estrutura preparada)




Toda entidade possui histórico.




O foco do sistema não é cadastro.




O foco é gerenciamento.




---




# Tecnologias




Utilize obrigatoriamente:




- React 19

- TypeScript

- Vite

- React Router DOM 7

- TailwindCSS v4

- shadcn/ui

- Lucide Icons

- React Hook Form

- Zod

- TanStack Query




Não utilizar:




- Redux

- MobX

- NextJS

- Styled Components

- Material UI

- Bootstrap




---




# Estrutura do Projeto




Organize por módulos.




Nunca por tipo.




Exemplo:




src/




modules/




dashboard/




assets/




licenses/




employees/




maintenance/




audits/




settings/




shared/




components/




hooks/




services/




types/




utils/




layouts/




router/




Nunca criar:




components/




pages/




hooks/




utils/




gigantes.




Cada módulo deve ser isolado.




---




# Arquitetura




Separar claramente:




UI




↓




Hooks




↓




Services




↓




Repositories




↓




API




↓




Backend




Nunca chamar fetch dentro de componentes.




Nunca misturar renderização com regra de negócio.




Nunca colocar validações dentro da interface.




Todo componente deve possuir responsabilidade única.




O componente pode ser unido desde que faça sentido, que o conxtexto do componente seja parecido ou reutilizavel




---




# Fluxo Inicial




Ao abrir o sistema.




Splash Screen.




↓




Tela Login.




↓




Dashboard.




No primeiro acesso.




Mostrar um onboarding.




O onboarding deve explicar:




O que é um ativo.




Como cadastrar.




Como entregar.




Como registrar manutenção.




Como consultar histórico.




O onboarding nunca deve aparecer novamente.




---




# Header




No Header adicionar:




Logo




Busca global




Notificações




Tema claro/escuro




Perfil




Botão de ajuda (?).




Ao clicar no ?.




Abrir um Drawer lateral.




Esse drawer será um guia completo do sistema.




Separado em:




Dashboard




Ativos




Colaboradores




Movimentações




Licenças




EPIs




Manutenções




Auditorias




Cada tópico deve possuir:




Título.




Descrição.




Como utilizar.




Melhores práticas.




Atalhos.




Esse conteúdo deve ser facilmente editável.




---




# TopBar




Dashboard




Ativos




Colaboradores




Movimentações




Licenças




Equipamentos




EPIs




Manutenções




Auditorias




Fornecedores




Departamentos




Categorias




Configurações




---




# Dashboard




Criar dashboard profissional.




Cards.




Gráficos.




Atividades recentes.




Últimas movimentações.




Itens vencendo.




Garantias próximas.




Licenças disponíveis.




EPIs vencendo.




Distribuição por categorias.




Tudo utilizando dados mockados.




(Nota: Todos os dados que forem mockados, precisam estar em uma pasta mock/) para serem facilmente removidos depois




---




# Telas




...




(descrever uma por uma)




Dashboard




Lista




Drawer




Detalhes




Timeline




Histórico




Filtros




Paginação




Busca




Tudo utilizando componentes reutilizáveis.




---




# UX




Nunca abrir telas desnecessárias.




Sempre utilizar:




Drawer




Dialog




Popover




Tooltip




Hover Cards




Context Menu




Command Palette




Breadcrumb




Tabs




Accordion




Timeline




Skeleton Loading




Empty State




Error State




Loading State




---




# Componentes Globais




Criar uma biblioteca reutilizável.




PageHeader




DataTable




Toolbar




Search




Filters




ConfirmDialog




DeleteDialog




Timeline




StatusBadge




AvatarGroup




Card




StatCard




MetricCard




EmptyState




TableToolbar




Drawer




Modal




LoadingOverlay




PageContainer




Section




ActionsDropdown




---




# Performance




Preparar para milhares de registros.




Lazy Loading.




Code Splitting.




Virtualização preparada.




Rotas lazy.




Sem renderizações desnecessárias.




---




# Backend




Não implementar backend.




Criar somente uma camada de serviços.




Toda comunicação deve passar por:




services/




Utilizar Express.




A URL deve vir exclusivamente de:




.env




Exemplo:




VITE_API_URL=




O projeto deverá permitir posteriormente substituir facilmente Express por outro client.




---




# Banco




O frontend não conhece Neon.




Ele apenas conhece a API.




Toda conexão deve ser configurável por .env.




Nunca fixar URLs.




Nunca criar autenticação própria.




---




# Qualidade




Gerar código legível.




Sem arquivos gigantes.




Componentes menores que 450 linhas.




Hooks menores que 250 linhas.




Services menores que 300 linhas.




Funções pequenas.




Nomes claros.




Arquitetura preparada para crescimento.




---




# Resultado Esperado




Ao finalizar, o projeto deverá parecer um software enterprise pronto para produção, mesmo utilizando dados mockados.




O backend será conectado posteriormente sem necessidade de reestruturar a arquitetura do frontend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/893d2054-00b4-487d-aee3-c7a229cafe16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
