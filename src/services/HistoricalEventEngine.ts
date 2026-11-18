import { HistoricalEventRecord, WorldState } from '../types/world';
import { HistoricalTimelineEngine } from './HistoricalTimelineEngine';

export interface ProcessedHistoricalEventsResult {
  triggeredEvents: HistoricalEventRecord[];
  playerHappinessDelta: number;
  playerHealthDelta: number;
}

export class HistoricalEventEngine {
  static processYearEvents(worldState: WorldState, year: number): ProcessedHistoricalEventsResult {
    const existingIds = new Set(worldState.historicalLog.map((e) => e.id));
    const catalogEvents = HistoricalTimelineEngine.getEventsForExactYear(year);
    const projected = HistoricalTimelineEngine.generateProjectedYearEventIfDue(
      year,
      worldState.seed
    );

    const candidates = [...catalogEvents, ...(projected ? [projected] : [])].filter(
      (evt) => !existingIds.has(evt.id) && evt.year <= year
    );

    let playerHappinessDelta = 0;
    let playerHealthDelta = 0;

    for (const evt of candidates) {
      const imp = evt.impact;
      if (imp.globalGdpDeltaPct) {
        worldState.economy.globalGdpGrowthRate = Number(
          (worldState.economy.globalGdpGrowthRate + imp.globalGdpDeltaPct).toFixed(2)
        );
      }
      if (imp.brazilGdpDeltaPct) {
        worldState.brazil.gdpGrowthRate = Number(
          (worldState.brazil.gdpGrowthRate + imp.brazilGdpDeltaPct).toFixed(2)
        );
      }
      if (imp.globalInflationDelta) {
        worldState.economy.globalInflationRate = Math.max(
          0.2,
          Number((worldState.economy.globalInflationRate + imp.globalInflationDelta).toFixed(2))
        );
      }
      if (imp.brazilInflationDelta) {
        worldState.brazil.annualInflationRate = Math.max(
          0.5,
          Number((worldState.brazil.annualInflationRate + imp.brazilInflationDelta).toFixed(2))
        );
      }
      if (imp.unemploymentDelta) {
        worldState.brazil.unemploymentRate = Math.max(
          2.5,
          Math.min(28, Number((worldState.brazil.unemploymentRate + imp.unemploymentDelta).toFixed(1)))
        );
        worldState.economy.globalUnemploymentRate = Math.max(
          2.0,
          Math.min(25, Number((worldState.economy.globalUnemploymentRate + imp.unemploymentDelta * 0.7).toFixed(1)))
        );
      }
      if (imp.selicDelta) {
        worldState.brazil.selicRate = Math.max(
          2.0,
          Number((worldState.brazil.selicRate + imp.selicDelta).toFixed(2))
        );
      }
      if (imp.trustInInstitutionsDelta) {
        worldState.brazil.institutionalTrust = Math.max(
          5,
          Math.min(95, worldState.brazil.institutionalTrust + imp.trustInInstitutionsDelta)
        );
      }
      if (imp.urbanizationDelta) {
        worldState.brazil.urbanizationRate = Math.min(
          96,
          Number((worldState.brazil.urbanizationRate + imp.urbanizationDelta).toFixed(1))
        );
      }
      if (imp.playerCostOfLivingMultiplierDelta) {
        worldState.economy.costOfLivingMultiplier = Math.max(
          0.3,
          Number((worldState.economy.costOfLivingMultiplier + imp.playerCostOfLivingMultiplierDelta).toFixed(3))
        );
      }
      if (imp.playerHappinessDelta) playerHappinessDelta += imp.playerHappinessDelta;
      if (imp.playerHealthDelta) playerHealthDelta += imp.playerHealthDelta;

      worldState.historicalLog.push({
        ...evt,
        processed: true,
        occurredAtTick: worldState.clock.tickCount,
      });
    }

    if (worldState.historicalLog.length > 260) {
      const realFacts = worldState.historicalLog.filter((e) => e.truthStatus === 'HISTORICAL_FACT');
      const others = worldState.historicalLog.filter((e) => e.truthStatus !== 'HISTORICAL_FACT').slice(-120);
      worldState.historicalLog = [...realFacts, ...others].sort((a, b) => a.year - b.year);
    }

    return {
      triggeredEvents: candidates,
      playerHappinessDelta,
      playerHealthDelta,
    };
  }
}
