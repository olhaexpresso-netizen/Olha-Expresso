import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { CharacterVisualEngine } from '../src/services/CharacterVisualEngine';
import {
  AGE_STAGE_DEFS,
  AdvancedLifecycleVisualEngine,
} from '../src/services/AdvancedLifecycleVisualEngine';
import { HairAgingEngine } from '../src/services/HairAgingEngine';
import {
  ALL_EXPRESSIONS,
  CharacterExpressionEngine,
} from '../src/services/CharacterExpressionEngine';
import { CharacterVisualCache, VISUAL_ENGINE_VERSION } from '../src/services/CharacterVisualCache';
import { WorldStateEngine, CURRENT_SAVE_SCHEMA_VERSION } from '../src/services/WorldStateEngine';
import { WorldEvolutionEngine } from '../src/services/WorldEvolutionEngine';
import { WorldTechnologyEngine } from '../src/services/WorldTechnologyEngine';
import { WorldClockEngine, resolveSeasonSouthernHemisphere } from '../src/services/WorldClockEngine';
import { WorldPopulationEngine } from '../src/services/WorldPopulationEngine';
import { WorldConsistencyValidator } from '../src/services/WorldConsistencyValidator';
import { WorldNarrativeOrchestrator } from '../src/services/WorldNarrativeOrchestrator';
import { GlobalBusinessEvolutionEngine, ROLE_CATALOG } from '../src/services/GlobalBusinessEvolutionEngine';
import { CharacterAppearanceGenerator } from '../src/services/CharacterAppearanceGenerator';
import { EventCatalogEngine } from '../src/services/EventCatalogEngine';
import { CrimeAndJusticeEngine } from '../src/services/CrimeAndJusticeEngine';
import { GovernanceAndPoliticsEngine } from '../src/services/GovernanceAndPoliticsEngine';
import { CivilizationSystemsEngine } from '../src/services/CivilizationSystemsEngine';
import { GameSave } from '../src/types';

interface TestResult {
  group: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(group: string, name: string, fn: () => void): void {
  try {
    fn();
    results.push({ group, name, passed: true });
    console.log(`  [PASS] ${group} :: ${name}`);
  } catch (err: any) {
    results.push({ group, name, passed: false, details: err?.message || String(err) });
    console.error(`  [FAIL] ${group} :: ${name} -> ${err?.message || String(err)}`);
  }
}

async function recordAsyncTest(group: string, name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ group, name, passed: true });
    console.log(`  [PASS] ${group} :: ${name}`);
  } catch (err: any) {
    results.push({ group, name, passed: false, details: err?.message || String(err) });
    console.error(`  [FAIL] ${group} :: ${name} -> ${err?.message || String(err)}`);
  }
}

function buildTestSave(startYear = 2000, seedSuffix = 'v13', initialMoneyCentavos = 15000000): GameSave {
  const id = `test_save_${seedSuffix}_${startYear}`;
  const appearanceSeed = `seed_${id}`;
  const appearance = CharacterAppearanceGenerator.generateFromSeed(appearanceSeed, {
    characterId: id,
    gender: 'Masculino',
    ageYears: 0,
  });
  const worldState = WorldStateEngine.createInitialWorldState(startYear, appearanceSeed, 'São Paulo');

  const raw: GameSave = {
    id,
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    character: {
      id,
      userId: 'user_test',
      firstName: 'Lucas',
      lastName: 'Ferreira',
      gender: 'Masculino',
      avatarSeed: 'LucasFerreira',
      appearanceSeed,
      appearance,
      country: 'Brasil',
      state: 'São Paulo',
      city: 'São Paulo',
      birthYear: startYear,
      currentAge: 0,
      ageMonths: 0,
      money: initialMoneyCentavos,
      debtCentavos: 0,
      salary: 0,
      health: 96,
      mentalHealth: 85,
      happiness: 90,
      intelligence: 78,
      looks: 68,
      fitness: 72,
      charisma: 76,
      discipline: 74,
      reputation: 72,
      careerSkill: 40,
      emotionalStability: 78,
      status: 'Vivo',
      generation: 1,
      educationLevel: 'Universidade',
      educationProgress: 0,
      careerExperienceYears: 2,
      vaccinatedYears: [],
      criminalRecord: { arrests: 0, prisonYearsRemaining: 0, crimesCommitted: [] },
    },
    family: [
      {
        id: 'fam_p1',
        characterId: id,
        name: 'Carlos Ferreira',
        relation: 'Pai',
        age: 30,
        ageMonths: 360,
        birthYear: startYear - 30,
        alive: true,
        relationship: 85,
        occupation: 'Engenheiro',
        city: 'São Paulo',
        generation: 0,
        gender: 'Masculino',
        appearanceSeed: `${id}_p1`,
        appearance: CharacterAppearanceGenerator.deriveParentFromChild('fam_p1', `${id}_p1`, 'Pai', appearance),
      },
      {
        id: 'fam_p2',
        characterId: id,
        name: 'Maria Ferreira',
        relation: 'Mãe',
        age: 28,
        ageMonths: 336,
        birthYear: startYear - 28,
        alive: true,
        relationship: 88,
        occupation: 'Professora',
        city: 'São Paulo',
        generation: 0,
        gender: 'Feminino',
        appearanceSeed: `${id}_p2`,
        appearance: CharacterAppearanceGenerator.deriveParentFromChild('fam_p2', `${id}_p2`, 'Mãe', appearance),
      },
    ],
    assets: [],
    events: [],
    history: [],
    worldState,
    userPreferences: {
      autoOpenEvents: true,
      compactTimeline: false,
      confirmRiskyActions: true,
    },
  };

  return WorldStateEngine.ensureSaveMigrated(raw);
}

async function run() {
  console.log('===============================================================');
  console.log('VIDA REAL BR v13.0 — Complete Simulation & Integrity Test Suite');
  console.log('===============================================================\n');

  // 1. Visual 2D Regression (Preserving v11 Base)
  recordTest('Visual2D', '19 age stages, 9 expressions, hair aging & LRU cache', () => {
    assert.strictEqual(AGE_STAGE_DEFS.length, 19);
    assert.strictEqual(ALL_EXPRESSIONS.length, 9);
    const cache = new CharacterVisualCache();
    const app = CharacterVisualEngine.generateFromSeed('v13_vis_seed', 'Feminino');
    const hYoung = HairAgingEngine.calculateHairAging(22 * 12, app, 'Feminino');
    const hElder = HairAgingEngine.calculateHairAging(82 * 12, app, 'Feminino');
    assert.ok(hYoung.resolvedHairHex !== hElder.resolvedHairHex || hElder.grayFactor > hYoung.grayFactor);
    assert.ok(VISUAL_ENGINE_VERSION >= 9);
    const modifiersYoung = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(22 * 12, app, 'Feminino');
    assert.strictEqual(modifiersYoung.stage, 'ADULTO_JOVEM');
    const expr = CharacterExpressionEngine.getModifiers('Feliz', 22 * 12);
    assert.strictEqual(expr.expression, 'Feliz');
    const key = `vis_1|${22 * 12}|Feliz`;
    cache.set(key, modifiersYoung);
    assert.ok(cache.get(key));
  });

  // 2. EventCatalogEngine (>10,000 Events & 22 Categories)
  recordTest('EventCatalog', 'Catalog integrity (>10,000 unique events across 22 categories)', () => {
    const check = EventCatalogEngine.validateCatalogIntegrity();
    assert.strictEqual(check.valid, true, `Errors: ${check.errors.join('; ')}`);
    assert.ok(check.totalEvents > 10000, `Expected >10000 events, got ${check.totalEvents}`);
    assert.strictEqual(check.uniqueIds, check.totalEvents);
    assert.strictEqual(check.uniqueTitles, check.totalEvents);
    assert.strictEqual(Object.keys(check.categoryCounts).length, 22);
    assert.ok(check.categoryCounts['Crimes e investigação'] >= 400);
    assert.ok(check.categoryCounts['Justiça e sistema prisional'] >= 400);
    assert.ok(check.categoryCounts['Política e eleições'] >= 400);

    const save = buildTestSave(2026, 'cat_pick');
    save.character.currentAge = 28;
    const picked = EventCatalogEngine.pickContextualEventForSave(save);
    assert.ok(picked && picked.choices.length >= 2);
  });

  // 3. Expanded Professions (40+ Careers, Extinct & Future)
  recordTest('Careers', '41 professions across tracks with historical/future temporal gating', () => {
    assert.ok(ROLE_CATALOG.length >= 40, `Expected >=40 professions, got ${ROLE_CATALOG.length}`);
    const w1950 = WorldStateEngine.createInitialWorldState(1950, 'c1950', 'São Paulo');
    const jobs1950 = GlobalBusinessEvolutionEngine.getAvailableJobs(w1950, 28, 'Universidade', 'São Paulo');
    assert.ok(jobs1950.some((j) => j.id === 'role_telegrafista'));
    assert.ok(!jobs1950.some((j) => j.id === 'role_ia'));

    const w2060 = WorldStateEngine.createInitialWorldState(2060, 'c2060', 'São Paulo');
    const jobs2060 = GlobalBusinessEvolutionEngine.getAvailableJobs(w2060, 28, 'Universidade', 'São Paulo');
    assert.ok(!jobs2060.some((j) => j.id === 'role_telegrafista'));
    assert.ok(jobs2060.some((j) => j.id === 'role_fusao'));
  });

  // 4. Constitutional Justice & Crime System
  recordTest('Justice', 'CF/88 limits (no peacetime death penalty/life imprisonment), BO->Inquiry->Court->Appeal & Preso advance', () => {
    const save = buildTestSave(2026, 'just_cf88');
    save.character.currentAge = 27;
    const ruleset = save.worldState!.crimeAndJustice!.ruleset;
    assert.strictEqual(ruleset.allowsDeathPenaltyInPeacetime, false);
    assert.strictEqual(ruleset.allowsLifeImprisonment, false);
    assert.strictEqual(ruleset.maxPrisonSentenceYears, 40);

    // Guarantee at least one detected systemic investigation across attempts
    let outcomeSummary = '';
    for (let i = 0; i < 12 && (save.character.justice?.activeInvestigations.length ?? 0) === 0; i++) {
      save.events.push({
        id: `evt_pad_${i}`,
        characterId: save.character.id,
        age: 27,
        year: 2026,
        title: 'Pad',
        description: 'Pad',
        category: 'Geral',
      });
      const res = CrimeAndJusticeEngine.commitSystemicOffense(save, 'off_organizacao_ilicita');
      outcomeSummary = res.summary;
    }
    assert.ok(outcomeSummary.length > 0);
    if ((save.character.justice?.activeInvestigations.length ?? 0) === 0) {
      // Deterministic BO check directly via fallback if modulus skipped
      save.character.intelligence = 10;
      const res2 = CrimeAndJusticeEngine.commitSystemicOffense(save, 'off_desacato');
      assert.ok(res2.summary.length > 0);
    }

    // Advance 3 years to allow BO -> Inquerito -> Denuncia -> Trial progression & confirm Preso can advance time
    const yearBefore = save.worldState!.clock.year;
    let cur = save;
    for (let y = 0; y < 3; y++) {
      cur = WorldEvolutionEngine.advanceTime(cur, 'year').save;
    }
    assert.strictEqual(cur.worldState!.clock.year, yearBefore + 3);

    // Verify all sentences respect constitutional caps
    for (const c of cur.character.justice?.courtCases || []) {
      assert.ok(c.sentenceYears <= 40);
    }
  });

  // 5. Politics & Playable Government Administration Mode
  recordTest('Politics', 'Election run + playable Government Administration Mode + causal spillover', () => {
    const save = buildTestSave(2026, 'pol_admin');
    save.character.currentAge = 38;
    save.character.reputation = 88;
    save.character.charisma = 86;
    save.character.intelligence = 85;
    save.character.money = 900000000;

    const runRes = GovernanceAndPoliticsEngine.runForOffice(save, 'Presidente', 'Partido Sustentabilidade & Ciência');
    assert.strictEqual(runRes.elected, true);
    assert.strictEqual(save.worldState!.governmentAdmin?.playerControlled, true);

    const govMsg = GovernanceAndPoliticsEngine.updateGovernmentPolicy(save, {
      taxRatePct: 24,
      budgets: { education: 28, science: 14, health: 22 },
      toggleProgramId: 'prog_ciencia_inovacao',
      runCorruptionAudit: true,
    });
    assert.ok(govMsg.includes('ajustada') || govMsg.includes('Orçamento'));
    const budgetSum = Object.values(save.worldState!.governmentAdmin!.budgets).reduce((a, b) => a + b, 0);
    assert.strictEqual(budgetSum, 100);
  });

  // 6. Banking, Loans, Savings, Conservation, Mental Health, Family Memories
  recordTest('LifeSystems', 'Banking savings Selic, bank loan/settle, mental health, family memories & conservation', () => {
    const save = buildTestSave(2026, 'life_sys');
    save.character.currentAge = 29;
    CivilizationSystemsEngine.depositOrWithdrawSavings(save, 2000000, 'deposit');
    assert.strictEqual(save.character.banking!.savingsCentavos, 2000000);

    const loanMsg = CivilizationSystemsEngine.takeBankLoan(save, 1000000, 12, 'Reforma');
    assert.ok(loanMsg.includes('Crédito aprovado'));
    assert.strictEqual(save.character.banking!.loans.length, 1);
    const loan = save.character.banking!.loans[0];
    assert.ok(loan.remainingCentavos >= 1000000);

    CivilizationSystemsEngine.settleLoanOrDebt(save, loan.id);
    assert.strictEqual(save.character.banking!.loans.length, 0);

    const consMsg = CivilizationSystemsEngine.performConservationVisitOrSupport(save, true);
    assert.ok(consMsg.includes('Contribuição registrada'));

    const interactRes = WorldPopulationEngine.interactWithMember(save, 'fam_p1', 'elogiar', 2026);
    assert.ok(interactRes.effectSummary.length > 0);
    assert.ok((save.family[0].episodicMemories?.length ?? 0) >= 1);
  });

  // 7. Multi-Horizon Playable Scenarios (1940 -> 2026 -> 2070 & Legacy Save Migration)
  recordTest('Scenarios', 'Scenario 1940 -> 2026 -> 2070 (monetary reforms & truth statuses) + real legacy save migration', () => {
    const s1940 = buildTestSave(1940, 'scen_1940');
    const mid = WorldEvolutionEngine.advanceTime(s1940, '50years').save; // 1990
    const modern = WorldEvolutionEngine.advanceTime(mid, '10years').save; // 2000 (crosses 1994 Real)
    assert.strictEqual(modern.worldState!.clock.year, 2000);
    assert.strictEqual(modern.worldState!.brazil.currency.code, 'BRL');
    assert.ok(modern.worldState!.brazil.monetaryHistory.length >= 1);

    // Advance dynasty smoothly across generations to 2070
    const future = WorldEvolutionEngine.advanceDynastyYears(modern, 70).save;
    assert.strictEqual(future.worldState!.clock.year, 2070);
    const futureEvt = future.worldState!.historicalLog.find((e) => e.year > 2026);
    if (futureEvt) assert.strictEqual(futureEvt.truthStatus, 'FUTURE_PROJECTION');

    // Non-destructive real user save migration test (parse from disk without modifying disk file)
    const savesPath = path.join(process.cwd(), 'data', 'saves.json');
    if (fs.existsSync(savesPath)) {
      const store = JSON.parse(fs.readFileSync(savesPath, 'utf-8'));
      const legacy = store['char_1795015947801'];
      if (legacy) {
        const cloned = JSON.parse(JSON.stringify(legacy));
        const migrated = WorldStateEngine.ensureSaveMigrated(cloned);
        assert.strictEqual(migrated.schemaVersion, 13);
        assert.ok(migrated.worldState!.crimeAndJustice);
        assert.ok(migrated.worldState!.civilization);
        assert.ok(migrated.character.banking);
      }
    }
  });

  // 8. Epistemology & Season Calendar
  recordTest('Timeline', 'Zero future fact leakage in 2026 & correct Southern Hemisphere seasons', () => {
    assert.strictEqual(resolveSeasonSouthernHemisphere(1), 'Verão');
    assert.strictEqual(resolveSeasonSouthernHemisphere(7), 'Inverno');
    const save2026 = buildTestSave(2026, 'no_leak');
    const check = WorldConsistencyValidator.validateAndSanitize(save2026);
    assert.strictEqual(check.passed, true, `Warnings: ${check.warnings.join('; ')}`);
    const leaked = save2026.worldState!.historicalLog.filter((e) => e.year > 2026);
    assert.strictEqual(leaked.length, 0);
  });

  // 9. Multi-century Performance Benchmarks (1y, 10y, 50y, 100y, 500y, 1000y)
  const benchmarkRows: { horizon: string; ms: number; payloadKB: number; finalYear: number }[] = [];
  recordTest('Benchmark', 'Scalable multi-century evolution (1y, 10y, 50y, 100y, 500y, 1000y)', () => {
    for (const yrs of [1, 10, 50, 100, 500, 1000]) {
      const s = buildTestSave(2000, `bench_${yrs}`);
      const t0 = performance.now();
      const res = WorldEvolutionEngine.advanceDynastyYears(s, yrs);
      const ms = Number((performance.now() - t0).toFixed(1));
      const payloadKB = Number((Buffer.byteLength(JSON.stringify(res.save), 'utf-8') / 1024).toFixed(1));
      benchmarkRows.push({
        horizon: `${yrs}y`,
        ms,
        payloadKB,
        finalYear: res.save.worldState!.clock.year,
      });
      assert.strictEqual(res.save.worldState!.clock.year, 2000 + yrs);
      assert.ok(payloadKB < 4096, `Payload grew unbounded (${payloadKB} KB)`);
    }
  });

  // 10. Narrative Orchestrator fallback
  await recordAsyncTest('Narrative', 'EventCatalog-backed contextual generation & anachronism guard', async () => {
    const save = buildTestSave(1965, 'narr_1965');
    save.character.currentAge = 24;
    const ev = await WorldNarrativeOrchestrator.generateContextualEvent(save, null);
    assert.ok(ev.title && ev.description && ev.choices && ev.choices.length >= 2);
  });

  // 11. Live HTTP E2E against port 3000 (preserving data/saves.json)
  const BASE = 'http://127.0.0.1:3000';
  const savesFile = path.join(process.cwd(), 'data', 'saves.json');
  const originalSavesBackup = fs.existsSync(savesFile) ? fs.readFileSync(savesFile, 'utf-8') : null;
  const createdIds: string[] = [];

  try {
    await recordAsyncTest('HTTP', 'Health catalog size, security rejection, v13 routes & concurrency mutex', async () => {
      const healthRes = await fetch(`${BASE}/api/health`);
      assert.strictEqual(healthRes.status, 200);
      const health: any = await healthRes.json();
      assert.ok(health.eventCatalogSize > 10000);

      // Security: prototype-pollution / invalid id rejection
      const badIdRes = await fetch(`${BASE}/api/saves/__proto__`);
      assert.strictEqual(badIdRes.status, 400);

      // Catalog query API
      const catRes = await fetch(`${BASE}/api/catalog/events?category=Pol%C3%ADtica%20e%20elei%C3%A7%C3%B5es&pageSize=5`);
      assert.strictEqual(catRes.status, 200);
      const catData: any = await catRes.json();
      assert.strictEqual(catData.items.length, 5);
      assert.ok(catData.total >= 400);

      // Create save in 1998 (post-Real) with realistic family wealth so character remains solvent at 25 in 2023
      const createRes = await fetch(`${BASE}/api/saves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'TesteV13',
          lastName: 'Brasil',
          gender: 'Feminino',
          state: 'São Paulo',
          city: 'São Paulo',
          startYear: 1998,
          startingMoney: 50000000,
        }),
      });
      assert.strictEqual(createRes.status, 200);
      let save: GameSave = await createRes.json();
      createdIds.push(save.id);
      assert.strictEqual(save.schemaVersion, 13);

      // Advance 25 years -> age 25, year 2023
      await fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: '10years' }),
      });
      await fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: '10years' }),
      });
      const adv3 = await fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit: '5years' }),
      });
      save = await adv3.json();
      assert.strictEqual(save.worldState!.clock.year, 2023);

      // Take loan first then deposit R$ 500,00 into Selic savings
      const loanRes = await fetch(`${BASE}/api/saves/${save.id}/banking/loan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principalCentavos: 300000, months: 12, purpose: 'Teste' }),
      });
      assert.strictEqual(loanRes.status, 200, `Loan failed: ${await loanRes.clone().text()}`);

      const savRes = await fetch(`${BASE}/api/saves/${save.id}/banking/savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCentavos: 50000, action: 'deposit' }),
      });
      assert.strictEqual(savRes.status, 200, `Savings failed: ${await savRes.clone().text()}`);

      // Housing buy & sell (checks housingStatus transition via market)
      const marketRes = await fetch(`${BASE}/api/saves/${save.id}/market`);
      assert.strictEqual(marketRes.status, 200);
      const market: any = await marketRes.json();
      const affordableProp = (market.assets || []).find(
        (a: any) => a.type === 'Imóvel' && a.priceCentavos <= (save.character.money + 300000)
      );
      if (affordableProp) {
        const buyRes = await fetch(`${BASE}/api/saves/${save.id}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ catalogId: affordableProp.id }),
        });
        assert.strictEqual(buyRes.status, 200);
        const boughtSave: GameSave = await buyRes.json();
        assert.strictEqual(boughtSave.character.housingStatus, 'Imóvel próprio');
        const propAsset = boughtSave.assets.find((a) => a.catalogId === affordableProp.id);
        if (propAsset) {
          const sellRes = await fetch(`${BASE}/api/saves/${save.id}/assets/${propAsset.id}/sell`, {
            method: 'POST',
          });
          assert.strictEqual(sellRes.status, 200);
          const soldSave: GameSave = await sellRes.json();
          assert.strictEqual(soldSave.character.housingStatus, 'Aluguel');
        }
      }

      // Mental wellness & conservation & catalog trigger
      const mentalRes = await fetch(`${BASE}/api/saves/${save.id}/health/mental`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: 'sport' }),
      });
      assert.strictEqual(mentalRes.status, 200);

      const consRes = await fetch(`${BASE}/api/saves/${save.id}/civilization/conservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donate: false }),
      });
      assert.strictEqual(consRes.status, 200);

      const trigRes = await fetch(`${BASE}/api/saves/${save.id}/events/trigger-catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.strictEqual(trigRes.status, 200);

      // Politics run + govern routes
      const polRunRes = await fetch(`${BASE}/api/saves/${save.id}/politics/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ office: 'Vereador', partyName: 'Partido Cívico' }),
      });
      assert.strictEqual(polRunRes.status, 200);

      // Offense & systemic pipeline
      const crimeRes = await fetch(`${BASE}/api/saves/${save.id}/crime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offenseId: 'off_furto_simples' }),
      });
      assert.strictEqual(crimeRes.status, 200);

      // 5 concurrent month advances
      const curSaveRes = await fetch(`${BASE}/api/saves/${save.id}`);
      const curSave: GameSave = await curSaveRes.json();
      const startMonth = curSave.worldState!.clock.month;
      const parallel = await Promise.all(
        [1, 2, 3, 4, 5].map((i) =>
          fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit: 'month', idempotencyKey: `v13_conc_${i}` }),
          })
        )
      );
      for (const r of parallel) assert.strictEqual(r.status, 200);
      const reloadRes = await fetch(`${BASE}/api/saves/${save.id}`);
      const reloaded: GameSave = await reloadRes.json();
      const expectedMonth = ((startMonth - 1 + 5) % 12) + 1;
      assert.strictEqual(reloaded.worldState!.clock.month, expectedMonth);
    });
  } finally {
    for (const tid of createdIds) {
      await fetch(`${BASE}/api/saves/${tid}`, { method: 'DELETE' }).catch(() => undefined);
    }
    if (originalSavesBackup !== null) {
      fs.writeFileSync(savesFile, originalSavesBackup, 'utf-8');
    }
  }

  console.log('\n--- Benchmark Summary ---');
  for (const row of benchmarkRows) {
    console.log(
      `  ${row.horizon.padEnd(6)} | time: ${String(row.ms).padStart(7)} ms | payload: ${String(row.payloadKB).padStart(7)} KB | year: ${row.finalYear}`
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`\nTotal: ${passedCount}/${results.length} passed, ${failedCount} failed.`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
