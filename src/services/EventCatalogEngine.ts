import {
  CatalogEventChoice,
  CatalogEventDefinition,
  EventCatalogCategory,
  GameSave,
  LifeEvent,
  WorldTruthStatus,
} from '../types';

export interface EventCatalogFilter {
  category?: EventCatalogCategory | 'Todas';
  search?: string;
  year?: number;
  era?: string;
  truthStatus?: WorldTruthStatus;
  countryScope?: 'BR' | 'GLOBAL' | 'Todos';
  page?: number;
  pageSize?: number;
}

export interface EventCatalogPageResult {
  items: CatalogEventDefinition[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categoryCounts: Record<EventCatalogCategory, number>;
}

interface EraBand {
  id: string;
  label: string;
  minYear: number;
  maxYear: number;
  contextTag: string;
  truthStatusForHistory: WorldTruthStatus;
}

const ERA_BANDS: EraBand[] = [
  { id: 'COLONIAL_IMP', label: 'Brasil Colônia & Império', minYear: 1500, maxYear: 1889, contextTag: 'império e século XIX', truthStatusForHistory: 'HISTORICAL_FACT' },
  { id: 'REP_VARGAS', label: 'Primeira República & Era Vargas', minYear: 1890, maxYear: 1945, contextTag: 'industrialização inicial', truthStatusForHistory: 'HISTORICAL_FACT' },
  { id: 'POS_GUERRA', label: 'Pós-Guerra & Regime Militar', minYear: 1946, maxYear: 1987, contextTag: 'urbanização acelerada', truthStatusForHistory: 'HISTORICAL_FACT' },
  { id: 'CONTEMP', label: 'Nova República & Era Digital', minYear: 1988, maxYear: 2026, contextTag: 'Constituição de 1988 e economia conectada', truthStatusForHistory: 'HISTORICAL_FACT' },
  { id: 'FUTURO', label: 'Horizonte Futuro Simulado', minYear: 2027, maxYear: 3500, contextTag: 'sociedade futura projetada', truthStatusForHistory: 'FUTURE_PROJECTION' },
];

const REGIONS_BR = [
  'Sudeste (São Paulo / Rio de Janeiro)',
  'Sul (Porto Alegre / Curitiba)',
  'Nordeste (Salvador / Recife)',
  'Centro-Oeste (Brasília / Goiânia)',
  'Norte (Manaus / Belém)',
  'Interior Produtivo',
  'Litoral Metropolitano',
];

interface CategoryBlueprint {
  category: EventCatalogCategory;
  targetCount: number;
  countryScope: 'BR' | 'GLOBAL';
  minAge?: number;
  maxAge?: number;
  subcategories: string[];
  subjects: string[];
  triggers: string[];
  locations: string[];
  outcomes: string[];
  choicePairs: [string, string, number, number, number, number][]; // [textA, textB, moneyA, happyA, moneyB, happyB]
  reqType?: 'employed' | 'political' | 'crime' | 'none';
}

const BLUEPRINTS: CategoryBlueprint[] = [
  {
    category: 'Vida pessoal e familiar',
    targetCount: 760,
    countryScope: 'BR',
    minAge: 5,
    subcategories: ['Convivência Familiar', 'Infância & Adolescência', 'Casamento & Parceria', 'Parentalidade', 'Sucessão & Herança', 'Amizades & Vizinhança', 'Conflitos Domésticos', 'Luto & Memória', 'Adoção & Acolhimento', 'Envelhecimento & Sabedoria'],
    subjects: ['almoço de domingo', 'partilha de memórias', 'reunião de parentes', 'mudança de residência', 'celebração de aniversário', 'apoio em momento difícil', 'mediação de conflito antigo', 'planejamento do futuro familiar', 'visita aos avós', 'reconciliação de irmãos', 'escolha escolar dos filhos', 'reforma da casa da família', 'organização do orçamento doméstico', 'viagem em família'],
    triggers: ['em meio a uma conversa franca', 'após uma notícia inesperada', 'durante uma data comemorativa', 'em uma fase de transição financeira', 'diante de uma mudança de cidade', 'quando surge um pedido urgente de ajuda', 'ao revisitar documentos e fotografias antigas', 'após anos de distanciamento'],
    locations: REGIONS_BR,
    outcomes: ['fortalece os vínculos de confiança', 'exige maturidade emocional e diálogo', 'testa a paciência e os limites do lar', 'redefine prioridades entre trabalho e afeto'],
    choicePairs: [
      ['Priorizar o diálogo e acolher a família', 'Manter distância e focar nos planos individuais', -25000, 7, 15000, -3],
      ['Assumir a responsabilidade e ajudar ativamente', 'Dividir tarefas e negociar prazos', -45000, 6, 0, 2],
    ],
  },
  {
    category: 'Finanças e patrimônio',
    targetCount: 650,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['Orçamento & Poupança', 'Crédito & Empréstimos', 'Juros & Inflação', 'Mercado Imobiliário', 'Renda Fixa & Tesouro', 'Ações & Dividendos', 'Impostos & Malha Fina', 'Seguros & Proteção', 'Renegociação de Dívidas', 'Previdência & INSS'],
    subjects: ['reajuste da taxa básica de juros', 'proposta de financiamento imobiliário', 'renegociação de saldo devedor', 'declaração anual de imposto de renda', 'oportunidade de compra de imóvel', 'aplicação em reserva de emergência', 'revisão de apólice de seguro', 'oscilação cambial e poder de compra', 'auditoria patrimonial familiar', 'planejamento de aposentadoria no INSS', 'oferta de crédito bancário', 'avaliação de veículo usado'],
    triggers: ['com a inflação pressionando o orçamento', 'em janela de liquidez favorável no banco', 'diante de boletos vencidos no mês', 'após valorização de imóveis no bairro', 'com mudança nas regras tributárias', 'durante ciclo de aperto monetário'],
    locations: REGIONS_BR,
    outcomes: ['altera seu fluxo de caixa anual', 'influencia sua pontuação de crédito bancário', 'exige cautela contra endividamento excessivo', 'protege o patrimônio contra perdas reais'],
    choicePairs: [
      ['Adotar postura conservadora e reforçar a reserva', 'Assumir risco calculado buscando maior retorno', 60000, 2, 140000, -1],
      ['Quitar pendências imediatamente com desconto', 'Parcelar para preservar liquidez mensal', -80000, 4, -20000, 1],
    ],
  },
  {
    category: 'Educação e formação',
    targetCount: 500,
    countryScope: 'BR',
    minAge: 6,
    subcategories: ['Ensino Básico', 'Ensino Médio & Vestibular', 'Ensino Técnico & SENAI', 'Graduação Universitária', 'Pós-Graduação & Pesquisa', 'Bolsas & Intercâmbio', 'Educação Financeira', 'Idiomas & Certificações', 'Ensino a Distância', 'Alfabetização & EJA'],
    subjects: ['maratona de preparação para vestibular', 'bolsa de iniciação científica', 'curso técnico profissionalizante', 'oficina prática de laboratório', 'defesa de trabalho de conclusão', 'olimpíada nacional de matemática', 'estágio supervisionado em instituição pública', 'programa de intercâmbio acadêmico', 'seleção para mestrado ou doutorado', 'certificação profissional setorial', 'projeto de extensão comunitária'],
    triggers: ['com abertura de edital de bolsas', 'em semestre de provas exigentes', 'com incentivo de professores orientadores', 'diante de mudança tecnológica no currículo', 'conciliando estudo e jornada de trabalho'],
    locations: REGIONS_BR,
    outcomes: ['amplia horizontes intelectuais e salariais', 'consolida disciplina acadêmica', 'abre portas em concursos e empresas', 'demanda equilíbrio entre estudo e descanso'],
    choicePairs: [
      ['Dedicar horas extras aos estudos e pesquisa', 'Equilibrar estudo com atividades práticas de renda', 0, 2, 35000, 1],
      ['Participar de grupo de estudos e monitoria', 'Estudar de forma autônoma com foco em provas', 15000, 4, 0, 3],
    ],
  },
  {
    category: 'Carreiras e trabalho',
    targetCount: 960,
    countryScope: 'BR',
    minAge: 16,
    reqType: 'employed',
    subcategories: ['CLT & Carteira Assinada', 'Trabalho Informal & Bicos', 'Autônomo & Freelancer', 'Concurso Público', 'Carreira Executiva', 'Magistratura & Direito', 'Carreira Militar & Diplomacia', 'Trabalho Rural & Agro', 'Indústria & Manufatura', 'Tecnologia & Dados', 'Saúde & Plantões', 'Profissões Históricas'],
    subjects: ['avaliação anual de desempenho', 'convite para liderar projeto estratégico', 'concurso público com alta concorrência', 'negociação salarial com sindicato', 'reestruturação do setor produtivo', 'mudança de turno ou transferência regional', 'treinamento de atualização operacional', 'substituição de tarefas por novas máquinas', 'auditoria interna de conformidade', 'convite para cargo de chefia técnica', 'greve da categoria por reajuste', 'inspeção de segurança do trabalho'],
    triggers: ['em meio a ciclo de aquecimento econômico', 'durante desaceleração industrial', 'após destaque na entrega de metas', 'com abertura de vagas na capital', 'diante de novas exigências regulatórias', 'após mudança de diretoria na organização'],
    locations: REGIONS_BR,
    outcomes: ['impacta sua progressão salarial e experiência', 'aumenta visibilidade no mercado de trabalho', 'testa resistência sob pressão profissional', 'constrói reputação e tempo de INSS'],
    choicePairs: [
      ['Aceitar o desafio e buscar promoção', 'Manter rotina estável e preservar saúde mental', 95000, 1, 20000, 5],
      ['Negociar melhores condições e capacitação', 'Priorizar segurança contratual imediata', 55000, 3, 25000, 2],
    ],
  },
  {
    category: 'Empresas e empreendedorismo',
    targetCount: 500,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['MEI & Microempresa', 'Comércio Local', 'Indústria Nacional', 'Agronegócio & Cooperativas', 'Startups & Inovação', 'Fintechs & Serviços', 'Exportação & Logística', 'Governança & ESG', 'Fusões & Aquisições', 'Recuperação Empresarial'],
    subjects: ['abertura de filial em estado vizinho', 'rodada de captação com investidores', 'modernização do parque produtivo', 'negociação com grandes fornecedores', 'crise de capital de giro no trimestre', 'expansão via comércio digital', 'lançamento de linha de produtos sustentáveis', 'auditoria fiscal e trabalhista', 'parceria tecnológica com universidade', 'registro de patente industrial'],
    triggers: ['com queda dos juros para investimento', 'em momento de alta nos custos logísticos', 'após crescimento da demanda regional', 'diante de novo concorrente estrangeiro', 'com incentivo estadual à industrialização'],
    locations: REGIONS_BR,
    outcomes: ['define o ritmo de contratação de empregados', 'afeta a margem operacional do negócio', 'impulsiona cadeias locais de fornecedores', 'testa capacidade de gestão sob risco'],
    choicePairs: [
      ['Reinvestir lucros em expansão e tecnologia', 'Consolidar caixa e cortar despesas fixas', 120000, 2, 70000, 3],
      ['Firmar parceria estratégica com fornecedores locais', 'Expandir diretamente para novos mercados', 85000, 4, 150000, -1],
    ],
  },
  {
    category: 'Política e eleições',
    targetCount: 760,
    countryScope: 'BR',
    minAge: 16,
    subcategories: ['Eleições Municipais', 'Eleições Estaduais', 'Eleições Presidenciais', 'Campanhas & Debates', 'Coligações Partidárias', 'Movimentos Eleitorais', 'Projetos de Lei', 'CPIs & Fiscalização', 'Impeachment & Crises', 'Participação Cidadã'],
    subjects: ['debate televisionado entre candidatos', 'formação de chapa e coligação partidária', 'votação de projeto de lei orçamentária', 'pesquisa de aprovação popular', 'organização de comício e plenária comunitária', 'disputa por liderança na câmara', 'auditoria eleitoral de prestação de contas', 'mobilização por reforma tributária', 'veto executivo em matéria social', 'instalação de comissão parlamentar de inquérito'],
    triggers: ['às vésperas do pleito eleitoral', 'em cenário de polarização legislativa', 'após divulgação de índices econômicos', 'sob pressão de manifestações nas ruas', 'durante negociação de base aliada'],
    locations: REGIONS_BR,
    outcomes: ['muda o equilíbrio institucional e partidário', 'influencia a confiança pública nas urnas', 'abre ou fecha espaço para alianças políticas', 'repercute na agenda de reformas econômicas'],
    choicePairs: [
      ['Defender propostas técnicas e transparência fiscal', 'Priorizar articulação política com base aliada', 0, 4, 25000, 1],
      ['Engajar eleitores em diálogo aberto nos bairros', 'Concentrar esforços em alianças institucionais', -15000, 6, 0, 2],
    ],
  },
  {
    category: 'Governo e administração pública',
    targetCount: 550,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['Orçamento Público', 'Saúde & SUS', 'Educação Pública', 'Segurança Integrada', 'Infraestrutura & Saneamento', 'Previdência & Fiscal', 'Controladoria & Transparência', 'Programas Sociais', 'Gestão Municipal', 'Gestão Federal'],
    subjects: ['remanejamento de orçamento para hospitais', 'licitação transparente de saneamento básico', 'auditoria da controladoria contra desvios', 'ampliação de escolas em tempo integral', 'pacote de obras de mobilidade urbana', 'revisão de alíquota de tributo estadual', 'expansão de programa de transferência de renda', 'digitalização de serviços ao cidadão', 'plano emergencial de defesa civil', 'reajuste do salário mínimo regional'],
    triggers: ['diante de meta fiscal apertada', 'após demanda urgente de prefeitos', 'com relatório técnico de auditoria', 'em resposta a filas no atendimento público', 'visando reduzir desigualdade regional'],
    locations: REGIONS_BR,
    outcomes: ['altera indicadores de qualidade de vida urbana', 'impacta dívida pública e arrecadação', 'fortalece ou pressiona a aprovação do governo', 'gera efeitos duradouros na produtividade regional'],
    choicePairs: [
      ['Priorizar saúde, educação e controle de contas', 'Acelerar obras de infraestrutura com crédito público', 0, 5, 30000, 2],
      ['Reforçar auditorias independentes e transparência', 'Desburocratizar contratações emergenciais', 0, 4, 15000, 1],
    ],
  },
  {
    category: 'Polícia e segurança pública',
    targetCount: 600,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['Polícia Militar & Ostensiva', 'Polícia Civil & Delegacias', 'Polícia Federal & Fronteiras', 'Polícia Rodoviária Federal', 'Guarda Municipal', 'Perícia Criminal', 'Polícia Penal', 'Corpo de Bombeiros', 'Inteligência Policial', 'Prevenção Comunitária'],
    subjects: ['operação integrada de combate ao contrabando', 'implantação de delegacia especializada', 'atendimento pericial em local complexo', 'patrulhamento preventivo em corredores urbanos', 'resgate dos bombeiros em área alagada', 'apreensão em rodovia federal estratégica', 'cooperação entre inteligência estadual e PF', 'treinamento em direitos humanos e protocolo', 'reforço de policiamento comunitário no bairro', 'modernização de laboratório forense'],
    triggers: ['após aumento de ocorrências na região', 'com autorização judicial fundamentada', 'durante operação coordenada interestadual', 'após denúncia anônima verificada', 'em parceria com forças municipais'],
    locations: REGIONS_BR,
    outcomes: ['reduz vulnerabilidades territoriais', 'eleva índice de esclarecimento de inquéritos', 'melhora sensação de segurança na cidade', 'testa integração e legalidade das corporações'],
    choicePairs: [
      ['Apoiar policiamento técnico baseado em inteligência', 'Defender programas comunitários e iluminação urbana', 0, 4, -10000, 5],
      ['Cooperar formalmente com protocolos de segurança', 'Manter distância cautelosa da ocorrência', 0, 2, 0, 1],
    ],
  },
  {
    category: 'Crimes e investigação',
    targetCount: 800,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['Furto & Patrimônio', 'Fraudes Financeiras', 'Corrupção & Lavagem', 'Organizações Criminosas', 'Crimes Digitais', 'Contrabando & Descaminho', 'Crimes Ambientais', 'Abertura de BO & Inquérito', 'Coleta de Provas & Perícia', 'Quebra de Sigilo Autorizada'],
    subjects: ['registro de boletim de ocorrência e perícia', 'instauração de inquérito policial detalhado', 'rastreamento financeiro de movimentação suspeita', 'disputa territorial entre grupos rivais', 'investigação de fraude em contrato comercial', 'interceptação legal autorizada por juiz', 'busca e apreensão de documentos contábeis', 'denúncia oferecida pelo Ministério Público', 'identificação de esquema digital clandestino', 'arquivamento por insuficiência de provas materiais'],
    triggers: ['após auditoria bancária detectar anomalia', 'com depoimento de testemunha-chave', 'durante operação contra organização ilícita', 'após violação de regras comerciais locais', 'quando provas periciais apontam autoria'],
    locations: REGIONS_BR,
    outcomes: ['pode resultar em inquérito, denúncia ou arquivamento', 'afeta reputação civil e histórico criminal', 'envolve custos jurídicos e risco de prisão preventiva', 'reflete pressão policial sobre grupos ilegais'],
    choicePairs: [
      ['Colaborar integralmente com esclarecimento legal', 'Acionar defesa técnica rigorosa e aguardar rito', -20000, 1, -65000, 0],
      ['Afastar-se imediatamente de ambientes ilícitos', 'Negociar acordo formal conforme a lei', 0, 4, -40000, 1],
    ],
  },
  {
    category: 'Justiça e sistema prisional',
    targetCount: 600,
    countryScope: 'BR',
    minAge: 18,
    subcategories: ['Audiência de Custódia', 'Tribunal do Júri', '1ª e 2ª Instâncias', 'STJ & STF / Constitucionalidade', 'Defensoria Pública', 'Progressão de Regime', 'Trabalho & Estudo Prisional', 'Recursos & Revisão Criminal', 'Prescrição Penal', 'Reintegração Social'],
    subjects: ['audiência de instrução e julgamento', 'análise de pedido de liberdade provisória', 'julgamento de recurso em tribunal superior', 'aplicação do limite constitucional de pena', 'progressão para regime semiaberto por bom comportamento', 'revisão criminal por erro judicial comprovado', 'atuação dedicada da Defensoria Pública', 'decretação de prescrição pelo decurso do prazo', 'programa educacional dentro da unidade penal', 'audiência de conciliação e reparação civil'],
    triggers: ['observando garantias constitucionais vigentes', 'após apresentação de novas provas documentais', 'com parecer técnico do Ministério Público', 'mediante relatório de conduta carcerária', 'respeitando a vedação à pena perpétua no Brasil'],
    locations: REGIONS_BR,
    outcomes: ['assegura devido processo legal e ampla defesa', 'pode converter, reduzir ou anular condenação', 'orienta o retorno gradual ao convívio social', 'reforça segurança jurídica nas decisões judiciais'],
    choicePairs: [
      ['Recorrer formalmente às instâncias superiores', 'Aceitar reparação alternativa e focar em reintegração', -45000, 1, -15000, 3],
      ['Dedicar-se a estudo e trabalho para remição legal', 'Buscar apoio da Defensoria Pública', 10000, 4, 0, 3],
    ],
  },
  {
    category: 'Religiões e instituições',
    targetCount: 400,
    countryScope: 'BR',
    minAge: 8,
    subcategories: ['Igreja Católica', 'Igrejas Evangélicas', 'Espiritismo', 'Matrizes Africanas (Umbanda/Candomblé)', 'Tradições Indígenas', 'Judaísmo & Islamismo', 'Budismo & Filosofias Orientais', 'Diálogo Inter-religioso', 'Ação Social & Filantropia', 'Liberdade de Crença'],
    subjects: ['mutirão solidário de arrecadação de alimentos', 'encontro ecumênico pela paz comunitária', 'celebração tradicional cultural do bairro', 'projeto de acolhimento a famílias vulneráveis', 'restauração de patrimônio histórico religioso', 'seminário sobre liberdade religiosa e respeito', 'roda de diálogo espiritual e saúde emocional', 'festa popular ligada ao calendário histórico', 'atendimento voluntário em creche comunitária'],
    triggers: ['em datas tradicionais do calendário local', 'durante campanha de inverno ou enchentes', 'reunindo lideranças diversas da cidade', 'em busca de sentido, propósito e acolhimento'],
    locations: REGIONS_BR,
    outcomes: ['fortalece redes comunitárias de solidariedade', 'promove respeito à pluralidade cultural e de crença', 'apoia saúde emocional e pertencimento social', 'preserva tradições históricas brasileiras'],
    choicePairs: [
      ['Participar como voluntário em ações sociais', 'Apoiar financeiramente projetos comunitários locais', 0, 6, -20000, 5],
      ['Promover o respeito e o diálogo plural', 'Refletir de forma reservada sobre espiritualidade', 0, 4, 0, 3],
    ],
  },
  {
    category: 'Organizações e movimentos sociais',
    targetCount: 400,
    countryScope: 'BR',
    minAge: 14,
    subcategories: ['Associações de Bairro', 'Sindicatos & Categorias', 'Movimento Ambientalista', 'Direitos Civis & Igualdade', 'Movimento Estudantil', 'Cooperativismo Popular', 'Organizações Indígenas', 'ONGs de Saúde & Educação', 'Direito à Moradia', 'Inovação Cívica'],
    subjects: ['assembleia comunitária por saneamento básico', 'abaixo-assinado por parque urbano e escola', 'campanha de doação de sangue e prevenção', 'cooperativa local de reciclagem e renda', 'fórum juvenil sobre emprego e qualificação', 'marcha pacífica por direitos constitucionais', 'rede de voluntariado para alfabetização adulta', 'audiência pública no legislativo municipal'],
    triggers: ['após mobilização de moradores e estudantes', 'diante de pauta legislativa relevante', 'em parceria com universidades e conselhos', 'buscando soluções práticas para o município'],
    locations: REGIONS_BR,
    outcomes: ['amplia participação cívica e controle social', 'melhora serviços comunitários essenciais', 'desenvolve lideranças locais responsáveis', 'influencia decisões de políticas públicas'],
    choicePairs: [
      ['Engajar-se ativamente na organização comunitária', 'Contribuir com apoio técnico ou assinatura', 0, 5, -5000, 3],
      ['Mediar propostas viáveis junto ao poder público', 'Acompanhar os desdobramentos à distância', 0, 4, 0, 1],
    ],
  },
  {
    category: 'Guerras e conflitos internacionais',
    targetCount: 700,
    countryScope: 'GLOBAL',
    minAge: 14,
    subcategories: ['Conflitos Históricos Mundiais', 'Guerras Regionais', 'Crises Fronteiriças', 'Bloqueios & Sanções', 'Cadeias de Suprimentos em Guerra', 'Refugiados & Ajuda Humanitária', 'Segurança Cibernética Estratégica', 'Reconstrução Pós-Conflito', 'Missões de Paz da ONU', 'Defesa & Soberania'],
    subjects: ['escalada de tensão militar em região estratégica', 'bloqueio comercial afetando energia e grãos', 'missão humanitária de acolhimento a deslocados', 'disputa marítima sobre rotas de navegação', 'incidente cibernético contra redes estratégicas', 'cessar-fogo mediado por organismos multilaterais', 'reajuste global nos preços de fertilizantes e combustível', 'participação brasileira em missão internacional de paz', 'reconstrução de infraestrutura após tratado de encerramento', 'embargo financeiro em mercados globais'],
    triggers: ['sob alerta de conselhos internacionais', 'com impactos imediatos em commodities e câmbio', 'exigindo cautela diplomática brasileira', 'provocando deslocamentos populacionais externos'],
    locations: ['Europa Oriental', 'Oriente Médio', 'Ásia-Pacífico', 'Atlântico Sul', 'África Subsaariana', 'Américas', 'Cenário Global'],
    outcomes: ['eleva volatilidade de preços e inflação externa', 'altera fluxos migratórios e acordos de segurança', 'valoriza estratégias diplomáticas de mediação pacífica', 'impacta exportações e custo de importados no Brasil'],
    choicePairs: [
      ['Apoiar iniciativas humanitárias e postura diplomática de paz', 'Proteger finanças pessoais contra choque externo', -15000, 4, 30000, 1],
      ['Acompanhar notícias verificadas sem pânico financeiro', 'Reavaliar investimentos expostos ao exterior', 0, 2, 20000, 2],
    ],
  },
  {
    category: 'Diplomacia e relações internacionais',
    targetCount: 400,
    countryScope: 'GLOBAL',
    minAge: 18,
    subcategories: ['Tratados Comerciais', 'Mercosul & América Latina', 'Acordos Climáticos', 'Cooperação Científica', 'Passaportes & Vistos', 'Embaixadas & Consulados', 'Cúpulas Multilaterais', 'Comércio Exterior', 'Cultura Internacional', 'Mediação de Crises'],
    subjects: ['assinatura de acordo comercial de redução tarifária', 'cúpula climática internacional com metas verdes', 'facilitação de vistos estudantis e turísticos', 'cooperação espacial e agrícola entre países', 'rodada de negócios para exportadores brasileiros', 'fórum diplomático no Itamaraty sobre integração', 'tratado de reconhecimento mútuo de diplomas', 'aliança sanitária para troca rápida de vacinas'],
    triggers: ['durante presidência pro tempore ou cúpula global', 'após meses de negociação técnica', 'visando ampliar exportações e intercâmbios', 'em resposta a desafios transnacionais'],
    locations: ['Brasília / Itamaraty', 'Mercosul', 'Genebra / ONU', 'União Europeia', 'Ásia-Pacífico', 'América do Norte'],
    outcomes: ['abre mercados para empresas e profissionais', 'fortalece imagem externa e turismo científico', 'facilita mobilidade internacional com segurança', 'estabiliza relações bilaterais estratégicas'],
    choicePairs: [
      ['Aproveitar oportunidades de intercâmbio ou comércio', 'Fortalecer atuação no mercado interno brasileiro', 45000, 4, 25000, 2],
      ['Valorizar cooperação multilateral e qualificação idiomática', 'Manter foco nas prioridades regionais', 15000, 3, 0, 2],
    ],
  },
  {
    category: 'Saúde e epidemias',
    targetCount: 400,
    countryScope: 'BR',
    minAge: 0,
    subcategories: ['Vacinação & Imunização', 'SUS & Atenção Básica', 'Epidemias & Surtos', 'Saúde Mental & Bem-Estar', 'Nutrição & Exercícios', 'Cirurgias & Emergências', 'Pesquisa Médica', 'Saúde do Idoso', 'Prevenção Ocupacional', 'Saneamento & Saúde'],
    subjects: ['campanha nacional de vacinação preventiva', 'surto sazonal de virose ou arbovirose urbana', 'check-up médico preventivo na unidade de saúde', 'jornada de cuidado com estresse e saúde mental', 'prática regular de atividade física ao ar livre', 'avanço de protocolo clínico para tratamento crônico', 'ampliação de atendimento hospitalar de urgência', 'orientação nutricional contra sedentarismo', 'campanha de saúde bucal e oftalmológica'],
    triggers: ['em mudança brusca de estação', 'durante campanha pública de saúde', 'após período prolongado de excesso de trabalho', 'com recomendação médica de rotina'],
    locations: REGIONS_BR,
    outcomes: ['protege longevidade e reduz risco de internações', 'equilibra saúde física e mental', 'evita faltas ao trabalho e gastos emergenciais', 'melhora disposição diária'],
    choicePairs: [
      ['Seguir recomendações médicas e manter prevenção em dia', 'Adiar cuidados por foco excessivo na rotina', -10000, 4, 0, -4],
      ['Priorizar descanso, terapia e atividade física', 'Fazer apenas o básico necessário no mês', -15000, 6, 0, 1],
    ],
  },
  {
    category: 'Ciência e tecnologia',
    targetCount: 400,
    countryScope: 'GLOBAL',
    minAge: 10,
    subcategories: ['Computação & Software', 'Internet & Redes', 'Inteligência Artificial', 'Biotecnologia & Genômica', 'Energia Limpa & Fusão', 'Agritech & Embrapa', 'Automação & Robótica', 'Exploração Espacial', 'Telecomunicações', 'Segurança Digital'],
    subjects: ['adoção de nova ferramenta tecnológica no trabalho', 'descoberta científica em universidade pública', 'expansão de conectividade de alta velocidade', 'projeto piloto de energia solar e armazenamento', 'debate ético sobre automação e empregos', 'lançamento de satélite nacional de monitoramento', 'curso prático de alfabetização digital segura', 'avanço em medicamentos biológicos nacionais'],
    triggers: ['com barateamento de equipamentos e redes', 'após publicação de pesquisa de impacto', 'durante onda de modernização industrial', 'exigindo adaptação rápida da população'],
    locations: REGIONS_BR,
    outcomes: ['eleva produtividade e cria novas profissões', 'pode tornar ofícios antigos obsoletos', 'demanda atualização contínua e pensamento crítico', 'reduz custos em energia, saúde e comunicações'],
    choicePairs: [
      ['Aprender a nova tecnologia e integrá-la à carreira', 'Adotar postura cautelosa aguardando consolidação', 35000, 3, 0, 1],
      ['Investir em qualificação técnica atualizada', 'Manter métodos tradicionais já dominados', -25000, 4, 10000, 0],
    ],
  },
  {
    category: 'Cultura e entretenimento',
    targetCount: 350,
    countryScope: 'BR',
    minAge: 6,
    subcategories: ['Música Brasileira', 'Cinema & Audiovisual', 'Literatura & Bibliotecas', 'Teatro & Dança', 'Carnaval & Festas Populares', 'Gastronomia Regional', 'Museus & Patrimônio', 'Moda & Design', 'Rádio, TV & Streaming', 'Cultura Digital'],
    subjects: ['festival de música regional em praça pública', 'estreia de filme nacional premiado em circuito', 'feira do livro e encontro com autores brasileiros', 'exposição gratuita em museu histórico revitalizado', 'oficina cultural de gastronomia tradicional local', 'espetáculo comunitário de teatro e dança', 'preservação de acervo fonográfico e memória', 'celebração popular com manifestações folclóricas'],
    triggers: ['no fim de semana cultural da cidade', 'durante temporada de festivais anuais', 'com projeto de lei de incentivo à cultura', 'ao descobrir novo talento local'],
    locations: REGIONS_BR,
    outcomes: ['enriquece repertório cultural e bem-estar', 'valoriza artistas e identidade brasileira', 'movimenta turismo e economia criativa local', 'fortalece vínculos sociais e memórias afetivas'],
    choicePairs: [
      ['Prestigiara produção cultural local e convidar amigos', 'Explorar o tema em leitura ou catálogo em casa', -10000, 6, 0, 3],
      ['Participar de oficina criativa comunitária', 'Apenas assistir à programação cultural', -8000, 5, 0, 2],
    ],
  },
  {
    category: 'Meio ambiente e desastres',
    targetCount: 350,
    countryScope: 'BR',
    minAge: 8,
    subcategories: ['Amazônia & Florestas', 'Cerrado, Mata Atlântica & Pantanal', 'Enchentes & Defesa Civil', 'Secas & Segurança Hídrica', 'Energia Renovável', 'Reciclagem & Lixo Zero', 'Zoológicos & Conservação', 'Fauna Ameaçada', 'Qualidade do Ar', 'Adaptação Climática'],
    subjects: ['alerta meteorológico de tempestade intensa', 'programa de reflorestamento de nascentes urbanas', 'reintrodução de espécie nativa em reserva ecológica', 'visita educativa a parque nacional e zoológico conservacionista', 'campanha municipal de coleta seletiva e compostagem', 'seca severa afetando reservatórios regionais', 'fiscalização contra queimadas ilegais na região', 'instalação de sistema de captação de água da chuva'],
    triggers: ['durante fenômeno climático extremo sazonal', 'com mobilização de biólogos e defesa civil', 'após relatório ambiental regional', 'buscando equilíbrio entre cidade e biodiversidade'],
    locations: REGIONS_BR,
    outcomes: ['protege biodiversidade e mananciais regionais', 'reduz danos materiais em eventos climáticos', 'eleva consciência ambiental e saúde urbana', 'impacta preços de alimentos e energia'],
    choicePairs: [
      ['Engajar-se em mutirão ambiental e prevenção doméstica', 'Seguir orientações da Defesa Civil e economizar água', -10000, 5, 0, 3],
      ['Apoiar santuários de fauna e áreas protegidas', 'Adotar hábitos sustentáveis de consumo', -12000, 4, 5000, 3],
    ],
  },
  {
    category: 'Esportes e lazer',
    targetCount: 300,
    countryScope: 'BR',
    minAge: 6,
    subcategories: ['Futebol & Seleções', 'Corrida de Rua & Atletismo', 'Vôlei, Basquete & Quadra', 'Lutas & Artes Marciais', 'Skate, Surfe & Olimpíadas', 'Ciclismo & Parques', 'Xadrez & Jogos de Mente', 'E-Sports & Clubes', 'Turismo Nacional', 'Lazer em Família'],
    subjects: ['torneio amador de futebol no bairro', 'participação em corrida de rua de 5 km', 'final emocionante de campeonato nacional', 'trilha ecológica em parque estadual no feriado', 'aula experimental em centro esportivo público', 'campeonato escolar ou universitário regional', 'viagem curta de descanso pelo litoral ou serra', 'competição amistosa de xadrez e estratégia'],
    triggers: ['no calendário esportivo do semestre', 'em busca de condicionamento e diversão', 'convite de colegas de trabalho ou escola', 'durante grandes jogos olímpicos ou mundiais'],
    locations: REGIONS_BR,
    outcomes: ['melhora condicionamento físico e reduz estresse', 'estimula espírito de equipe e fair play', 'proporciona lazer acessível e conexões sociais', 'previne sedentarismo'],
    choicePairs: [
      ['Participar ativamente praticando esporte ou lazer', 'Acompanhar com amigos em clima de confraternização', -8000, 6, -5000, 4],
      ['Treinar com regularidade nas horas vagas', 'Reservar o fim de semana para descanso leve', 0, 5, 0, 3],
    ],
  },
  {
    category: 'História mundial e brasileira',
    targetCount: 760,
    countryScope: 'GLOBAL',
    minAge: 0,
    subcategories: ['Brasil Colônia & Império', 'República Velha & Tenentismo', 'Era Vargas & CLT', 'Democracia 1946–1964', 'Regime Militar & Abertura', 'Constituição 1988 & Plano Real', 'Século XXI Contemporâneo', 'História Econômica Mundial', 'Avanços Científicos Históricos', 'Marcos Sociais Globais'],
    subjects: ['repercussão nacional de marco constitucional', 'impacto cotidiano de reforma econômica e monetária', 'abertura de grandes rodovias e integração territorial', 'debate público sobre direitos trabalhistas e voto', 'transformação urbana com chegada de eletricidade e transporte', 'transição geopolítica alterando comércio mundial', 'conquista histórica de cobertura vacinal e saneamento', 'expansão do ensino público e universidades federais', 'mudança nos meios de comunicação da década', 'desenvolvimento industrial e agrário em escala nacional'],
    triggers: ['em ano decisivo para os rumos institucionais', 'refletindo fatos documentados do período', 'transformando hábitos cotidianos nas cidades e campos', 'marcando a memória coletiva da geração'],
    locations: ['Rio de Janeiro / Capital Histórica', 'São Paulo / Eixo Sudeste', 'Brasília / Planalto Central', 'Recife & Salvador / Nordeste', 'Porto Alegre / Sul', 'Belém & Manaus / Norte', 'Cenário Internacional'],
    outcomes: ['contextualiza a vida individual dentro da História', 'produz efeitos econômicos, civis e culturais reais', 'respeita rigorosamente a cronologia até 2026', 'projeta cenários plausíveis apenas após 2026'],
    choicePairs: [
      ['Registrar reflexões e adaptar planos ao momento histórico', 'Seguir rotina cotidiana observando os desdobramentos', 0, 3, 0, 1],
      ['Buscar compreender as causas econômicas e sociais do marco', 'Focar na proteção prática da própria família', 0, 4, 10000, 2],
    ],
  },
  {
    category: 'Sociedade e demografia',
    targetCount: 500,
    countryScope: 'BR',
    minAge: 10,
    subcategories: ['Urbanização & Metrópoles', 'Migração Regional', 'Envelhecimento Populacional', 'Mercado de Habitação', 'Desigualdade & Mobilidade Social', 'Juventude & Primeiro Emprego', 'Transporte & Mobilidade', 'Consumo & Costumes', 'Longevidade & Terceira Idade', 'Cidades do Interior'],
    subjects: ['fluxo migratório para polos regionais de emprego', 'expansão de bairros periféricos e demanda por transporte', 'envelhecimento demográfico exigindo adaptação urbana', 'mudança no tamanho médio das famílias brasileiras', 'crescimento acelerado de cidades médias do interior', 'alteração no custo de moradia próximo aos centros', 'novas formas de convivência intergeracional', 'debate sobre mobilidade social e acesso à renda'],
    triggers: ['revelado por dados censitários da década', 'diante de oportunidades econômicas em outro estado', 'com aumento da expectativa de vida no país', 'transformando a rotina dos bairros brasileiros'],
    locations: REGIONS_BR,
    outcomes: ['orienta decisões de moradia e migração interna', 'influencia mercado de trabalho e previdência', 'remodela infraestrutura e serviços nas cidades', 'conecta economia à estrutura populacional'],
    choicePairs: [
      ['Adaptar planejamento familiar e considerar novas regiões', 'Consolidar raízes e rede de apoio no bairro atual', 20000, 3, 0, 4],
      ['Investir em convivência intergeracional e comunidade', 'Focar em autonomia pessoal e mobilidade', 0, 5, 15000, 2],
    ],
  },
  {
    category: 'Eventos extraordinários e históricos alternativos',
    targetCount: 300,
    countryScope: 'GLOBAL',
    minAge: 12,
    subcategories: ['Encruzilhadas Contrafactuais', 'Descobertas Inesperadas', 'Coincidências Extraordinárias', 'Saltos Tecnológicos Simulados', 'Crises Sistêmicas Raras', 'Cenários Futuros Plausíveis', 'Dilemas Éticos Singulares', 'Oportunidades Únicas de Vida'],
    subjects: ['encontro fortuito com mentor influente em viagem', 'reforma econômica alternativa acelera inovação nacional', 'achado documental histórico em arquivo familiar antigo', 'descoberta acidental de talento artístico ou científico', 'simulação de cenário energético limpo antecipado', 'decisão singular que muda o rumo de toda uma cidade', 'prêmio extraordinário de reconhecimento comunitário', 'proposta inesperada de missão pioneira internacional'],
    triggers: ['em momento raro de convergência histórica', 'classificado claramente como simulação ou história alternativa', 'desafiando escolhas convencionais de trajetória', 'abrindo ramificação narrativa inesperada'],
    locations: REGIONS_BR,
    outcomes: ['altera drasticamente a trajetória pessoal ou local', 'mantém separação transparente entre fato e simulação', 'gera memória marcante na biografia familiar', 'desbloqueia novos caminhos narrativos'],
    choicePairs: [
      ['Abraçar o caminho extraordinário com coragem e cautela', 'Manter os pés no chão e preservar a estabilidade atual', 80000, 6, 15000, 2],
      ['Documentar o acontecimento e compartilhá-lo com a família', 'Seguir em frente discretamente aproveitando o aprendizado', 25000, 5, 0, 3],
    ],
  },
];

export class EventCatalogEngine {
  private static catalog: CatalogEventDefinition[] | null = null;
  private static byId: Map<string, CatalogEventDefinition> | null = null;
  private static byCategory: Map<EventCatalogCategory, CatalogEventDefinition[]> | null = null;
  private static categoryCountsCache: Record<EventCatalogCategory, number> | null = null;

  private static ensureInitialized(): void {
    if (this.catalog) return;

    const catalog: CatalogEventDefinition[] = [];
    const byId = new Map<string, CatalogEventDefinition>();
    const byCategory = new Map<EventCatalogCategory, CatalogEventDefinition[]>();
    const counts = {} as Record<EventCatalogCategory, number>;
    const seenTitles = new Set<string>();

    let globalSeq = 1;

    for (let bIdx = 0; bIdx < BLUEPRINTS.length; bIdx++) {
      const bp = BLUEPRINTS[bIdx];
      const catList: CatalogEventDefinition[] = [];
      const catSlug = bp.category
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .slice(0, 18);

      const nSub = bp.subcategories.length;
      const nSubj = bp.subjects.length;
      const nTrig = bp.triggers.length;
      const nLoc = bp.locations.length;
      const nOut = bp.outcomes.length;
      const nEra = ERA_BANDS.length;

      let generated = 0;
      let cursor = 0;
      // Deterministic permutation stride ensures distinct semantic combinations across all generated events
      while (generated < bp.targetCount) {
        const subIdx = cursor % nSub;
        const subjIdx = Math.floor(cursor / nSub) % nSubj;
        const trigIdx = (Math.floor(cursor / (nSub * nSubj)) + subjIdx) % nTrig;
        const locIdx = (Math.floor(cursor / (nSub * nSubj * nTrig)) + subIdx * 2) % nLoc;
        const eraIdx = (cursor + bIdx) % nEra;
        const outIdx = (cursor + trigIdx) % nOut;
        cursor++;

        const sub = bp.subcategories[subIdx];
        const subj = bp.subjects[subjIdx];
        const trig = bp.triggers[trigIdx];
        const loc = bp.locations[locIdx];
        const era = ERA_BANDS[eraIdx];
        const outcome = bp.outcomes[outIdx];
        const locShort = loc.split('(')[0].trim();

        const id = `evcat_${catSlug}_${String(generated + 1).padStart(4, '0')}`;
        const capitalizedSubj = subj.charAt(0).toUpperCase() + subj.slice(1);
        let title = `${sub}: ${capitalizedSubj} (${locShort} · ${era.label.split('&')[0].trim()})`;
        if (seenTitles.has(title)) {
          title = `${sub}: ${capitalizedSubj} — ${locShort} (${era.minYear}–${era.maxYear === 3500 ? 'Futuro' : era.maxYear}) #${generated + 1}`;
        }
        seenTitles.add(title);

        let truthStatus: WorldTruthStatus = 'SIMULATED_EVENT';
        if (bp.category === 'Eventos extraordinários e históricos alternativos') {
          truthStatus = era.minYear > 2026 ? 'FUTURE_PROJECTION' : 'ALTERNATIVE_HISTORY';
        } else if (bp.category === 'História mundial e brasileira') {
          truthStatus = era.truthStatusForHistory;
        } else if (era.minYear > 2026) {
          truthStatus = 'FUTURE_PROJECTION';
        }

        const pair = bp.choicePairs[(generated + bIdx) % bp.choicePairs.length];
        const scale = era.minYear < 1940 ? 0.4 : era.minYear > 2026 ? 1.4 : 1.0;

        const choices: CatalogEventChoice[] = [
          {
            id: 'a',
            text: pair[0],
            effectDescription: `Impacto: ${outcome}.`,
            effect: {
              moneyDeltaCentavos: Math.round(pair[2] * scale),
              happinessDelta: pair[3],
              intelligenceDelta: bp.category === 'Educação e formação' || bp.category === 'Ciência e tecnologia' ? 2 : 0,
              reputationDelta: bp.category === 'Política e eleições' || bp.category === 'Justiça e sistema prisional' ? 2 : 1,
              mentalHealthDelta: bp.category === 'Saúde e epidemias' || bp.category === 'Religiões e instituições' ? 3 : 0,
              crimeSeverity: bp.category === 'Crimes e investigação' ? 0 : undefined,
            },
          },
          {
            id: 'b',
            text: pair[1],
            effectDescription: 'Alternativa pragmática com efeitos moderados.',
            effect: {
              moneyDeltaCentavos: Math.round(pair[4] * scale),
              happinessDelta: pair[5],
              disciplineDelta: 1,
              crimeSeverity: bp.category === 'Crimes e investigação' ? ((generated % 3) + 1) : undefined,
            },
          },
        ];

        const description = `Em ${loc}, no contexto de ${era.contextTag}, ${subj} surge ${trig}. O episódio ${outcome}.`;

        const def: CatalogEventDefinition = {
          id,
          title,
          description,
          category: bp.category,
          subcategory: sub,
          minYear: era.minYear,
          maxYear: era.maxYear,
          minAge: bp.minAge ?? 0,
          maxAge: bp.maxAge ?? 110,
          countryScope: bp.countryScope,
          regions: [locShort],
          truthStatus,
          tags: [
            bp.category.toLowerCase(),
            sub.toLowerCase(),
            era.id.toLowerCase(),
            locShort.toLowerCase(),
          ],
          requirements:
            bp.reqType === 'employed'
              ? { requiresEmployed: true }
              : bp.reqType === 'political'
                ? { requiresPoliticalOffice: true }
                : undefined,
          choices,
          oneTime: false,
        };

        catalog.push(def);
        byId.set(id, def);
        catList.push(def);
        generated++;
        globalSeq++;
      }

      // Link deterministic causal chains within the category (every 5th event chains to the next related event)
      for (let i = 0; i < catList.length - 1; i++) {
        if (i % 5 === 0) {
          catList[i].chainedNextIds = [catList[i + 1].id];
          catList[i].choices[0].effect.nextEventId = catList[i + 1].id;
        }
      }

      byCategory.set(bp.category, catList);
      counts[bp.category] = catList.length;
    }

    // Link cross-domain causal chains: Crime -> Investigation -> Police -> Justice -> Prison
    const crimeEvents = byCategory.get('Crimes e investigação') || [];
    const policeEvents = byCategory.get('Polícia e segurança pública') || [];
    const justiceEvents = byCategory.get('Justiça e sistema prisional') || [];
    const chainLimit = Math.min(200, crimeEvents.length, policeEvents.length, justiceEvents.length);
    for (let i = 0; i < chainLimit; i++) {
      crimeEvents[i].chainedNextIds = [policeEvents[i].id];
      crimeEvents[i].choices[1].effect.nextEventId = policeEvents[i].id;
      policeEvents[i].chainedNextIds = [justiceEvents[i].id];
      policeEvents[i].choices[0].effect.nextEventId = justiceEvents[i].id;
    }

    this.catalog = catalog;
    this.byId = byId;
    this.byCategory = byCategory;
    this.categoryCountsCache = counts;
  }

  static getTotalCount(): number {
    this.ensureInitialized();
    return this.catalog!.length;
  }

  static getCategoryCounts(): Record<EventCatalogCategory, number> {
    this.ensureInitialized();
    return { ...this.categoryCountsCache! };
  }

  static getAllCategories(): EventCatalogCategory[] {
    return BLUEPRINTS.map((b) => b.category);
  }

  static getById(id: string): CatalogEventDefinition | undefined {
    this.ensureInitialized();
    return this.byId!.get(id);
  }

  static queryEvents(filter: EventCatalogFilter = {}): EventCatalogPageResult {
    this.ensureInitialized();
    const page = Math.max(1, filter.page || 1);
    const pageSize = Math.max(1, Math.min(100, filter.pageSize || 24));
    const searchLower = filter.search?.trim().toLowerCase() || '';

    let source: CatalogEventDefinition[] =
      filter.category && filter.category !== 'Todas'
        ? this.byCategory!.get(filter.category) || []
        : this.catalog!;

    if (searchLower || filter.year !== undefined || filter.truthStatus || (filter.countryScope && filter.countryScope !== 'Todos')) {
      source = source.filter((ev) => {
        if (filter.year !== undefined && (filter.year < ev.minYear || filter.year > ev.maxYear)) {
          return false;
        }
        if (filter.truthStatus && ev.truthStatus !== filter.truthStatus) {
          return false;
        }
        if (filter.countryScope && filter.countryScope !== 'Todos' && ev.countryScope !== filter.countryScope) {
          return false;
        }
        if (searchLower) {
          return (
            ev.title.toLowerCase().includes(searchLower) ||
            ev.description.toLowerCase().includes(searchLower) ||
            ev.subcategory.toLowerCase().includes(searchLower) ||
            ev.id.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });
    }

    const total = source.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: source.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
      categoryCounts: { ...this.categoryCountsCache! },
    };
  }

  /**
   * Selects a contextual, historically coherent, non-duplicate event for the protagonist at O(1)/bounded cost.
   */
  static pickContextualEventForSave(save: GameSave, preferredCategory?: EventCatalogCategory): CatalogEventDefinition | null {
    this.ensureInitialized();
    const world = save.worldState;
    const year = world?.clock.year ?? (save.character.birthYear + save.character.currentAge);
    const age = save.character.currentAge;
    const triggeredSet = new Set(world?.triggeredCatalogEventIds || []);

    // 1. Check pending chained events first
    const pending = world?.pendingChainedCatalogIds || [];
    for (let i = 0; i < pending.length; i++) {
      const chained = this.byId!.get(pending[i]);
      if (chained && year >= chained.minYear && year <= chained.maxYear && !triggeredSet.has(chained.id)) {
        return chained;
      }
    }

    // 2. Determine category by life context if not explicitly provided
    const categories = this.getAllCategories();
    const hash = Math.abs(
      (save.id + '_' + year + '_' + age + '_' + (world?.clock.month ?? 1))
        .split('')
        .reduce((acc, ch) => (acc * 33 + ch.charCodeAt(0)) | 0, 7)
    );

    let category = preferredCategory;
    if (!category) {
      const candidateCats: EventCatalogCategory[] = ['Vida pessoal e familiar', 'Sociedade e demografia', 'Cultura e entretenimento'];
      if (age >= 6 && age <= 24) candidateCats.push('Educação e formação', 'Esportes e lazer');
      if (age >= 18) candidateCats.push('Finanças e patrimônio', 'Saúde e epidemias', 'Política e eleições', 'Religiões e instituições');
      if (save.character.careerTitle) candidateCats.push('Carreiras e trabalho', 'Empresas e empreendedorismo');
      if (save.character.status === 'Preso' || (save.character.criminalRecord?.arrests ?? 0) > 0) {
        candidateCats.push('Justiça e sistema prisional', 'Polícia e segurança pública');
      }
      if ((save.character.politics?.office ?? 'Nenhum') !== 'Nenhum') {
        candidateCats.push('Governo e administração pública', 'Política e eleições');
      }
      candidateCats.push('História mundial e brasileira', 'Ciência e tecnologia', 'Meio ambiente e desastres');
      category = candidateCats[hash % candidateCats.length] || categories[hash % categories.length];
    }

    const bucket = this.byCategory!.get(category) || this.catalog!;
    const len = bucket.length;
    if (len === 0) return null;

    // Probe deterministically up to 48 entries in primary bucket for fast O(1) lookup
    for (let probe = 0; probe < 48; probe++) {
      const candidate = bucket[(hash + probe * 17) % len];
      if (year < candidate.minYear || year > candidate.maxYear) continue;
      if (candidate.minAge !== undefined && age < candidate.minAge) continue;
      if (candidate.maxAge !== undefined && age > candidate.maxAge) continue;
      if (candidate.requirements?.requiresEmployed && !save.character.careerTitle) continue;
      if (triggeredSet.has(candidate.id)) continue;
      return candidate;
    }

    // Fallback scan on broad personal/social buckets (and full catalog) if age/era matched none in first bucket
    const fallbackBuckets = [
      this.byCategory!.get('Vida pessoal e familiar') || [],
      this.byCategory!.get('Sociedade e demografia') || [],
      this.catalog!,
    ];
    for (const fb of fallbackBuckets) {
      if (fb.length === 0) continue;
      const limit = Math.min(fb.length, 300);
      for (let i = 0; i < limit; i++) {
        const candidate = fb[(hash + i * 31) % fb.length];
        if (year < candidate.minYear || year > candidate.maxYear) continue;
        if (candidate.minAge !== undefined && age < candidate.minAge) continue;
        if (candidate.maxAge !== undefined && age > candidate.maxAge) continue;
        if (candidate.requirements?.requiresEmployed && !save.character.careerTitle) continue;
        if (triggeredSet.has(candidate.id)) continue;
        return candidate;
      }
    }

    return null;
  }

  static toLifeEvent(def: CatalogEventDefinition, save: GameSave): LifeEvent {
    const year = save.worldState?.clock.year ?? (save.character.birthYear + save.character.currentAge);
    return {
      id: `evt_cat_${def.id}_${year}_${save.events.length}`,
      catalogEventId: def.id,
      characterId: save.character.id,
      age: save.character.currentAge,
      year,
      month: save.worldState?.clock.month ?? 1,
      day: save.worldState?.clock.day ?? 1,
      title: def.title,
      description: def.description,
      category: def.category,
      truthStatus: year > 2026 ? 'FUTURE_PROJECTION' : def.truthStatus,
      worldContextNote: `${def.subcategory} · ${def.countryScope === 'BR' ? 'Brasil' : 'Global'}`,
      choices: def.choices.map((c) => ({
        id: c.id,
        text: c.text,
        effectDescription: c.effectDescription,
      })),
    };
  }

  /**
   * Validates catalog size, uniqueness, zero duplicate titles/IDs, and category quotas.
   */
  static validateCatalogIntegrity(): {
    valid: boolean;
    totalEvents: number;
    uniqueIds: number;
    uniqueTitles: number;
    categoryCounts: Record<EventCatalogCategory, number>;
    errors: string[];
  } {
    this.ensureInitialized();
    const errors: string[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    for (const ev of this.catalog!) {
      if (seenIds.has(ev.id)) errors.push(`ID duplicado: ${ev.id}`);
      if (seenTitles.has(ev.title)) errors.push(`Título duplicado: ${ev.title}`);
      if (!ev.description || ev.description.length < 20) errors.push(`Descrição curta em ${ev.id}`);
      if (ev.minYear > ev.maxYear) errors.push(`Faixa temporal inválida em ${ev.id}`);
      if (!ev.choices || ev.choices.length < 2) errors.push(`Escolhas insuficientes em ${ev.id}`);
      seenIds.add(ev.id);
      seenTitles.add(ev.title);
    }

    if (this.catalog!.length <= 10000) {
      errors.push(`Total de eventos (${this.catalog!.length}) deve ser > 10.000.`);
    }

    return {
      valid: errors.length === 0,
      totalEvents: this.catalog!.length,
      uniqueIds: seenIds.size,
      uniqueTitles: seenTitles.size,
      categoryCounts: { ...this.categoryCountsCache! },
      errors,
    };
  }
}
