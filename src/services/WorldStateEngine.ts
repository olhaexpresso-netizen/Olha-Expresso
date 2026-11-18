import { GameSave } from '../types';
import { normalizeTruthStatus, WorldState } from '../types/world';
import { WorldClockEngine, resolveSeasonSouthernHemisphere } from './WorldClockEngine';
import { WorldGeographyEngine } from './WorldGeographyEngine';
import { BrazilHistoricalSimulationEngine } from './BrazilHistoricalSimulationEngine';
import { HistoricalTimelineEngine } from './HistoricalTimelineEngine';
import { WorldEconomyEngine } from './WorldEconomyEngine';
import { WorldTechnologyEngine, normalizeTechnologyCategory } from './WorldTechnologyEngine';
import { WorldPoliticsEngine } from './WorldPoliticsEngine';
import { WorldPopulationEngine } from './WorldPopulationEngine';
import { WorldCultureEngine } from './WorldCultureEngine';
import { WorldEnvironmentEngine } from './WorldEnvironmentEngine';
import { WorldInstitutionEngine } from './WorldInstitutionEngine';
import { GlobalBusinessEvolutionEngine } from './GlobalBusinessEvolutionEngine';
import { WorldConsistencyValidator } from './WorldConsistencyValidator';
import { WorldCausalityEngine } from './WorldCausalityEngine';
import { GlobalEconomicSimulationEngine } from './GlobalEconomicSimulationEngine';
import { CrimeAndJusticeEngine } from './CrimeAndJusticeEngine';
import { GovernanceAndPoliticsEngine } from './GovernanceAndPoliticsEngine';
import { CivilizationSystemsEngine } from './CivilizationSystemsEngine';

export const CURRENT_SAVE_SCHEMA_VERSION = 13;

export class WorldStateEngine {
  static createInitialWorldState(startYear: number, seed: string, protagonistCity = 'São Paulo'): WorldState {
    const clock = WorldClockEngine.createClock(startYear, 1, 1);
    const countries = WorldGeographyEngine.buildCountries(startYear);
    const brazil = BrazilHistoricalSimulationEngine.buildInitialBrazilState(clock, seed);
    const economy = WorldEconomyEngine.createInitialState(startYear);
    const technology = WorldTechnologyEngine.createInitialState(startYear);
    const politics = WorldPoliticsEngine.createInitialState(startYear);
    const population = WorldPopulationEngine.createInitialPopulationState(countries, brazil.population, startYear);
    const culture = WorldCultureEngine.createInitialState(startYear);
    const environment = WorldEnvironmentEngine.createInitialState(startYear);
    const institutions = WorldInstitutionEngine.createInitialState(startYear);
    const companies = GlobalBusinessEvolutionEngine.createInitialCompanies(startYear, technology.brazilTechIndex);
    const baselineHistory = HistoricalTimelineEngine.getHistoricalBaselineUpToYear(startYear);
    const notableNPCs = WorldPopulationEngine.createInitialNotableNPCs(startYear, protagonistCity);
    const causality = WorldCausalityEngine.createInitialMetrics(
      technology.brazilTechIndex,
      brazil.realWageIndex,
      brazil.institutionalTrust,
      startYear
    );
    const activeTreaties = WorldGeographyEngine.getActiveTreaties(startYear);
    const activeConflicts = WorldGeographyEngine.getActiveConflicts(startYear);
    const crimeAndJustice = CrimeAndJusticeEngine.createInitialState(startYear);
    const civilization = CivilizationSystemsEngine.createInitialCivilizationState(startYear);

    const ws: WorldState = {
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      seed,
      startYear,
      clock,
      economy,
      brazil,
      countries,
      technology,
      politics,
      population,
      culture,
      environment,
      institutions,
      companies,
      historicalLog: baselineHistory,
      notableNPCs,
      generationsHistory: [],
      processedPeriodKeys: [],
      causality,
      activeTreaties,
      activeConflicts,
      crimeAndJustice,
      civilization,
      triggeredCatalogEventIds: [],
      pendingChainedCatalogIds: [],
      lastConsistencyCheck: {
        passed: true,
        warnings: [],
        checkedAtYear: startYear,
      },
    };
    ws.governmentAdmin = GovernanceAndPoliticsEngine.createInitialAdminState(ws);
    return ws;
  }

  /**
   * Migrates older v8/v9/v10/v11/v12 GameSaves seamlessly to v13 WorldState without losing character,
   * appearance, family, assets, history, or accumulated world state.
   */
  static ensureSaveMigrated(save: GameSave, skipValidation = false): GameSave {
    const currentYear = (save.character.birthYear || 2000) + (save.character.currentAge || 0);

    if (!save.userPreferences) {
      save.userPreferences = {
        autoOpenEvents: true,
        compactTimeline: false,
        confirmRiskyActions: true,
      };
    }

    if (!save.worldState) {
      save.worldState = this.createInitialWorldState(
        currentYear,
        save.character.appearanceSeed || save.id,
        save.character.city || 'São Paulo'
      );
      save.schemaVersion = CURRENT_SAVE_SCHEMA_VERSION;
    } else if (!save.schemaVersion || save.schemaVersion < CURRENT_SAVE_SCHEMA_VERSION) {
      const ws = save.worldState;

      if (!ws.clock.season) {
        ws.clock.season = resolveSeasonSouthernHemisphere(ws.clock.month || 1);
      }
      if (ws.economy.housingAffordabilityIndex === undefined) ws.economy.housingAffordabilityIndex = 58;
      if (ws.economy.creditInterestSpreadPct === undefined) ws.economy.creditInterestSpreadPct = 12.5;

      const br = ws.brazil as any;
      if (br.minimumWageNominal === undefined && br.minimumWageBRL !== undefined) {
        br.minimumWageNominal = br.minimumWageBRL;
        delete br.minimumWageBRL;
      }
      if (br.exchangeRatePerUSD === undefined && br.exchangeRateBRLPerUSD !== undefined) {
        br.exchangeRatePerUSD = br.exchangeRateBRLPerUSD;
        delete br.exchangeRateBRLPerUSD;
      }
      if (br.currency && br.currency.divisorFromPrevious === undefined) {
        br.currency = BrazilHistoricalSimulationEngine.resolveCurrency(ws.clock.year);
      }
      if (!br.monetaryHistory) br.monetaryHistory = [];
      if (br.publicDebtPctGdp === undefined) br.publicDebtPctGdp = 72;
      if (br.baseTaxRatePct === undefined) br.baseTaxRatePct = br.currentGovernment?.baseTaxRatePct ?? 26;
      if (br.realWageIndex === undefined) br.realWageIndex = 100;
      if (br.povertyRatePct === undefined) br.povertyRatePct = 22;
      if (!br.regionalEvents) br.regionalEvents = [];
      if (br.currentGovernment) {
        br.currentGovernment.truthStatus = normalizeTruthStatus(br.currentGovernment.truthStatus, ws.clock.year);
        if (br.currentGovernment.baseTaxRatePct === undefined) {
          br.currentGovernment.baseTaxRatePct = br.baseTaxRatePct;
        }
      }

      const freshBrazil = BrazilHistoricalSimulationEngine.buildInitialBrazilState(ws.clock, ws.seed || save.id);
      br.states = { ...freshBrazil.states, ...(br.states || {}) };
      br.cities = { ...freshBrazil.cities, ...(br.cities || {}) };

      const freshCountries = WorldGeographyEngine.buildCountries(ws.clock.year);
      ws.countries = { ...freshCountries, ...(ws.countries || {}) };

      if (!ws.technology.regionalAdoptionByTech) {
        ws.technology.regionalAdoptionByTech = WorldTechnologyEngine.createInitialState(ws.clock.year).regionalAdoptionByTech;
      }
      if (Array.isArray(ws.technology.recentBreakthroughs)) {
        ws.technology.recentBreakthroughs = ws.technology.recentBreakthroughs.map((b: any) => ({
          ...b,
          category: normalizeTechnologyCategory(b.category),
          truthStatus: normalizeTruthStatus(b.truthStatus, b.year),
        }));
      }

      if (ws.politics.citizenParticipationScore === undefined) ws.politics.citizenParticipationScore = 62;
      if (!ws.environment.recentDisasters) ws.environment.recentDisasters = [];

      if (Array.isArray(ws.historicalLog)) {
        ws.historicalLog = ws.historicalLog.map((e: any) => ({
          ...e,
          region: e.region || (e.scope === 'global' ? 'Global' : 'Brasil'),
          origin: e.origin || 'historical',
          truthStatus: normalizeTruthStatus(e.truthStatus, e.year),
          consequences: Array.isArray(e.consequences) ? e.consequences : [],
          affectedSystems: Array.isArray(e.affectedSystems) ? e.affectedSystems : ['society'],
          processed: e.processed ?? true,
          idempotencyKey: e.idempotencyKey || `${e.id}_y${e.year}`,
        }));
      }

      if (!ws.causality) {
        ws.causality = WorldCausalityEngine.createInitialMetrics(
          ws.technology.brazilTechIndex || 50,
          ws.brazil.realWageIndex || 100,
          ws.brazil.institutionalTrust || 60,
          ws.clock.year
        );
      }

      if (!ws.activeTreaties) {
        ws.activeTreaties = WorldGeographyEngine.getActiveTreaties(ws.clock.year);
      }
      if (!ws.activeConflicts) {
        ws.activeConflicts = WorldGeographyEngine.getActiveConflicts(ws.clock.year);
      }
      if (!ws.crimeAndJustice) {
        ws.crimeAndJustice = CrimeAndJusticeEngine.createInitialState(ws.clock.year);
      }
      if (!ws.governmentAdmin) {
        ws.governmentAdmin = GovernanceAndPoliticsEngine.createInitialAdminState(ws);
      }
      if (!ws.civilization) {
        ws.civilization = CivilizationSystemsEngine.createInitialCivilizationState(ws.clock.year);
      }
      if (!ws.triggeredCatalogEventIds) ws.triggeredCatalogEventIds = [];
      if (!ws.pendingChainedCatalogIds) ws.pendingChainedCatalogIds = [];

      ws.schemaVersion = CURRENT_SAVE_SCHEMA_VERSION;
      save.schemaVersion = CURRENT_SAVE_SCHEMA_VERSION;
    }

    // Character v12/v13 life simulation fields
    const char = save.character;
    const hasOwnedHome = save.assets.some((a) => a.type === 'Imóvel');
    if (!char.housingStatus) {
      if (hasOwnedHome) {
        char.housingStatus = 'Imóvel próprio';
        char.monthlyRentCentavos = 0;
      } else if (char.currentAge >= 22) {
        char.housingStatus = 'Aluguel';
        char.monthlyRentCentavos = GlobalEconomicSimulationEngine.calculateMonthlyRentCentavos(
          save.worldState,
          char.city
        );
      } else {
        char.housingStatus = 'Mora com pais';
        char.monthlyRentCentavos = 0;
      }
    }
    if (char.isRetired === undefined) char.isRetired = false;
    if (char.pensionCentavos === undefined) char.pensionCentavos = 0;
    if (char.inssContributionYears === undefined) {
      char.inssContributionYears = Math.max(
        0,
        char.careerExperienceYears || (char.currentAge > 20 ? char.currentAge - 20 : 0)
      );
    }
    if (char.mentalHealth === undefined) char.mentalHealth = Math.round((char.happiness + char.emotionalStability) / 2);
    if (!char.religion) char.religion = 'Sem Religião / Secular';
    if (!char.hobbies) char.hobbies = ['Leitura e História'];
    if (!char.passportCountries) char.passportCountries = ['Brasil'];
    if (!char.insurance) char.insurance = { health: false, life: false };
    if (!char.banking) {
      char.banking = {
        bankAccountCentavos: 0,
        savingsCentavos: 0,
        creditScore: 680,
        creditCardDebtCentavos: 0,
        inDefault: char.money < 0,
        bankruptcyCount: 0,
        totalTaxesPaidCentavos: 0,
        loans: [],
      };
    }
    if (!char.politics) {
      char.politics = {
        office: 'Nenhum',
        mandateYearsRemaining: 0,
        approvalRating: 50,
        campaignFundsCentavos: 0,
        termCount: 0,
        impeachmentRisk: 0,
        billsPassed: 0,
      };
    }
    if (!char.justice) {
      char.justice = {
        activeInvestigations: [],
        courtCases: [],
        criminalAffiliation: null,
        prisonRegime: char.criminalRecord.prisonYearsRemaining > 0 ? 'Fechado' : 'Livre',
        prisonGoodBehaviorPoints: 0,
        totalConvictions: char.criminalRecord.arrests || 0,
        totalAcquittals: 0,
      };
    }

    if (!save.worldState.processedPeriodKeys) save.worldState.processedPeriodKeys = [];
    if (!save.worldState.generationsHistory) save.worldState.generationsHistory = [];
    if (!save.worldState.notableNPCs) {
      save.worldState.notableNPCs = WorldPopulationEngine.createInitialNotableNPCs(
        save.worldState.clock.year,
        save.character.city || 'São Paulo'
      );
    }

    if (!skipValidation) {
      WorldConsistencyValidator.validateAndSanitize(save);
    }
    return save;
  }
}
