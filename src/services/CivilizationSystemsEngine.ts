import {
  GameSave,
  ReligionDistribution,
  WarAndSanctionState,
  WorldCivilizationState,
  WorldState,
  ZooAndConservationState,
} from '../types';

export const RELIGIONS_CATALOG = [
  'Catolicismo Romano',
  'Evangélica / Protestante',
  'Espiritismo',
  'Umbanda / Candomblé (Matriz Africana)',
  'Tradições Indígenas',
  'Judaísmo',
  'Islamismo',
  'Budismo',
  'Sem Religião / Secular',
];

export const HOBBIES_CATALOG = [
  'Leitura e História',
  'Futebol e Esportes Coletivos',
  'Música e Instrumentos',
  'Corrida e Ciclismo',
  'Jardinagem e Ecologia',
  'Xadrez e Estratégia',
  'Voluntariado Comunitário',
  'Culinária Regional Brasileira',
];

export class CivilizationSystemsEngine {
  static createInitialCivilizationState(year: number): WorldCivilizationState {
    const religions: ReligionDistribution[] = year < 1970
      ? [
          { id: 'rel_catolica', name: 'Catolicismo Romano', sharePct: 88.0, institutionalPresence: 90, socialRole: 'Paróquias, escolas confessionais e assistência social histórica.' },
          { id: 'rel_evangelica', name: 'Evangélicas / Protestantes', sharePct: 5.5, institutionalPresence: 45, socialRole: 'Comunidades locais de fé e ensino bíblico.' },
          { id: 'rel_matriz_africana', name: 'Matrizes Africanas (Umbanda/Candomblé)', sharePct: 2.2, institutionalPresence: 40, socialRole: 'Preservação cultural ancestral, acolhimento e resistência histórica.' },
          { id: 'rel_espirita', name: 'Espiritismo', sharePct: 1.8, institutionalPresence: 48, socialRole: 'Centros de caridade, saúde fraterna e obras filantrópicas.' },
          { id: 'rel_outras', name: 'Indígenas, Judaísmo, Islã e Budismo', sharePct: 1.3, institutionalPresence: 35, socialRole: 'Diversidade espiritual e patrimônio cultural plural.' },
          { id: 'rel_secular', name: 'Sem Religião / Secular', sharePct: 1.2, institutionalPresence: 30, socialRole: 'Pensamento laico, científico e humanista.' },
        ]
      : [
          { id: 'rel_catolica', name: 'Catolicismo Romano', sharePct: year > 2015 ? 52.0 : 68.0, institutionalPresence: 82, socialRole: 'Ação pastoral, universidades e patrimônio histórico.' },
          { id: 'rel_evangelica', name: 'Evangélicas / Protestantes', sharePct: year > 2015 ? 31.0 : 18.0, institutionalPresence: 80, socialRole: 'Redes comunitárias, música gospel e assistência social.' },
          { id: 'rel_matriz_africana', name: 'Matrizes Africanas (Umbanda/Candomblé)', sharePct: 2.4, institutionalPresence: 54, socialRole: 'Cultura afro-brasileira, diálogo inter-religioso e proteção ambiental.' },
          { id: 'rel_espirita', name: 'Espiritismo', sharePct: 2.6, institutionalPresence: 58, socialRole: 'Hospitais filantrópicos e voluntariado.' },
          { id: 'rel_outras', name: 'Indígenas, Judaísmo, Islã e Budismo', sharePct: 2.5, institutionalPresence: 45, socialRole: 'Pluralismo cultural e centros educacionais.' },
          { id: 'rel_secular', name: 'Sem Religião / Secular', sharePct: year > 2015 ? 9.5 : 7.0, institutionalPresence: 50, socialRole: 'Ética cívica laica e liberdade de consciência.' },
        ];

    const socialMovements = [
      { id: 'mov_educacao', name: 'Frente pela Educação Pública e Ciência', focus: 'Ensino integral e bolsas de pesquisa', supportPct: 68, active: true },
      { id: 'mov_ambiental', name: 'Aliança Biomas Brasileiros', focus: 'Proteção da Amazônia, Cerrado e Mata Atlântica', supportPct: year >= 1988 ? 64 : 24, active: year >= 1975 },
      { id: 'mov_trabalho', name: 'Movimento Trabalhista & Renda Digna', focus: 'Direitos trabalhistas e qualificação profissional', supportPct: 58, active: year >= 1930 },
      { id: 'mov_direitos_civis', name: 'Movimento por Igualdade & Direitos Civis', focus: 'Combate à discriminação e acesso à justiça', supportPct: 66, active: year >= 1950 },
    ];

    const conservation: ZooAndConservationState = {
      nationalParksCount: year < 1940 ? 2 : year < 1980 ? 22 : year < 2010 ? 64 : 76,
      zoosCount: year < 1950 ? 6 : year < 1990 ? 45 : 112,
      protectedSpeciesCount: year < 1970 ? 120 : 1450,
      endangeredSpeciesCount: year < 1970 ? 85 : 320,
      conservationIndex: year < 1970 ? 42 : 67,
      deforestationAlertLevel: year < 1970 ? 25 : 54,
      recentInitiatives: ['Programa de Conservação da Ararinha-Azul e Mico-Leão-Dourado'],
    };

    const activeWarsAndSanctions: WarAndSanctionState[] = this.resolveGlobalWarsAndSanctions(year);

    return {
      religions,
      socialMovements,
      conservation,
      activeWarsAndSanctions,
    };
  }

  static resolveGlobalWarsAndSanctions(year: number): WarAndSanctionState[] {
    const list: WarAndSanctionState[] = [];
    if (year >= 1939 && year <= 1945) {
      list.push({
        id: 'war_ww2',
        title: 'Segunda Guerra Mundial',
        region: 'Global (Europa, Pacífico, Atlântico)',
        actors: ['Aliados (incl. Brasil/FEB 1944)', 'Eixo'],
        type: 'Conflito Territorial',
        intensity: 5,
        economicShockPct: 4.5,
        refugeeFlowIndex: 95,
        diplomaticStatus: year === 1945 ? 'Tratado Assinado' : 'Escalando',
        startYear: 1939,
      });
    } else if (year >= 1950 && year <= 1991) {
      list.push({
        id: 'war_cold',
        title: 'Guerra Fria — Disputa Geopolítica Bipolar',
        region: 'Global',
        actors: ['Bloco Ocidental', 'Bloco Soviético'],
        type: 'Guerra Comercial/Sanções',
        intensity: 3,
        economicShockPct: 1.4,
        refugeeFlowIndex: 42,
        diplomaticStatus: year >= 1989 ? 'Negociação de Paz' : 'Impasse',
        startYear: 1947,
      });
    } else if (year >= 2022 && year <= 2026) {
      list.push({
        id: 'war_leste_europeu_2022',
        title: 'Conflito no Leste Europeu & Sanções Energéticas',
        region: 'Europa Oriental',
        actors: ['Rússia', 'Ucrânia', 'Coalizão de Sanções'],
        type: 'Conflito Territorial',
        intensity: 4,
        economicShockPct: 2.1,
        refugeeFlowIndex: 76,
        diplomaticStatus: 'Impasse',
        startYear: 2022,
      });
    } else if (year > 2026 && year % 14 < 3) {
      list.push({
        id: `sim_tension_${Math.floor(year / 14)}`,
        title: 'Tensão Comercial em Rotas Marítimas e Semicondutores (Projeção)',
        region: 'Ásia-Pacífico / Rotas Globais',
        actors: ['Potências Comerciais', 'Organismos Multilaterais'],
        type: 'Guerra Comercial/Sanções',
        intensity: 2,
        economicShockPct: 1.2,
        refugeeFlowIndex: 18,
        diplomaticStatus: 'Negociação de Paz',
        startYear: year,
      });
    }
    return list;
  }

  static advanceYear(world: WorldState, year: number): void {
    if (!world.civilization) {
      world.civilization = this.createInitialCivilizationState(year);
    }
    const civ = world.civilization;

    // Gentle secularization / pluralism trend across decades
    const cat = civ.religions.find((r) => r.id === 'rel_catolica');
    const evg = civ.religions.find((r) => r.id === 'rel_evangelica');
    const sec = civ.religions.find((r) => r.id === 'rel_secular');
    if (cat && evg && sec && year >= 1970 && year <= 2050) {
      if (cat.sharePct > 42) {
        cat.sharePct = Number((cat.sharePct - 0.15).toFixed(1));
        evg.sharePct = Number(Math.min(38, evg.sharePct + 0.1).toFixed(1));
        sec.sharePct = Number(Math.min(18, sec.sharePct + 0.05).toFixed(1));
      }
    }

    // Conservation linked with WorldEnvironmentEngine & Governance budget
    const envBudget = world.governmentAdmin?.budgets.environment ?? 6;
    const deltaCons = (envBudget - 5) * 0.25 - (world.brazil.gdpGrowthRate > 4.2 ? 0.1 : 0);
    civ.conservation.conservationIndex = Math.max(25, Math.min(96, Number((civ.conservation.conservationIndex + deltaCons).toFixed(1))));
    civ.conservation.deforestationAlertLevel = Math.max(10, Math.min(92, Number((100 - world.environment.brazilForestCoverPct).toFixed(1))));

    civ.activeWarsAndSanctions = this.resolveGlobalWarsAndSanctions(year);

    // Wars impact global inflation slightly
    if (civ.activeWarsAndSanctions.length > 0) {
      const shock = civ.activeWarsAndSanctions.reduce((acc, w) => acc + w.economicShockPct, 0);
      world.economy.globalInflationRate = Number(Math.min(30, world.economy.globalInflationRate + shock * 0.08).toFixed(2));
    }
  }

  static performConservationVisitOrSupport(save: GameSave, donate: boolean): string {
    const world = save.worldState!;
    if (!world.civilization) {
      world.civilization = this.createInitialCivilizationState(world.clock.year);
    }
    const scale = Math.max(0.4, world.economy.costOfLivingMultiplier || 1);
    const cost = Math.round((donate ? 25000 : 6000) * scale);
    if (save.character.money < cost) {
      throw new Error('Saldo insuficiente para esta atividade ambiental.');
    }
    save.character.money -= cost;
    save.character.happiness = Math.min(100, save.character.happiness + (donate ? 6 : 5));
    save.character.mentalHealth = Math.min(100, (save.character.mentalHealth ?? 75) + 5);

    if (donate) {
      world.civilization.conservation.conservationIndex = Math.min(99, Number((world.civilization.conservation.conservationIndex + 0.6).toFixed(1)));
      world.civilization.conservation.recentInitiatives.unshift(`${world.clock.year}: Apoio cidadão à conservação de fauna nativa`);
      world.civilization.conservation.recentInitiatives = world.civilization.conservation.recentInitiatives.slice(0, 10);
      return 'Contribuição registrada para santuários ecológicos e zoológicos de conservação!';
    }
    return 'Visita educativa ao parque ecológico e zoológico revitalizou seu bem-estar mental!';
  }

  static takeBankLoan(save: GameSave, principalCentavos: number, months: number, purpose: string): string {
    const world = save.worldState!;
    const char = save.character;
    if (!char.banking) {
      char.banking = {
        bankAccountCentavos: 0,
        savingsCentavos: 0,
        creditScore: 680,
        creditCardDebtCentavos: 0,
        inDefault: false,
        bankruptcyCount: 0,
        totalTaxesPaidCentavos: 0,
        loans: [],
      };
    }
    if (char.currentAge < 18) throw new Error('Apenas maiores de 18 anos podem contratar crédito bancário.');
    if (char.banking.inDefault) throw new Error('Regularize sua inadimplência (negativação) antes de contratar novo crédito.');
    if (char.banking.loans.length >= 3) throw new Error('Limite máximo de 3 contratos de crédito ativos atingido.');
    if (!Number.isFinite(principalCentavos) || principalCentavos < 10000 || principalCentavos > 5000000000) {
      throw new Error('Valor de empréstimo inválido.');
    }
    const cleanMonths = Math.max(6, Math.min(240, Math.round(months)));
    const annualRate = Math.max(6, Math.min(65, (world.brazil.selicRate || 10) + (world.economy.creditInterestSpreadPct || 12)));
    const totalWithInterest = Math.round(principalCentavos * (1 + (annualRate / 100) * (cleanMonths / 12) * 0.55));
    const monthlyInstallmentCentavos = Math.max(1000, Math.round(totalWithInterest / cleanMonths));

    char.banking.loans.push({
      id: `loan_${world.clock.year}_${Date.now().toString(36)}`,
      purpose: purpose.trim().slice(0, 80) || 'Crédito Pessoal',
      principalCentavos,
      remainingCentavos: totalWithInterest,
      annualInterestPct: Number(annualRate.toFixed(1)),
      remainingMonths: cleanMonths,
      monthlyInstallmentCentavos,
    });
    char.money += principalCentavos;
    char.debtCentavos = (char.debtCentavos || 0) + totalWithInterest;
    return `Crédito aprovado (${annualRate.toFixed(1)}% a.a. em ${cleanMonths}x). Valor creditado em conta.`;
  }

  static settleLoanOrDebt(save: GameSave, loanId?: string): string {
    const char = save.character;
    if (!char.banking) throw new Error('Perfil bancário não inicializado.');

    if (loanId) {
      const idx = char.banking.loans.findIndex((l) => l.id === loanId);
      if (idx === -1) throw new Error('Empréstimo não encontrado.');
      const loan = char.banking.loans[idx];
      if (char.money < loan.remainingCentavos) throw new Error('Saldo insuficiente para quitar este empréstimo.');
      char.money -= loan.remainingCentavos;
      char.debtCentavos = Math.max(0, (char.debtCentavos || 0) - loan.remainingCentavos);
      char.banking.loans.splice(idx, 1);
      char.banking.creditScore = Math.min(1000, char.banking.creditScore + 35);
      char.banking.inDefault = false;
      return `Contrato "${loan.purpose}" quitado integralmente! Score de crédito elevado.`;
    }

    // Pay negative balance or credit card debt via savings
    if (char.banking.savingsCentavos > 0 && char.money < 0) {
      const transfer = Math.min(char.banking.savingsCentavos, Math.abs(char.money));
      char.banking.savingsCentavos -= transfer;
      char.money += transfer;
      char.banking.inDefault = char.money < 0;
      return `Reserva de poupança utilizada para cobrir saldo negativo.`;
    }
    throw new Error('Nenhuma dívida selecionada para quitação.');
  }

  static depositOrWithdrawSavings(save: GameSave, amountCentavos: number, action: 'deposit' | 'withdraw'): string {
    const char = save.character;
    if (!char.banking) {
      char.banking = {
        bankAccountCentavos: 0,
        savingsCentavos: 0,
        creditScore: 680,
        creditCardDebtCentavos: 0,
        inDefault: false,
        bankruptcyCount: 0,
        totalTaxesPaidCentavos: 0,
        loans: [],
      };
    }
    if (!Number.isFinite(amountCentavos) || amountCentavos <= 0) {
      throw new Error('Valor inválido.');
    }
    const rounded = Math.round(amountCentavos);
    if (action === 'deposit') {
      if (char.money < rounded) throw new Error('Saldo disponível insuficiente para aplicar na reserva.');
      char.money -= rounded;
      char.banking.savingsCentavos += rounded;
      return 'Aplicação realizada na reserva remunerada pela taxa básica!';
    }
    if (char.banking.savingsCentavos < rounded) throw new Error('Saldo insuficiente na reserva.');
    char.banking.savingsCentavos -= rounded;
    char.money += rounded;
    return 'Resgate da reserva realizado para conta corrente.';
  }
}
