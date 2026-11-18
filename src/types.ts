import type {
  WorldState,
  WorldTruthStatus,
  WorldAdvanceUnit,
  WorldClock,
  HistoricalEventRecord,
  BrazilState,
  CountryState,
  JobMarketRole,
  NPCMemoryItem,
  EventCatalogCategory,
  PoliceInvestigationRecord,
  CourtCaseRecord,
  PoliticalOfficeTitle,
} from './types/world';

export * from './types/world';

export type AgeStage2D =
  | 'RECEM_NASCIDO'
  | 'BEBE_PEQUENO'
  | 'BEBE'
  | 'PRIMEIRA_INFANCIA'
  | 'CRIANCA_PEQUENA'
  | 'CRIANCA'
  | 'PRE_ADOLESCENTE'
  | 'ADOLESCENTE_INICIAL'
  | 'ADOLESCENTE_FINAL'
  | 'ADULTO_JOVEM'
  | 'ADULTO'
  | 'ADULTO_MADURO'
  | 'MEIA_IDADE_INICIAL'
  | 'MEIA_IDADE_AVANCADA'
  | 'IDOSO_INICIAL'
  | 'IDOSO'
  | 'IDOSO_AVANCADO'
  | 'LONGEVIDADE_EXTREMA'
  | 'CENTENARIO';

export type FacialExpression =
  | 'Neutra'
  | 'Feliz'
  | 'Triste'
  | 'Choro'
  | 'Assustada'
  | 'Irritada'
  | 'Surpresa'
  | 'Preocupada'
  | 'Cansada';

export interface CharacterAppearance {
  characterId: string;
  appearanceSeed: string;
  visualVersion?: number;
  faceShape: string;
  skinTone: string;
  eyeStyle: string;
  eyeColor: string;
  eyebrowStyle: string;
  noseStyle: string;
  mouthStyle: string;
  hairStyle: string;
  hairColor: string;
  facialHair: string;
  mustacheStyle?: string;
  accessories: {
    glasses: string;
    earrings: string;
    freckles: boolean;
    facialMark: string;
  };
  shirtColor?: string;
  backgroundColor?: string;
}

export interface Character {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  avatarSeed: string;
  appearanceSeed?: string;
  appearance?: CharacterAppearance;
  country: string;
  state: string;
  city: string;
  birthYear: number;
  currentAge: number;
  ageMonths?: number;
  money: number; // in current currency's minor units (centavos)
  debtCentavos?: number;
  salary: number; // annual salary in current currency's minor units
  health: number; // 0 - 100
  happiness: number; // 0 - 100
  intelligence: number; // 0 - 100
  looks: number; // 0 - 100
  fitness: number; // 0 - 100
  charisma: number; // 0 - 100
  discipline: number; // 0 - 100
  reputation: number; // 0 - 100
  careerSkill: number; // 0 - 100
  emotionalStability: number; // 0 - 100
  status: 'Vivo' | 'Morto' | 'Preso';
  causeOfDeath?: string;
  generation: number;
  parentId?: string;
  partnerId?: string;
  educationLevel: 'Nenhum' | 'Fundamental' | 'Médio' | 'Universidade' | 'Pós-graduação';
  currentEducation?: string;
  educationProgress: number; // 0 - 100
  careerTitle?: string;
  careerCompany?: string;
  careerExperienceYears: number;
  ownedCompanyId?: string;
  vaccinatedYears?: number[];
  housingStatus?: 'Mora com pais' | 'Aluguel' | 'Imóvel próprio';
  monthlyRentCentavos?: number;
  isRetired?: boolean;
  pensionCentavos?: number;
  inssContributionYears?: number;
  criminalRecord: {
    arrests: number;
    prisonYearsRemaining: number;
    crimesCommitted: string[];
  };
  mentalHealth?: number; // 0 - 100
  religion?: string;
  hobbies?: string[];
  passportCountries?: string[];
  insurance?: {
    health: boolean;
    life: boolean;
  };
  banking?: {
    bankAccountCentavos: number;
    savingsCentavos: number;
    creditScore: number; // 0 - 1000
    creditCardDebtCentavos: number;
    inDefault: boolean;
    bankruptcyCount: number;
    totalTaxesPaidCentavos: number;
    loans: {
      id: string;
      purpose: string;
      principalCentavos: number;
      remainingCentavos: number;
      annualInterestPct: number;
      remainingMonths: number;
      monthlyInstallmentCentavos: number;
    }[];
  };
  politics?: {
    party?: string;
    ideology?: string;
    office: PoliticalOfficeTitle;
    mandateYearsRemaining: number;
    approvalRating: number;
    campaignFundsCentavos: number;
    termCount: number;
    impeachmentRisk: number;
    billsPassed: number;
  };
  justice?: {
    activeInvestigations: PoliceInvestigationRecord[];
    courtCases: CourtCaseRecord[];
    criminalAffiliation?: {
      orgId: string;
      orgName: string;
      rank: string;
    } | null;
    prisonRegime?: 'Livre' | 'Liberdade_Provisoria' | 'Aberto' | 'Semiaberto' | 'Fechado';
    prisonGoodBehaviorPoints: number;
    totalConvictions: number;
    totalAcquittals: number;
  };
}

export type FamilyRelationType =
  | 'Pai'
  | 'Mãe'
  | 'Irmão'
  | 'Irmã'
  | 'Filho'
  | 'Filha'
  | 'Enteado'
  | 'Enteada'
  | 'Neto'
  | 'Neta'
  | 'Bisneto'
  | 'Bisneta'
  | 'Primo'
  | 'Prima'
  | 'Tio'
  | 'Tia'
  | 'Cônjuge'
  | 'Ex-Cônjuge'
  | 'Avô'
  | 'Avó';

export interface FamilyMember {
  id: string;
  characterId: string;
  name: string;
  relation: FamilyRelationType;
  age: number;
  ageMonths?: number;
  birthYear?: number;
  deathYear?: number;
  causeOfDeath?: string;
  alive: boolean;
  relationship: number; // 0 - 100 (Afinidade)
  money?: number;
  occupation?: string;
  city?: string;
  generation?: number;
  gender?: 'Masculino' | 'Feminino' | 'Outro';
  married?: boolean;
  divorced?: boolean;
  maritalYear?: number;
  isAdopted?: boolean;
  isStep?: boolean;
  personality?: string[];
  goals?: string[];
  memories?: string[];
  episodicMemories?: NPCMemoryItem[];
  mood?: string;
  appearanceSeed?: string;
  appearance?: CharacterAppearance;
}

export interface Asset {
  id: string;
  characterId: string;
  catalogId?: string;
  type: 'Imóvel' | 'Veículo' | 'Empresa' | 'Investimento';
  name: string;
  value: number; // in centavos
  monthlyIncome: number; // in centavos
  purchaseYear: number;
}

export interface LifeEvent {
  id: string;
  characterId: string;
  age: number;
  year: number;
  month?: number;
  day?: number;
  title: string;
  description: string;
  category:
    | EventCatalogCategory
    | 'Família'
    | 'Educação'
    | 'Carreira'
    | 'Finanças'
    | 'Saúde'
    | 'Romance'
    | 'Crime'
    | 'Aleatório'
    | 'Geral'
    | 'Mundo'
    | 'Política'
    | 'Tecnologia'
    | 'Cultura';
  catalogEventId?: string;
  truthStatus?: WorldTruthStatus;
  worldContextNote?: string;
  choices?: {
    id: string;
    text: string;
    effectDescription: string;
  }[];
  chosenOptionId?: string;
  consequence?: string;
}

export interface UserPreferences {
  autoOpenEvents: boolean;
  compactTimeline: boolean;
  confirmRiskyActions: boolean;
}

export interface GameSave {
  id: string;
  schemaVersion?: number;
  createdAt: number;
  updatedAt: number;
  character: Character;
  family: FamilyMember[];
  assets: Asset[];
  events: LifeEvent[];
  history: {
    age: number;
    year: number;
    month?: number;
    summary: string;
    worldSummary?: string;
  }[];
  worldState?: WorldState;
  userPreferences?: UserPreferences;
}
