import {
  CourtCaseRecord,
  GameSave,
  PoliceInvestigationRecord,
  WorldState,
} from '../types';
import { CrimeAndJusticeEngine } from './CrimeAndJusticeEngine';

export interface PersistentLegalRecordEntry {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'Protagonista' | 'NPC' | 'Organização';
  year: number;
  type: 'Investigação' | 'Processo' | 'Julgamento' | 'Sentença' | 'Recurso' | 'Progressão de Regime';
  summary: string;
  status: string;
  severity: number;
}

export class JusticeSimulationEngine {
  /**
   * Initializes or updates persistent legal records across the world state for both protagonist and notable NPCs/orgs.
   */
  static syncPersistentLegalHistory(save: GameSave): PersistentLegalRecordEntry[] {
    const world = save.worldState;
    if (!world) return [];
    if (!world.crimeAndJustice) {
      world.crimeAndJustice = CrimeAndJusticeEngine.createInitialState(world.clock.year);
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

    const entries: PersistentLegalRecordEntry[] = [];
    const currentYear = world.clock.year;

    // Protagonist investigations
    for (const inv of char.justice.activeInvestigations) {
      entries.push({
        id: inv.id,
        entityId: char.id,
        entityName: `${char.firstName} ${char.lastName}`,
        entityType: 'Protagonista',
        year: inv.openedYear,
        type: 'Investigação',
        summary: `Inquérito ${inv.boNumber} (${inv.offenseTitle}) · Força: ${inv.investigatingForce} · Provas: ${inv.evidenceScore}%`,
        status: inv.status,
        severity: inv.severity,
      });
    }

    // Protagonist court cases
    for (const c of char.justice.courtCases) {
      entries.push({
        id: c.id,
        entityId: char.id,
        entityName: `${char.firstName} ${char.lastName}`,
        entityType: 'Protagonista',
        year: c.filedYear,
        type: c.status === 'Condenado' || c.status === 'Absolvido' ? 'Julgamento' : 'Processo',
        summary: `Processo ${c.processNumber} (${c.charge}) · ${c.courtLevel} · Regime: ${c.regime} · Pena: ${c.sentenceYears}a`,
        status: c.status,
        severity: 3,
      });
    }

    // NPC legal simulation tracking
    if (!world.notableNPCs) world.notableNPCs = [];
    for (const npc of world.notableNPCs) {
      if (!npc.alive) continue;
      const npcHash = Math.abs((npc.id + '_' + currentYear).split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7));
      if (npcHash % 19 === 0) {
        entries.push({
          id: `npc_leg_${npc.id}_${currentYear}`,
          entityId: npc.id,
          entityName: npc.name,
          entityType: 'NPC',
          year: currentYear,
          type: 'Investigação',
          summary: `Investigação preliminar de compliance e conduta (${npc.role}) em ${npc.city}.`,
          status: 'Em Análise',
          severity: 2,
        });
      }
    }

    return entries.sort((a, b) => b.year - a.year);
  }

  static getComprehensiveJusticeStatus(save: GameSave): {
    rulesetName: string;
    constitutionalNotes: string;
    nationalCrimeIndex: number;
    prisonOccupancyPct: number;
    activeInvestigationsCount: number;
    activeCasesCount: number;
    persistentHistory: PersistentLegalRecordEntry[];
  } {
    const world = save.worldState!;
    const cj = world.crimeAndJustice || CrimeAndJusticeEngine.createInitialState(world.clock.year);
    const char = save.character;
    const history = this.syncPersistentLegalHistory(save);

    return {
      rulesetName: cj.ruleset.eraLabel,
      constitutionalNotes: cj.ruleset.notes,
      nationalCrimeIndex: cj.nationalCrimeIndex,
      prisonOccupancyPct: cj.prisonOccupancyPct,
      activeInvestigationsCount: char.justice?.activeInvestigations?.length || 0,
      activeCasesCount: char.justice?.courtCases?.length || 0,
      persistentHistory: history,
    };
  }
}
