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
  shortcuts: Array<{ keys: string; action: string }>;
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
    shortcuts: [{ keys: "G depois D", action: "Ir para o Dashboard" }],
  },
  {
    id: "assets",
    title: "Ativos",
    description:
      "Registro central de todo item patrimonial: notebooks, desktops, celulares, móveis, ferramentas e veículos.",
    howTo: [
      "Cadastre com etiqueta, número de série, categoria, fornecedor e valor de compra.",
      "Abra o drawer de detalhes para ver ficha técnica, timeline e histórico.",
      "Use filtros de status para separar disponíveis, em uso e em manutenção.",
    ],
    bestPractices: [
      "Padronize a etiqueta (AH-0000) e nunca reutilize código de item baixado.",
      "Anexe nota fiscal e termo de responsabilidade em toda entrega.",
    ],
    shortcuts: [
      { keys: "⌘ K", action: "Command palette" },
      { keys: "/", action: "Focar na busca" },
    ],
  },
  {
    id: "employees",
    title: "Colaboradores",
    description: "Pessoas que podem receber ativos, agrupadas por departamento e centro de custo.",
    howTo: [
      "Consulte quantos ativos cada colaborador possui antes de uma nova entrega.",
      "Ao desligar alguém, valide devoluções pendentes na aba de movimentações.",
    ],
    bestPractices: [
      "Mantenha o departamento atualizado — ele define o rateio de custo.",
      "Bloqueie novas entregas para colaboradores desligados.",
    ],
    shortcuts: [{ keys: "G depois C", action: "Ir para Colaboradores" }],
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
    shortcuts: [{ keys: "G depois M", action: "Ir para Movimentações" }],
  },
  {
    id: "licenses",
    title: "Licenças",
    description: "Contratos de software com controle de assentos, renovação e custo anual.",
    howTo: [
      "Acompanhe assentos usados versus contratados para evitar sobrecompra.",
      "Programe a renovação com pelo menos 30 dias de antecedência.",
    ],
    bestPractices: [
      "Revogue assentos no desligamento do colaborador.",
      "Revise licenças sem alocação a cada trimestre.",
    ],
    shortcuts: [{ keys: "G depois L", action: "Ir para Licenças" }],
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
    shortcuts: [{ keys: "G depois E", action: "Ir para EPIs" }],
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
    shortcuts: [{ keys: "G depois N", action: "Ir para Manutenções" }],
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
    shortcuts: [{ keys: "G depois A", action: "Ir para Auditorias" }],
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
      "Em Ativos, clique em Novo ativo e informe categoria, etiqueta, número de série, fornecedor, valor e garantia. O ativo nasce com status Disponível.",
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
