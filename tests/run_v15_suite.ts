import fs from 'fs';
import { EventCatalogEngine } from '../src/services/EventCatalogEngine';
import { CharacterEventRelevanceEngine } from '../src/services/CharacterEventRelevanceEngine';
import { ContextualEventSelectionEngine } from '../src/services/ContextualEventSelectionEngine';
import { GuardianDecisionEngine } from '../src/services/GuardianDecisionEngine';
import { WorldStateEngine } from '../src/services/WorldStateEngine';
import { WorldEvolutionEngine } from '../src/services/WorldEvolutionEngine';

async function runV15Suite() {
  console.log('===================================================================');
  console.log('VIDA REAL BR v15.0 — Contextual Reality & Autonomous Intelligence Suite');
  console.log('===================================================================');

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

  // Scenario 1: Baby in 2001 (Age 1)
  test('Scenario 1 — Baby in 2001 (Strict Age & Chronological Filtering)', () => {
    const seed = 'test_baby_2001';
    const world = WorldStateEngine.createInitialWorldState(2001, seed, 'São Paulo');
    const save: any = {
      id: 'save_baby_2001',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character: {
        id: 'char_baby',
        firstName: 'Lucas',
        lastName: 'Silva',
        gender: 'Masculino',
        country: 'Brasil',
        state: 'São Paulo',
        city: 'São Paulo',
        birthYear: 2000,
        currentAge: 1,
        ageMonths: 12,
        money: 15000,
        health: 100,
        status: 'Vivo',
        criminalRecord: { prisonYearsRemaining: 0 },
      },
      family: [
        { id: 'f1', name: 'Ana Silva', relation: 'Mãe', alive: true, age: 28 },
        { id: 'f2', name: 'Carlos Silva', relation: 'Pai', alive: true, age: 30 },
      ],
      assets: [],
      events: [],
      history: [],
      worldState: world,
    };

    const catalogEvents = EventCatalogEngine.queryEvents({ pageSize: 50 }).items;
    const timelineResult = ContextualEventSelectionEngine.processContextualTimeline(save, catalogEvents);

    // Verify that baby has no forbidden adult/political/financial decision events
    for (const ev of timelineResult.activeEvents) {
      if (ev.isAllowedForAge) {
        const cat = ev.event.category || '';
        if (cat.includes('Política') || cat.includes('Finanças') || cat.includes('Carreiras')) {
          throw new Error(`Baby aged 1 received forbidden category event: ${cat} - ${ev.event.title}`);
        }
      }
    }

    // Verify Guardian Decision Engine generates appropriate childhood decision
    const guardDecision = GuardianDecisionEngine.simulateGuardianDecisionIfNeeded(save);
    if (!guardDecision || (guardDecision.decisionType !== 'SCHOOL_ENROLLMENT' && guardDecision.decisionType !== 'BUDGET_ADJUSTMENT' && guardDecision.decisionType !== 'RESIDENCE_RELOCATION')) {
      throw new Error('GuardianDecisionEngine failed to generate valid guardian decision for baby');
    }
  });

  // Scenario 2: Child in 2010
  test('Scenario 2 — Child in 2010 (School & Family Socialization)', () => {
    const context = {
      age: 8,
      country: 'Brasil',
      state: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      health: 100,
      money: 20000,
    };
    const bracket = CharacterEventRelevanceEngine.getAgeBracket(context.age);
    if (bracket !== 'CHILDHOOD') {
      throw new Error(`Expected CHILDHOOD bracket for age 8, got ${bracket}`);
    }
    const isAllowed = CharacterEventRelevanceEngine.isCategoryAllowedForAge('Política e eleições', context.age);
    if (isAllowed) {
      throw new Error('Political category should be forbidden for 8-year-old child');
    }
  });

  // Scenario 3: Teenager in 2018
  test('Scenario 3 — Teenager in 2018 (Education & Identity)', () => {
    const context = {
      age: 15,
      country: 'Brasil',
      state: 'Minas Gerais',
      city: 'Belo Horizonte',
      health: 100,
      money: 5000,
    };
    const bracket = CharacterEventRelevanceEngine.getAgeBracket(context.age);
    if (bracket !== 'ADOLESCENCE') {
      throw new Error(`Expected ADOLESCENCE bracket for age 15, got ${bracket}`);
    }
  });

  // Scenario 4: Adult in 2026
  test('Scenario 4 — Adult in 2026 (Career, Finances & Full Autonomy)', () => {
    const context = {
      age: 35,
      country: 'Brasil',
      state: 'São Paulo',
      city: 'Campinas',
      profession: 'Engenheiro',
      health: 90,
      money: 120000,
    };
    const bracket = CharacterEventRelevanceEngine.getAgeBracket(context.age);
    if (bracket !== 'ADULT') {
      throw new Error(`Expected ADULT bracket for age 35, got ${bracket}`);
    }
    const isAllowed = CharacterEventRelevanceEngine.isCategoryAllowedForAge('Finanças e patrimônio', context.age);
    if (!isAllowed) {
      throw new Error('Financial category should be allowed for adults');
    }
  });

  // Scenario 5: Elderly
  test('Scenario 5 — Elderly (Retirement & Legacy)', () => {
    const context = {
      age: 72,
      country: 'Brasil',
      state: 'Rio Grande do Sul',
      city: 'Porto Alegre',
      health: 65,
      money: 450000,
    };
    const bracket = CharacterEventRelevanceEngine.getAgeBracket(context.age);
    if (bracket !== 'ELDERLY') {
      throw new Error(`Expected ELDERLY bracket for age 72, got ${bracket}`);
    }
  });

  // Scenario 6: Independent World Evolution
  test('Scenario 6 — Independent World Evolution', () => {
    const seed = 'test_world_evo';
    const world = WorldStateEngine.createInitialWorldState(2020, seed, 'Brasília');
    const save: any = {
      id: 'save_world_evo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character: { id: 'c1', firstName: 'Test', lastName: 'Evo', currentAge: 25, birthYear: 1995, status: 'Vivo', money: 10000, health: 100, criminalRecord: { prisonYearsRemaining: 0 } },
      family: [],
      assets: [],
      events: [],
      history: [],
      worldState: world,
    };
    const outcome = WorldEvolutionEngine.advanceTime(save, 'year');
    const advYear = outcome.save.worldState?.clock?.year;
    if (advYear !== 2021) {
      throw new Error(`Expected world clock year to advance to 2021, got ${advYear}`);
    }
  });

  // Scenario 7: Persistence and Chronology Validation
  test('Scenario 7 — Chronological Coherence Check (Anachronisms)', () => {
    const isValid1 = ContextualEventSelectionEngine.isChronologicallyCoherent(1970, 'Regime Militar', 'Governo militar no Brasil');
    const isValid2 = ContextualEventSelectionEngine.isChronologicallyCoherent(1995, 'Regime Militar', 'Governo militar no Brasil');
    if (!isValid1) throw new Error('1970 military regime should be valid');
    if (isValid2) throw new Error('1995 military regime should be invalid (anachronism)');
  });

  console.log('===================================================================');
  console.log(`Test Summary: Passed = ${passed}, Failed = ${failed}`);
  console.log('===================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runV15Suite().catch((err) => {
  console.error('Fatal test suite error:', err);
  process.exit(1);
});
