import { TechnologyDefinition, WorldTechnologyState } from '../types/world';
import { TECHNOLOGY_CATALOG, WorldTechnologyEngine } from './WorldTechnologyEngine';

/**
 * Facade & domain queries for technology adoption, prerequisite trees, obsolescence, and labor-market impact.
 */
export class TechnologyEvolutionEngine {
  static getAllUnlockedDefinitions(state: WorldTechnologyState): TechnologyDefinition[] {
    const set = new Set(state.unlockedTechIds);
    return TECHNOLOGY_CATALOG.filter((t) => set.has(t.id));
  }

  static hasDependenciesMet(state: WorldTechnologyState, techId: string): boolean {
    const def = TECHNOLOGY_CATALOG.find((t) => t.id === techId);
    if (!def) return false;
    const set = new Set(state.unlockedTechIds);
    return def.dependencies.every((d) => set.has(d));
  }

  static getRegionalAdoption(state: WorldTechnologyState, techId: string, region: string): number {
    return state.regionalAdoptionByTech?.[techId]?.[region] ?? state.adoptedTechRates[techId] ?? 0;
  }

  static hasInternet(year: number, state?: WorldTechnologyState): boolean {
    if (year < 1991) return false;
    return state ? WorldTechnologyEngine.isTechnologyUnlocked(state, 'tech_internet') : year >= 1995;
  }

  static hasSmartphones(year: number, state?: WorldTechnologyState): boolean {
    if (year < 2007) return false;
    return state ? WorldTechnologyEngine.isTechnologyUnlocked(state, 'tech_smartphones') : year >= 2007;
  }

  static hasGenerativeAI(year: number, state?: WorldTechnologyState): boolean {
    if (year < 2022) return false;
    return state ? WorldTechnologyEngine.isTechnologyUnlocked(state, 'tech_generative_ai') : year >= 2023;
  }

  static computeProductivityMultiplier(state: WorldTechnologyState): number {
    const bonusSum = this.getAllUnlockedDefinitions(state).reduce(
      (acc, tech) => acc + tech.productivityBonus * ((state.adoptedTechRates[tech.id] || 20) / 100),
      0
    );
    return Number((1 + bonusSum / 100).toFixed(3));
  }
}
