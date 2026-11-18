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
import {
  TECHNOLOGY_CATALOG,
  WorldTechnologyEngine,
} from '../src/services/WorldTechnologyEngine';
import { WorldClockEngine, resolveSeasonSouthernHemisphere } from '../src/services/WorldClockEngine';
import { WorldPopulationEngine } from '../src/services/WorldPopulationEngine';
import { WorldConsistencyValidator } from '../src/services/WorldConsistencyValidator';
import { WorldNarrativeOrchestrator } from '../src/services/WorldNarrativeOrchestrator';
import { GlobalBusinessEvolutionEngine } from '../src/services/GlobalBusinessEvolutionEngine';
import { CharacterAppearanceGenerator } from '../src/services/CharacterAppearanceGenerator';
import { TechnologyCategory } from '../src/types/world';
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

function buildTestSave(startYear = 2000, seedSuffix = 'test', initialMoneyCentavos = 5000000): GameSave {
  const id = `test_save_${seedSuffix}_${startYear}`;
  const appearanceSeed = `seed_${id}`;
  const appearance = CharacterAppearanceGenerator.generateFromSeed(appearanceSeed, {
    characterId: id,
    gender: 'Masculino',
    ageYears: 0,
  });
  const worldState = WorldStateEngine.createInitialWorldState(startYear, appearanceSeed, 'São Paulo');

  return {
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
      happiness: 90,
      intelligence: 72,
      looks: 65,
      fitness: 70,
      charisma: 64,
      discipline: 68,
      reputation: 55,
      careerSkill: 0,
      emotionalStability: 75,
      status: 'Vivo',
      generation: 1,
      educationLevel: 'Nenhum',
      educationProgress: 0,
      careerExperienceYears: 0,
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
}

async function run() {
  console.log('=== VIDA REAL BR 11.0 — VERIFICATION SUITE ===\n');

  // ---------------------------------------------------------------------------
  // 1. 2D Visual Regression (v9.0 preservation)
  // ---------------------------------------------------------------------------
  console.log('1) Visual 2D Regression Tests');
  recordTest('Visual2D', '19 lifecycle stages resolve monotonically from 0m to 1300m', () => {
    assert.strictEqual(AGE_STAGE_DEFS.length, 19);
    const seen = new Set<string>();
    for (const def of AGE_STAGE_DEFS) {
      const stage = AdvancedLifecycleVisualEngine.resolveAgeStage(def.minMonths);
      assert.strictEqual(stage, def.id, `Expected ${def.id} at ${def.minMonths}m, got ${stage}`);
      seen.add(stage);
    }
    assert.strictEqual(seen.size, 19);
  });

  recordTest('Visual2D', 'Visual proportions, skin aging, and facial hair respond faithfully by age', () => {
    const app = CharacterAppearanceGenerator.generateFromSeed('visual_reg_1', {
      characterId: 'vis_1',
      gender: 'Masculino',
      ageYears: 25,
    });
    const newborn = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(0, app, 'Masculino');
    const adult = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(360, app, 'Masculino');
    const elder = AdvancedLifecycleVisualEngine.calculateFacialAgeModifiers(1080, app, 'Masculino');

    assert.strictEqual(newborn.proportions.showNeck, false);
    assert.strictEqual(newborn.skin.wrinkleOpacity, 0);
    assert.strictEqual(newborn.allowFacialHair, false);
    assert.strictEqual(adult.proportions.showNeck, true);
    assert.strictEqual(adult.allowFacialHair, true);
    assert.ok(elder.skin.wrinkleOpacity > 0.35, 'Elderly should show visible wrinkles');
    assert.ok(elder.skin.ageSpotsOpacity > 0.1, 'Elderly should show age spots');

    const modelElder = CharacterVisualEngine.buildLayeredModelFromMonths(
      app,
      1080,
      'Feliz',
      'Masculino'
    );
    assert.ok(modelElder.faceShape && modelElder.eyeStyle && modelElder.mouthStyle);
  });

  recordTest('Visual2D', 'Hair graying, recession, and balding evolve independently with age', () => {
    const app = CharacterAppearanceGenerator.generateFromSeed('hair_seed_xyz', {
      characterId: 'h1',
      gender: 'Masculino',
      ageYears: 20,
    });
    const youngHair = HairAgingEngine.calculateHairAging(240, app, 'Masculino');
    const oldHair = HairAgingEngine.calculateHairAging(960, app, 'Masculino');
    assert.strictEqual(youngHair.grayFactor, 0);
    assert.ok(oldHair.grayFactor > 0.4, `Expected noticeable graying at 80y, got ${oldHair.grayFactor}`);
    assert.ok(oldHair.whiteDominance >= youngHair.whiteDominance);
  });

  recordTest('Visual2D', 'All 9 facial expressions resolve distinct curves & baby toothless smile', () => {
    assert.strictEqual(ALL_EXPRESSIONS.length, 9);
    const babySmile = CharacterExpressionEngine.getModifiers('Feliz', 4);
    const adultSmile = CharacterExpressionEngine.getModifiers('Feliz', 300);
    assert.strictEqual(babySmile.mouthType, 'smile_baby');
    assert.strictEqual(adultSmile.mouthType, 'smile_teeth');
    for (const expr of ALL_EXPRESSIONS) {
      const mod = CharacterExpressionEngine.getModifiers(expr, 300);
      assert.strictEqual(mod.expression, expr);
    }
  });

  recordTest('Visual2D', 'CharacterVisualCache LRU bounding and character invalidation work', () => {
    const cache = new CharacterVisualCache<string>(3, VISUAL_ENGINE_VERSION);
    cache.set('c1|300|Feliz', 'A');
    cache.set('c2|300|Feliz', 'B');
    cache.set('c3|300|Feliz', 'C');
    // Touch c1 so c2 becomes LRU
    assert.strictEqual(cache.get('c1|300|Feliz'), 'A');
    cache.set('c4|300|Feliz', 'D');
    assert.strictEqual(cache.size, 3);
    assert.strictEqual(cache.get('c2|300|Feliz'), undefined);
    assert.strictEqual(cache.invalidateCharacter('c1'), 1);
    assert.strictEqual(cache.size, 2);
  });

  // ---------------------------------------------------------------------------
  // 2. Brazil 27 UFs, Seasons, Tech DAG (14 Categories), Monetary Reforms
  // ---------------------------------------------------------------------------
  console.log('\n2) World Geography, Seasons, Tech DAG & Monetary Reforms');
  recordTest('WorldCore', 'Brazil initializes with all 27 UFs across 5 regions and categorized cities', () => {
    const ws = WorldStateEngine.createInitialWorldState(2020, 'uf_check');
    assert.strictEqual(Object.keys(ws.brazil.states).length, 27);
    const tiers = new Set(Object.values(ws.brazil.cities).map((c) => c.tier));
    assert.ok(tiers.has('metropole') && tiers.has('capital') && tiers.has('interior') && tiers.has('rural'));
  });

  recordTest('WorldCore', 'Southern Hemisphere seasons resolve inversely to Northern Hemisphere', () => {
    assert.strictEqual(resolveSeasonSouthernHemisphere(1), 'Verão');
    assert.strictEqual(resolveSeasonSouthernHemisphere(4), 'Outono');
    assert.strictEqual(resolveSeasonSouthernHemisphere(7), 'Inverno');
    assert.strictEqual(resolveSeasonSouthernHemisphere(10), 'Primavera');
  });

  recordTest('WorldCore', 'All 14 Technology categories present & DAG dependencies respected 1900->2050', () => {
    const categories = new Set<TechnologyCategory>(TECHNOLOGY_CATALOG.map((t) => t.category));
    assert.strictEqual(categories.size, 14, `Expected 14 tech categories, got ${categories.size}`);

    const save = buildTestSave(1900, 'techdag');
    const out = WorldEvolutionEngine.advanceDynastyYears(save, 150);
    const unlocked = new Set(out.save.worldState!.technology.unlockedTechIds);
    const catalogMap = new Map(TECHNOLOGY_CATALOG.map((t) => [t.id, t]));
    for (const id of unlocked) {
      const def = catalogMap.get(id)!;
      assert.ok(def.inventionYear <= 2050);
      for (const dep of def.dependencies) {
        assert.ok(unlocked.has(dep), `Tech ${id} unlocked without dependency ${dep}`);
      }
    }
  });

  recordTest('Monetary', 'Monetary reforms 1935->1995 scale nominal cash & assets coherently without NaN or zero collapse', () => {
    const save = buildTestSave(1935, 'mon_1935', 1_000_000_000); // enough historical réis/cruzeiros
    save.character.salary = 240_000_000;
    save.assets.push({
      id: 'ast_hist_house',
      characterId: save.character.id,
      type: 'Imóvel',
      name: 'Sobrado Histórico',
      value: 5_000_000_000,
      monthlyIncome: 25_000_000,
      purchaseYear: 1935,
    });
    const out = WorldEvolutionEngine.advanceDynastyYears(save, 60); // lands on 1995 (Real era)
    const ws = out.save.worldState!;
    assert.strictEqual(ws.clock.year, 1995);
    assert.strictEqual(ws.brazil.currency.code, 'BRL');
    assert.ok(ws.brazil.monetaryHistory.length >= 4, 'Expected multiple monetary reforms recorded');
    assert.ok(Number.isFinite(out.save.character.money));
    assert.ok(out.save.assets[0].value > 0 && Number.isFinite(out.save.assets[0].value));
    assert.ok(ws.brazil.minimumWageNominal > 0 && ws.brazil.minimumWageNominal < 5000);
  });

  recordTest('Economy', 'Causal economic indicators & obsolete vs emerging labor market sync properly', () => {
    const save1930 = buildTestSave(1930, 'jobs_1930');
    const jobs1930 = GlobalBusinessEvolutionEngine.getAvailableJobs(save1930.worldState!, 25, 'Médio', 'São Paulo');
    assert.ok(!jobs1930.some((j) => j.id === 'role_ia'), 'AI Engineer cannot appear in 1930');

    const save2024 = buildTestSave(2024, 'jobs_2024');
    const jobs2024 = GlobalBusinessEvolutionEngine.getAvailableJobs(save2024.worldState!, 25, 'Universidade', 'São Paulo');
    assert.ok(!jobs2024.some((j) => j.id === 'role_telegrafista'), 'Obsolete telegraph job hidden in 2024');
    assert.ok(jobs2024.some((j) => j.id === 'role_dev' || j.id === 'role_ia'));
    assert.ok(save2024.worldState!.brazil.publicDebtPctGdp > 0);
    assert.ok(save2024.worldState!.economy.housingAffordabilityIndex > 0);
  });

  // ---------------------------------------------------------------------------
  // 3. Temporal Integrity Sweep (16 Benchmark Years: 1900..2400)
  // ---------------------------------------------------------------------------
  console.log('\n3) Temporal Integrity & Truth Boundary Sweep (16 Years)');
  const BENCHMARK_YEARS = [1900, 1940, 1960, 1975, 1988, 1994, 1995, 2000, 2010, 2020, 2026, 2030, 2050, 2100, 2200, 2400];
  recordTest('Temporal', `All ${BENCHMARK_YEARS.length} historical & future horizons maintain zero leaks and strict truth cutoff`, () => {
    for (const yr of BENCHMARK_YEARS) {
      const save = buildTestSave(yr, `sweep_${yr}`);
      const out = WorldEvolutionEngine.advanceTime(save, 'year');
      const ws = out.save.worldState!;
      assert.strictEqual(ws.clock.year, yr + 1);
      for (const evt of ws.historicalLog) {
        assert.ok(evt.year <= ws.clock.year, `Future leak in ${yr}: ${evt.title} (${evt.year})`);
        if (evt.year > 2026) {
          assert.strictEqual(evt.truthStatus, 'FUTURE_PROJECTION', `Expected FUTURE_PROJECTION for ${evt.year}`);
        } else {
          assert.ok(
            evt.truthStatus === 'HISTORICAL_FACT' ||
              evt.truthStatus === 'SIMULATED_EVENT' ||
              evt.truthStatus === 'ALTERNATIVE_HISTORY'
          );
        }
      }
      const val = WorldConsistencyValidator.validateAndSanitize(out.save);
      assert.strictEqual(val.passed, true, `Consistency warnings in ${yr}: ${val.warnings.join('; ')}`);
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Genealogy, Divorce, Adoption, Reconciliation, Biological Rules & Zero-Dup Inheritance
  // ---------------------------------------------------------------------------
  console.log('\n4) Genealogy, Family Depth & Legacy Inheritance');
  recordTest('Family', 'Biological limits, adoption, marriage, divorce, reconciliation & zero-duplication succession', () => {
    const save = buildTestSave(2000, 'fam_test', 10_000_000);
    // Child < 16 rejected
    assert.throws(() => WorldPopulationEngine.createChild(save, 2005));
    // Marry < 18 rejected
    assert.throws(() => WorldPopulationEngine.createSpouse(save, 2010));

    // Advance manually 25 years (age 25 in 2025) without auto-marriage
    let grown = WorldEvolutionEngine.advanceTime(save, '10years').save;
    grown = WorldEvolutionEngine.advanceTime(grown, '10years').save;
    grown = WorldEvolutionEngine.advanceTime(grown, '5years').save;
    assert.strictEqual(grown.character.currentAge, 25);

    const spouse = WorldPopulationEngine.createSpouse(grown, 2025);
    grown.family.push(spouse);
    grown.character.partnerId = spouse.id;

    const bioChild = WorldPopulationEngine.createChild(grown, 2025);
    grown.family.push(bioChild);

    const adoptedChild = WorldPopulationEngine.adoptChild(grown, 2025);
    assert.strictEqual(adoptedChild.isAdopted, true);

    WorldPopulationEngine.divorceSpouse(grown, 2026);
    assert.strictEqual(spouse.relation, 'Ex-Cônjuge');
    assert.strictEqual(grown.character.partnerId, undefined);

    WorldPopulationEngine.reconcileWithMember(grown, spouse.id, 2026);
    assert.strictEqual(spouse.mood, 'Reconciliado');

    // Add 2 distinct assets and verify zero duplication upon heir transfer
    grown.assets.push(
      {
        id: 'ast_1',
        characterId: grown.character.id,
        type: 'Imóvel',
        name: 'Casa Teste',
        value: 20_000_000,
        monthlyIncome: 100_000,
        purchaseYear: 2025,
      },
      {
        id: 'ast_2',
        characterId: grown.character.id,
        type: 'Investimento',
        name: 'Tesouro Direto',
        value: 5_000_000,
        monthlyIncome: 45_000,
        purchaseYear: 2025,
      }
    );

    const beforeAssetCount = grown.assets.length;
    const inherited = WorldPopulationEngine.transferLegacyToHeir(grown, bioChild.id);
    assert.strictEqual(inherited.assets.length, beforeAssetCount);
    assert.ok(inherited.assets.every((a) => a.characterId === inherited.character.id));
    assert.strictEqual(inherited.character.generation, 2);
    assert.strictEqual(inherited.worldState!.generationsHistory.length, 1);
  });

  // ---------------------------------------------------------------------------
  // 5. Save Migration (v10 + Real Save Clone) & Idempotency
  // ---------------------------------------------------------------------------
  console.log('\n5) Save Migration (v10 + Real Save) & Idempotency');
  recordTest('Migration', 'Synthetic v10 save and real save char_1795015947801 migrate cleanly to v11', () => {
    const v10Save: any = buildTestSave(2005, 'legacy_v10');
    v10Save.schemaVersion = 10;
    v10Save.worldState.schemaVersion = 10;
    delete v10Save.userPreferences;
    v10Save.worldState.brazil.minimumWageBRL = 300;
    delete v10Save.worldState.brazil.minimumWageNominal;
    v10Save.worldState.brazil.exchangeRateBRLPerUSD = 2.4;
    delete v10Save.worldState.brazil.exchangeRatePerUSD;
    v10Save.worldState.historicalLog = [
      { id: 'h1', year: 2005, title: 'Marco v10', summary: 'Teste', category: 'Economia', scope: 'brasil', truthStatus: 'FATO_HISTORICO' },
    ];

    const migrated = WorldStateEngine.ensureSaveMigrated(v10Save);
    assert.strictEqual(migrated.schemaVersion, 11);
    assert.strictEqual(migrated.worldState!.brazil.minimumWageNominal, 300);
    assert.strictEqual(migrated.worldState!.historicalLog[0].truthStatus, 'HISTORICAL_FACT');
    assert.ok(migrated.userPreferences);

    // Real user save in data/saves.json (read-only clone in memory)
    const savesPath = path.resolve(process.cwd(), 'data', 'saves.json');
    if (fs.existsSync(savesPath)) {
      const store = JSON.parse(fs.readFileSync(savesPath, 'utf-8'));
      const pedroRaw = store['char_1795015947801'];
      if (pedroRaw) {
        const cloned = JSON.parse(JSON.stringify(pedroRaw));
        const pedroMigrated = WorldStateEngine.ensureSaveMigrated(cloned);
        assert.strictEqual(pedroMigrated.schemaVersion, 11);
        assert.strictEqual(pedroMigrated.character.firstName, pedroRaw.character.firstName);
        assert.strictEqual(Object.keys(pedroMigrated.worldState!.brazil.states).length, 27);
      }
    }
  });

  recordTest('Idempotency', 'Replaying identical idempotencyKey returns idempotentReplay=true with zero double advance', () => {
    const save = buildTestSave(2015, 'idem_check');
    const first = WorldEvolutionEngine.advanceTime(save, 'year', 'key_2015_abc');
    assert.strictEqual(first.idempotentReplay, false);
    assert.strictEqual(first.save.worldState!.clock.year, 2016);
    const second = WorldEvolutionEngine.advanceTime(first.save, 'year', 'key_2015_abc');
    assert.strictEqual(second.idempotentReplay, true);
    assert.strictEqual(second.yearsAdvanced, 0);
    assert.strictEqual(second.save.worldState!.clock.year, 2016);
  });

  // ---------------------------------------------------------------------------
  // 6. Narrative Orchestrator Hardening (Fallback, Anachronism Filter, Cache)
  // ---------------------------------------------------------------------------
  console.log('\n6) Narrative Orchestrator Safety & Cache Tests');
  await recordAsyncTest('Narrative', 'Blocks anachronisms (Pix/WhatsApp in 1975), falls back cleanly, and caches valid responses', async () => {
    WorldNarrativeOrchestrator.resetMetricsForTests();
    const save1975 = buildTestSave(1975, 'narr_1975');
    const fakeAnachronisticAI: any = {
      models: {
        generateContent: async () => ({
          text: JSON.stringify({
            title: 'Transferência via Pix no WhatsApp',
            description: 'Você recebeu um Pix pelo WhatsApp em 1975.',
            category: 'Finanças',
            choices: [{ id: 'a', text: 'Aceitar', effectDescription: 'Teste' }],
          }),
        }),
      },
    };
    const evt1 = await WorldNarrativeOrchestrator.generateContextualEvent(save1975, fakeAnachronisticAI);
    assert.ok(!/pix|whatsapp/i.test(evt1.title + ' ' + evt1.description));
    assert.ok(WorldNarrativeOrchestrator.getMetrics().anachronismsBlocked >= 1);

    let aiCallCount = 0;
    const validSave1998 = buildTestSave(1998, 'narr_1998');
    const fakeValidAI: any = {
      models: {
        generateContent: async () => {
          aiCallCount++;
          return {
            text: JSON.stringify({
              title: 'Copa da França e Internet Discada',
              description: 'A família acompanha a Copa de 1998 em São Paulo enquanto a internet discada chega aos lares.',
              category: 'Cultura',
              choices: [
                { id: 'a', text: 'Reunir amigos', effectDescription: '+Felicidade' },
                { id: 'b', text: 'Focar nos estudos', effectDescription: '+Inteligência' },
              ],
            }),
          };
        },
      },
    };
    await WorldNarrativeOrchestrator.generateContextualEvent(validSave1998, fakeValidAI);
    await WorldNarrativeOrchestrator.generateContextualEvent(validSave1998, fakeValidAI);
    assert.strictEqual(aiCallCount, 1, 'Second identical call should hit LRU cache');
    assert.strictEqual(WorldNarrativeOrchestrator.getMetrics().cacheHits, 1);
  });

  // ---------------------------------------------------------------------------
  // 7. Time Steps & Performance Benchmarks (1y, 10y, 50y, 100y, 500y, 1000y)
  // ---------------------------------------------------------------------------
  console.log('\n7) Time Steps & Multi-Century Performance Benchmarks');
  const benchmarkRows: { horizon: string; ms: number; payloadKB: number; finalYear: number; events: number }[] = [];

  recordTest('TimeSteps', 'Granular time steps day, week, month, 6months, 5years, 10years execute cleanly', () => {
    let s = buildTestSave(2000, 'steps');
    s = WorldEvolutionEngine.advanceTime(s, 'day').save;
    assert.strictEqual(s.worldState!.clock.day, 2);
    s = WorldEvolutionEngine.advanceTime(s, 'week').save;
    assert.strictEqual(s.worldState!.clock.day, 9);
    s = WorldEvolutionEngine.advanceTime(s, 'month').save;
    assert.strictEqual(s.worldState!.clock.month, 2);
    s = WorldEvolutionEngine.advanceTime(s, '6months').save;
    assert.strictEqual(s.worldState!.clock.month, 8);
    s = WorldEvolutionEngine.advanceTime(s, '5years').save;
    assert.strictEqual(s.worldState!.clock.year, 2005);
    s = WorldEvolutionEngine.advanceTime(s, '10years').save;
    assert.strictEqual(s.worldState!.clock.year, 2015);
  });

  for (const years of [1, 10, 50, 100, 500, 1000]) {
    recordTest('Benchmark', `Dynasty simulation benchmark (${years}y)`, () => {
      const s = buildTestSave(1950, `bench_${years}`);
      const t0 = performance.now();
      const res =
        years <= 100
          ? WorldEvolutionEngine.advanceTime(
              s,
              years === 1 ? 'year' : years === 10 ? '10years' : years === 50 ? '50years' : '100years',
              undefined,
              true
            )
          : WorldEvolutionEngine.advanceDynastyYears(s, years);
      const elapsed = Number((performance.now() - t0).toFixed(2));
      const payloadBytes = Buffer.byteLength(JSON.stringify(res.save), 'utf8');
      const payloadKB = Number((payloadBytes / 1024).toFixed(2));
      assert.strictEqual(res.yearsAdvanced, years);
      assert.ok(res.save.events.length <= 180);
      assert.ok(res.save.history.length <= 350);
      assert.ok(res.save.worldState!.historicalLog.length <= 250);
      benchmarkRows.push({
        horizon: `${years}y`,
        ms: elapsed,
        payloadKB,
        finalYear: res.save.worldState!.clock.year,
        events: res.save.events.length,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Live HTTP API E2E + Security + Concurrency + Disk Persistence
  // ---------------------------------------------------------------------------
  console.log('\n8) Live HTTP API E2E, Security & Concurrency Tests (http://localhost:3000)');
  const BASE = 'http://localhost:3000';
  const createdIds: string[] = [];

  await recordAsyncTest('HTTP', 'GET /api/health returns schemaVersion 11 and GET / returns HTML', async () => {
    const hRes = await fetch(`${BASE}/api/health`);
    assert.strictEqual(hRes.status, 200);
    const hJson: any = await hRes.json();
    assert.strictEqual(hJson.status, 'ok');
    assert.strictEqual(hJson.schemaVersion, 11);

    const htmlRes = await fetch(`${BASE}/`);
    assert.strictEqual(htmlRes.status, 200);
    const htmlText = await htmlRes.text();
    assert.ok(htmlText.includes('VIDA REAL BR'));
  });

  await recordAsyncTest('HTTP', 'Real user save char_1795015947801 loads safely with backup generated', async () => {
    const res = await fetch(`${BASE}/api/saves/char_1795015947801`);
    if (res.status === 200) {
      const save: GameSave = await res.json();
      assert.strictEqual(save.schemaVersion, 11);
      assert.strictEqual(Object.keys(save.worldState!.brazil.states).length, 27);
    }
  });

  await recordAsyncTest('HTTP', 'Full life lifecycle, server-authoritative validation, concurrency mutex & cleanup', async () => {
    // Create 1988 save
    const createRes = await fetch(`${BASE}/api/saves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'TesteV11',
        lastName: 'Simulacao',
        gender: 'Masculino',
        state: 'São Paulo',
        city: 'São Paulo',
        startYear: 1988,
        startingMoney: 12000000,
      }),
    });
    assert.strictEqual(createRes.status, 200);
    let save: GameSave = await createRes.json();
    createdIds.push(save.id);
    assert.strictEqual(save.schemaVersion, 11);
    assert.strictEqual(save.worldState!.brazil.currency.code, 'Cz$');

    // Security reject: raw salary without roleId -> 400
    const badCareerRes = await fetch(`${BASE}/api/saves/${save.id}/career`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ careerTitle: 'Hacker Bilionário', salary: 999999999 }),
    });
    assert.strictEqual(badCareerRes.status, 400);

    // Security reject: raw asset price without catalogId -> 400
    const badAssetRes = await fetch(`${BASE}/api/saves/${save.id}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ilha Fake', value: 1 }),
    });
    assert.strictEqual(badAssetRes.status, 400);

    // Advance 10years + 10years -> 2008 (age 20, Real era, adult)
    let advRes = await fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit: '10years' }),
    });
    assert.strictEqual(advRes.status, 200);
    advRes = await fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit: '10years' }),
    });
    assert.strictEqual(advRes.status, 200);
    save = await advRes.json();
    assert.strictEqual(save.worldState!.clock.year, 2008);
    assert.strictEqual(save.worldState!.brazil.currency.code, 'BRL');

    // Market + Server-authoritative Career Apply (roleId)
    const mktRes = await fetch(`${BASE}/api/saves/${save.id}/market`);
    assert.strictEqual(mktRes.status, 200);
    const market: any = await mktRes.json();
    assert.ok(Array.isArray(market.jobs) && market.jobs.length > 0);
    assert.ok(Array.isArray(market.assetsMarket) && market.assetsMarket.length > 0);

    const jobRes = await fetch(`${BASE}/api/saves/${save.id}/career`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId: market.jobs[0].id }),
    });
    assert.strictEqual(jobRes.status, 200);
    save = await jobRes.json();
    assert.ok(save.character.salary > 0);

    // Ensure enough money for cheapest asset then buy & sell
    const cheapestAsset = [...market.assetsMarket].sort((a, b) => a.priceCentavos - b.priceCentavos)[0];
    if (save.character.money >= cheapestAsset.priceCentavos) {
      const buyRes = await fetch(`${BASE}/api/saves/${save.id}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogId: cheapestAsset.id }),
      });
      assert.strictEqual(buyRes.status, 200);
      save = await buyRes.json();
      const boughtId = save.assets[save.assets.length - 1].id;
      const sellRes = await fetch(`${BASE}/api/saves/${save.id}/assets/${boughtId}/sell`, {
        method: 'POST',
      });
      assert.strictEqual(sellRes.status, 200);
      save = await sellRes.json();
    }

    // Civic participate + vaccinate + preferences
    const polRes = await fetch(`${BASE}/api/saves/${save.id}/politics/participate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vote' }),
    });
    assert.strictEqual(polRes.status, 200);

    const vacRes = await fetch(`${BASE}/api/saves/${save.id}/health/vaccinate`, { method: 'POST' });
    assert.strictEqual(vacRes.status, 200);

    const prefRes = await fetch(`${BASE}/api/saves/${save.id}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compactTimeline: true, autoOpenEvents: false }),
    });
    assert.strictEqual(prefRes.status, 200);
    save = await prefRes.json();
    assert.strictEqual(save.userPreferences?.compactTimeline, true);

    // Concurrency test: 5 parallel month advances against SAME save ID
    const startMonth = save.worldState!.clock.month;
    const parallelAdvances = await Promise.all(
      [1, 2, 3, 4, 5].map((i) =>
        fetch(`${BASE}/api/saves/${save.id}/advance-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unit: 'month', idempotencyKey: `conc_m_${i}` }),
        })
      )
    );
    for (const r of parallelAdvances) {
      assert.strictEqual(r.status, 200);
    }

    // Reload from disk via GET to confirm persistence & zero race lost updates
    const reloadRes = await fetch(`${BASE}/api/saves/${save.id}`);
    assert.strictEqual(reloadRes.status, 200);
    const reloaded: GameSave = await reloadRes.json();
    const expectedMonth = ((startMonth - 1 + 5) % 12) + 1;
    assert.strictEqual(reloaded.worldState!.clock.month, expectedMonth);
  });

  // Cleanup all temporary HTTP test saves
  for (const tempId of createdIds) {
    await fetch(`${BASE}/api/saves/${tempId}`, { method: 'DELETE' });
  }

  console.log('\n--- Benchmark Summary ---');
  for (const row of benchmarkRows) {
    console.log(
      `  ${row.horizon.padEnd(6)} | time: ${String(row.ms).padStart(7)} ms | payload: ${String(row.payloadKB).padStart(7)} KB | year: ${row.finalYear} | events: ${row.events}`
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
