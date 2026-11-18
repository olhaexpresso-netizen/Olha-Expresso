import { GameSave } from '../types';
import {
  BrazilGovernmentPeriod,
  BrazilState,
  CurrencyPeriod,
  MonetaryReformRecord,
  RegionalDynamicEvent,
  WorldClock,
} from '../types/world';
import { resolveBrazilHistoricalPhase } from './WorldClockEngine';
import { BRAZIL_STATES, WorldGeographyEngine } from './WorldGeographyEngine';

export const CURRENCY_TIMELINE: CurrencyPeriod[] = [
  {
    id: 'cur_reis',
    name: 'Réis (Real Colonial/Imperial/Republicano)',
    code: 'Rs',
    symbol: 'Rs',
    startYear: 1500,
    endYear: 1941,
    divisorFromPrevious: 1,
    conversionNote: 'Moeda histórica vigente até outubro de 1942 (1$000 mil-réis = Cr$ 1,00).',
  },
  {
    id: 'cur_cruzeiro_1',
    name: 'Cruzeiro (1942)',
    code: 'Cr$',
    symbol: 'Cr$',
    startYear: 1942,
    endYear: 1966,
    divisorFromPrevious: 1000,
    conversionNote: 'Substituiu o Mil-Réis em 1942 (corte de 3 zeros: 1:1.000).',
  },
  {
    id: 'cur_cruzeiro_novo',
    name: 'Cruzeiro Novo',
    code: 'NCr$',
    symbol: 'NCr$',
    startYear: 1967,
    endYear: 1969,
    divisorFromPrevious: 1000,
    conversionNote: 'Reforma de 1967 com corte de 3 zeros (1:1.000).',
  },
  {
    id: 'cur_cruzeiro_2',
    name: 'Cruzeiro (1970)',
    code: 'Cr$',
    symbol: 'Cr$',
    startYear: 1970,
    endYear: 1985,
    divisorFromPrevious: 1,
    conversionNote: 'Paridade 1:1 com o Cruzeiro Novo.',
  },
  {
    id: 'cur_cruzado',
    name: 'Cruzado',
    code: 'Cz$',
    symbol: 'Cz$',
    startYear: 1986,
    endYear: 1988,
    divisorFromPrevious: 1000,
    conversionNote: 'Plano Cruzado (1986): corte de 3 zeros (1:1.000).',
  },
  {
    id: 'cur_cruzado_novo',
    name: 'Cruzado Novo',
    code: 'NCz$',
    symbol: 'NCz$',
    startYear: 1989,
    endYear: 1989,
    divisorFromPrevious: 1000,
    conversionNote: 'Plano Verão (1989): corte de 3 zeros (1:1.000).',
  },
  {
    id: 'cur_cruzeiro_collor',
    name: 'Cruzeiro (1990)',
    code: 'Cr$',
    symbol: 'Cr$',
    startYear: 1990,
    endYear: 1992,
    divisorFromPrevious: 1,
    conversionNote: 'Plano Collor (1990): paridade 1:1 com o Cruzado Novo.',
  },
  {
    id: 'cur_cruzeiro_real',
    name: 'Cruzeiro Real',
    code: 'CR$',
    symbol: 'CR$',
    startYear: 1993,
    endYear: 1993,
    divisorFromPrevious: 1000,
    conversionNote: 'Transição de 1993 antes da URV: corte de 3 zeros (1:1.000).',
  },
  {
    id: 'cur_real',
    name: 'Real',
    code: 'BRL',
    symbol: 'R$',
    startYear: 1994,
    endYear: 2030,
    divisorFromPrevious: 2750,
    conversionNote: 'Plano Real (1994): conversão de CR$ 2.750,00 para R$ 1,00.',
  },
  {
    id: 'cur_real_digital',
    name: 'Real Digital (DREX)',
    code: 'BRLD',
    symbol: 'RD$',
    startYear: 2031,
    endYear: 2150,
    divisorFromPrevious: 1,
    conversionNote: 'Real Digital / DREX (2031): moeda digital soberana programável com contratos inteligentes (1:1).',
  },
  {
    id: 'cur_credito_solar',
    name: 'Crédito Solar Unificado (CSU)',
    code: 'CSU',
    symbol: '☀️',
    startYear: 2151,
    endYear: 3500,
    divisorFromPrevious: 1000,
    conversionNote: 'Crédito Solar (2151+): transição monetária para padrão energético planetário (1:1.000).',
  },
];

const BRAZIL_GOVERNMENTS: BrazilGovernmentPeriod[] = [
  {
    id: 'gov_feitorias',
    leaderName: 'Feitorias e Capitães Donatários',
    title: 'Capitania Donatária',
    regime: 'Monarquia',
    partyOrCoalition: 'Coroa Portuguesa / Donatários',
    startYear: 1500,
    endYear: 1548,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 20,
    keyPolicies: ['Extração do Pau-Brasil', 'Primeiros engenhos de açúcar', 'Ocupação litorânea'],
  },
  {
    id: 'gov_governo_geral',
    leaderName: 'Governadores-Gerais (Tomé de Sousa a Mem de Sá)',
    title: 'Governador-Geral',
    regime: 'Monarquia',
    partyOrCoalition: 'Governo-Geral de Salvador',
    startYear: 1549,
    endYear: 1762,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 20,
    keyPolicies: ['Fundação de Salvador (primeira capital)', 'Ciclo da Cana-de-Açúcar', 'Defesa contra invasões holandesas'],
  },
  {
    id: 'gov_vice_reino',
    leaderName: 'Vice-Reis do Brasil (Transferência para o Rio)',
    title: 'Vice-Rei do Brasil',
    regime: 'Monarquia',
    partyOrCoalition: 'Vice-Reino do Brasil',
    startYear: 1763,
    endYear: 1807,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 20,
    keyPolicies: ['Rio de Janeiro nova capital colonial', 'Ciclo do Ouro em Minas Gerais', 'Inconfidência Mineira'],
  },
  {
    id: 'gov_corte_joanina',
    leaderName: 'D. João VI (Corte Portuguesa no Brasil)',
    title: 'Rei de Portugal, Brasil e Algarves',
    regime: 'Monarquia',
    partyOrCoalition: 'Reino Unido de Portugal, Brasil e Algarves',
    startYear: 1808,
    endYear: 1821,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 15,
    keyPolicies: ['Abertura dos Portos às Nações Amigas', 'Criação do Banco do Brasil e Imprensa Régia', 'Elevação do Brasil a Reino Unido'],
  },
  {
    id: 'gov_pedro1',
    leaderName: 'D. Pedro I',
    title: 'Imperador do Brasil',
    regime: 'Monarquia',
    partyOrCoalition: 'Império do Brasil',
    startYear: 1822,
    endYear: 1831,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 12,
    keyPolicies: ['Constituição outorgada de 1824', 'Consolidação da Independência', 'Guerra da Cisplatina'],
  },
  {
    id: 'gov_regencia',
    leaderName: 'Regência Trina e Una (Feijó, Araújo Lima)',
    title: 'Regente do Império',
    regime: 'Monarquia',
    partyOrCoalition: 'Liberais Moderados / Regressistas',
    startYear: 1832,
    endYear: 1840,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 12,
    keyPolicies: ['Ato Adicional de 1834', 'Revoltas provinciais (Farroupilha, Cabanagem, Sabinada)', 'Golpe da Maioridade'],
  },
  {
    id: 'gov_pedro2',
    leaderName: 'D. Pedro II',
    title: 'Imperador do Brasil',
    regime: 'Monarquia',
    partyOrCoalition: 'Conservadores e Liberais (Parlamentarismo às avessas)',
    startYear: 1841,
    endYear: 1888,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 12,
    keyPolicies: ['Expansão do café e malha ferroviária', 'Guerra do Paraguai', 'Abolição da escravidão com a Lei Áurea (1888)'],
  },
  {
    id: 'gov_primeira_republica',
    leaderName: 'Governos da Primeira República (Deodoro a Washington Luís)',
    title: 'Presidente da República',
    regime: 'República Oligárquica',
    partyOrCoalition: 'Política dos Governadores (PRP / PRM)',
    startYear: 1889,
    endYear: 1929,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 11,
    keyPolicies: ['Café com Leite', 'Encilhamento e reformas urbanas'],
  },
  {
    id: 'gov_vargas_1',
    leaderName: 'Getúlio Vargas',
    title: 'Presidente da República',
    regime: 'Governo Provisório/Estado Novo',
    partyOrCoalition: 'Aliança Liberal / Estado Novo',
    startYear: 1930,
    endYear: 1945,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 15,
    keyPolicies: ['CLT (1943)', 'Voto feminino (1932)', 'CSN e industrialização de base'],
  },
  {
    id: 'gov_dutra_vargas2',
    leaderName: 'Eurico Gaspar Dutra / Getúlio Vargas',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PSD / PTB',
    startYear: 1946,
    endYear: 1955,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 16,
    keyPolicies: ['Constituição de 1946', 'Criação da Petrobras (1953)'],
  },
  {
    id: 'gov_jk',
    leaderName: 'Juscelino Kubitschek',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PSD / PTB',
    startYear: 1956,
    endYear: 1960,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 17,
    keyPolicies: ['Plano de Metas (50 anos em 5)', 'Construção de Brasília'],
  },
  {
    id: 'gov_quadros_goulart',
    leaderName: 'Jânio Quadros / João Goulart',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PTB / UDN',
    startYear: 1961,
    endYear: 1963,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 18,
    keyPolicies: ['Reformas de Base', 'Instabilidade inflacionária e institucional'],
  },
  {
    id: 'gov_militar',
    leaderName: 'Governos do Regime Militar (Castelo Branco a Figueiredo)',
    title: 'Presidente (Regime Militar)',
    regime: 'Regime Militar',
    partyOrCoalition: 'ARENA / PDS',
    startYear: 1964,
    endYear: 1984,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Estatizante',
    baseTaxRatePct: 21,
    keyPolicies: ['Grandes obras de infraestrutura', 'Milagre Econômico e crise da dívida'],
  },
  {
    id: 'gov_sarney',
    leaderName: 'José Sarney',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PMDB',
    startYear: 1985,
    endYear: 1989,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 22,
    keyPolicies: ['Redemocratização', 'Constituição de 1988', 'Planos Cruzado/Verão'],
  },
  {
    id: 'gov_collor_itamar',
    leaderName: 'Fernando Collor / Itamar Franco',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PRN / PMDB',
    startYear: 1990,
    endYear: 1994,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Estabilização',
    baseTaxRatePct: 24,
    keyPolicies: ['Abertura comercial', 'Plano Real (1994)'],
  },
  {
    id: 'gov_fhc',
    leaderName: 'Fernando Henrique Cardoso',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PSDB / PFL',
    startYear: 1995,
    endYear: 2002,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Estabilização',
    baseTaxRatePct: 26,
    keyPolicies: ['Consolidação do Real', 'Privatizações e Lei de Responsabilidade Fiscal'],
  },
  {
    id: 'gov_lula_1_2',
    leaderName: 'Luiz Inácio Lula da Silva',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PT / Coalizão',
    startYear: 2003,
    endYear: 2010,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 27,
    keyPolicies: ['Programas sociais (Bolsa Família)', 'Expansão universitária (ProUni/REUNI)'],
  },
  {
    id: 'gov_dilma',
    leaderName: 'Dilma Rousseff',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PT / PMDB',
    startYear: 2011,
    endYear: 2016,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 27,
    keyPolicies: ['Desonerações industriais', 'Crise econômico-fiscal (2015–2016)'],
  },
  {
    id: 'gov_temer',
    leaderName: 'Michel Temer',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'MDB',
    startYear: 2016,
    endYear: 2018,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 26,
    keyPolicies: ['Teto de Gastos', 'Reforma Trabalhista'],
  },
  {
    id: 'gov_bolsonaro',
    leaderName: 'Jair Bolsonaro',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PSL / PL',
    startYear: 2019,
    endYear: 2022,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Liberal',
    baseTaxRatePct: 26,
    keyPolicies: ['Reforma da Previdência', 'Lançamento do Pix', 'Resposta à pandemia'],
  },
  {
    id: 'gov_lula_3',
    leaderName: 'Luiz Inácio Lula da Silva',
    title: 'Presidente da República',
    regime: 'República Democrática',
    partyOrCoalition: 'PT / Frente Ampla',
    startYear: 2023,
    endYear: 2026,
    truthStatus: 'HISTORICAL_FACT',
    economicOrientation: 'Misto',
    baseTaxRatePct: 27,
    keyPolicies: ['Novo Arcabouço Fiscal', 'Reforma Tributária', 'Transição ecológica'],
  },
  {
    id: 'gov_brasil_digital_2027',
    leaderName: 'Governo de Transição Digital & Sustentável',
    title: 'Presidente da República',
    regime: 'Projeção Presidencial',
    partyOrCoalition: 'Frente Republicana de Inovação',
    startYear: 2027,
    endYear: 2034,
    truthStatus: 'FUTURE_PROJECTION',
    economicOrientation: 'Misto',
    baseTaxRatePct: 26,
    keyPolicies: ['Adoção do Real Digital (DREX)', 'Modernização da matriz energética', 'IA pública soberana'],
  },
  {
    id: 'gov_brasil_bioclimatico_2035',
    leaderName: 'Presidência da Aliança Bioclimática & Sustentável',
    title: 'Presidente da República',
    regime: 'Projeção Presidencial',
    partyOrCoalition: 'Aliança Bioclimática & Tecnológica',
    startYear: 2035,
    endYear: 2050,
    truthStatus: 'FUTURE_PROJECTION',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 25,
    keyPolicies: ['Reflorestamento de precisão por satélite', 'Biopolímeros e hidrogênio verde', 'Educação neuroadaptativa'],
  },
  {
    id: 'gov_brasil_espacial_2051',
    leaderName: 'Conselho Presidencial Federativo Tecnológico',
    title: 'Presidente do Conselho Federativo',
    regime: 'Projeção Presidencial',
    partyOrCoalition: 'Pacto Federativo do Século XXII',
    startYear: 2051,
    endYear: 2100,
    truthStatus: 'FUTURE_PROJECTION',
    economicOrientation: 'Estabilização',
    baseTaxRatePct: 24,
    keyPolicies: ['Hub orbital e polo espacial de Alcântara', 'Rede de fusão nuclear limpa', 'Automação sintética integral'],
  },
  {
    id: 'gov_brasil_solar_2101',
    leaderName: 'Federação Bioclimática Brasileira Solar',
    title: 'Chanceler da Federação',
    regime: 'Projeção Presidencial',
    partyOrCoalition: 'Governança Planetária Integrada',
    startYear: 2101,
    endYear: 3500,
    truthStatus: 'FUTURE_PROJECTION',
    economicOrientation: 'Desenvolvimentista',
    baseTaxRatePct: 20,
    keyPolicies: ['Crédito Solar Unificado', 'Territórios biorregenerativos', 'Economia de pós-escassez energética'],
  },
];

const CONSTITUTION_TIMELINE = [
  { year: 1824, label: 'Constituição Política do Império do Brazil (1824)' },
  { year: 1891, label: 'Constituição da República dos Estados Unidos do Brasil (1891)' },
  { year: 1934, label: 'Constituição da República dos Estados Unidos do Brasil (1934)' },
  { year: 1937, label: 'Constituição do Estado Novo (1937)' },
  { year: 1946, label: 'Constituição Democrática de 1946' },
  { year: 1967, label: 'Constituição do Regime Militar (1967 / EC 1969)' },
  { year: 1988, label: 'Constituição da República Federativa do Brasil de 1988' },
];

export class BrazilHistoricalSimulationEngine {
  static resolveCurrency(year: number): CurrencyPeriod {
    return (
      CURRENCY_TIMELINE.find((c) => year >= c.startYear && year <= c.endYear) ||
      CURRENCY_TIMELINE[CURRENCY_TIMELINE.length - 1]
    );
  }

  static formatMoney(minorUnitsCentavos: number, currency?: CurrencyPeriod): string {
    const symbol = currency?.symbol || 'R$';
    const units = minorUnitsCentavos / 100;
    const formatted = units.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol} ${formatted}`;
  }

  /**
   * Returns a safe nominal scale factor for starting balances & salaries in pre-1994 eras
   * so that starting in 1935 (Réis) or 1988 (Cruzado) produces era-realistic nominal amounts
   * that survive subsequent zero-cut reforms cleanly.
   */
  static getNominalEraScaleForStart(year: number): number {
    if (year >= 1994) return 1;
    if (year === 1993) return 1500; // Cruzeiros Reais before URV
    if (year >= 1990) return 80000; // Cruzeiros Collor
    if (year === 1989) return 35000; // Cruzado Novo
    if (year >= 1986) return 12000; // Cruzado
    if (year >= 1970) return 400; // Cruzeiro 2ª versão
    if (year >= 1967) return 120; // Cruzeiro Novo
    if (year >= 1942) return 40; // Cruzeiro 1942
    return 1000; // Réis (1$000 mil-réis = Cr$ 1,00)
  }

  /**
   * Applies exact historical monetary conversion when transitioning between official currencies.
   * Updates character money, salary, debt, asset values, and nominal minimum wage atomically
   * without fabricating or destroying real purchasing power.
   */
  static applyMonetaryReformIfCrossed(
    save: GameSave,
    prevCurrency: CurrencyPeriod,
    nextCurrency: CurrencyPeriod,
    year: number
  ): MonetaryReformRecord | null {
    if (prevCurrency.id === nextCurrency.id) return null;
    const divisor = Math.max(1, nextCurrency.divisorFromPrevious);
    const char = save.character;
    const world = save.worldState!;

    const moneyBefore = char.money;
    const salaryBefore = char.salary;

    if (divisor > 1) {
      const convertMinor = (val: number, minIfPositive = 1) => {
        if (val === 0) return 0;
        const sign = val < 0 ? -1 : 1;
        const absConverted = Math.round(Math.abs(val) / divisor);
        return sign * (absConverted === 0 ? minIfPositive : absConverted);
      };

      char.money = convertMinor(char.money, 100);
      char.salary = convertMinor(char.salary, 100);
      if (char.debtCentavos && char.debtCentavos > 0) {
        char.debtCentavos = convertMinor(char.debtCentavos, 100);
      }
      if (char.monthlyRentCentavos && char.monthlyRentCentavos > 0) {
        char.monthlyRentCentavos = convertMinor(char.monthlyRentCentavos, 10);
      }
      if (char.pensionCentavos && char.pensionCentavos > 0) {
        char.pensionCentavos = convertMinor(char.pensionCentavos, 50);
      }
      save.assets = save.assets.map((a) => ({
        ...a,
        value: convertMinor(a.value, 500),
        monthlyIncome: convertMinor(a.monthlyIncome, 0),
      }));
      world.brazil.minimumWageNominal = Math.max(
        50,
        Math.round(world.brazil.minimumWageNominal / divisor)
      );
      world.economy.costOfLivingMultiplier = Number(
        Math.max(0.45, world.economy.costOfLivingMultiplier / divisor).toFixed(4)
      );
    }

    const record: MonetaryReformRecord = {
      year,
      fromCurrency: `${prevCurrency.name} (${prevCurrency.symbol})`,
      toCurrency: `${nextCurrency.name} (${nextCurrency.symbol})`,
      divisor,
      moneyBeforeNominal: moneyBefore,
      moneyAfterNominal: char.money,
      salaryBeforeNominal: salaryBefore,
      salaryAfterNominal: char.salary,
      note: nextCurrency.conversionNote,
    };

    if (!world.brazil.monetaryHistory) world.brazil.monetaryHistory = [];
    world.brazil.monetaryHistory.push(record);

    save.events.push({
      id: `evt_monetary_${year}_${nextCurrency.id}`,
      characterId: char.id,
      age: char.currentAge,
      year,
      title: `Reforma Monetária: ${nextCurrency.name}`,
      description: `O Brasil adotou o ${nextCurrency.name} (${nextCurrency.symbol}), substituindo ${prevCurrency.name} com fator de conversão ${divisor}:1. Saldo e patrimônio foram convertidos automaticamente.`,
      category: 'Finanças',
      truthStatus: year <= 2026 ? 'HISTORICAL_FACT' : 'FUTURE_PROJECTION',
      worldContextNote: nextCurrency.conversionNote,
    });

    return record;
  }

  static resolveConstitution(year: number): { year: number; label: string } {
    if (year < 1824) return { year: 1500, label: 'Ordenações do Reino de Portugal' };
    const matched = [...CONSTITUTION_TIMELINE].reverse().find((c) => year >= c.year);
    return matched || CONSTITUTION_TIMELINE[0];
  }

  static resolveGovernment(year: number, seed: string): BrazilGovernmentPeriod {
    const exact = BRAZIL_GOVERNMENTS.find((g) => year >= g.startYear && year <= g.endYear);
    if (exact) return exact;

    const cycleIndex = Math.max(0, Math.floor((year - 2027) / 4));
    const startYear = 2027 + cycleIndex * 4;
    const endYear = startYear + 3;
    const projectedNames = [
      'Clara Mendes (Projeção)',
      'Rafael Nogueira (Projeção)',
      'Beatriz Azevedo (Projeção)',
      'Henrique Vasconcelos (Projeção)',
      'Mariana Cavalcanti (Projeção)',
    ];
    const hash = Math.abs(
      seed.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, cycleIndex)
    );
    const orientations: BrazilGovernmentPeriod['economicOrientation'][] = [
      'Estabilização',
      'Desenvolvimentista',
      'Liberal',
      'Misto',
    ];
    return {
      id: `gov_proj_${startYear}_${endYear}`,
      leaderName: projectedNames[hash % projectedNames.length],
      title: 'Presidente da República (Simulação)',
      regime: 'Projeção Presidencial',
      partyOrCoalition: 'Coalizão Simulada',
      startYear,
      endYear,
      truthStatus: 'FUTURE_PROJECTION',
      economicOrientation: orientations[hash % orientations.length],
      baseTaxRatePct: 26,
      keyPolicies: ['Infraestrutura digital e energética', 'Sustentabilidade fiscal e produtividade'],
    };
  }

  static buildInitialBrazilState(clock: WorldClock, seed: string): BrazilState {
    const year = clock.year;
    const phase = resolveBrazilHistoricalPhase(year);
    const currency = this.resolveCurrency(year);
    const constitution = this.resolveConstitution(year);
    const government = this.resolveGovernment(year, seed);

    const canVoteDirectly =
      year >= 1989 || (year >= 1946 && year <= 1963) || (year >= 1934 && year <= 1936);
    const regimeType =
      year < 1822
        ? 'Colônia'
        : year < 1889
          ? 'Monarquia Constitucional'
          : year >= 1964 && year < 1985
            ? 'Regime Militar (Eleições Indiretas)'
            : 'República Presidencialista';

    const basePop2020 = 211000000;
    const popFactor =
      year <= 1900
        ? 0.085
        : year <= 1950
          ? 0.25
          : year <= 1980
            ? 0.57
            : year <= 2000
              ? 0.81
              : year <= 2020
                ? 0.99
                : 1.0 + Math.min(0.18, (year - 2020) * 0.004);
    const totalPop = Math.round(basePop2020 * popFactor);
    const devScale = Math.min(1, Math.max(0.2, (year - 1880) / 145));

    const statesRecord: BrazilState['states'] = {};
    for (const s of BRAZIL_STATES) {
      statesRecord[s.name] = {
        ufCode: s.code,
        region: s.region,
        population: Math.round(totalPop * s.populationShare),
        developmentIndex: Number(Math.min(0.92, Math.max(0.28, 0.48 + 0.36 * devScale * (s.gdpIndex > 1 ? 1.08 : 0.94))).toFixed(3)),
        unemploymentRate: Number((year < 1980 ? 4.5 : year >= 2015 && year <= 2021 ? 12.2 : 8.1).toFixed(1)),
        costOfLivingIndex: Math.round(80 + 40 * s.gdpIndex * devScale),
        safetyIndex: Math.round(s.region === 'Sul' ? 68 : s.region === 'Sudeste' ? 60 : 56),
      };
    }

    const inflation =
      year >= 1989 && year <= 1993
        ? 1100.0
        : year >= 1985 && year <= 1988
          ? 280.0
          : year >= 1974 && year <= 1984
            ? 85.0
            : year >= 1961 && year <= 1966
              ? 55.0
              : year >= 2015 && year <= 2016
                ? 9.2
                : 4.4;
    const selic = year < 1994 ? 22.0 : year >= 2021 && year <= 2025 ? 11.25 : 8.5;

    const nextElectionYear =
      year >= 1989
        ? 1989 + Math.ceil((year - 1989 + 0.1) / 4) * 4
        : year + 4;

    const scaleNom = this.getNominalEraScaleForStart(year);
    const minWage = year >= 1994 ? Math.round(70 + Math.max(0, year - 1994) * 48) : Math.round(300 * scaleNom);

    return {
      phase: phase.id,
      phaseLabel: phase.label,
      constitution: constitution.label,
      constitutionYear: constitution.year,
      currency,
      monetaryHistory: [],
      currentGovernment: government,
      politicalRegimeType: regimeType,
      electionCycleYear: 4,
      nextElectionYear,
      canVoteDirectly,
      population: totalPop,
      urbanizationRate: Math.round(Math.min(92, Math.max(15, 22 + 66 * devScale))),
      gdpBillionsUSD: Number((1800 * Math.pow(devScale, 1.35)).toFixed(1)),
      gdpGrowthRate: year >= 2015 && year <= 2016 ? -3.3 : 2.5,
      annualInflationRate: inflation,
      selicRate: selic,
      unemploymentRate: year >= 2015 && year <= 2021 ? 12.1 : 7.8,
      publicDebtPctGdp: year < 1980 ? 32 : year < 2014 ? 54 : 76,
      baseTaxRatePct: government.baseTaxRatePct,
      realWageIndex: Math.round(68 + 34 * devScale),
      povertyRatePct: Number(Math.max(8, 48 - 32 * devScale).toFixed(1)),
      minimumWageNominal: minWage,
      exchangeRatePerUSD: year >= 1994 ? Number((1 + Math.max(0, year - 1994) * 0.14).toFixed(2)) : 1.0,
      literacyRate: Math.round(Math.min(97, Math.max(22, 28 + 66 * devScale))),
      lifeExpectancy: Math.round(Math.min(82, Math.max(38, 40 + 36 * devScale))),
      institutionalTrust: year >= 2014 && year <= 2022 ? 42 : 56,
      socialInequalityGini: Number((0.62 - 0.10 * devScale).toFixed(2)),
      states: statesRecord,
      cities: WorldGeographyEngine.buildBrazilianCities(year),
      regionalEvents: [],
      activePolicies: government.keyPolicies,
      activeEpidemic: year === 1918 ? { id: 'epi_1918', name: 'Gripe Espanhola', severity: 65, vaccineAvailable: false } : year === 2020 ? { id: 'epi_2020', name: 'Pandemia de COVID-19', severity: 58, vaccineAvailable: false } : null,
    };
  }

  static advanceYear(brazil: BrazilState, year: number, seed: string): BrazilState {
    const phase = resolveBrazilHistoricalPhase(year);
    const currency = this.resolveCurrency(year);
    const constitution = this.resolveConstitution(year);
    const government = this.resolveGovernment(year, seed);

    const canVoteDirectly =
      year >= 1989 || (year >= 1946 && year <= 1963) || (year >= 1934 && year <= 1936);
    const regimeType =
      year < 1822
        ? 'Colônia'
        : year < 1889
          ? 'Monarquia Constitucional'
          : year >= 1964 && year < 1985
            ? 'Regime Militar (Eleições Indiretas)'
            : 'República Presidencialista';

    const naturalGrowthRate = year < 1980 ? 0.021 : year < 2010 ? 0.012 : year < 2040 ? 0.005 : -0.001;
    const nextPop = Math.max(1000000, Math.round(brazil.population * (1 + naturalGrowthRate)));
    const nextUrban = Math.min(94, Number((brazil.urbanizationRate + (brazil.urbanizationRate < 85 ? 0.45 : 0.1)).toFixed(2)));
    const nextLifeExp = Math.min(89, Number((brazil.lifeExpectancy + (year < 2040 ? 0.18 : 0.08)).toFixed(2)));
    const nextLiteracy = Math.min(99.2, Number((brazil.literacyRate + (brazil.literacyRate < 96 ? 0.4 : 0.05)).toFixed(2)));

    // Regional dynamic event generator (factory, university, drought, migration, infra)
    const nextRegionalEvents: RegionalDynamicEvent[] = [...(brazil.regionalEvents || [])];
    const hash = Math.abs(seed.split('').reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) | 0, year));
    let affectedCityId: string | null = null;
    let eventImpactType: RegionalDynamicEvent['type'] | null = null;

    if (year % 4 === 0) {
      const cityKeys = Object.keys(brazil.cities);
      if (cityKeys.length > 0) {
        affectedCityId = cityKeys[hash % cityKeys.length];
        const targetCity = brazil.cities[affectedCityId];
        const types: RegionalDynamicEvent['type'][] = ['industria', 'universidade', 'infraestrutura', 'seca', 'migracao', 'crise_local'];
        eventImpactType = types[(hash >> 3) % types.length];
        const labels: Record<RegionalDynamicEvent['type'], { title: string; summary: string }> = {
          industria: { title: `Novo Polo Industrial em ${targetCity.name}`, summary: `Instalação de parque produtivo impulsiona empregos em ${targetCity.name} (${targetCity.ufCode}).` },
          universidade: { title: `Expansão Universitária em ${targetCity.name}`, summary: `Novo campus tecnológico eleva qualificação profissional e IDH estimado local.` },
          infraestrutura: { title: `Obras de Mobilidade e Energia (${targetCity.ufCode})`, summary: `Modernização viária e logística reduz custos regionais em ${targetCity.name}.` },
          seca: { title: `Estiagem Severa no Entorno de ${targetCity.name}`, summary: `Seca prolongada pressiona preços locais e gera migração regional.` },
          migracao: { title: `Fluxo Migratório para ${targetCity.name}`, summary: `Crescimento acelerado de novos moradores eleva demanda urbana e aluguéis.` },
          crise_local: { title: `Fechamento de Planta Produtiva em ${targetCity.name}`, summary: `Retração setorial eleva desemprego temporário no município.` },
        };
        const chosen = labels[eventImpactType];
        nextRegionalEvents.push({
          id: `reg_${year}_${affectedCityId}`,
          year,
          ufCode: targetCity.ufCode,
          stateName: targetCity.state,
          cityName: targetCity.name,
          title: chosen.title,
          summary: chosen.summary,
          type: eventImpactType,
          truthStatus: year <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
        });
      }
    }

    const nextStates: BrazilState['states'] = {};
    for (const s of BRAZIL_STATES) {
      const prev = brazil.states[s.name] || {
        ufCode: s.code,
        region: s.region,
        population: Math.round(nextPop * s.populationShare),
        developmentIndex: 0.65,
        unemploymentRate: brazil.unemploymentRate,
        costOfLivingIndex: 100,
        safetyIndex: 60,
      };
      nextStates[s.name] = {
        ufCode: s.code,
        region: s.region,
        population: Math.round(nextPop * s.populationShare),
        developmentIndex: Number(Math.min(0.96, prev.developmentIndex + 0.002).toFixed(3)),
        unemploymentRate: Number(Math.max(3.0, Math.min(22.0, brazil.unemploymentRate + (s.gdpIndex > 1 ? -1.1 : 1.2))).toFixed(1)),
        costOfLivingIndex: prev.costOfLivingIndex ?? Math.round(90 * s.gdpIndex),
        safetyIndex: prev.safetyIndex ?? 60,
      };
    }

    const nextCities: BrazilState['cities'] = {};
    const cityPopScale = nextPop / Math.max(1, brazil.population);
    for (const [cid, city] of Object.entries(brazil.cities)) {
      const isBrasiliaOpening = cid === 'df_brasilia' && year === 1960;
      let popMult = 1.003;
      let jobDelta = brazil.gdpGrowthRate * 0.35;
      let costDelta = 0;
      let safetyDelta = 0;
      let infraDelta = 0.2;
      let recentRegionalEvent = city.recentRegionalEvent;

      if (cid === affectedCityId && eventImpactType) {
        recentRegionalEvent = nextRegionalEvents[nextRegionalEvents.length - 1]?.title;
        if (eventImpactType === 'industria') {
          jobDelta += 4.5;
          popMult += 0.006;
        } else if (eventImpactType === 'universidade') {
          jobDelta += 2.5;
          infraDelta += 1.5;
          safetyDelta += 1;
        } else if (eventImpactType === 'infraestrutura') {
          infraDelta += 2.8;
          costDelta -= 1.5;
        } else if (eventImpactType === 'seca') {
          jobDelta -= 3.0;
          costDelta += 3.0;
          popMult -= 0.005;
        } else if (eventImpactType === 'migracao') {
          popMult += 0.012;
          costDelta += 3.5;
          safetyDelta -= 1;
        } else if (eventImpactType === 'crise_local') {
          jobDelta -= 4.5;
          safetyDelta -= 1.5;
        }
      }

      const grownPop = isBrasiliaOpening ? 140000 : Math.round(city.population * cityPopScale * popMult);
      nextCities[cid] = {
        ...city,
        population: grownPop,
        urbanizationRate: Math.min(100, Number((city.urbanizationRate + 0.08).toFixed(1))),
        developmentIndex: Number(Math.min(0.97, city.developmentIndex + 0.0018).toFixed(3)),
        costOfLivingIndex: Math.max(65, Math.min(180, Math.round(city.costOfLivingIndex + costDelta))),
        safetyIndex: Math.max(25, Math.min(95, Math.round(city.safetyIndex + safetyDelta))),
        infrastructureLevel: Math.min(100, Number((city.infrastructureLevel + infraDelta).toFixed(1))),
        jobOpportunityIndex: Math.max(25, Math.min(98, Math.round(city.jobOpportunityIndex + jobDelta))),
        recentRegionalEvent,
      };
    }

    // Historical Brazilian pre-1994 inflation curve + post-1994 regime
    let nextInflation = brazil.annualInflationRate;
    if (year >= 1989 && year <= 1993) {
      nextInflation = year === 1993 ? 1950 : year === 1989 ? 1320 : 880;
    } else if (year >= 1985 && year <= 1988) {
      nextInflation = 260;
    } else if (year >= 1974 && year <= 1984) {
      nextInflation = 88;
    } else if (year >= 1961 && year <= 1966) {
      nextInflation = 54;
    } else if (year === 1994) {
      nextInflation = 12.5;
    } else if (year > 1994 && nextInflation > 20) {
      nextInflation = 6.2;
    }

    const nextElectionYear =
      canVoteDirectly && year >= brazil.nextElectionYear
        ? year + 4
        : brazil.nextElectionYear;

    // Historical epidemic cycle
    let nextEpidemic = brazil.activeEpidemic || null;
    if (year === 1918) {
      nextEpidemic = { id: 'epi_1918', name: 'Gripe Espanhola', severity: 65, vaccineAvailable: false };
    } else if (year === 2020) {
      nextEpidemic = { id: 'epi_2020', name: 'Pandemia de COVID-19', severity: 58, vaccineAvailable: false };
    } else if (year === 2021 && nextEpidemic?.id === 'epi_2020') {
      nextEpidemic = { ...nextEpidemic, severity: 36, vaccineAvailable: true };
    } else if (nextEpidemic) {
      const reduced = nextEpidemic.severity - 25;
      nextEpidemic = reduced > 10 ? { ...nextEpidemic, severity: reduced } : null;
    }

    return {
      ...brazil,
      phase: phase.id,
      phaseLabel: phase.label,
      constitution: constitution.label,
      constitutionYear: constitution.year,
      currency,
      currentGovernment: government,
      politicalRegimeType: regimeType,
      baseTaxRatePct: government.baseTaxRatePct,
      canVoteDirectly,
      nextElectionYear,
      population: nextPop,
      urbanizationRate: nextUrban,
      literacyRate: nextLiteracy,
      lifeExpectancy: nextLifeExp,
      annualInflationRate: Number(nextInflation.toFixed(2)),
      states: nextStates,
      cities: nextCities,
      regionalEvents: nextRegionalEvents.slice(-30),
      activePolicies: government.keyPolicies,
      activeEpidemic: nextEpidemic,
    };
  }
}
