import { GameSave } from '../types';
import { normalizeTruthStatus, WorldState } from '../types/world';
import { resolveBrazilHistoricalPhase, resolveHistoricalEra } from './WorldClockEngine';
import { TECHNOLOGY_CATALOG } from './WorldTechnologyEngine';

export interface ConsistencyReport {
  passed: boolean;
  warnings: string[];
  checkedAtYear: number;
}

export class WorldConsistencyValidator {
  static validateAndSanitize(save: GameSave): ConsistencyReport {
    const warnings: string[] = [];
    const world: WorldState | undefined = save.worldState;
    if (!world) {
      return {
        passed: false,
        warnings: ['WorldState ausente no save.'],
        checkedAtYear: save.character.birthYear + save.character.currentAge,
      };
    }

    const currentYear = world.clock.year;

    // 1. Canonical clock & era/phase sync
    const expectedEra = resolveHistoricalEra(currentYear);
    if (world.clock.era !== expectedEra.id) {
      world.clock.era = expectedEra.id;
      world.clock.eraLabel = expectedEra.label;
      warnings.push(`Era histórica corrigida para ${expectedEra.label}.`);
    }
    const expectedBrPhase = resolveBrazilHistoricalPhase(currentYear);
    if (world.clock.brazilPhase !== expectedBrPhase.id) {
      world.clock.brazilPhase = expectedBrPhase.id;
      world.clock.brazilPhaseLabel = expectedBrPhase.label;
      world.brazil.phase = expectedBrPhase.id;
      world.brazil.phaseLabel = expectedBrPhase.label;
      warnings.push(`Fase do Brasil corrigida para ${expectedBrPhase.label}.`);
    }

    // 2. Prevent future event leaks in historicalLog
    const leakedEvents = world.historicalLog.filter((e) => e.year > currentYear);
    if (leakedEvents.length > 0) {
      world.historicalLog = world.historicalLog.filter((e) => e.year <= currentYear);
      warnings.push(`${leakedEvents.length} evento(s) futuro(s) removidos por coerência temporal.`);
    }

    // 3. Enforce tech chronology & dependency tree integrity
    const unlockedSet = new Set(world.technology.unlockedTechIds);
    const catalogById = new Map(TECHNOLOGY_CATALOG.map((t) => [t.id, t]));
    let removedAnachronistic = 0;

    let changed = true;
    while (changed) {
      changed = false;
      for (const id of Array.from(unlockedSet)) {
        const def = catalogById.get(id);
        if (!def || def.inventionYear > currentYear) {
          unlockedSet.delete(id);
          removedAnachronistic++;
          changed = true;
          continue;
        }
        const depsOk = def.dependencies.every((d) => unlockedSet.has(d));
        if (!depsOk) {
          unlockedSet.delete(id);
          removedAnachronistic++;
          changed = true;
        }
      }
    }
    if (removedAnachronistic > 0) {
      world.technology.unlockedTechIds = Array.from(unlockedSet);
      warnings.push(`${removedAnachronistic} tecnologia(s) anacrônica(s) ou sem pré-requisito removida(s).`);
    }

    // 4. Economic sanity bounds
    if (!Number.isFinite(world.brazil.annualInflationRate) || world.brazil.annualInflationRate < -10) {
      world.brazil.annualInflationRate = 4.0;
      warnings.push('Inflação brasileira normalizada.');
    }
    if (!Number.isFinite(world.economy.globalGdpBillionsUSD) || world.economy.globalGdpBillionsUSD <= 0) {
      world.economy.globalGdpBillionsUSD = 10000;
      warnings.push('PIB global normalizado.');
    }
    if (!Number.isFinite(save.character.money)) {
      save.character.money = 0;
      warnings.push('Saldo do personagem normalizado.');
    }
    if (!Number.isFinite(save.character.salary) || save.character.salary < 0) {
      save.character.salary = 0;
      warnings.push('Salário do personagem normalizado.');
    }

    // 5. Character age synchronization with canonical year
    const expectedAge = Math.max(0, currentYear - save.character.birthYear);
    if (Math.abs(expectedAge - save.character.currentAge) > 1 && save.character.status === 'Vivo') {
      save.character.currentAge = expectedAge;
      save.character.ageMonths = expectedAge * 12 + (world.clock.month - 1);
      warnings.push('Idade do personagem sincronizada com o relógio canônico.');
    }

    // 6. Biological age sanity check on family members
    for (const f of save.family) {
      if ((f.relation === 'Filho' || f.relation === 'Filha') && !f.isAdopted && !f.isStep && f.alive) {
        if (f.age > save.character.currentAge - 12 && save.character.generation === (f.generation ?? 2) - 1) {
          // Flag biological impossibility only when direct child is older/near protagonist
          warnings.push(`Diferença etária incomum detectada com ${f.name}.`);
        }
      }
    }

    // 7. Enforce truthStatus normalization & 2026 historical cutoff
    for (const evt of world.historicalLog) {
      const normalized = normalizeTruthStatus(evt.truthStatus, evt.year);
      if (evt.truthStatus !== normalized) {
        evt.truthStatus = normalized;
        warnings.push(`Evento (${evt.title}) normalizado para ${normalized}.`);
      }
    }
    for (const evt of save.events) {
      evt.truthStatus = normalizeTruthStatus(evt.truthStatus, evt.year);
    }

    const report: ConsistencyReport = {
      passed: warnings.length === 0,
      warnings,
      checkedAtYear: currentYear,
    };
    world.lastConsistencyCheck = report;
    return report;
  }
}
