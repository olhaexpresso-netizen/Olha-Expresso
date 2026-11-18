import { WorldState } from '../types/world';
import { WorldPopulationEngine } from './WorldPopulationEngine';

/**
 * Facade complementing WorldPopulationEngine with country-level demographic summaries and Tier 1 NPC counts.
 */
export class GlobalPopulationEngine {
  static stepYear(world: WorldState, year: number): void {
    WorldPopulationEngine.advanceMacroPopulationYear(world, year);
  }

  static getTopCountriesByPopulation(world: WorldState, limit = 8) {
    return Object.values(world.countries)
      .sort((a, b) => b.population - a.population)
      .slice(0, limit);
  }
}
