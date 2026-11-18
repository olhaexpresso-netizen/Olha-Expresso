import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  Character,
  CharacterAppearance,
  FamilyMember,
  Asset,
  LifeEvent,
  GameSave,
  WorldAdvanceUnit,
  BusinessSector,
} from './src/types';
import { CharacterAppearanceGenerator } from './src/services/CharacterAppearanceGenerator';
import { WorldStateEngine, CURRENT_SAVE_SCHEMA_VERSION } from './src/services/WorldStateEngine';
import { WorldEvolutionEngine } from './src/services/WorldEvolutionEngine';
import { WorldNarrativeOrchestrator } from './src/services/WorldNarrativeOrchestrator';
import { WorldPopulationEngine } from './src/services/WorldPopulationEngine';
import { GlobalBusinessEvolutionEngine } from './src/services/GlobalBusinessEvolutionEngine';
import { SocietyEvolutionEngine } from './src/services/SocietyEvolutionEngine';
import { WorldTechnologyEngine } from './src/services/WorldTechnologyEngine';
import { BrazilHistoricalSimulationEngine } from './src/services/BrazilHistoricalSimulationEngine';
import { GlobalEconomicSimulationEngine } from './src/services/GlobalEconomicSimulationEngine';
import { PoliticalWorldEngine } from './src/services/PoliticalWorldEngine';
import { normalizeTruthStatus } from './src/types/world';
import { EventCatalogEngine } from './src/services/EventCatalogEngine';
import { CrimeAndJusticeEngine, SYSTEMIC_OFFENSES_CATALOG } from './src/services/CrimeAndJusticeEngine';
import {
  GovernanceAndPoliticsEngine,
  POLITICAL_OFFICES_CATALOG,
  POLITICAL_PARTIES,
  PUBLIC_POLICY_PROGRAMS,
} from './src/services/GovernanceAndPoliticsEngine';
import { CivilizationSystemsEngine, RELIGIONS_CATALOG } from './src/services/CivilizationSystemsEngine';
import { GameSaveCompressor } from './src/services/GameSaveCompressor';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const SAVES_FILE = path.join(DATA_DIR, 'saves.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Simple in-memory IP rate limiter
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'local';
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > 300) {
    return res.status(429).json({ error: 'Muitas requisições em sequência. Aguarde alguns segundos.' });
  }
  return next();
});

const SAFE_SAVE_ID_RE = /^[a-zA-Z0-9_-]{3,80}$/;
const RESERVED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
app.param('id', (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!SAFE_SAVE_ID_RE.test(id) || RESERVED_KEYS.has(id)) {
    return res.status(400).json({ error: 'Identificador de partida inválido.' });
  }
  return next();
});

// Per-save async mutex / store serializer to prevent concurrent write race conditions
const saveLocks = new Map<string, Promise<unknown>>();
function withSaveLock<T>(lockKey: string, fn: () => Promise<T> | T): Promise<T> {
  const prev = saveLocks.get(lockKey) || Promise.resolve();
  const next = prev.then(() => fn());
  const settled = next.catch(() => {});
  saveLocks.set(lockKey, settled);
  settled.finally(() => {
    if (saveLocks.get(lockKey) === settled) {
      saveLocks.delete(lockKey);
    }
  });
  return next;
}

function loadSavesStore(): Record<string, GameSave> {
  try {
    if (fs.existsSync(SAVES_FILE)) {
      const data = fs.readFileSync(SAVES_FILE, 'utf-8');
      const store = JSON.parse(data);
      for (const id of Object.keys(store)) {
        store[id] = GameSaveCompressor.compress(store[id]);
      }
      return store;
    }
  } catch (err) {
    console.error('Error loading saves:', err);
  }
  return {};
}

function saveSavesStore(store: Record<string, GameSave>) {
  try {
    const compressedStore = {} as Record<string, GameSave>;
    for (const id of Object.keys(store)) {
      compressedStore[id] = GameSaveCompressor.compress(store[id]);
    }
    const tmpFile = `${SAVES_FILE}.tmp_${process.pid}_${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(compressedStore, null, 2), 'utf-8');
    fs.renameSync(tmpFile, SAVES_FILE);
  } catch (err) {
    console.error('Error saving store:', err);
  }
}


let lastBackupAt = 0;
function createPreMigrationBackup(): void {
  const now = Date.now();
  if (now - lastBackupAt < 5000 || !fs.existsSync(SAVES_FILE)) return;
  try {
    lastBackupAt = now;
    const backupPath = path.join(BACKUP_DIR, `saves.backup.${now}.json`);
    fs.copyFileSync(SAVES_FILE, backupPath);
    // Keep last 10 backups
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('saves.backup.'))
      .sort();
    if (files.length > 10) {
      for (const old of files.slice(0, files.length - 10)) {
        fs.unlinkSync(path.join(BACKUP_DIR, old));
      }
    }
  } catch (err) {
    console.error('Pre-migration backup failed:', err);
  }
}

let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.error('Failed to initialize GoogleGenAI:', e);
  }
}

const VALID_ADVANCE_UNITS = new Set<WorldAdvanceUnit>([
  'day',
  'week',
  'month',
  '6months',
  'year',
  '5years',
  '10years',
  '50years',
  '100years',
]);

function normalizeSave(save: GameSave): GameSave {
  if (save.character.ageMonths === undefined) {
    save.character.ageMonths = (save.character.currentAge || 0) * 12;
  }
  if (!save.character.appearance) {
    const seed =
      save.character.appearanceSeed ||
      `${save.character.id}_${save.character.avatarSeed || save.character.firstName}_${save.character.lastName}_${save.character.gender}`;
    save.character.appearanceSeed = seed;
    save.character.appearance = CharacterAppearanceGenerator.generateFromSeed(seed, {
      characterId: save.character.id,
      gender: save.character.gender,
      ageYears: save.character.currentAge,
    });
  }
  save.family = (save.family || []).map((f) => {
    const resolvedAgeMonths = f.ageMonths ?? (f.age || 0) * 12;
    if (f.appearance) {
      return { ...f, ageMonths: resolvedAgeMonths };
    }
    const fSeed = f.appearanceSeed || `${save.character.id}_${f.id}_${f.name}_${f.relation}`;
    const appData =
      f.relation === 'Pai' || f.relation === 'Mãe' || f.relation === 'Avô' || f.relation === 'Avó'
        ? CharacterAppearanceGenerator.deriveParentFromChild(f.id, fSeed, f.relation, save.character.appearance!)
        : CharacterAppearanceGenerator.generateFromSeed(fSeed, {
            characterId: f.id,
            gender: f.relation === 'Irmão' || f.relation === 'Filho' || f.relation === 'Neto' ? 'Masculino' : 'Feminino',
            ageYears: f.age,
          });
    return { ...f, ageMonths: resolvedAgeMonths, appearanceSeed: fSeed, appearance: appData };
  });

  return WorldStateEngine.ensureSaveMigrated(save);
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    aiEnabled: Boolean(ai),
    eventCatalogSize: EventCatalogEngine.getTotalCount(),
  });
});

// Event Catalog Explorer (+11,000 events indexed)
app.get('/api/catalog/events', (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 24);
  const year = req.query.year ? Number(req.query.year) : undefined;
  const result = EventCatalogEngine.queryEvents({
    category: (req.query.category as any) || 'Todas',
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    year: Number.isFinite(year) ? year : undefined,
    truthStatus: typeof req.query.truthStatus === 'string' ? (req.query.truthStatus as any) : undefined,
    countryScope: (req.query.countryScope as any) || 'Todos',
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 24,
  });
  return res.json(result);
});

// List saves
app.get('/api/saves', (_req: Request, res: Response) => {
  const store = loadSavesStore();
  const savesList = Object.values(store).map((s) => ({
    id: s.id,
    schemaVersion: s.schemaVersion ?? 9,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    character: s.character,
    worldYear: s.worldState?.clock.year ?? s.character.birthYear + s.character.currentAge,
    brazilPhaseLabel: s.worldState?.brazil.phaseLabel,
  }));
  res.json(savesList);
});

// Create new game with selectable starting era/year
app.post('/api/saves', async (req: Request, res: Response) => {
  return withSaveLock('__store__', () => {
    const { firstName, lastName, gender, state, city, country, startingMoney, appearance, startYear } =
      req.body || {};
    const charId = `char_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const parsedStartYear = Number.isFinite(Number(startYear))
      ? Math.max(1500, Math.min(2100, Math.floor(Number(startYear))))
      : 2000;
    const birthYear = parsedStartYear;
    const resolvedFirstName = String(firstName || 'João').trim().slice(0, 40) || 'João';
    const resolvedLastName = String(lastName || 'Silva').trim().slice(0, 40) || 'Silva';
    const resolvedGender: 'Masculino' | 'Feminino' | 'Outro' =
      gender === 'Feminino' || gender === 'Outro' ? gender : 'Masculino';
    const resolvedCity = String(city || 'São Paulo').trim() || 'São Paulo';
    const resolvedState = String(state || 'São Paulo').trim() || 'São Paulo';
    const appearanceSeed =
      appearance?.appearanceSeed || `${charId}_${resolvedFirstName}_${resolvedLastName}_${resolvedGender}`;

    const resolvedAppearance: CharacterAppearance = appearance
      ? { ...appearance, characterId: charId, appearanceSeed }
      : CharacterAppearanceGenerator.generateFromSeed(appearanceSeed, {
          characterId: charId,
          gender: resolvedGender,
          ageYears: 0,
        });

    const worldState = WorldStateEngine.createInitialWorldState(birthYear, appearanceSeed, resolvedCity);
    const eraScale = BrazilHistoricalSimulationEngine.getNominalEraScaleForStart(birthYear);
    const defaultStartCentavos = Math.round(1500000 * eraScale);
    const safeStartingMoney =
      typeof startingMoney === 'number' && Number.isFinite(startingMoney)
        ? Math.max(0, Math.min(100_000_000_000, Math.round(startingMoney)))
        : defaultStartCentavos;

    const character: Character = {
      id: charId,
      userId: 'user_default',
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      gender: resolvedGender,
      avatarSeed: resolvedFirstName + resolvedLastName,
      appearanceSeed,
      appearance: resolvedAppearance,
      country: String(country || 'Brasil').slice(0, 40),
      state: resolvedState,
      city: resolvedCity,
      birthYear,
      currentAge: 0,
      ageMonths: 0,
      money: safeStartingMoney,
      debtCentavos: 0,
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
      status: 'Vivo',
      generation: 1,
      educationLevel: 'Nenhum',
      educationProgress: 0,
      careerExperienceYears: 0,
      vaccinatedYears: [],
      criminalRecord: {
        arrests: 0,
        prisonYearsRemaining: 0,
        crimesCommitted: [],
      },
    };

    const fatherSeed = `${charId}_fam_1_Pai`;
    const motherSeed = `${charId}_fam_2_Mae`;
    const grandpaSeed = `${charId}_fam_3_AvoM`;
    const grandmaSeed = `${charId}_fam_4_AvoF`;
    const fatherAppearance = CharacterAppearanceGenerator.deriveParentFromChild(
      'fam_1',
      fatherSeed,
      'Pai',
      resolvedAppearance
    );
    const motherAppearance = CharacterAppearanceGenerator.deriveParentFromChild(
      'fam_2',
      motherSeed,
      'Mãe',
      resolvedAppearance
    );
    const grandpaAppearance = CharacterAppearanceGenerator.deriveParentFromChild(
      'fam_3',
      grandpaSeed,
      'Avô',
      fatherAppearance
    );
    const grandmaAppearance = CharacterAppearanceGenerator.deriveParentFromChild(
      'fam_4',
      grandmaSeed,
      'Avó',
      motherAppearance
    );

    const family: FamilyMember[] = [
      {
        id: 'fam_1',
        characterId: charId,
        name: 'Carlos ' + resolvedLastName,
        relation: 'Pai',
        age: 32,
        ageMonths: 32 * 12,
        birthYear: birthYear - 32,
        alive: true,
        relationship: 80,
        occupation: birthYear < 1950 ? 'Lavrador / Comerciante' : 'Comerciante / Motorista',
        city: resolvedCity,
        generation: 0,
        gender: 'Masculino',
        personality: ['Pragmático', 'Acolhedor'],
        goals: ['Estabilidade familiar'],
        mood: 'Sereno',
        memories: [`Nascimento de ${resolvedFirstName} em ${birthYear}`],
        appearanceSeed: fatherSeed,
        appearance: fatherAppearance,
      },
      {
        id: 'fam_2',
        characterId: charId,
        name: 'Maria ' + resolvedLastName,
        relation: 'Mãe',
        age: 30,
        ageMonths: 30 * 12,
        birthYear: birthYear - 30,
        alive: true,
        relationship: 85,
        occupation: 'Professora',
        city: resolvedCity,
        generation: 0,
        gender: 'Feminino',
        personality: ['Acolhedor', 'Resiliente'],
        goals: ['Estabilidade familiar'],
        mood: 'Alegre',
        memories: [`Nascimento de ${resolvedFirstName} em ${birthYear}`],
        appearanceSeed: motherSeed,
        appearance: motherAppearance,
      },
      {
        id: 'fam_3',
        characterId: charId,
        name: 'Antônio ' + resolvedLastName,
        relation: 'Avô',
        age: 62,
        ageMonths: 62 * 12,
        birthYear: birthYear - 62,
        alive: true,
        relationship: 75,
        occupation: 'Aposentado',
        city: resolvedCity,
        generation: -1,
        gender: 'Masculino',
        personality: ['Cauteloso', 'Resiliente'],
        mood: 'Sereno',
        appearanceSeed: grandpaSeed,
        appearance: grandpaAppearance,
      },
      {
        id: 'fam_4',
        characterId: charId,
        name: 'Helena ' + resolvedLastName,
        relation: 'Avó',
        age: 60,
        ageMonths: 60 * 12,
        birthYear: birthYear - 60,
        alive: true,
        relationship: 78,
        occupation: 'Costureira',
        city: resolvedCity,
        generation: -1,
        gender: 'Feminino',
        personality: ['Acolhedor', 'Criativo'],
        mood: 'Alegre',
        appearanceSeed: grandmaSeed,
        appearance: grandmaAppearance,
      },
    ];

    const initialEvent: LifeEvent = {
      id: 'evt_birth',
      characterId: charId,
      age: 0,
      year: birthYear,
      month: 1,
      day: 1,
      title: 'Nascimento',
      description: `Você nasceu em ${character.city}, ${character.state}, no ano de ${birthYear} (${worldState.brazil.phaseLabel}). Seus pais, ${family[0].name} e ${family[1].name}, celebram sua chegada.`,
      category: 'Família',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', birthYear),
      worldContextNote: `Governo no Brasil: ${worldState.brazil.currentGovernment.leaderName} · Moeda: ${worldState.brazil.currency.name}`,
      choices: [
        { id: 'a', text: 'Chorar firme e se alimentar bem', effectDescription: 'Início saudável da vida.' },
        { id: 'b', text: 'Dormir tranquilo nos braços da família', effectDescription: 'Bebê calmo e estável.' },
      ],
    };

    const newSave: GameSave = {
      id: charId,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      character,
      family,
      assets: [],
      events: [initialEvent],
      history: [
        {
          age: 0,
          year: birthYear,
          month: 1,
          summary: `Nasceu em ${character.city}, ${character.state}.`,
          worldSummary: `${worldState.brazil.phaseLabel} · ${worldState.brazil.currentGovernment.leaderName}`,
        },
      ],
      worldState,
      userPreferences: {
        autoOpenEvents: true,
        compactTimeline: false,
        confirmRiskyActions: true,
      },
    };

    const store = loadSavesStore();
    store[charId] = newSave;
    saveSavesStore(store);

    return res.json(newSave);
  });
});

// Load game save (migrates v8/v9/v10 saves with automatic pre-migration backup)
app.get('/api/saves/:id', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }
    const needsMigration =
      !rawSave.schemaVersion ||
      rawSave.schemaVersion < CURRENT_SAVE_SCHEMA_VERSION ||
      !rawSave.worldState;
    if (needsMigration) {
      createPreMigrationBackup();
    }
    const save = normalizeSave(rawSave);
    if (needsMigration) {
      store[req.params.id] = save;
      saveSavesStore(store);
    }
    return res.json(save);
  });
});

// Update character 2D appearance
app.put('/api/saves/:id/appearance', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { appearance } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    if (appearance) {
      const updatedAppearance: CharacterAppearance = {
        ...appearance,
        characterId: save.character.id,
        appearanceSeed: appearance.appearanceSeed || save.character.appearanceSeed || save.character.id,
      };
      save.character.appearance = updatedAppearance;
      save.character.appearanceSeed = updatedAppearance.appearanceSeed;
    }
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Persist user preferences
app.put('/api/saves/:id/preferences', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const prefs = req.body || {};
    save.userPreferences = {
      autoOpenEvents: Boolean(prefs.autoOpenEvents ?? save.userPreferences?.autoOpenEvents ?? true),
      compactTimeline: Boolean(prefs.compactTimeline ?? save.userPreferences?.compactTimeline ?? false),
      confirmRiskyActions: Boolean(
        prefs.confirmRiskyActions ?? save.userPreferences?.confirmRiskyActions ?? true
      ),
    };
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Delete game save
app.delete('/api/saves/:id', (req: Request, res: Response) => {
  return withSaveLock('__store__', () => {
    const store = loadSavesStore();
    if (!store[req.params.id]) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }
    delete store[req.params.id];
    saveSavesStore(store);
    return res.json({ success: true });
  });
});

async function handleTimeAdvance(req: Request, res: Response, forcedUnit?: WorldAdvanceUnit) {
  return withSaveLock(req.params.id, async () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) {
      return res.status(404).json({ error: 'Partida não encontrada.' });
    }

    const needsMigration =
      !rawSave.schemaVersion ||
      rawSave.schemaVersion < CURRENT_SAVE_SCHEMA_VERSION ||
      !rawSave.worldState;
    if (needsMigration) createPreMigrationBackup();

    const save = normalizeSave(rawSave);
    const unit: WorldAdvanceUnit = forcedUnit || req.body?.unit || 'year';
    if (!VALID_ADVANCE_UNITS.has(unit)) {
      return res.status(400).json({ error: `Unidade de tempo inválida: ${String(unit)}` });
    }
    const idempotencyKey: string | undefined = req.body?.idempotencyKey;

    if (save.character.status === 'Morto') {
      return res.status(400).json({
        error: 'O personagem faleceu. Selecione um herdeiro para continuar ou crie nova partida.',
      });
    }

    try {
      const outcome = WorldEvolutionEngine.advanceTime(save, unit, idempotencyKey);

      if (
        !outcome.idempotentReplay &&
        outcome.yearsAdvanced >= 1 &&
        outcome.yearsAdvanced <= 5 &&
        outcome.save.character.status === 'Vivo' &&
        outcome.save.character.criminalRecord.prisonYearsRemaining <= 0
      ) {
        const narrativeEvent = await WorldNarrativeOrchestrator.generateContextualEvent(outcome.save, ai);
        outcome.save.events.push(narrativeEvent);
      }

      store[req.params.id] = outcome.save;
      saveSavesStore(store);
      return res.json(outcome.save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Falha ao avançar o tempo.' });
    }
  });
}

app.post('/api/saves/:id/advance', async (req: Request, res: Response) => {
  return handleTimeAdvance(req, res, 'year');
});

app.post('/api/saves/:id/advance-time', async (req: Request, res: Response) => {
  return handleTimeAdvance(req, res);
});

// Market options tailored to current historical era, world economy, and character city
app.get('/api/saves/:id/market', (req: Request, res: Response) => {
  const store = loadSavesStore();
  const rawSave = store[req.params.id];
  if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

  const save = normalizeSave(rawSave);
  const world = save.worldState!;
  const year = world.clock.year;

  const jobs = GlobalBusinessEvolutionEngine.getAvailableJobs(
    world,
    save.character.currentAge,
    save.character.educationLevel,
    save.character.city
  );
  const educationPrograms = SocietyEvolutionEngine.getAvailableEducationPrograms(year, world);
  const treatments = WorldTechnologyEngine.getAvailableMedicalTreatments(year).map((t) => ({
    ...t,
    costCentavos: Math.round(
      t.costCentavos * Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier))
    ),
  }));
  const assetsMarket = GlobalEconomicSimulationEngine.getAssetCatalog(world, save.character.city);

  return res.json({
    year,
    jobs,
    educationPrograms,
    treatments,
    assetsMarket,
    offenses: SYSTEMIC_OFFENSES_CATALOG.filter((o) => !o.minYear || year >= o.minYear),
    politicalOffices: POLITICAL_OFFICES_CATALOG.filter((o) => !o.minYear || year >= o.minYear),
    politicalParties: POLITICAL_PARTIES,
    publicPrograms: PUBLIC_POLICY_PROGRAMS,
    religions: RELIGIONS_CATALOG,
  });
});

// Resolve choice (validated against event choices)
app.post('/api/saves/:id/choice', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { eventId, choiceId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);

    const event = save.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Evento não encontrado.' });
    if (event.chosenOptionId) return res.json(save);

    const validChoice = event.choices?.find((c) => c.id === choiceId);
    if (!validChoice) {
      return res.status(400).json({ error: 'Opção de escolha inválida para este evento.' });
    }

    event.chosenOptionId = choiceId;
    const char = save.character;
    const world = save.worldState!;
    const scale = Math.max(0.5, Math.min(2500, world.economy.costOfLivingMultiplier));

    const catalogDef = event.catalogEventId ? EventCatalogEngine.getById(event.catalogEventId) : undefined;
    const catalogChoice = catalogDef?.choices.find((c) => c.id === choiceId);
    if (catalogChoice?.effect) {
      const ef = catalogChoice.effect;
      if (ef.moneyDeltaCentavos) char.money += Math.round(ef.moneyDeltaCentavos * scale);
      if (ef.healthDelta) char.health = Math.max(5, Math.min(100, char.health + ef.healthDelta));
      if (ef.mentalHealthDelta) char.mentalHealth = Math.max(5, Math.min(100, (char.mentalHealth ?? 75) + ef.mentalHealthDelta));
      if (ef.happinessDelta) char.happiness = Math.max(0, Math.min(100, char.happiness + ef.happinessDelta));
      if (ef.intelligenceDelta) char.intelligence = Math.max(0, Math.min(100, char.intelligence + ef.intelligenceDelta));
      if (ef.reputationDelta) char.reputation = Math.max(0, Math.min(100, char.reputation + ef.reputationDelta));
      if (ef.disciplineDelta) char.discipline = Math.max(0, Math.min(100, char.discipline + ef.disciplineDelta));
      if (ef.nextEventId) {
        if (!world.pendingChainedCatalogIds) world.pendingChainedCatalogIds = [];
        world.pendingChainedCatalogIds.push(ef.nextEventId);
        world.pendingChainedCatalogIds = world.pendingChainedCatalogIds.slice(-20);
      }
      event.consequence = validChoice.effectDescription;
    } else if (choiceId === 'a') {
      char.happiness = Math.min(100, char.happiness + 5);
      char.intelligence = Math.min(100, char.intelligence + 3);
      char.discipline = Math.min(100, char.discipline + 3);
    } else if (choiceId === 'b') {
      char.happiness = Math.min(100, char.happiness + 8);
      char.health = Math.min(100, char.health + 2);
    } else {
      char.money += Math.round(180000 * scale);
      char.careerSkill = Math.min(100, char.careerSkill + 5);
    }

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Server-authoritative Career Application (validates roleId, age, tech, and computes salary server-side)
app.post('/api/saves/:id/career', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { roleId } = req.body || {};
    if (!roleId || typeof roleId !== 'string') {
      return res.status(400).json({ error: 'roleId obrigatório e validado pelo servidor.' });
    }
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    if (char.status !== 'Vivo') return res.status(400).json({ error: 'Personagem falecido.' });

    const role = GlobalBusinessEvolutionEngine.getRoleById(
      world,
      roleId,
      char.currentAge,
      char.educationLevel,
      char.city
    );
    if (!role) {
      return res.status(400).json({
        error: 'Cargo indisponível para a era atual, tecnologia desbloqueada ou perfil do personagem.',
      });
    }

    if (role.requiredIntelligence && char.intelligence < role.requiredIntelligence) {
      return res.status(400).json({
        error: `Inteligência mínima exigida (${role.requiredIntelligence}) não atingida.`,
      });
    }

    const currentYear = world.clock.year;
    char.careerTitle = role.title;
    char.careerCompany = role.companyName;
    char.salary = role.baseAnnualSalaryCentavos;

    const salaryFormatted = BrazilHistoricalSimulationEngine.formatMoney(char.salary, world.brazil.currency);
    save.events.push({
      id: `evt_job_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: 'Novo Emprego',
      description: `Você foi contratado como ${role.title} em ${role.companyName}, com remuneração anual de ${salaryFormatted}.`,
      category: 'Carreira',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Career Promotion
app.post('/api/saves/:id/career/promote', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    if (!char.careerTitle || char.salary <= 0) {
      return res.status(400).json({ error: 'Você precisa estar empregado para solicitar promoção.' });
    }
    if (char.careerSkill < 15 && char.careerExperienceYears < 2) {
      return res.status(400).json({
        error: 'Acumule pelo menos 2 anos de experiência ou habilidade profissional para promoção.',
      });
    }

    const raisePct = 0.14;
    char.salary = Math.round(char.salary * (1 + raisePct));
    char.careerSkill = Math.min(100, char.careerSkill + 5);
    char.happiness = Math.min(100, char.happiness + 6);
    if (!char.careerTitle.includes('(Sênior)') && char.careerExperienceYears >= 5) {
      char.careerTitle = `${char.careerTitle} (Sênior)`;
    }

    const currentYear = world.clock.year;
    const formatted = BrazilHistoricalSimulationEngine.formatMoney(char.salary, world.brazil.currency);
    save.events.push({
      id: `evt_promo_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: 'Promoção na Carreira',
      description: `Seu desempenho garantiu aumento salarial! Novo salário anual: ${formatted}.`,
      category: 'Carreira',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Career Resign
app.post('/api/saves/:id/career/resign', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const char = save.character;
    if (!char.careerTitle) return res.status(400).json({ error: 'Você não possui vínculo ativo.' });

    const prev = char.careerTitle;
    char.careerTitle = undefined;
    char.careerCompany = undefined;
    char.salary = 0;
    const currentYear = save.worldState!.clock.year;
    save.events.push({
      id: `evt_resign_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: 'Pedido de Demissão',
      description: `Você encerrou seu ciclo como ${prev} em busca de novos caminhos.`,
      category: 'Carreira',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Found own company (Entrepreneurship)
app.post('/api/saves/:id/career/found-company', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { companyName, sector } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    const currentYear = world.clock.year;

    if (char.currentAge < 21) {
      return res.status(400).json({ error: 'Idade mínima para fundar empresa é 21 anos.' });
    }
    const cleanName = String(companyName || '').trim().slice(0, 50);
    if (!cleanName) return res.status(400).json({ error: 'Nome da empresa é obrigatório.' });

    const scale = Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier));
    const startupCost = Math.round(2500000 * scale);
    if (char.money < startupCost) {
      return res.status(400).json({
        error: `Capital inicial insuficiente (necessário: ${BrazilHistoricalSimulationEngine.formatMoney(
          startupCost,
          world.brazil.currency
        )}).`,
      });
    }

    const validSector: BusinessSector = sector || 'Comércio';
    const companyId = `comp_player_${Date.now()}`;
    char.money -= startupCost;
    char.ownedCompanyId = companyId;
    char.careerTitle = 'Fundador(a) & Diretor(a)';
    char.careerCompany = cleanName;
    char.salary = Math.round(3200000 * scale);

    world.companies.push({
      id: companyId,
      name: cleanName,
      sector: validSector,
      countryId: 'BRA',
      headquartersCity: char.city,
      foundedYear: currentYear,
      status: 'Em Expansão',
      playerOwned: true,
      valuationBillionsBRL: 0.05,
      revenueGrowthPct: 8.5,
      employeesCount: 8,
      hiringCapacity: 60,
      minTechIndexRequired: 0,
      minYearAvailable: currentYear,
    });

    save.assets.push({
      id: `ast_comp_${Date.now()}`,
      characterId: char.id,
      type: 'Empresa',
      name: cleanName,
      value: startupCost,
      monthlyIncome: Math.round(180000 * scale),
      purchaseYear: currentYear,
    });

    save.events.push({
      id: `evt_found_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: `Empresa Fundada: ${cleanName}`,
      description: `Você empreendeu em ${char.city} fundando ${cleanName} no setor de ${validSector}.`,
      category: 'Carreira',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Server-authoritative Buy Asset via catalogId
app.post('/api/saves/:id/assets', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { catalogId } = req.body || {};
    if (!catalogId || typeof catalogId !== 'string') {
      return res.status(400).json({ error: 'catalogId obrigatório e validado pelo servidor.' });
    }
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    const currentYear = world.clock.year;

    const catalog = GlobalEconomicSimulationEngine.getAssetCatalog(world, char.city);
    const item = catalog.find((c) => c.id === catalogId);
    if (!item) {
      return res.status(400).json({ error: 'Ativo indisponível no catálogo desta época.' });
    }
    if (char.money < item.priceCentavos) {
      return res.status(400).json({ error: 'Dinheiro insuficiente para esta compra.' });
    }

    char.money -= item.priceCentavos;
    const newAsset: Asset = {
      id: `ast_${Date.now()}_${Math.floor(Math.random() * 100)}`,
      characterId: char.id,
      catalogId: item.id,
      type: item.type,
      name: item.name,
      value: item.priceCentavos,
      monthlyIncome: item.monthlyIncomeCentavos,
      purchaseYear: currentYear,
    };

    save.assets.push(newAsset);
    if (item.type === 'Imóvel') {
      char.housingStatus = 'Imóvel próprio';
      char.monthlyRentCentavos = 0;
    }
    save.events.push({
      id: `evt_ast_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: `Aquisição de ${item.type}`,
      description: `Você comprou ${item.name} por ${BrazilHistoricalSimulationEngine.formatMoney(
        item.priceCentavos,
        world.brazil.currency
      )}.`,
      category: 'Finanças',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Sell Asset
app.post('/api/saves/:id/assets/:assetId/sell', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const world = save.worldState!;
    const idx = save.assets.findIndex((a) => a.id === req.params.assetId);
    if (idx === -1) return res.status(404).json({ error: 'Bem patrimonial não encontrado.' });

    const asset = save.assets[idx];
    const saleProceeds = Math.round(asset.value * 0.92);
    save.character.money += saleProceeds;
    save.assets.splice(idx, 1);

    if (asset.type === 'Imóvel' && !save.assets.some((a) => a.type === 'Imóvel') && save.character.currentAge >= 22) {
      save.character.housingStatus = 'Aluguel';
      save.character.monthlyRentCentavos = GlobalEconomicSimulationEngine.calculateMonthlyRentCentavos(
        world,
        save.character.city
      );
    }

    const currentYear = world.clock.year;
    save.events.push({
      id: `evt_sell_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year: currentYear,
      title: `Venda de ${asset.type}`,
      description: `Você vendeu ${asset.name} por ${BrazilHistoricalSimulationEngine.formatMoney(
        saleProceeds,
        world.brazil.currency
      )}.`,
      category: 'Finanças',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Medical treatment action
app.post('/api/saves/:id/health/treat', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { treatmentId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const world = save.worldState!;
    const year = world.clock.year;
    const catalog = WorldTechnologyEngine.getAvailableMedicalTreatments(year);
    const chosen = catalog.find((t) => t.id === treatmentId) || catalog[0];

    if (!chosen) return res.status(400).json({ error: 'Tratamento indisponível nesta era.' });
    const cost = Math.round(
      chosen.costCentavos * Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier))
    );
    if (save.character.money < cost) {
      return res.status(400).json({ error: 'Dinheiro insuficiente para o tratamento médico.' });
    }

    save.character.money -= cost;
    save.character.health = Math.min(100, save.character.health + chosen.healthBoost);
    save.character.happiness = Math.min(100, save.character.happiness + 4);
    save.events.push({
      id: `evt_med_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year,
      title: 'Tratamento Médico',
      description: `Você realizou "${chosen.name}", recuperando saúde (+${chosen.healthBoost}).`,
      category: 'Saúde',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', year),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Vaccination action
app.post('/api/saves/:id/health/vaccinate', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const year = save.worldState!.clock.year;
    if (year < 1920) {
      return res.status(400).json({ error: 'Campanhas modernas de vacinação disponíveis a partir de 1920.' });
    }
    if (!save.character.vaccinatedYears) save.character.vaccinatedYears = [];
    if (!save.character.vaccinatedYears.includes(year)) {
      save.character.vaccinatedYears.push(year);
    }
    save.character.health = Math.min(100, save.character.health + 3);
    save.events.push({
      id: `evt_vac_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year,
      title: 'Vacinação em Dia',
      description: `Você atualizou sua carteira de vacinação em ${year}, reforçando proteção contra surtos.`,
      category: 'Saúde',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', year),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Family actions
app.post('/api/saves/:id/family/marry', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    if (save.character.currentAge < 18) {
      return res.status(400).json({ error: 'É preciso ter ao menos 18 anos para se casar.' });
    }
    const hasLivingSpouse = save.family.some((f) => f.relation === 'Cônjuge' && f.alive);
    if (hasLivingSpouse) {
      return res.status(400).json({ error: 'Você já possui um(a) cônjuge vivo(a).' });
    }

    const year = save.worldState!.clock.year;
    const spouse = WorldPopulationEngine.createSpouse(save, year);
    save.family.push(spouse);
    save.character.partnerId = spouse.id;
    save.character.happiness = Math.min(100, save.character.happiness + 14);
    save.events.push({
      id: `evt_marry_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year,
      title: 'Casamento',
      description: `Você se casou com ${spouse.name} em ${save.character.city}!`,
      category: 'Romance',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', year),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

app.post('/api/saves/:id/family/divorce', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      WorldPopulationEngine.divorceSpouse(save, save.worldState!.clock.year);
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json(save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Falha ao processar divórcio.' });
    }
  });
});

app.post('/api/saves/:id/family/child', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    if (save.character.currentAge < 18 || save.character.currentAge > 60) {
      return res.status(400).json({ error: 'Idade incompatível para ter filhos biológicos.' });
    }

    try {
      const year = save.worldState!.clock.year;
      const child = WorldPopulationEngine.createChild(save, year);
      save.family.push(child);
      save.character.happiness = Math.min(100, save.character.happiness + 15);
      save.events.push({
        id: `evt_child_${Date.now()}`,
        characterId: save.character.id,
        age: save.character.currentAge,
        year,
        title: `Nascimento de ${child.name}`,
        description: `Chegou seu novo(a) ${child.relation.toLowerCase()}, ${child.name}, trazendo nova geração para sua família.`,
        category: 'Família',
        truthStatus: normalizeTruthStatus('SIMULATED_EVENT', year),
      });

      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json(save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/family/adopt', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      WorldPopulationEngine.adoptChild(save, save.worldState!.clock.year);
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json(save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/family/interact', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { memberId, action } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    try {
      const validAction =
        action === 'elogiar' || action === 'ajudar' || action === 'discutir' ? action : 'conversar';
      const interactOutcome = WorldPopulationEngine.interactWithMember(
        save,
        memberId,
        validAction,
        save.worldState!.clock.year
      );
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, note: interactOutcome.effectSummary });
    } catch (err: any) {
      return res.status(404).json({ error: err.message || 'Familiar não encontrado.' });
    }
  });
});

app.post('/api/saves/:id/family/reconcile', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { memberId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      WorldPopulationEngine.reconcileWithMember(save, memberId, save.worldState!.clock.year);
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json(save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

// Multi-generational heir continuation
app.post('/api/saves/:id/continue-heir', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { heirId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    try {
      const nextSave = WorldPopulationEngine.transferLegacyToHeir(save, heirId);
      nextSave.updatedAt = Date.now();
      store[req.params.id] = nextSave;
      saveSavesStore(store);
      return res.json(nextSave);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Falha na sucessão familiar.' });
    }
  });
});

// Move to another city in Brazil
app.post('/api/saves/:id/city/move', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { cityId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const world = save.worldState!;
    const targetCity = world.brazil.cities[cityId];
    if (!targetCity) return res.status(404).json({ error: 'Cidade de destino não encontrada.' });
    if (targetCity.name === save.character.city) {
      return res.status(400).json({ error: 'Você já reside nesta cidade.' });
    }

    const scale = Math.max(0.45, Math.min(2500, world.economy.costOfLivingMultiplier));
    const movingCost = Math.round(350000 * scale);
    if (save.character.money < movingCost) {
      return res.status(400).json({ error: 'Saldo insuficiente para custear mudança interestadual.' });
    }

    save.character.money -= movingCost;
    save.character.city = targetCity.name;
    save.character.state = targetCity.state;
    const year = world.clock.year;
    save.events.push({
      id: `evt_move_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year,
      title: `Mudança para ${targetCity.name} (${targetCity.ufCode})`,
      description: `Você mudou de residência para ${targetCity.name}, ${targetCity.state}. Novo custo de vida local: índice ${targetCity.costOfLivingIndex}.`,
      category: 'Geral',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', year),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Political / Civic action
app.post('/api/saves/:id/politics/participate', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { action } = req.body || {};
    if (action !== 'vote' && action !== 'debate' && action !== 'volunteer') {
      return res.status(400).json({ error: 'Ação cívica inválida.' });
    }
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const result = PoliticalWorldEngine.participateInCivicAction(save, action);
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json({ save, message: result.message });
  });
});

// Systemic Crime & Investigation (replaces legacy binary random check with full Police/Justice pipeline)
app.post('/api/saves/:id/crime', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { offenseId, crimeType } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const world = save.worldState!;
    const currentYear = world.clock.year;
    if (save.character.status !== 'Vivo') {
      return res.status(400).json({ error: 'Ação indisponível no estado atual do personagem.' });
    }

    const mappedId =
      typeof offenseId === 'string' && SYSTEMIC_OFFENSES_CATALOG.some((o) => o.id === offenseId)
        ? offenseId
        : String(crimeType || '').toLowerCase().includes('fraud') || String(crimeType || '').toLowerCase().includes('estelion')
          ? 'off_estelionato'
          : String(crimeType || '').toLowerCase().includes('soneg')
            ? 'off_sonegacao'
            : 'off_furto_simples';

    try {
      const outcome = CrimeAndJusticeEngine.commitSystemicOffense(save, mappedId);
      save.events.push({
        id: `evt_crime_${Date.now()}`,
        characterId: save.character.id,
        age: save.character.currentAge,
        year: currentYear,
        title: outcome.detected ? 'Ocorrência Policial Registrada' : 'Infração Não Detectada',
        description: outcome.summary,
        category: outcome.detected ? 'Polícia e segurança pública' : 'Crimes e investigação',
        truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
      });

      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json(save);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Falha ao simular infração.' });
    }
  });
});

// Judicial Appeal
app.post('/api/saves/:id/crime/appeal', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { caseId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = CrimeAndJusticeEngine.fileCourtAppeal(save, String(caseId || ''));
      save.events.push({
        id: `evt_appeal_${Date.now()}`,
        characterId: save.character.id,
        age: save.character.currentAge,
        year: save.worldState!.clock.year,
        title: 'Julgamento de Recurso',
        description: message,
        category: 'Justiça e sistema prisional',
        truthStatus: normalizeTruthStatus('SIMULATED_EVENT', save.worldState!.clock.year),
      });
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

// INSS Retirement
app.post('/api/saves/:id/retire', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    if (char.isRetired) return res.status(400).json({ error: 'Você já está aposentado(a).' });
    const check = GlobalEconomicSimulationEngine.canRetire(char.currentAge, char.inssContributionYears || 0);
    if (!check.allowed) return res.status(400).json({ error: check.reason });

    const baseSal = char.salary > 0 ? char.salary : (world.brazil.minimumWageNominal || 1412) * 100 * 12;
    const pension = GlobalEconomicSimulationEngine.calculateRetirementPensionCentavos(
      baseSal,
      char.inssContributionYears || 15,
      world
    );
    char.isRetired = true;
    char.pensionCentavos = pension;
    char.careerTitle = char.careerTitle ? `${char.careerTitle} (Aposentado)` : 'Aposentado INSS';
    char.salary = 0;

    save.events.push({
      id: `evt_retire_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: world.clock.year,
      title: 'Aposentadoria Concedida (INSS)',
      description: `Benefício anual concedido de ${BrazilHistoricalSimulationEngine.formatMoney(pension, world.brazil.currency)}.`,
      category: 'Finanças e patrimônio',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', world.clock.year),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Banking: Savings, Loans, Settlement, Insurance
app.post('/api/saves/:id/banking/savings', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { amountCentavos, action } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = CivilizationSystemsEngine.depositOrWithdrawSavings(
        save,
        Number(amountCentavos),
        action === 'withdraw' ? 'withdraw' : 'deposit'
      );
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/banking/loan', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { principalCentavos, months, purpose } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = CivilizationSystemsEngine.takeBankLoan(
        save,
        Number(principalCentavos),
        Number(months || 24),
        String(purpose || 'Crédito Pessoal')
      );
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/banking/settle', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { loanId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = CivilizationSystemsEngine.settleLoanOrDebt(save, loanId);
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/insurance', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { type } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    if (!save.character.insurance) save.character.insurance = { health: false, life: false };
    if (type === 'health') save.character.insurance.health = !save.character.insurance.health;
    else if (type === 'life') save.character.insurance.life = !save.character.insurance.life;
    else return res.status(400).json({ error: 'Tipo de seguro inválido.' });
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

// Political Elections & Government Administration Mode
app.post('/api/saves/:id/politics/run', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { office, partyName } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const result = GovernanceAndPoliticsEngine.runForOffice(save, office, String(partyName || ''));
      save.events.push({
        id: `evt_elec_${Date.now()}`,
        characterId: save.character.id,
        age: save.character.currentAge,
        year: save.worldState!.clock.year,
        title: result.elected ? `Eleito(a) ${office}!` : `Resultado Eleitoral (${office})`,
        description: result.summary,
        category: 'Política e eleições',
        truthStatus: normalizeTruthStatus('SIMULATED_EVENT', save.worldState!.clock.year),
      });
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, ...result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/politics/govern', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = GovernanceAndPoliticsEngine.updateGovernmentPolicy(save, req.body || {});
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

// Civilization: Conservation, Mental Health, Religion, Event Catalog Trigger
app.post('/api/saves/:id/civilization/conservation', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { donate } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    try {
      const message = CivilizationSystemsEngine.performConservationVisitOrSupport(save, Boolean(donate));
      save.updatedAt = Date.now();
      store[req.params.id] = save;
      saveSavesStore(store);
      return res.json({ save, message });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });
});

app.post('/api/saves/:id/health/mental', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { activity } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const scale = Math.max(0.4, save.worldState!.economy.costOfLivingMultiplier || 1);
    const cost = activity === 'therapy' ? Math.round(22000 * scale) : 0;
    if (save.character.money < cost) return res.status(400).json({ error: 'Saldo insuficiente para sessão particular.' });
    save.character.money -= cost;
    save.character.mentalHealth = Math.min(100, (save.character.mentalHealth ?? 75) + (activity === 'therapy' ? 12 : 7));
    save.character.happiness = Math.min(100, save.character.happiness + 6);
    if (activity === 'sport') save.character.fitness = Math.min(100, save.character.fitness + 4);
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

app.post('/api/saves/:id/religion', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { religion } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    if (!RELIGIONS_CATALOG.includes(religion)) {
      return res.status(400).json({ error: 'Tradição religiosa ou filosófica não reconhecida.' });
    }
    save.character.religion = religion;
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

app.post('/api/saves/:id/events/trigger-catalog', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { category } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });
    const save = normalizeSave(rawSave);
    const def = EventCatalogEngine.pickContextualEventForSave(save, category);
    if (!def) {
      return res.status(404).json({ error: 'Nenhum evento elegível disponível no momento.' });
    }
    const world = save.worldState!;
    if (!world.triggeredCatalogEventIds) world.triggeredCatalogEventIds = [];
    world.triggeredCatalogEventIds.push(def.id);
    const lifeEvt = EventCatalogEngine.toLifeEvent(def, save);
    save.events.push(lifeEvt);
    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json({ save, event: lifeEvt });
  });
});

// 2D Portrait Metadata Endpoint
app.post('/api/portrait', async (req: Request, res: Response) => {
  try {
    const profile = req.body || {};
    const seed = profile.appearanceSeed || profile.characterId || 'vidareal_default';
    const appearance = CharacterAppearanceGenerator.generateFromSeed(seed, {
      characterId: profile.characterId,
      gender: profile.gender || 'Masculino',
    });
    res.json({
      status: 'READY',
      engine: '2D_BITLIFE_VECTOR',
      appearance,
      url: '',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Falha ao gerar perfil visual 2D', status: 'FAILED' });
  }
});

// Education enrollment (validated against era catalog)
app.post('/api/saves/:id/education', (req: Request, res: Response) => {
  return withSaveLock(req.params.id, () => {
    const { educationName, programId } = req.body || {};
    const store = loadSavesStore();
    const rawSave = store[req.params.id];
    if (!rawSave) return res.status(404).json({ error: 'Partida não encontrada.' });

    const save = normalizeSave(rawSave);
    const char = save.character;
    const world = save.worldState!;
    const currentYear = world.clock.year;
    const programs = SocietyEvolutionEngine.getAvailableEducationPrograms(currentYear, world);
    const chosen = programs.find((p) => (programId && p.id === programId) || p.name === educationName);
    if (!chosen) {
      return res.status(400).json({ error: 'Curso indisponível para a época atual.' });
    }
    if (char.money < chosen.costCentavos) {
      return res.status(400).json({ error: 'Saldo insuficiente para custear esta formação.' });
    }

    char.money -= chosen.costCentavos;
    char.currentEducation = chosen.name;
    char.educationProgress = 0;

    save.events.push({
      id: `evt_edu_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: 'Matrícula Realizada',
      description: `Você se matriculou em ${chosen.name} em ${currentYear}.`,
      category: 'Educação',
      truthStatus: normalizeTruthStatus('SIMULATED_EVENT', currentYear),
    });

    save.updatedAt = Date.now();
    store[req.params.id] = save;
    saveSavesStore(store);
    return res.json(save);
  });
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
  });
  app.use(vite.middlewares);
} else {
  const DIST_DIR = path.resolve(__dirname, 'dist');
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`VIDA REAL BR server running on http://0.0.0.0:${PORT}`);
});
