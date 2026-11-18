import { CatalogEventDefinition, GameSave, WorldState } from '../types';
import { CharacterEventRelevanceEngine, EvaluatedEventResult } from './CharacterEventRelevanceEngine';

export interface TimelineSeparationResult {
  personalTimeline: {
    year: number;
    title: string;
    description: string;
    category: string;
    impact: string;
  }[];
  worldTimeline: {
    year: number;
    title: string;
    description: string;
    category: string;
    truthStatus: string;
  }[];
  activeEvents: EvaluatedEventResult[];
}

export class ContextualEventSelectionEngine {
  /**
   * Separate and correlate World Timeline vs Personal Timeline ensuring strict chronological & age coherence
   */
  public static processContextualTimeline(save: GameSave, catalogEvents: CatalogEventDefinition[]): TimelineSeparationResult {
    const currentYear = save.worldState?.clock?.year || 2026;
    const characterAge = save.character.currentAge || 0;
    const birthYear = save.character.birthYear || (currentYear - characterAge);
    const location = save.character.city || 'São Paulo';
    const state = save.character.state || 'São Paulo';

    const context = {
      age: characterAge,
      country: save.character.country || 'Brasil',
      state,
      city: location,
      profession: save.character.careerTitle,
      health: save.character.health || 100,
      money: save.character.money || 10000,
    };

    // 1. Filter world timeline events from worldState historicalLog
    const worldTimeline = (save.worldState?.historicalLog || []).map((h: any) => ({
      year: h.year || currentYear,
      title: h.title || 'Acontecimento Mundial',
      description: h.summary || h.description || '',
      category: h.category || 'História e Geopolítica',
      truthStatus: h.truthStatus || 'HISTORICAL_FACT',
    }));

    // 2. Evaluate catalog events against character context
    const evaluatedEvents = CharacterEventRelevanceEngine.filterEventsForCharacter(catalogEvents, context, 15);

    // 3. Build personal timeline from save history & events
    const personalTimeline = (save.history || []).map((h: any) => ({
      year: h.year || currentYear,
      title: h.title || h.summary || 'Marco Pessoal',
      description: h.description || h.summary || '',
      category: h.category || 'Vida pessoal',
      impact: h.impact || 'Neutro',
    }));

    if (characterAge <= 2 && personalTimeline.length === 0) {
      personalTimeline.push({
        year: birthYear,
        title: 'Nascimento e Primeiros Cuidados',
        description: `Nascimento em ${location}. A família organiza a rotina de cuidados básicos, vacinação e acompanhamento pediátrico.`,
        category: 'Vida pessoal e familiar',
        impact: 'Positivo',
      });
    }

    return {
      personalTimeline,
      worldTimeline,
      activeEvents: evaluatedEvents,
    };
  }

  /**
   * Validate event against chronological and historical constraints
   */
  public static isChronologicallyCoherent(eventYear: number, eventTitle: string, eventDesc: string): boolean {
    const lower = (eventTitle + ' ' + eventDesc).toLowerCase();
    if (lower.includes('regime militar') || lower.includes('ditadura militar')) {
      if (eventYear > 1985) {
        return false;
      }
    }
    return true;
  }
}
