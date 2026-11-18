import { WorldPoliticsState, WorldState } from '../types/world';
import { WorldGeographyEngine } from './WorldGeographyEngine';

export class WorldPoliticsEngine {
  static createInitialState(year: number): WorldPoliticsState {
    const treaties = ['ONU (Organização das Nações Unidas)'];
    if (year >= 1991) treaties.push('Mercosul');
    if (year >= 1993) treaties.push('União Europeia');
    if (year >= 2009) treaties.push('BRICS');
    if (year >= 2015) treaties.push('Acordo de Paris (Clima)');

    return {
      globalStabilityIndex: year >= 1939 && year <= 1945 ? 25 : year >= 2020 ? 64 : 74,
      multipolarityIndex: year < 1945 ? 65 : year < 1991 ? 45 : year < 2010 ? 40 : 78,
      brazilForeignAlignment:
        year >= 1964 && year <= 1984
          ? 'Alinhamento Ocidental / Pragmatismo Responsável'
          : year >= 2003
            ? 'Multipolaridade e Integração Sul-Americana / BRICS'
            : 'Diplomacia Tradicional Multilateral',
      activeTreaties: year < 1945 ? ['Liga das Nações / Tratados Bilaterais'] : treaties,
      recentPoliticalTransitions: [],
      activeProtestsOrMovements: [],
      citizenParticipationScore: year >= 1988 ? 64 : year >= 1964 && year < 1985 ? 25 : 48,
    };
  }

  static advanceYear(world: WorldState, year: number): void {
    const pol = world.politics;

    for (const c of Object.values(world.countries)) {
      const nextRegime = WorldGeographyEngine.resolveCountryRegime(c.id, year);
      if (nextRegime !== c.regimeType) {
        c.regimeType = nextRegime;
        pol.recentPoliticalTransitions.push({
          year,
          countryId: c.id,
          summary: `${c.name}: transição institucional para ${nextRegime}`,
          truthStatus: year <= 2026 ? 'HISTORICAL_FACT' : 'FUTURE_PROJECTION',
        });
      }
      if (c.id === 'BRA' && year === 1960) {
        c.capital = 'Brasília';
      }
      const stabilityDelta = world.economy.cyclePhase === 'Recessão' ? -0.6 : 0.3;
      c.stabilityIndex = Number(
        Math.max(20, Math.min(96, c.stabilityIndex + stabilityDelta)).toFixed(1)
      );
    }

    if (year === 1991 && !pol.activeTreaties.includes('Mercosul')) {
      pol.activeTreaties.push('Mercosul');
    }
    if (year === 2009 && !pol.activeTreaties.includes('BRICS')) {
      pol.activeTreaties.push('BRICS');
    }
    if (year === 2015 && !pol.activeTreaties.includes('Acordo de Paris (Clima)')) {
      pol.activeTreaties.push('Acordo de Paris (Clima)');
    }

    pol.activeProtestsOrMovements = [];
    if (world.brazil.annualInflationRate > 12 || world.brazil.unemploymentRate > 11.5) {
      pol.activeProtestsOrMovements.push('Mobilizações sociais por custo de vida e emprego');
    }
    if (world.brazil.institutionalTrust < 45 && world.brazil.canVoteDirectly) {
      pol.activeProtestsOrMovements.push('Debates e pressão por reformas políticas');
    }

    const avgCountryStability =
      Object.values(world.countries).reduce((s, c) => s + c.stabilityIndex, 0) /
      Math.max(1, Object.keys(world.countries).length);
    pol.globalStabilityIndex = Math.round(avgCountryStability);
    pol.citizenParticipationScore = Math.max(
      15,
      Math.min(
        98,
        Math.round(
          (pol.citizenParticipationScore ?? 55) * 0.8 +
            (world.brazil.canVoteDirectly ? 68 : 24) * 0.2
        )
      )
    );
    pol.recentPoliticalTransitions = pol.recentPoliticalTransitions.slice(-12);
  }
}
