import fs from 'fs';
import { EventCatalogEngine } from '../src/services/EventCatalogEngine';
import { EventSemanticDeduplicationEngine } from '../src/services/EventSemanticDeduplicationEngine';
import { JusticeSimulationEngine } from '../src/services/JusticeSimulationEngine';
import { GameSaveCompressor } from '../src/services/GameSaveCompressor';
import { WorldStateEngine } from '../src/services/WorldStateEngine';
import { WorldEvolutionEngine } from '../src/services/WorldEvolutionEngine';

async function runV14Suite() {
  console.log('===============================================================');
  console.log('VIDA REAL BR v14.0 — Omniscient AI & Simulation Integrity Suite');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  [FAIL] ${name} ->`, err?.message || err);
      failed++;
    }
  }

  // 1. EventCatalog Audit & Deduplication Engine
  test('EventCatalog & SemanticDeduplication', () => {
    const rawEvents = EventCatalogEngine.queryEvents({ pageSize: 100 }).items;
    const { report, deduplicatedEvents } = EventSemanticDeduplicationEngine.auditAndDeduplicate(rawEvents);
    if (report.originalCount <= 0 || deduplicatedEvents.length === 0) {
      throw new Error('Catalog deduplication produced empty output');
    }
    console.log(`    -> Catalog audited: ${report.originalCount} original, ${report.trulyUniqueRecords} unique preserved.`);
  });

  // 2. JusticeSimulationEngine
  test('JusticeSimulationEngine & Persistent Legal Tracking', () => {
    const seed = 'test_justice_14';
    const save = WorldStateEngine.createInitialWorldState(2000, seed, 'São Paulo');
    const mockSave = {
      id: 'save_test_14',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character: {
        id: 'char_test',
        firstName: 'Test',
        lastName: 'Character',
        currentAge: 30,
        status: 'Vivo',
        money: 1000000,
        justice: {
          activeInvestigations: [
            {
              id: 'inv_test_1',
              boNumber: 'BO-2000-999',
              offenseTitle: 'Subtração Patrimonial Oportunista',
              category: 'Patrimônio',
              severity: 2,
              status: 'Inquerito_Em_Curso',
              evidenceScore: 50,
              openedYear: 2000,
              prescribesAtYear: 2020,
              investigatingForce: 'PC',
            },
          ],
          courtCases: [],
          criminalAffiliation: null,
          prisonRegime: 'Livre',
          prisonGoodBehaviorPoints: 0,
          totalConvictions: 0,
          totalAcquittals: 0,
        },
      },
      family: [],
      assets: [],
      events: [],
      history: [],
      worldState: save,
    };

    const legalHistory = JusticeSimulationEngine.syncPersistentLegalHistory(mockSave as any);
    if (!Array.isArray(legalHistory) || legalHistory.length === 0) {
      throw new Error('JusticeSimulationEngine failed to generate persistent legal entries');
    }
    const status = JusticeSimulationEngine.getComprehensiveJusticeStatus(mockSave as any);
    if (!status.rulesetName || status.activeInvestigationsCount !== 1) {
      throw new Error('Comprehensive justice status failed validation');
    }
  });

  // 3. GameSaveCompressor
  test('GameSaveCompressor Incremental Compression', () => {
    const seed = 'test_comp_14';
    const save = WorldStateEngine.createInitialWorldState(2000, seed, 'Campinas');
    const mockSave = {
      id: 'save_comp',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character: { id: 'c1', firstName: 'Comp', lastName: 'Test', currentAge: 40, status: 'Vivo' },
      family: [
        {
          id: 'f1',
          name: 'Fam 1',
          relation: 'Pai',
          alive: true,
          episodicMemories: Array.from({ length: 25 }, (_, i) => ({
            id: `m_${i}`,
            year: 1980 + i,
            summary: `Memory ${i}`,
            sentiment: 'positivo',
            impactLevel: 3,
          })),
        },
      ],
      assets: [],
      events: Array.from({ length: 250 }, (_, i) => ({ id: `e_${i}`, title: `Ev ${i}` })),
      history: Array.from({ length: 450 }, (_, i) => ({ year: 1960 + i, summary: `Hist ${i}` })),
      worldState: save,
    };

    const compressed = GameSaveCompressor.compress(mockSave as any);
    if (compressed.events.length > 180 || compressed.history.length > 300) {
      throw new Error(`Compression limits exceeded: events=${compressed.events.length}, history=${compressed.history.length}`);
    }
  });

  // 4. Multi-Century Benchmark
  test('Multi-Century Benchmark (100y & 500y)', () => {
    const seed = 'test_bench_14';
    const save = WorldStateEngine.createInitialWorldState(1940, seed, 'Rio de Janeiro');
    const fullSave = {
      id: 'save_bench',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character: {
        id: 'char_bench',
        firstName: 'Pedro',
        lastName: 'Alves',
        gender: 'Masculino' as const,
        country: 'Brasil',
        state: 'Rio de Janeiro',
        city: 'Rio de Janeiro',
        birthYear: 1940,
        currentAge: 0,
        ageMonths: 0,
        money: 1000000,
        salary: 0,
        health: 100,
        happiness: 90,
        intelligence: 50,
        looks: 60,
        fitness: 70,
        charisma: 50,
        discipline: 50,
        reputation: 50,
        careerSkill: 0,
        emotionalStability: 70,
        status: 'Vivo' as const,
        generation: 1,
        educationLevel: 'Nenhum' as const,
        educationProgress: 0,
        careerExperienceYears: 0,
        vaccinatedYears: [],
        criminalRecord: { arrests: 0, prisonYearsRemaining: 0, crimesCommitted: [] },
      },
      family: [],
      assets: [],
      events: [],
      history: [],
      worldState: save,
    };

    const t0 = Date.now();
    const outcome100 = WorldEvolutionEngine.advanceDynastyYears(fullSave as any, 100);
    const dt100 = Date.now() - t0;
    console.log(`    -> 100-year evolution took ${dt100} ms. Final year: ${outcome100.save.worldState?.clock.year}`);

    const t1 = Date.now();
    const outcome500 = WorldEvolutionEngine.advanceDynastyYears(outcome100.save, 400);
    const dt500 = Date.now() - t1;
    console.log(`    -> Additional 400y evolution (500y total) took ${dt500} ms. Final year: ${outcome500.save.worldState?.clock.year}`);
  });

  console.log('---------------------------------------------------------------');
  console.log(`Result: ${passed} passed, ${failed} failed.`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runV14Suite();
