import { CatalogEventDefinition, GameSave, LifeEvent } from '../types';

export type EventParticipationType =
  | 'PARTICIPANT'
  | 'WITNESS'
  | 'AFFECTED'
  | 'FAMILY_IMPACT'
  | 'COMMUNITY_IMPACT'
  | 'REGIONAL_IMPACT'
  | 'NATIONAL_IMPACT'
  | 'GLOBAL_IMPACT'
  | 'HISTORICAL_CONTEXT';

export type DecisionModality =
  | 'INFORMATIVE'
  | 'OBSERVACIONAL'
  | 'INDIRETO'
  | 'INTERATIVO';

export type AgeBracketId =
  | 'BABY' // 0-2
  | 'EARLY_CHILDHOOD' // 3-5
  | 'CHILDHOOD' // 6-11
  | 'ADOLESCENCE' // 12-17
  | 'ADULT' // 18-59
  | 'ELDERLY'; // 60+

export interface CharacterContext {
  age: number;
  country: string;
  state: string;
  city: string;
  profession?: string;
  health: number;
  money: number;
  educationLevel?: string;
  criminalRecord?: boolean;
}

export interface EvaluatedEventResult {
  event: CatalogEventDefinition;
  participation: EventParticipationType;
  modality: DecisionModality;
  relevanceScore: number; // 0 to 100
  isAllowedForAge: boolean;
  reasoning: string;
}

export class CharacterEventRelevanceEngine {
  /**
   * Determine age bracket of character
   */
  public static getAgeBracket(age: number): AgeBracketId {
    if (age <= 2) return 'BABY';
    if (age <= 5) return 'EARLY_CHILDHOOD';
    if (age <= 11) return 'CHILDHOOD';
    if (age <= 17) return 'ADOLESCENCE';
    if (age <= 59) return 'ADULT';
    return 'ELDERLY';
  }

  /**
   * Check if category/subject is forbidden or allowed for a given age bracket
   */
  public static isCategoryAllowedForAge(category: string, age: number): boolean {
    const bracket = this.getAgeBracket(age);
    const catLower = (category || '').toLowerCase();

    const isBabyOrChild = bracket === 'BABY' || bracket === 'EARLY_CHILDHOOD' || bracket === 'CHILDHOOD';

    if (isBabyOrChild) {
      if (
        catLower.includes('política') ||
        catLower.includes('eleições') ||
        catLower.includes('crime') ||
        catLower.includes('facções') ||
        catLower.includes('empresas') ||
        catLower.includes('negócios')
      ) {
        return false;
      }
    }

    if (bracket === 'BABY') {
      if (
        catLower.includes('carreiras') ||
        catLower.includes('trabalho') ||
        catLower.includes('finanças') ||
        catLower.includes('patrimônio') ||
        catLower.includes('justiça')
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Determine Decision Modality based on age and event type
   */
  public static determineModality(age: number, category: string, participation: EventParticipationType): DecisionModality {
    const bracket = this.getAgeBracket(age);

    if (bracket === 'BABY' || bracket === 'EARLY_CHILDHOOD') {
      if (participation === 'GLOBAL_IMPACT' || participation === 'HISTORICAL_CONTEXT' || participation === 'NATIONAL_IMPACT') {
        return 'INFORMATIVE';
      }
      if (participation === 'REGIONAL_IMPACT' || participation === 'COMMUNITY_IMPACT') {
        return 'OBSERVACIONAL';
      }
      return 'INDIRETO'; // Handled by guardian
    }

    if (bracket === 'CHILDHOOD') {
      if (participation === 'GLOBAL_IMPACT' || participation === 'HISTORICAL_CONTEXT') {
        return 'INFORMATIVE';
      }
      if (participation === 'NATIONAL_IMPACT' || participation === 'REGIONAL_IMPACT') {
        return 'OBSERVACIONAL';
      }
      if (category.includes('Educação') || category.includes('família')) {
        return 'INTERATIVO';
      }
      return 'INDIRETO';
    }

    if (bracket === 'ADOLESCENCE') {
      if (category.includes('Política') || category.includes('Finanças')) {
        return 'OBSERVACIONAL';
      }
      return 'INTERATIVO';
    }

    // Adult and Elderly
    if (['GLOBAL_IMPACT', 'HISTORICAL_CONTEXT'].includes(participation)) {
      return 'INFORMATIVE';
    }
    return 'INTERATIVO';
  }

  /**
   * Evaluate relevance and participation of a catalog event for a character context
   */
  public static evaluateEvent(event: CatalogEventDefinition, context: CharacterContext): EvaluatedEventResult {
    const bracket = this.getAgeBracket(context.age);
    const category = event.category || 'Vida pessoal e familiar';
    const isAllowed = this.isCategoryAllowedForAge(category, context.age);

    let participation: EventParticipationType = 'AFFECTED';
    let relevanceScore = 50;

    if (event.countryScope === 'GLOBAL') {
      participation = 'GLOBAL_IMPACT';
      relevanceScore = 15;
    } else if (category.includes('Política') || category.includes('História') || category.includes('Governo')) {
      participation = context.age >= 16 ? 'NATIONAL_IMPACT' : 'HISTORICAL_CONTEXT';
      relevanceScore = context.age >= 16 ? 40 : 10;
    } else if (category.includes('Família') || category.includes('pessoal')) {
      participation = 'FAMILY_IMPACT';
      relevanceScore = 90;
    } else if (category.includes('Educação') && bracket === 'CHILDHOOD') {
      participation = 'PARTICIPANT';
      relevanceScore = 95;
    } else {
      participation = 'AFFECTED';
      relevanceScore = 60;
    }

    if (bracket === 'BABY' && (category.includes('Política') || category.includes('Governo') || category.includes('Regime') || category.includes('Geopolítica'))) {
      relevanceScore = 1;
      participation = 'HISTORICAL_CONTEXT';
    }

    const modality = this.determineModality(context.age, category, participation);
    const reasoning = `Avaliando evento para idade ${context.age} (${bracket}): categoria '${category}' com participação '${participation}' e modalidade '${modality}'.`;

    return {
      event,
      participation,
      modality,
      relevanceScore,
      isAllowedForAge: isAllowed && relevanceScore > 10,
      reasoning,
    };
  }

  /**
   * Filter and rank events from catalog for character context
   */
  public static filterEventsForCharacter(events: CatalogEventDefinition[], context: CharacterContext, maxResults: number = 20): EvaluatedEventResult[] {
    const evaluated = events.map((ev) => this.evaluateEvent(ev, context));
    const valid = evaluated.filter((item) => item.isAllowedForAge);
    valid.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return valid.slice(0, maxResults);
  }
}
