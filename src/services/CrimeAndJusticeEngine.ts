import {
  CourtCaseRecord,
  CriminalOrganizationEntity,
  GameSave,
  LegalRulesetProfile,
  PoliceForceStatus,
  PoliceInvestigationRecord,
  WorldCrimeAndJusticeState,
  WorldState,
} from '../types';

export interface SystemicOffenseCatalogItem {
  id: string;
  title: string;
  category: 'Patrimônio' | 'Financeiro' | 'Ordem Pública' | 'Cibernético' | 'Ambiental' | 'Grave';
  severity: 1 | 2 | 3 | 4 | 5;
  baseRewardCentavos: number;
  baseDetectionRiskPct: number;
  baseSentenceYears: number;
  requiresJury?: boolean;
  minYear?: number;
  description: string;
}

export const SYSTEMIC_OFFENSES_CATALOG: SystemicOffenseCatalogItem[] = [
  {
    id: 'off_desacato',
    title: 'Desacato e Perturbação da Ordem Pública',
    category: 'Ordem Pública',
    severity: 1,
    baseRewardCentavos: 0,
    baseDetectionRiskPct: 72,
    baseSentenceYears: 0.5,
    description: 'Incidente leve em via pública sujeito a termo circunstanciado e multa.',
  },
  {
    id: 'off_furto_simples',
    title: 'Subtração Patrimonial Oportunista',
    category: 'Patrimônio',
    severity: 2,
    baseRewardCentavos: 380000,
    baseDetectionRiskPct: 48,
    baseSentenceYears: 2,
    description: 'Infração patrimonial sem violência, apurada via boletim e inquérito civil.',
  },
  {
    id: 'off_estelionato',
    title: 'Fraude Comercial / Estelionato',
    category: 'Financeiro',
    severity: 3,
    baseRewardCentavos: 1800000,
    baseDetectionRiskPct: 44,
    baseSentenceYears: 4,
    description: 'Irregularidade contratual investigada por delegacia especializada e Ministério Público.',
  },
  {
    id: 'off_sonegacao',
    title: 'Evasão Fiscal e Ocultação Contábil',
    category: 'Financeiro',
    severity: 3,
    baseRewardCentavos: 3200000,
    baseDetectionRiskPct: 40,
    baseSentenceYears: 3,
    description: 'Infração tributária sujeita a autuação fazendária, multa e parcelamento ou processo penal.',
  },
  {
    id: 'off_ciberfraude',
    title: 'Fraude Digital Sistêmica',
    category: 'Cibernético',
    severity: 3,
    baseRewardCentavos: 2600000,
    baseDetectionRiskPct: 46,
    baseSentenceYears: 4,
    minYear: 1995,
    description: 'Ataque ou fraude eletrônica rastreada pela Polícia Federal e perícia cibernética.',
  },
  {
    id: 'off_crime_ambiental',
    title: 'Extração Ilegal e Dano Ambiental',
    category: 'Ambiental',
    severity: 4,
    baseRewardCentavos: 4500000,
    baseDetectionRiskPct: 52,
    baseSentenceYears: 5,
    description: 'Infração ambiental grave apurada por órgãos de proteção e Polícia Federal.',
  },
  {
    id: 'off_organizacao_ilicita',
    title: 'Associação em Esquema de Contrabando',
    category: 'Grave',
    severity: 5,
    baseRewardCentavos: 9500000,
    baseDetectionRiskPct: 58,
    baseSentenceYears: 12,
    description: 'Operação ilícita interestadual com alto risco de mandado judicial e confisco de bens.',
  },
];

export class CrimeAndJusticeEngine {
  static resolveLegalRuleset(countryId: string, year: number): LegalRulesetProfile {
    if (countryId === 'BRA' || countryId === 'Brasil') {
      if (year < 1890) {
        return {
          id: 'br_codigo_criminal_1830',
          countryId: 'BRA',
          eraLabel: 'Império (Código Criminal de 1830)',
          constitutionName: 'Constituição Imperial de 1824',
          minYear: 1824,
          maxYear: 1889,
          allowsDeathPenaltyInPeacetime: year <= 1876,
          allowsLifeImprisonment: true,
          maxPrisonSentenceYears: 30,
          majorityAge: 21,
          requiresDueProcess: true,
          hasRegimeProgression: false,
          prescriptionYearsDefault: 20,
          notes: 'Código Criminal do Império; galés e pena capital reduzidas na prática após 1876.',
        };
      }
      if (year < 1940) {
        return {
          id: 'br_codigo_penal_1890',
          countryId: 'BRA',
          eraLabel: 'Primeira República (Código Penal de 1890)',
          constitutionName: 'Constituição da República de 1891',
          minYear: 1890,
          maxYear: 1939,
          allowsDeathPenaltyInPeacetime: false,
          allowsLifeImprisonment: false,
          maxPrisonSentenceYears: 30,
          majorityAge: 21,
          requiresDueProcess: true,
          hasRegimeProgression: false,
          prescriptionYearsDefault: 20,
          notes: 'Aboliu pena de morte comum e prisão perpétua; teto de 30 anos.',
        };
      }
      if (year >= 1964 && year <= 1985) {
        return {
          id: 'br_regime_militar_lsn',
          countryId: 'BRA',
          eraLabel: 'Regime Militar (CP 1940 + Atos Institucionais)',
          constitutionName: 'Constituição de 1967 / EC 1969',
          minYear: 1964,
          maxYear: 1985,
          allowsDeathPenaltyInPeacetime: false,
          allowsLifeImprisonment: false,
          maxPrisonSentenceYears: 30,
          majorityAge: 18,
          requiresDueProcess: year >= 1979,
          hasRegimeProgression: year >= 1984,
          prescriptionYearsDefault: 20,
          notes: 'Lei de Execução Penal instituída em 1984; regime de exceção vigente até a abertura.',
        };
      }
      if (year >= 1988) {
        const maxYears = year >= 2020 ? 40 : 30;
        return {
          id: year >= 2020 ? 'br_cf88_pacote_2019' : 'br_cf88',
          countryId: 'BRA',
          eraLabel: year >= 2020 ? 'Constituição de 1988 (Limite 40 anos)' : 'Constituição Cidadã de 1988',
          constitutionName: 'Constituição Federal de 1988',
          minYear: 1988,
          maxYear: 3500,
          allowsDeathPenaltyInPeacetime: false,
          allowsLifeImprisonment: false,
          maxPrisonSentenceYears: maxYears,
          majorityAge: 18,
          requiresDueProcess: true,
          hasRegimeProgression: true,
          prescriptionYearsDefault: 16,
          notes: `CF/88 Art. 5º XLVII proíbe pena de morte em paz e prisão perpétua; teto de cumprimento de ${maxYears} anos e progressão de regime.`,
        };
      }
      return {
        id: 'br_cp_1940',
        countryId: 'BRA',
        eraLabel: 'Código Penal de 1940',
        constitutionName: 'Constituição de 1946',
        minYear: 1940,
        maxYear: 1987,
        allowsDeathPenaltyInPeacetime: false,
        allowsLifeImprisonment: false,
        maxPrisonSentenceYears: 30,
        majorityAge: 18,
        requiresDueProcess: true,
        hasRegimeProgression: true,
        prescriptionYearsDefault: 20,
        notes: 'Código Penal de 1940 com limite máximo de 30 anos e garantia do Júri.',
      };
    }

    return {
      id: `${countryId}_standard`,
      countryId,
      eraLabel: 'Legislação Comparada Padrão',
      constitutionName: 'Carta Constitucional Local',
      minYear: 1900,
      maxYear: 3500,
      allowsDeathPenaltyInPeacetime: countryId === 'USA' || countryId === 'CHN',
      allowsLifeImprisonment: countryId !== 'BRA' && countryId !== 'PRT',
      maxPrisonSentenceYears: countryId === 'BRA' ? 40 : 50,
      majorityAge: 18,
      requiresDueProcess: true,
      hasRegimeProgression: true,
      prescriptionYearsDefault: 15,
      notes: 'Parâmetros legais comparados para jurisdição estrangeira.',
    };
  }

  static createInitialState(year: number): WorldCrimeAndJusticeState {
    const policeForces: PoliceForceStatus[] = [
      { id: 'pf_pm', name: 'Polícia Militar (Ostensiva)', acronym: 'PM', jurisdiction: 'Estadual', readiness: 66, clearanceRatePct: 34, budgetPct: 34, trustScore: 54 },
      { id: 'pf_pc', name: 'Polícia Civil (Judiciária)', acronym: 'PC', jurisdiction: 'Estadual', readiness: 62, clearanceRatePct: 41, budgetPct: 22, trustScore: 56 },
      { id: 'pf_pf', name: 'Polícia Federal', acronym: 'PF', jurisdiction: 'Federal', readiness: year >= 1944 ? 78 : 40, clearanceRatePct: 68, budgetPct: 16, trustScore: 76 },
      { id: 'pf_prf', name: 'Polícia Rodoviária Federal', acronym: 'PRF', jurisdiction: 'Federal', readiness: year >= 1928 ? 72 : 35, clearanceRatePct: 58, budgetPct: 9, trustScore: 69 },
      { id: 'pf_pp', name: 'Polícia Penal', acronym: 'PP', jurisdiction: 'Estadual', readiness: 58, clearanceRatePct: 45, budgetPct: 7, trustScore: 48 },
      { id: 'pf_gm', name: 'Guarda Municipal', acronym: 'GM', jurisdiction: 'Municipal', readiness: year >= 1988 ? 60 : 30, clearanceRatePct: 38, budgetPct: 5, trustScore: 60 },
      { id: 'pf_cb', name: 'Corpo de Bombeiros Militar', acronym: 'CB', jurisdiction: 'Estadual', readiness: 82, clearanceRatePct: 80, budgetPct: 4, trustScore: 89 },
      { id: 'pf_pericia', name: 'Perícia Criminal & Instituto Forense', acronym: 'PERICIA', jurisdiction: 'Estadual', readiness: year >= 1950 ? 64 : 30, clearanceRatePct: 62, budgetPct: 3, trustScore: 72 },
    ];

    const criminalOrganizations: CriminalOrganizationEntity[] = [
      {
        id: 'org_cinturao_metropolitano',
        name: 'Sindicato Clandestino Metropolitano',
        type: year < 1970 ? 'Quadrilha Histórica' : 'Facção',
        region: 'Sudeste',
        influence: year >= 1990 ? 64 : 32,
        territoryControlPct: year >= 1990 ? 18 : 6,
        rivalryWithIds: ['org_rota_norte'],
        lawEnforcementPressure: 55,
        status: 'Ativa',
      },
      {
        id: 'org_rota_norte',
        name: 'Rede de Contrabando Fronteiriço',
        type: 'Cartel',
        region: 'Norte / Centro-Oeste',
        influence: year >= 1980 ? 58 : 28,
        territoryControlPct: year >= 1980 ? 14 : 5,
        rivalryWithIds: ['org_cinturao_metropolitano'],
        lawEnforcementPressure: 52,
        status: 'Ativa',
      },
      {
        id: 'org_milicia_suburbana',
        name: 'Milícia Territorial Clandestina',
        type: 'Milícia',
        region: 'Sudeste / Nordeste',
        influence: year >= 2000 ? 48 : 15,
        territoryControlPct: year >= 2000 ? 11 : 2,
        rivalryWithIds: ['org_cinturao_metropolitano'],
        lawEnforcementPressure: 58,
        status: year >= 1995 ? 'Ativa' : 'Enfraquecida',
      },
      {
        id: 'org_cibercrime_latam',
        name: 'Anel de Fraude Digital Sombra',
        type: 'Cibercrime',
        region: 'Nacional / Digital',
        influence: year >= 2005 ? 52 : 0,
        territoryControlPct: 0,
        rivalryWithIds: [],
        lawEnforcementPressure: 62,
        status: year >= 2005 ? 'Ativa' : 'Desarticulada',
      },
    ];

    return {
      ruleset: this.resolveLegalRuleset('BRA', year),
      policeForces,
      criminalOrganizations,
      nationalCrimeIndex: 44,
      prisonOccupancyPct: year >= 2000 ? 148 : 98,
      judicialBacklogIndex: 61,
      recentOperations: [],
    };
  }

  static advanceYear(save: GameSave, year: number): string[] {
    const world = save.worldState!;
    if (!world.crimeAndJustice) {
      world.crimeAndJustice = this.createInitialState(year);
    }
    const cj = world.crimeAndJustice;
    cj.ruleset = this.resolveLegalRuleset('BRA', year);

    const securityBudgetBonus = world.governmentAdmin
      ? (world.governmentAdmin.budgets.security - 15) * 0.4
      : 0;
    const povertyFactor = (world.brazil.povertyRatePct || 20) * 0.45;
    const inequalityFactor = (world.brazil.socialInequalityGini || 0.52) * 35;

    cj.nationalCrimeIndex = Number(
      Math.max(12, Math.min(88, 28 + povertyFactor + inequalityFactor - securityBudgetBonus - (world.brazil.institutionalTrust || 50) * 0.25)).toFixed(1)
    );

    for (const pf of cj.policeForces) {
      pf.readiness = Math.max(25, Math.min(96, Math.round(pf.readiness * 0.85 + (55 + securityBudgetBonus + (world.technology.brazilTechIndex || 40) * 0.25) * 0.15)));
      pf.clearanceRatePct = Math.max(20, Math.min(92, Math.round(pf.clearanceRatePct * 0.8 + pf.readiness * 0.2)));
    }

    for (const org of cj.criminalOrganizations) {
      if (org.type === 'Cibercrime' && year < 2000) {
        org.influence = 0;
        org.status = 'Desarticulada';
        continue;
      }
      const pressure = Math.round(cj.policeForces[2].readiness * 0.55 + (world.brazil.institutionalTrust || 50) * 0.35 + securityBudgetBonus);
      org.lawEnforcementPressure = Math.max(15, Math.min(95, pressure));
      const delta = cj.nationalCrimeIndex > pressure ? 1.5 : -1.8;
      org.influence = Math.max(5, Math.min(85, Number((org.influence + delta).toFixed(1))));
      org.status = org.influence < 22 ? 'Enfraquecida' : 'Ativa';
    }

    const notes: string[] = [];
    const char = save.character;
    if (!char.justice) {
      char.justice = {
        activeInvestigations: [],
        courtCases: [],
        criminalAffiliation: null,
        prisonRegime: 'Livre',
        prisonGoodBehaviorPoints: 0,
        totalConvictions: 0,
        totalAcquittals: 0,
      };
    }

    // 1. Advance active police investigations (BO -> Inquérito -> Denúncia MP ou Arquivamento/Prescrição)
    for (const inv of char.justice.activeInvestigations) {
      if (inv.status === 'Arquivado' || inv.status === 'Prescrito' || inv.status === 'Denunciado_MP') continue;
      if (year >= inv.prescribesAtYear) {
        inv.status = 'Prescrito';
        notes.push(`Inquérito ${inv.boNumber} (${inv.offenseTitle}) prescreveu conforme prazo legal.`);
        continue;
      }
      if (inv.status === 'BO_Registrado') {
        inv.status = 'Inquerito_Em_Curso';
        inv.evidenceScore = Math.min(95, inv.evidenceScore + 12);
      } else if (inv.status === 'Inquerito_Em_Curso') {
        const threshold = cj.policeForces[1].clearanceRatePct;
        if (inv.evidenceScore >= 60 || (year + inv.severity * 7) % 100 < threshold) {
          inv.status = 'Denunciado_MP';
          const rules = cj.ruleset;
          const rawYears = Math.min(rules.maxPrisonSentenceYears, inv.severity * 2);
          const caseId = `case_${year}_${char.justice.courtCases.length + 1}`;
          const preventive = inv.severity >= 4 && inv.evidenceScore >= 72;
          char.justice.courtCases.push({
            id: caseId,
            processNumber: `${year}.${String(1000 + char.justice.courtCases.length)}.0001-BR`,
            charge: inv.offenseTitle,
            offenseCategory: inv.category,
            courtLevel: inv.severity === 5 ? 'Tribunal do Júri' : '1ª Instância',
            status: preventive ? 'Prisao_Preventiva' : 'Aguardando_Julgamento',
            sentenceYears: rawYears,
            servedYears: 0,
            regime: preventive ? 'Fechado' : 'Liberdade_Provisoria',
            fineCentavos: inv.severity * 250000,
            legalRulesetId: rules.id,
            constitutionalNote: rules.notes,
            filedYear: year,
            appealCount: 0,
            lawyerTier: char.money > 15000000 ? 'Banca Criminalista' : char.money > 2000000 ? 'Advogado Padrão' : 'Defensoria Pública',
          });
          if (preventive) {
            char.status = 'Preso';
            char.justice.prisonRegime = 'Fechado';
            notes.push(`Prisão preventiva decretada no processo ${caseId} por ${inv.offenseTitle}.`);
          } else {
            notes.push(`Ministério Público ofereceu denúncia no processo ${caseId}.`);
          }
        } else {
          inv.status = 'Arquivado';
          notes.push(`Inquérito ${inv.boNumber} arquivado por falta de provas suficientes.`);
        }
      }
    }

    // 2. Advance pending court trials
    for (const c of char.justice.courtCases) {
      if (c.status === 'Aguardando_Julgamento' || c.status === 'Prisao_Preventiva') {
        const defenseBonus = c.lawyerTier === 'Banca Criminalista' ? 28 : c.lawyerTier === 'Advogado Padrão' ? 14 : 6;
        const acquittalRoll = Math.abs((year * 29 + c.filedYear * 11 + char.intelligence) % 100);
        if (acquittalRoll < 25 + defenseBonus) {
          c.status = 'Absolvido';
          c.regime = 'Livre';
          c.verdictYear = year;
          char.justice.totalAcquittals += 1;
          if (!char.justice.courtCases.some((other) => other.id !== c.id && (other.status === 'Condenado' || other.status === 'Prisao_Preventiva'))) {
            char.status = 'Vivo';
            char.criminalRecord.prisonYearsRemaining = 0;
            char.justice.prisonRegime = 'Livre';
          }
          notes.push(`Absolvido na ação ${c.processNumber} (${c.charge}).`);
        } else {
          const rules = cj.ruleset;
          const cappedSentence = Math.min(rules.maxPrisonSentenceYears, Math.max(1, Math.round(c.sentenceYears)));
          c.status = 'Condenado';
          c.sentenceYears = cappedSentence;
          c.verdictYear = year;
          c.regime = cappedSentence >= 8 ? 'Fechado' : cappedSentence >= 4 ? 'Semiaberto' : 'Aberto';
          char.justice.totalConvictions += 1;
          char.criminalRecord.arrests += 1;
          char.criminalRecord.prisonYearsRemaining = Math.min(
            rules.maxPrisonSentenceYears,
            (char.criminalRecord.prisonYearsRemaining || 0) + (c.regime === 'Aberto' ? 0 : cappedSentence)
          );
          if (char.criminalRecord.prisonYearsRemaining > 0) {
            char.status = 'Preso';
            char.justice.prisonRegime = c.regime;
          }
          notes.push(`Condenação em ${c.courtLevel} (${c.processNumber}): ${cappedSentence} ano(s) em regime ${c.regime}.`);
        }
      }
    }

    // 3. Regime progression for incarcerated protagonists (Constitutional guarantee)
    if (char.status === 'Preso' && char.criminalRecord.prisonYearsRemaining > 0 && cj.ruleset.hasRegimeProgression) {
      const activeConv = char.justice.courtCases.find((c) => c.status === 'Condenado');
      if (activeConv) {
        activeConv.servedYears += 1;
        if (activeConv.regime === 'Fechado' && activeConv.servedYears >= Math.max(1, Math.floor(activeConv.sentenceYears * 0.25))) {
          activeConv.regime = 'Semiaberto';
          char.justice.prisonRegime = 'Semiaberto';
          notes.push(`Progressão legal concedida para o regime Semiaberto (${activeConv.processNumber}).`);
        } else if (activeConv.regime === 'Semiaberto' && activeConv.servedYears >= Math.max(2, Math.floor(activeConv.sentenceYears * 0.5))) {
          activeConv.regime = 'Aberto';
          char.justice.prisonRegime = 'Aberto';
          char.status = 'Vivo';
          char.criminalRecord.prisonYearsRemaining = 0;
          notes.push(`Progressão para o regime Aberto concedida; retorno à liberdade monitorada.`);
        }
      }
    }

    return notes;
  }

  static commitSystemicOffense(save: GameSave, offenseId: string): {
    offense: SystemicOffenseCatalogItem;
    detected: boolean;
    investigation?: PoliceInvestigationRecord;
    rewardCentavos: number;
    summary: string;
  } {
    const world = save.worldState!;
    const year = world.clock.year;
    if (!world.crimeAndJustice) {
      world.crimeAndJustice = this.createInitialState(year);
    }
    const offense = SYSTEMIC_OFFENSES_CATALOG.find((o) => o.id === offenseId);
    if (!offense) {
      throw new Error('Categoria de infração inválida.');
    }
    if (offense.minYear && year < offense.minYear) {
      throw new Error(`Esta tipificação não existe no contexto histórico de ${year}.`);
    }

    const char = save.character;
    if (!char.justice) {
      char.justice = {
        activeInvestigations: [],
        courtCases: [],
        criminalAffiliation: null,
        prisonRegime: 'Livre',
        prisonGoodBehaviorPoints: 0,
        totalConvictions: 0,
        totalAcquittals: 0,
      };
    }

    const policeSkill = world.crimeAndJustice.policeForces[1]?.clearanceRatePct ?? 45;
    const effectiveRisk = Math.min(92, Math.max(15, offense.baseDetectionRiskPct + (policeSkill - 40) * 0.35 - (char.intelligence - 50) * 0.15));
    const roll = (Date.now() + char.currentAge * 17 + save.events.length * 31) % 100;
    const detected = roll < effectiveRisk;

    const scale = Math.max(0.5, world.economy.costOfLivingMultiplier || 1);
    const rewardCentavos = detected ? Math.round(offense.baseRewardCentavos * 0.25 * scale) : Math.round(offense.baseRewardCentavos * scale);

    char.money += rewardCentavos;
    char.reputation = Math.max(0, char.reputation - offense.severity * 4);
    char.criminalRecord.crimesCommitted.push(`${offense.title} (${year})`);

    if (detected) {
      const force: PoliceInvestigationRecord['investigatingForce'] =
        offense.category === 'Cibernético' || offense.category === 'Ambiental' || offense.severity === 5 ? 'PF' : 'PC';
      const inv: PoliceInvestigationRecord = {
        id: `inv_${year}_${Date.now().toString(36)}`,
        boNumber: `BO-${year}-${Math.floor(10000 + (roll * 791) % 89999)}`,
        offenseTitle: offense.title,
        category: offense.category,
        severity: offense.severity,
        status: 'BO_Registrado',
        evidenceScore: Math.min(95, 45 + offense.severity * 9),
        openedYear: year,
        prescribesAtYear: year + world.crimeAndJustice.ruleset.prescriptionYearsDefault,
        investigatingForce: force,
      };
      char.justice.activeInvestigations.push(inv);

      return {
        offense,
        detected: true,
        investigation: inv,
        rewardCentavos,
        summary: `Autoridades (${force}) registraram o ${inv.boNumber} por ${offense.title}. O inquérito seguirá o devido processo legal (${world.crimeAndJustice.ruleset.eraLabel}).`,
      };
    }

    return {
      offense,
      detected: false,
      rewardCentavos,
      summary: `Ato ilícito (${offense.title}) não foi detectado de imediato, mas elevou riscos cadastrais e reputacionais.`,
    };
  }

  static fileCourtAppeal(save: GameSave, caseId: string): string {
    const char = save.character;
    const world = save.worldState!;
    const c = char.justice?.courtCases.find((item) => item.id === caseId);
    if (!c) throw new Error('Processo judicial não encontrado.');
    if (c.status !== 'Condenado' && c.status !== 'Prisao_Preventiva') {
      throw new Error('Este processo não está passível de recurso no momento.');
    }
    if (c.appealCount >= 2) {
      throw new Error('Instâncias recursais esgotadas neste processo.');
    }

    const appealCostCentavos = Math.round(350000 * Math.max(0.5, world.economy.costOfLivingMultiplier || 1));
    if (char.money < appealCostCentavos && c.lawyerTier !== 'Defensoria Pública') {
      throw new Error('Saldo insuficiente para custas recursais (ou utilize Defensoria Pública).');
    }
    if (c.lawyerTier !== 'Defensoria Pública') {
      char.money -= appealCostCentavos;
    }

    c.appealCount += 1;
    c.courtLevel = c.appealCount === 1 ? '2ª Instância (TJ/TRF)' : 'STJ/STF';

    const successChance = c.lawyerTier === 'Banca Criminalista' ? 42 : c.lawyerTier === 'Advogado Padrão' ? 28 : 22;
    const roll = Math.abs((world.clock.year * 19 + char.intelligence + c.appealCount * 37) % 100);

    if (roll < successChance) {
      if (roll % 3 === 0) {
        c.status = 'Anulado_Erro_Judicial';
        c.regime = 'Livre';
        c.sentenceYears = 0;
        char.status = 'Vivo';
        char.criminalRecord.prisonYearsRemaining = 0;
        if (char.justice) char.justice.prisonRegime = 'Livre';
        return `Recurso provido no ${c.courtLevel}: sentença anulada por revisão/erro judicial.`;
      } else {
        c.sentenceYears = Math.max(1, Math.floor(c.sentenceYears * 0.6));
        char.criminalRecord.prisonYearsRemaining = Math.max(1, Math.min(char.criminalRecord.prisonYearsRemaining, c.sentenceYears - c.servedYears));
        return `Recurso parcialmente provido no ${c.courtLevel}: pena reduzida para ${c.sentenceYears} ano(s).`;
      }
    }

    return `Recurso julgado no ${c.courtLevel}: condenação mantida nos limites da lei (${world.crimeAndJustice?.ruleset.constitutionName || 'CF/88'}).`;
  }
}
