export type WorldTruthStatus =
  | 'HISTORICAL_FACT'
  | 'SIMULATED_EVENT'
  | 'ALTERNATIVE_HISTORY'
  | 'FUTURE_PROJECTION';

export type LegacyWorldTruthStatus =
  | 'FATO_HISTORICO'
  | 'CONTEXTO_HISTORICO'
  | 'PROJECAO'
  | 'EVENTO_ALTERNATIVO';

export function normalizeTruthStatus(
  status?: string,
  year = 2026
): WorldTruthStatus {
  if (status === 'HISTORICAL_FACT' || status === 'FATO_HISTORICO') {
    return year > 2026 ? 'FUTURE_PROJECTION' : 'HISTORICAL_FACT';
  }
  if (status === 'SIMULATED_EVENT' || status === 'CONTEXTO_HISTORICO') {
    return year > 2026 ? 'FUTURE_PROJECTION' : 'SIMULATED_EVENT';
  }
  if (status === 'ALTERNATIVE_HISTORY' || status === 'EVENTO_ALTERNATIVO') {
    return 'ALTERNATIVE_HISTORY';
  }
  if (status === 'FUTURE_PROJECTION' || status === 'PROJECAO') {
    return 'FUTURE_PROJECTION';
  }
  return year > 2026 ? 'FUTURE_PROJECTION' : 'SIMULATED_EVENT';
}

export function formatTruthStatusLabel(status?: WorldTruthStatus | LegacyWorldTruthStatus): string {
  const norm = normalizeTruthStatus(status);
  switch (norm) {
    case 'HISTORICAL_FACT':
      return 'Fato Histórico';
    case 'ALTERNATIVE_HISTORY':
      return 'História Alternativa';
    case 'FUTURE_PROJECTION':
      return 'Projeção Simulada';
    case 'SIMULATED_EVENT':
    default:
      return 'Evento Simulado';
  }
}

export type WorldHistoricalEraId =
  | 'ANTIGUIDADE'
  | 'IDADE_MEDIA'
  | 'IDADE_MODERNA'
  | 'CONTEMPORANEA'
  | 'SECULO_XX'
  | 'SECULO_XXI'
  | 'FUTURO_PROXIMO'
  | 'FUTURO_DISTANTE';

export type BrazilHistoricalPhaseId =
  | 'BRASIL_COLONIA'
  | 'IMPERIO_DO_BRASIL'
  | 'PRIMEIRA_REPUBLICA'
  | 'ERA_VARGAS'
  | 'REPUBLICA_POPULISTA'
  | 'REGIME_MILITAR'
  | 'NOVA_REPUBLICA'
  | 'BRASIL_CONTEMPORANEO'
  | 'BRASIL_FUTURO_PROJETADO';

export type WorldAdvanceUnit =
  | 'day'
  | 'week'
  | 'month'
  | '6months'
  | 'year'
  | '5years'
  | '10years'
  | '50years'
  | '100years';

export type SeasonName = 'Verão' | 'Outono' | 'Inverno' | 'Primavera';

export interface WorldClock {
  day: number; // 1..30 canonical 30-day calendar
  month: number; // 1..12
  year: number;
  totalDaysElapsed: number;
  totalMonthsElapsed: number;
  decade: number;
  century: number;
  season: SeasonName;
  era: WorldHistoricalEraId;
  eraLabel: string;
  brazilPhase: BrazilHistoricalPhaseId;
  brazilPhaseLabel: string;
  tickCount: number;
  lastTickId: string;
}

export interface WorldClockStep {
  previous: WorldClock;
  current: WorldClock;
  daysAdvanced: number;
  monthsCrossed: number[];
  yearsCrossed: number[];
  decadesCrossed: number[];
  centuriesCrossed: number[];
  periodKey: string;
}

export type HistoricalEventScope = 'global' | 'brazil' | 'regional' | 'scientific' | 'economic' | 'cultural';

export type HistoricalEventCategory =
  | 'Geopolítica'
  | 'Economia'
  | 'Energia'
  | 'Ciência & Tecnologia'
  | 'Sociedade & Direitos'
  | 'Cultura'
  | 'Clima & Saúde'
  | 'Política Nacional'
  | 'Desenvolvimento Regional';

export type EventCatalogCategory =
  | 'Vida pessoal e familiar'
  | 'Finanças e patrimônio'
  | 'Educação e formação'
  | 'Carreiras e trabalho'
  | 'Empresas e empreendedorismo'
  | 'Política e eleições'
  | 'Governo e administração pública'
  | 'Polícia e segurança pública'
  | 'Crimes e investigação'
  | 'Justiça e sistema prisional'
  | 'Religiões e instituições'
  | 'Organizações e movimentos sociais'
  | 'Guerras e conflitos internacionais'
  | 'Diplomacia e relações internacionais'
  | 'Saúde e epidemias'
  | 'Ciência e tecnologia'
  | 'Cultura e entretenimento'
  | 'Meio ambiente e desastres'
  | 'Esportes e lazer'
  | 'História mundial e brasileira'
  | 'Sociedade e demografia'
  | 'Eventos extraordinários e históricos alternativos';

export interface CatalogEventChoiceEffect {
  moneyDeltaCentavos?: number;
  healthDelta?: number;
  mentalHealthDelta?: number;
  happinessDelta?: number;
  intelligenceDelta?: number;
  charismaDelta?: number;
  reputationDelta?: number;
  disciplineDelta?: number;
  careerSkillDelta?: number;
  lawPressureDelta?: number;
  worldGdpDelta?: number;
  worldTrustDelta?: number;
  crimeSeverity?: number;
  nextEventId?: string;
}

export interface CatalogEventChoice {
  id: string;
  text: string;
  effectDescription: string;
  effect: CatalogEventChoiceEffect;
}

export interface CatalogEventDefinition {
  id: string;
  title: string;
  description: string;
  category: EventCatalogCategory;
  subcategory: string;
  minYear: number;
  maxYear: number;
  minAge?: number;
  maxAge?: number;
  countryScope: 'BR' | 'GLOBAL';
  regions?: string[];
  truthStatus: WorldTruthStatus;
  tags: string[];
  requirements?: {
    minEducation?: 'Nenhum' | 'Fundamental' | 'Médio' | 'Universidade' | 'Pós-graduação';
    requiresEmployed?: boolean;
    requiresPoliticalOffice?: boolean;
    requiresCriminalActivity?: boolean;
    minWealthCentavos?: number;
  };
  choices: CatalogEventChoice[];
  chainedNextIds?: string[];
  oneTime?: boolean;
}

export interface HistoricalEventImpact {
  globalGdpDeltaPct?: number;
  brazilGdpDeltaPct?: number;
  globalInflationDelta?: number;
  brazilInflationDelta?: number;
  unemploymentDelta?: number;
  selicDelta?: number;
  diplomacyShift?: number;
  populationDeltaPct?: number;
  urbanizationDelta?: number;
  trustInInstitutionsDelta?: number;
  playerHappinessDelta?: number;
  playerHealthDelta?: number;
  playerCostOfLivingMultiplierDelta?: number;
  techBoostCategories?: TechnologyCategory[];
}

export interface HistoricalEventRecord {
  id: string;
  year: number;
  month?: number;
  endYear?: number;
  title: string;
  summary: string;
  region: string;
  scope: HistoricalEventScope;
  category?: HistoricalEventCategory;
  origin: 'historical' | 'simulated';
  truthStatus: WorldTruthStatus;
  era: WorldHistoricalEraId;
  brazilPhase?: BrazilHistoricalPhaseId;
  countriesAffected?: string[];
  tags: string[];
  conditions?: string[];
  consequences: string[];
  affectedSystems: string[];
  processed: boolean;
  idempotencyKey: string;
  impact: HistoricalEventImpact;
  occurredAtTick?: number;
}

export interface CurrencyPeriod {
  id: string;
  name: string;
  code: string;
  symbol: string;
  startYear: number;
  endYear: number;
  divisorFromPrevious: number;
  conversionNote: string;
}

export interface MonetaryReformRecord {
  year: number;
  fromCurrency: string;
  toCurrency: string;
  divisor: number;
  moneyBeforeNominal: number;
  moneyAfterNominal: number;
  salaryBeforeNominal: number;
  salaryAfterNominal: number;
  note: string;
}

export interface BrazilGovernmentPeriod {
  id: string;
  leaderName: string;
  title: string;
  regime:
    | 'Monarquia'
    | 'República Oligárquica'
    | 'Governo Provisório/Estado Novo'
    | 'República Democrática'
    | 'Regime Militar'
    | 'Projeção Presidencial';
  partyOrCoalition: string;
  startYear: number;
  endYear: number;
  truthStatus: WorldTruthStatus;
  economicOrientation: 'Liberal' | 'Desenvolvimentista' | 'Estatizante' | 'Estabilização' | 'Misto';
  baseTaxRatePct: number;
  keyPolicies: string[];
}

export type CitySettlementTier = 'metropole' | 'capital' | 'interior' | 'rural';

export interface CityEvolutionMetrics {
  id: string;
  name: string;
  state: string;
  ufCode: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  tier: CitySettlementTier;
  countryId: string;
  foundedYear: number;
  population: number;
  urbanizationRate: number; // 0..100
  developmentIndex: number; // 0..1 (internal simulator estimate)
  costOfLivingIndex: number; // baseline 100
  safetyIndex: number; // 0..100
  jobOpportunityIndex: number; // 0..100
  infrastructureLevel: number; // 0..100
  climateRiskIndex: number; // 0..100
  mainSectors: BusinessSector[];
  recentRegionalEvent?: string;
}

export interface RegionalDynamicEvent {
  id: string;
  year: number;
  ufCode: string;
  stateName: string;
  cityName: string;
  title: string;
  summary: string;
  type: 'industria' | 'universidade' | 'infraestrutura' | 'crise_local' | 'seca' | 'migracao';
  truthStatus: WorldTruthStatus;
}

export interface BrazilStateInfo {
  code: string;
  name: string;
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  capital: string;
  populationShare: number;
  gdpIndex: number;
  urbanizationBase: number;
}

export interface BrazilState {
  phase: BrazilHistoricalPhaseId;
  phaseLabel: string;
  constitution: string;
  constitutionYear: number;
  currency: CurrencyPeriod;
  monetaryHistory: MonetaryReformRecord[];
  currentGovernment: BrazilGovernmentPeriod;
  politicalRegimeType: string;
  electionCycleYear: number;
  nextElectionYear: number;
  canVoteDirectly: boolean;
  population: number;
  urbanizationRate: number;
  gdpBillionsUSD: number;
  gdpGrowthRate: number;
  annualInflationRate: number; // %
  selicRate: number; // %
  unemploymentRate: number; // %
  publicDebtPctGdp: number; // % of GDP
  baseTaxRatePct: number; // effective income/consumption tax rate %
  realWageIndex: number; // baseline 100
  povertyRatePct: number; // %
  minimumWageNominal: number; // in current currency units (not centavos)
  exchangeRatePerUSD: number;
  literacyRate: number; // %
  lifeExpectancy: number;
  institutionalTrust: number; // 0..100
  socialInequalityGini: number; // 0..1
  states: Record<
    string,
    {
      ufCode: string;
      region: BrazilStateInfo['region'];
      population: number;
      developmentIndex: number;
      unemploymentRate: number;
      costOfLivingIndex: number;
      safetyIndex: number;
    }
  >;
  cities: Record<string, CityEvolutionMetrics>;
  regionalEvents: RegionalDynamicEvent[];
  activePolicies: string[];
  activeEpidemic?: {
    id: string;
    name: string;
    severity: number; // 0..100
    vaccineAvailable: boolean;
  } | null;
}

export type GeopoliticalBloc =
  | 'América Latina / Mercosul'
  | 'América do Norte'
  | 'União Europeia / Europa'
  | 'Ásia-Pacífico'
  | 'Oriente Médio / África'
  | 'Não Alinhado / Em Transição';

export interface CountryState {
  id: string;
  name: string;
  region: string;
  capital: string;
  language: string;
  currencyCode: string;
  bloc: GeopoliticalBloc;
  regimeType: string;
  diplomaticRelationWithBrazil: number; // -100..100
  population: number;
  birthRatePer1000: number;
  deathRatePer1000: number;
  netMigrationPer1000: number;
  urbanizationRate: number;
  gdpBillionsUSD: number;
  gdpGrowthRate: number;
  inflationRate: number;
  unemploymentRate: number;
  interestRate: number;
  techAdoptionIndex: number; // 0..100
  stabilityIndex: number; // 0..100
  lifeExpectancy: number;
  conflictStatus: 'Paz' | 'Tensão Diplomática' | 'Conflito Regional' | 'Crise Econômica';
  majorCities: string[];
}

export type EconomicCyclePhase = 'Expansão' | 'Boom' | 'Desaceleração' | 'Recessão' | 'Recuperação';

export interface WorldEconomyState {
  cyclePhase: EconomicCyclePhase;
  globalGdpBillionsUSD: number;
  globalGdpGrowthRate: number;
  globalInflationRate: number;
  globalUnemploymentRate: number;
  commodityIndex: number; // baseline 100
  techMarketIndex: number; // baseline 100
  realEstateIndex: number; // baseline 100
  housingAffordabilityIndex: number; // 0..100
  energyPriceIndex: number; // baseline 100
  costOfLivingMultiplier: number;
  creditAvailability: number; // 0..100
  creditInterestSpreadPct: number; // %
  activeCrises: string[];
}

export type TechnologyCategory =
  | 'Agricultura'
  | 'Medicina'
  | 'Transporte'
  | 'Energia'
  | 'Comunicação'
  | 'Computação'
  | 'Internet'
  | 'Eletrônica'
  | 'Indústria'
  | 'Automação'
  | 'Robótica'
  | 'Inteligência Artificial'
  | 'Biotecnologia'
  | 'Exploração Espacial';

export interface TechnologyDefinition {
  id: string;
  name: string;
  category: TechnologyCategory;
  inventionYear: number;
  mainstreamYear: number;
  obsoleteAfterYear?: number;
  dependencies: string[];
  originRegion: string;
  truthStatus: WorldTruthStatus;
  description: string;
  lifeExpectancyBonus: number;
  productivityBonus: number;
  unlockedCareers: string[];
  obsoletedCareers?: string[];
  unlockedTreatments?: string[];
}

export interface WorldTechnologyState {
  globalTechIndex: number; // 0..100
  brazilTechIndex: number; // 0..100
  unlockedTechIds: string[];
  adoptedTechRates: Record<string, number>; // 0..100%
  regionalAdoptionByTech: Record<string, Record<string, number>>; // techId -> { Sudeste, Sul, ... }
  recentBreakthroughs: {
    year: number;
    techId: string;
    name: string;
    category: TechnologyCategory;
    truthStatus: WorldTruthStatus;
  }[];
}

export type BusinessSector =
  | 'Tecnologia'
  | 'Comércio'
  | 'Indústria'
  | 'Agropecuária'
  | 'Saúde'
  | 'Educação'
  | 'Finanças'
  | 'Entretenimento'
  | 'Construção'
  | 'Energia'
  | 'Logística';

export interface CompanyEntity {
  id: string;
  name: string;
  sector: BusinessSector;
  countryId: string;
  headquartersCity: string;
  foundedYear: number;
  status: 'Ativa' | 'Em Expansão' | 'Em Crise' | 'Faliu' | 'Adquirida';
  acquiredBy?: string;
  playerOwned?: boolean;
  valuationBillionsBRL: number;
  revenueGrowthPct: number;
  employeesCount: number;
  hiringCapacity: number; // 0..100
  minTechIndexRequired: number;
  minYearAvailable: number;
  maxYearAvailable?: number;
}

export interface JobMarketRole {
  id: string;
  title: string;
  sector: BusinessSector;
  careerTrack?:
    | 'Formal'
    | 'Informal'
    | 'Aprendiz'
    | 'Autônomo'
    | 'Empreendedor'
    | 'Executivo'
    | 'Concurso Público'
    | 'Magistratura'
    | 'Polícia'
    | 'Militar'
    | 'Diplomacia'
    | 'Política'
    | 'Rural'
    | 'Industrial'
    | 'Tecnologia'
    | 'Saúde'
    | 'Educação'
    | 'Cultura'
    | 'Esportes'
    | 'Religioso'
    | 'Histórica';
  companyName: string;
  minEducation: 'Nenhum' | 'Fundamental' | 'Médio' | 'Universidade' | 'Pós-graduação';
  minAge: number;
  minYear: number;
  maxYear?: number;
  requiredTechId?: string;
  baseAnnualSalaryCentavos: number;
  prestige: number;
  requiredIntelligence?: number;
  economySensitivity: number; // 0..1
  regionalDemandFactor?: number;
  legalRiskPct?: number;
  isExtinct?: boolean;
}

export interface WorldPoliticsState {
  globalStabilityIndex: number; // 0..100
  multipolarityIndex: number; // 0..100
  brazilForeignAlignment: string;
  activeTreaties: string[];
  recentPoliticalTransitions: {
    year: number;
    countryId: string;
    summary: string;
    truthStatus: WorldTruthStatus;
  }[];
  activeProtestsOrMovements: string[];
  citizenParticipationScore: number; // 0..100
}

export interface WorldPopulationState {
  worldPopulationTotal: number;
  worldBirthRatePer1000: number;
  worldDeathRatePer1000: number;
  globalLifeExpectancy: number;
  globalUrbanizationRate: number;
  medianAgeGlobal: number;
  medianAgeBrazil: number;
  netBrazilMigrationPerYear: number;
  livingGenerationsCount: number;
}

export interface WorldCultureState {
  dominantMusicGenres: string[];
  dominantMediaFormats: string[];
  fashionTrend: string;
  socialValues: {
    digitalization: number; // 0..100
    familyTraditionalism: number; // 0..100
    environmentalAwareness: number; // 0..100
    civicParticipation: number; // 0..100
    entrepreneurship: number; // 0..100
  };
  popularSports: string[];
  slangOrCulturalMarker: string;
}

export interface ClimateDisasterRecord {
  id: string;
  year: number;
  season: SeasonName;
  region: string;
  title: string;
  severity: 'Moderado' | 'Alto' | 'Extremo';
  impactNote: string;
}

export interface WorldEnvironmentState {
  globalTempAnomalyC: number;
  brazilForestCoverPct: number;
  renewableEnergySharePct: number;
  airQualityIndexBrazil: number;
  extremeWeatherRisk: number; // 0..100
  activeClimateEvents: string[];
  recentDisasters: ClimateDisasterRecord[];
}

export interface WorldInstitutionState {
  institutions: {
    id: string;
    name: string;
    countryId: string;
    foundedYear: number;
    status: 'Ativa' | 'Ainda não fundada' | 'Em Reforma' | 'Fortalecida';
    effectiveness: number; // 0..100
    publicTrust: number; // 0..100
  }[];
}

export interface NotableNPCRecord {
  id: string;
  name: string;
  role: string;
  countryId: string;
  city: string;
  birthYear: number;
  alive: boolean;
  fame: number; // 0..100
  sector: string;
  summary: string;
  personality?: string[];
}

export interface FamilyGenerationRecord {
  generation: number;
  protagonistId: string;
  protagonistName: string;
  birthYear: number;
  deathYear?: number;
  inheritedNetWorthCentavos: number;
  city: string;
  occupation?: string;
  legacyTitle: string;
}

export interface NPCMemoryItem {
  id: string;
  year: number;
  month?: number;
  summary: string;
  sentiment: 'positivo' | 'neutro' | 'negativo';
  impactLevel: number; // 1..5
}

export interface InternationalTreatyRecord {
  id: string;
  title: string;
  type: 'comercio' | 'diplomacia' | 'clima' | 'ciencia' | 'seguranca';
  countries: string[];
  startYear: number;
  endYear?: number;
  impactSummary: string;
}

export interface InternationalConflictRecord {
  id: string;
  title: string;
  belligerents: string[];
  startYear: number;
  endYear?: number;
  intensity: 'Tensão' | 'Guerra Local' | 'Guerra Regional' | 'Guerra Global';
  impactSummary: string;
}

export interface CausalDomainMetrics {
  technologyIndex: number;
  productivityIndex: number;
  businessHealthIndex: number;
  realWageIndex: number;
  regionalVitalityIndex: number;
  migrationPressureIndex: number;
  socialCohesionIndex: number;
  institutionalStabilityIndex: number;
  policyFeedbackDelta: number;
  lastCausalCycleTimestamp: number;
}

export interface LegalRulesetProfile {
  id: string;
  countryId: string;
  eraLabel: string;
  constitutionName: string;
  minYear: number;
  maxYear: number;
  allowsDeathPenaltyInPeacetime: boolean;
  allowsLifeImprisonment: boolean;
  maxPrisonSentenceYears: number;
  majorityAge: number;
  requiresDueProcess: boolean;
  hasRegimeProgression: boolean;
  prescriptionYearsDefault: number;
  notes: string;
}

export interface CriminalOrganizationEntity {
  id: string;
  name: string;
  type: 'Facção' | 'Milícia' | 'Cartel' | 'Cibercrime' | 'Quadrilha Histórica';
  region: string;
  influence: number; // 0..100
  territoryControlPct: number; // 0..100
  rivalryWithIds: string[];
  lawEnforcementPressure: number; // 0..100
  status: 'Ativa' | 'Enfraquecida' | 'Desarticulada';
}

export interface PoliceForceStatus {
  id: string;
  name: string;
  acronym: 'PM' | 'PC' | 'PF' | 'PRF' | 'PP' | 'GM' | 'CB' | 'PERICIA';
  jurisdiction: 'Municipal' | 'Estadual' | 'Federal';
  readiness: number; // 0..100
  clearanceRatePct: number; // 0..100
  budgetPct: number;
  trustScore: number; // 0..100
}

export interface PoliceInvestigationRecord {
  id: string;
  boNumber: string;
  offenseTitle: string;
  category: string;
  severity: 1 | 2 | 3 | 4 | 5;
  status: 'BO_Registrado' | 'Inquerito_Em_Curso' | 'Mandado_Expedido' | 'Denunciado_MP' | 'Arquivado' | 'Prescrito';
  evidenceScore: number; // 0..100
  openedYear: number;
  prescribesAtYear: number;
  investigatingForce: 'PC' | 'PF' | 'PM' | 'MP';
}

export interface CourtCaseRecord {
  id: string;
  processNumber: string;
  charge: string;
  offenseCategory: string;
  courtLevel: '1ª Instância' | 'Tribunal do Júri' | '2ª Instância (TJ/TRF)' | 'STJ/STF';
  status:
    | 'Aguardando_Julgamento'
    | 'Prisao_Preventiva'
    | 'Condenado'
    | 'Absolvido'
    | 'Recurso_Pendente'
    | 'Anulado_Erro_Judicial'
    | 'Prescrito'
    | 'Extinta_Punibilidade';
  sentenceYears: number;
  servedYears: number;
  regime: 'Livre' | 'Liberdade_Provisoria' | 'Aberto' | 'Semiaberto' | 'Fechado';
  fineCentavos: number;
  legalRulesetId: string;
  constitutionalNote: string;
  filedYear: number;
  verdictYear?: number;
  appealCount: number;
  lawyerTier: 'Defensoria Pública' | 'Advogado Padrão' | 'Banca Criminalista';
}

export interface WorldCrimeAndJusticeState {
  ruleset: LegalRulesetProfile;
  policeForces: PoliceForceStatus[];
  criminalOrganizations: CriminalOrganizationEntity[];
  nationalCrimeIndex: number; // 0..100
  prisonOccupancyPct: number; // 0..250
  judicialBacklogIndex: number; // 0..100
  recentOperations: string[];
}

export type PoliticalOfficeTitle =
  | 'Nenhum'
  | 'Vereador'
  | 'Prefeito'
  | 'Deputado Estadual'
  | 'Deputado Federal'
  | 'Senador'
  | 'Governador'
  | 'Presidente';

export interface GovernmentAdministrationState {
  scope: 'Municipal' | 'Estadual' | 'Federal';
  playerControlled: boolean;
  activeOfficeTitle: PoliticalOfficeTitle;
  mandateStartYear?: number;
  mandateEndYear?: number;
  taxRatePct: number;
  budgets: {
    health: number;
    education: number;
    security: number;
    infrastructure: number;
    science: number;
    environment: number;
    socialPrograms: number;
  };
  fiscalBalancePctGdp: number;
  publicSatisfaction: number; // 0..100
  corruptionAuditScore: number; // 0..100 (higher = cleaner)
  activePrograms: string[];
  recentDecisions: string[];
}

export interface ReligionDistribution {
  id: string;
  name: string;
  sharePct: number;
  institutionalPresence: number; // 0..100
  socialRole: string;
}

export interface ZooAndConservationState {
  nationalParksCount: number;
  zoosCount: number;
  protectedSpeciesCount: number;
  endangeredSpeciesCount: number;
  conservationIndex: number; // 0..100
  deforestationAlertLevel: number; // 0..100
  recentInitiatives: string[];
}

export interface WarAndSanctionState {
  id: string;
  title: string;
  region: string;
  actors: string[];
  type: 'Conflito Territorial' | 'Guerra Comercial/Sanções' | 'Tensão Cibernética' | 'Crise Humanitária';
  intensity: 1 | 2 | 3 | 4 | 5;
  economicShockPct: number;
  refugeeFlowIndex: number;
  diplomaticStatus: 'Escalando' | 'Impasse' | 'Negociação de Paz' | 'Tratado Assinado';
  startYear: number;
}

export interface WorldCivilizationState {
  religions: ReligionDistribution[];
  socialMovements: {
    id: string;
    name: string;
    focus: string;
    supportPct: number;
    active: boolean;
  }[];
  conservation: ZooAndConservationState;
  activeWarsAndSanctions: WarAndSanctionState[];
}

export interface WorldState {
  schemaVersion: number;
  seed: string;
  startYear: number;
  clock: WorldClock;
  economy: WorldEconomyState;
  brazil: BrazilState;
  countries: Record<string, CountryState>;
  technology: WorldTechnologyState;
  politics: WorldPoliticsState;
  population: WorldPopulationState;
  culture: WorldCultureState;
  environment: WorldEnvironmentState;
  institutions: WorldInstitutionState;
  companies: CompanyEntity[];
  historicalLog: HistoricalEventRecord[];
  notableNPCs: NotableNPCRecord[];
  generationsHistory: FamilyGenerationRecord[];
  processedPeriodKeys: string[];
  causality?: CausalDomainMetrics;
  activeTreaties?: InternationalTreatyRecord[];
  activeConflicts?: InternationalConflictRecord[];
  crimeAndJustice?: WorldCrimeAndJusticeState;
  governmentAdmin?: GovernmentAdministrationState;
  civilization?: WorldCivilizationState;
  triggeredCatalogEventIds?: string[];
  pendingChainedCatalogIds?: string[];
  lastConsistencyCheck: {
    passed: boolean;
    warnings: string[];
    checkedAtYear: number;
  };
}


