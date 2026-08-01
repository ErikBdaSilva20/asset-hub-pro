/**
 * Conteúdo do guia do sistema (drawer de ajuda).
 * Editável por qualquer pessoa do time — nenhum componente precisa mudar.
 */

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  howTo: string[];
  bestPractices: string[];
  /** Pra onde a informação cadastrada aqui se espalha, e por quê — não são atalhos de teclado
   * (não tínhamos nenhum de verdade além do ⌘K), é o mapa de "isso aqui afeta aquilo ali". */
  relatedTo: Array<{ topicId: string; note: string }>;
}

export const helpTopics: HelpTopic[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description:
      "Visão consolidada do parque de ativos: indicadores, vencimentos, movimentações recentes e distribuição por categoria.",
    howTo: [
      "Use os cards superiores para acompanhar inventário, alocação e custo.",
      "Clique em qualquer bloco de alerta para abrir a lista filtrada correspondente.",
      "O gráfico de movimentações compara entradas e saídas dos últimos meses.",
    ],
    bestPractices: [
      "Revise os vencimentos de garantia e licença semanalmente.",
      "Trate divergências de auditoria antes do fechamento do mês.",
    ],
    relatedTo: [
      { topicId: "assets", note: "Ativos totais, em uso e valor patrimonial vêm de Ativos" },
      { topicId: "movements", note: "O gráfico de entradas/saídas vem de Movimentações" },
      { topicId: "maintenance", note: '"Manutenções abertas" vem de Manutenções' },
    ],
  },
  {
    id: "assets",
    title: "Ativos",
    description:
      "Registro central de todo item patrimonial: notebooks, desktops, celulares, móveis, ferramentas e veículos.",
    howTo: [
      "Cadastre com etiqueta, número de série, categoria e valor de compra.",
      "Abra o drawer de detalhes para ver ficha técnica e histórico.",
      "Use filtros de status para separar disponíveis, em uso e em manutenção.",
    ],
    bestPractices: [
      "Padronize a etiqueta (AH-0000) e nunca reutilize código de item baixado.",
      "Anexe nota fiscal e termo de responsabilidade em toda entrega.",
    ],
    relatedTo: [
      { topicId: "categories", note: "O campo Categoria usa o texto cadastrado em Categorias" },
      {
        topicId: "movements",
        note: "Toda entrega/devolução deste ativo vira uma Movimentação vinculada a ele",
      },
      {
        topicId: "maintenance",
        note: "Ordens de serviço abertas ficam vinculadas a este ativo",
      },
    ],
  },
  {
    id: "equipment",
    title: "Equipamentos",
    description:
      "Recorte de TI e ferramentas dentro de Ativos: notebooks, desktops, periféricos e ferramentas. É a mesma tabela de Ativos, só filtrada — cadastrar aqui ou em Ativos dá no mesmo.",
    howTo: [
      "Use esta tela quando o time de TI só precisa ver o parque de equipamentos, sem mobiliário/frota/EPI junto.",
      "Um item criado aqui aparece automaticamente em Ativos também (e vice-versa, se o tipo bater).",
    ],
    bestPractices: [
      "Cadastre o tipo certo (notebook/desktop/periférico/ferramenta) — é ele que decide se o item aparece aqui.",
    ],
    relatedTo: [
      {
        topicId: "assets",
        note: "É a mesma tabela — cadastrar/editar aqui reflete lá e vice-versa",
      },
    ],
  },
  {
    id: "movements",
    title: "Movimentações",
    description: "Trilha de auditoria de entregas, devoluções, transferências e descartes.",
    howTo: [
      "Toda mudança de posse gera um registro imutável.",
      "Use o filtro por tipo para reconciliar entregas e devoluções do período.",
    ],
    bestPractices: [
      "Nunca edite uma movimentação: registre a contrapartida.",
      "Descreva o motivo em transferências entre departamentos.",
    ],
    relatedTo: [
      { topicId: "assets", note: "Toda movimentação exige um ativo já cadastrado" },
      {
        topicId: "dashboard",
        note: 'Alimenta o gráfico de entradas/saídas e as "Atividades recentes"',
      },
    ],
  },
  {
    id: "licenses",
    title: "Assinaturas",
    description:
      "Assinaturas e licenças de software centralizadas: custo, periodicidade (mensal/anual), categoria e renovação.",
    howTo: [
      "Programe a renovação com pelo menos 30 dias de antecedência.",
      "Só o admin vê e atribui o campo Responsável — manager cadastra e gerencia o resto da assinatura, mas nunca vê quem está com ela.",
    ],
    bestPractices: [
      "Revise assinaturas sem categoria a cada trimestre — sem categoria, o gasto não entra no gráfico do Dashboard.",
      "Desative a assinatura no desligamento do responsável.",
    ],
    relatedTo: [
      {
        topicId: "departments",
        note: "O campo Departamento usa o texto cadastrado em Departamentos",
      },
      {
        topicId: "dashboard",
        note: 'Custo anualizado entra em "Gastos por categoria" (admin-only); renovações próximas aparecem em "Itens vencendo" (todo mundo vê)',
      },
    ],
  },
  {
    id: "ppe",
    title: "EPIs",
    description: "Equipamentos de proteção individual com CA, validade e comprovação de entrega.",
    howTo: [
      "Registre CA, data de entrega e validade de cada item.",
      "Itens vencidos devem ser substituídos antes de nova jornada.",
    ],
    bestPractices: [
      "Mantenha estoque mínimo por tamanho e tipo.",
      "Guarde a assinatura da ficha de EPI para fiscalização.",
    ],
    relatedTo: [
      { topicId: "dashboard", note: 'EPIs vencendo aparecem no painel "Itens vencendo"' },
    ],
  },
  {
    id: "maintenance",
    title: "Manutenções",
    description: "Ordens preventivas e corretivas com prazo, fornecedor e custo.",
    howTo: [
      "Abra a OS a partir do ativo para manter o vínculo no histórico.",
      "Feche a ordem com laudo e custo real para alimentar o TCO.",
    ],
    bestPractices: [
      "Priorize ordens atrasadas antes de novas preventivas.",
      "Compare custo acumulado com valor residual antes de reparar.",
    ],
    relatedTo: [
      { topicId: "assets", note: "Toda ordem exige um ativo já cadastrado" },
      { topicId: "dashboard", note: 'Ordens em aberto contam pro card "Manutenções abertas"' },
    ],
  },
  {
    id: "audits",
    title: "Auditorias",
    description: "Ciclos de conferência física do inventário com apuração de divergências.",
    howTo: [
      "Defina escopo, responsável e período antes de iniciar.",
      "Registre cada item conferido; divergências geram pendência.",
    ],
    bestPractices: [
      "Audite categorias de alto valor a cada trimestre.",
      "Encerre o ciclo somente com todas as divergências tratadas.",
    ],
    relatedTo: [],
  },
  {
    id: "departments",
    title: "Departamentos",
    description: "Estrutura organizacional, centros de custo e distribuição de ativos.",
    howTo: [
      "Cadastre o departamento antes de vincular ativos a ele.",
      'O nome aqui é o mesmo texto que aparece no campo "Departamento" de Ativos e EPIs.',
    ],
    bestPractices: [
      'Use o mesmo nome de departamento em todas as telas — nomes diferentes (ex: "TI" vs "Engenharia") viram grupos separados nos relatórios.',
    ],
    relatedTo: [
      { topicId: "assets", note: "Aparece no campo Departamento ao cadastrar um ativo" },
      { topicId: "licenses", note: "Aparece no campo Departamento (dono da licença)" },
    ],
  },
  {
    id: "categories",
    title: "Categorias",
    description: "Taxonomia dos ativos, regras de depreciação e exigência de manutenção.",
    howTo: [
      'Cadastre a categoria com o mesmo "Tipo" (kind) que você vai usar ao criar ativos — é isso que liga uma coisa na outra.',
      '"Exige manutenção" é só informativo por enquanto — não bloqueia nada automaticamente.',
    ],
    bestPractices: ["Defina o prazo de depreciação junto do time financeiro antes de cadastrar."],
    relatedTo: [{ topicId: "assets", note: "Aparece no campo Categoria ao cadastrar um ativo" }],
  },
];

export const onboardingSteps = [
  {
    title: "O que é um ativo",
    description:
      "Ativo é qualquer item patrimonial controlado pela empresa: notebook, celular, mobiliário, ferramenta, EPI, licença ou veículo. Cada ativo tem identidade única (etiqueta), status e histórico completo.",
  },
  {
    title: "Como cadastrar",
    description:
      "Em Ativos, clique em Novo ativo e informe categoria, etiqueta, número de série, valor e garantia. O ativo nasce com status Disponível.",
  },
  {
    title: "Como entregar",
    description:
      "Abra o ativo, use Entregar e selecione o colaborador. O sistema gera a movimentação de entrega, altera o status para Em uso e registra o termo de responsabilidade.",
  },
  {
    title: "Como registrar manutenção",
    description:
      "No ativo, abra uma ordem de serviço informando tipo (preventiva ou corretiva), fornecedor e prazo. Enquanto a OS estiver aberta, o ativo fica em Manutenção.",
  },
  {
    title: "Como consultar histórico",
    description:
      "Todo ativo possui uma Timeline com cadastro, entregas, devoluções, manutenções e auditorias — a trilha usada em auditoria fiscal e contábil.",
  },
];
