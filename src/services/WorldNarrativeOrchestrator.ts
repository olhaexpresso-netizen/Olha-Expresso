import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { GameSave, LifeEvent } from '../types';
import { normalizeTruthStatus, WorldTruthStatus } from '../types/world';
import { EventCatalogEngine } from './EventCatalogEngine';

interface FallbackPoolItem {
  minAge: number;
  maxAge: number;
  minYear?: number;
  title: string;
  description: string;
  category: LifeEvent['category'];
  choices: { id: string; text: string; effectDescription: string }[];
}

const CONTEXTUAL_FALLBACK_POOL: FallbackPoolItem[] = [
  {
    minAge: 0,
    maxAge: 11,
    title: 'Brincadeiras na Vizinhança e Escola',
    description:
      'Entre tarefas escolares e amizades no bairro, você descobre novos interesses que moldam sua personalidade.',
    category: 'Família',
    choices: [
      { id: 'a', text: 'Dedicar tempo aos livros e lições de casa', effectDescription: 'Aumenta inteligência e disciplina.' },
      { id: 'b', text: 'Passar a tarde jogando bola e socializando', effectDescription: 'Aumenta felicidade, saúde e carisma.' },
      { id: 'c', text: 'Ajudar nas tarefas da família em casa', effectDescription: 'Fortalece laços familiares e disciplina.' },
    ],
  },
  {
    minAge: 12,
    maxAge: 24,
    title: 'Encruzilhada da Juventude Brasileira',
    description:
      'Pressões sobre futuro profissional, estudos e relações pessoais se intensificam nesta fase decisiva.',
    category: 'Educação',
    choices: [
      { id: 'a', text: 'Focar integralmente em cursos e qualificação', effectDescription: 'Melhora inteligência e preparação para carreira.' },
      { id: 'b', text: 'Equilibrar amizades, cultura e lazer', effectDescription: 'Aumenta felicidade e rede de contatos.' },
      { id: 'c', text: 'Buscar trabalho ou bico para independência financeira', effectDescription: 'Gera renda extra e experiência prática.' },
    ],
  },
  {
    minAge: 18,
    maxAge: 90,
    title: 'Pressão do Custo de Vida e Orçamento',
    description:
      'Variações nos preços de alimentos, moradia e juros exigem decisões estratégicas para manter o equilíbrio financeiro.',
    category: 'Finanças',
    choices: [
      { id: 'a', text: 'Reorganizar gastos e reforçar a reserva', effectDescription: 'Aumenta disciplina e protege finanças.' },
      { id: 'b', text: 'Manter a qualidade de vida e lazer com a família', effectDescription: 'Mantém felicidade alta.' },
      { id: 'c', text: 'Assumir projeto extra ou renda complementar', effectDescription: 'Renda extra e ganho de habilidade profissional.' },
    ],
  },
  {
    minAge: 18,
    maxAge: 85,
    minYear: 1995,
    title: 'Transformação Digital no Trabalho',
    description:
      'Novas ferramentas digitais transformam rotinas profissionais e exigem adaptação contínua na sua cidade.',
    category: 'Tecnologia',
    choices: [
      { id: 'a', text: 'Aprender as novas ferramentas e liderar a mudança', effectDescription: 'Eleva habilidade profissional e inteligência.' },
      { id: 'b', text: 'Manter a rotina tradicional com cautela', effectDescription: 'Preserva estabilidade emocional.' },
      { id: 'c', text: 'Explorar novos negócios ou freelances digitais', effectDescription: 'Chance de ganho financeiro extra.' },
    ],
  },
];

// Bounded LRU cache (max 100 entries) to save AI quota on repeated contexts
const NARRATIVE_CACHE = new Map<string, LifeEvent>();
const MAX_CACHE_ENTRIES = 100;
const AI_TIMEOUT_MS = 12000;
const AI_COOLDOWN_MS = 45000;
let aiCooldownUntil = 0;

export interface NarrativeMetrics {
  requests: number;
  cacheHits: number;
  aiSuccess: number;
  fallbacks: number;
  anachronismsBlocked: number;
}

const METRICS: NarrativeMetrics = {
  requests: 0,
  cacheHits: 0,
  aiSuccess: 0,
  fallbacks: 0,
  anachronismsBlocked: 0,
};

export class WorldNarrativeOrchestrator {
  static getMetrics(): NarrativeMetrics {
    return { ...METRICS };
  }

  static resetMetricsForTests(): void {
    METRICS.requests = 0;
    METRICS.cacheHits = 0;
    METRICS.aiSuccess = 0;
    METRICS.fallbacks = 0;
    METRICS.anachronismsBlocked = 0;
    aiCooldownUntil = 0;
    NARRATIVE_CACHE.clear();
  }

  static async generateContextualEvent(
    save: GameSave,
    aiClient: GoogleGenAI | null
  ): Promise<LifeEvent> {
    METRICS.requests += 1;
    const char = save.character;
    const world = save.worldState;
    const currentYear = world?.clock.year ?? char.birthYear + char.currentAge;
    const truthStatus: WorldTruthStatus = normalizeTruthStatus(
      currentYear <= 2026 ? 'SIMULATED_EVENT' : 'FUTURE_PROJECTION',
      currentYear
    );

    const buildDeterministicFallback = (): LifeEvent => {
      METRICS.fallbacks += 1;

      // Primary rich fallback: 11,940+ indexed EventCatalogEngine
      const catalogDef = EventCatalogEngine.pickContextualEventForSave(save);
      if (catalogDef) {
        if (world) {
          if (!world.triggeredCatalogEventIds) world.triggeredCatalogEventIds = [];
          world.triggeredCatalogEventIds.push(catalogDef.id);
          if (world.triggeredCatalogEventIds.length > 400) {
            world.triggeredCatalogEventIds = world.triggeredCatalogEventIds.slice(-400);
          }
          if (catalogDef.chainedNextIds?.length) {
            if (!world.pendingChainedCatalogIds) world.pendingChainedCatalogIds = [];
            world.pendingChainedCatalogIds.push(...catalogDef.chainedNextIds);
            world.pendingChainedCatalogIds = world.pendingChainedCatalogIds.slice(-20);
          }
        }
        return EventCatalogEngine.toLifeEvent(catalogDef, save);
      }

      const eligible = CONTEXTUAL_FALLBACK_POOL.filter(
        (item) =>
          char.currentAge >= item.minAge &&
          char.currentAge <= item.maxAge &&
          (!item.minYear || currentYear >= item.minYear)
      );
      const list = eligible.length > 0 ? eligible : CONTEXTUAL_FALLBACK_POOL;
      const idx = Math.abs((currentYear * 13 + char.currentAge * 7 + save.events.length) % list.length);
      const picked = list[idx];

      const worldNote = world
        ? `${world.brazil.phaseLabel} (${currentYear}) · Moeda: ${world.brazil.currency.name} · Ciclo: ${world.economy.cyclePhase}`
        : undefined;

      return {
        id: `evt_ctx_${currentYear}_${Date.now()}`,
        characterId: char.id,
        age: char.currentAge,
        year: currentYear,
        month: world?.clock.month ?? 1,
        day: world?.clock.day ?? 1,
        title: picked.title,
        description: `${picked.description}${
          world
            ? ` Em ${char.city}, o Brasil vive ${world.brazil.phaseLabel} com inflação anual de ${world.brazil.annualInflationRate}%.`
            : ''
        }`,
        category: picked.category,
        truthStatus,
        worldContextNote: worldNote,
        choices: picked.choices,
      };
    };

    if (!aiClient || !world || Date.now() < aiCooldownUntil) {
      return buildDeterministicFallback();
    }

    const cacheKey = `${currentYear}_${Math.floor(char.currentAge / 3)}_${char.careerTitle || 'none'}_${char.politics?.office || 'cidadao'}_${char.status}_${char.city}_${save.events.length % 5}`;
    const cached = NARRATIVE_CACHE.get(cacheKey);
    if (cached) {
      METRICS.cacheHits += 1;
      NARRATIVE_CACHE.delete(cacheKey);
      NARRATIVE_CACHE.set(cacheKey, cached);
      return {
        ...cached,
        id: `evt_ai_cache_${currentYear}_${Date.now()}`,
        characterId: char.id,
        age: char.currentAge,
      };
    }

    const unlockedTechNames = world.technology.recentBreakthroughs
      .map((t) => `${t.name} (${t.year})`)
      .slice(-3)
      .join(', ');
    const recentHistorical = world.historicalLog
      .filter((h) => h.year <= currentYear && h.year >= currentYear - 2)
      .map((h) => `${h.year}: ${h.title}`)
      .slice(0, 2)
      .join('; ');
    const activeWar = world.civilization?.activeWarsAndSanctions?.[0]?.title;

    const rawPrompt = `Narrador do simulador histórico brasileiro VIDA REAL BR em ${currentYear} (${world.clock.season}).
Regras: proibido citar tecnologias/fatos após ${currentYear}; moeda vigente: ${world.brazil.currency.name} (${world.brazil.currency.symbol}); ${currentYear <= 2026 ? 'contexto histórico fiel' : 'projeção futura simulada'}.
Brasil: ${world.brazil.phaseLabel}, governo ${world.brazil.currentGovernment.leaderName}, inflação ${world.brazil.annualInflationRate}%, PIB ${world.brazil.gdpGrowthRate}%, economia ${world.economy.cyclePhase}${activeWar ? `, ${activeWar}` : ''}.
Tech até ${currentYear}: ${unlockedTechNames || 'época tradicional'}. Fatos: ${recentHistorical || 'rotina estável'}.
Personagem: ${char.firstName} ${char.lastName}, ${char.currentAge} anos, ${char.gender}, ${char.city}/${char.state}, ${char.politics?.office && char.politics.office !== 'Nenhum' ? char.politics.office : char.careerTitle || (char.currentAge < 18 ? 'Estudante' : 'Autônomo')}.
Crie 1 evento curto e realista em PT-BR com 3 escolhas práticas.`;

    const MAX_ATTEMPTS = 2; // Bounded retry for transient errors / anachronisms only (no retry on timeout)
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const aiPromise = aiClient.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: rawPrompt,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: {
              type: Type.OBJECT,
              required: ['title', 'description', 'category', 'choices'],
              properties: {
                title: { type: Type.STRING, description: 'Título curto (máx 60 caracteres)' },
                description: { type: Type.STRING, description: 'Cena curta situada no ano atual (máx 260 caracteres)' },
                category: {
                  type: Type.STRING,
                  description: 'Uma de: Família, Educação, Carreira, Finanças, Saúde, Romance, Mundo, Política, Tecnologia, Cultura, Geral',
                },
                choices: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['id', 'text', 'effectDescription'],
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING },
                      effectDescription: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Gemini narrative timeout (${AI_TIMEOUT_MS}ms)`)), AI_TIMEOUT_MS);
        });

        const response = await Promise.race([aiPromise, timeoutPromise]);
        const raw = response.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          const textCheck = `${parsed.title || ''} ${parsed.description || ''}`.toLowerCase();

          const anachronismDetected =
            (currentYear < 1995 && /(internet|smartphone|whatsapp|pix|tiktok|instagram|chatgpt|uber|netflix|bitcoin)/i.test(textCheck)) ||
            (currentYear < 1994 && /\bplano real\b|\bmoeda real\b/i.test(textCheck)) ||
            (currentYear < 1960 && /\bbrasília\b|\bditadura militar\b|\btropicalia\b/i.test(textCheck));

          if (anachronismDetected) {
            METRICS.anachronismsBlocked += 1;
            continue;
          }

          if (parsed.title && parsed.description) {
            METRICS.aiSuccess += 1;
            const validChoices =
              Array.isArray(parsed.choices) && parsed.choices.length > 0
                ? parsed.choices.slice(0, 3)
                : buildDeterministicFallback().choices;

            const evt: LifeEvent = {
              id: `evt_ai_${currentYear}_${Date.now()}`,
              characterId: char.id,
              age: char.currentAge,
              year: currentYear,
              month: world.clock.month,
              day: world.clock.day,
              title: String(parsed.title).slice(0, 80),
              description: String(parsed.description),
              category: parsed.category || 'Geral',
              truthStatus,
              worldContextNote: `${world.brazil.phaseLabel} (${currentYear}) · ${world.brazil.currentGovernment.leaderName}`,
              choices: validChoices,
            };

            if (NARRATIVE_CACHE.size >= MAX_CACHE_ENTRIES) {
              const oldest = NARRATIVE_CACHE.keys().next().value;
              if (oldest) NARRATIVE_CACHE.delete(oldest);
            }
            NARRATIVE_CACHE.set(cacheKey, evt);
            return evt;
          }
        }
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        const isTimeout = msg.toLowerCase().includes('timeout');
        if (isTimeout) {
          aiCooldownUntil = Date.now() + AI_COOLDOWN_MS;
          break; // Immediately fall back to EventCatalogEngine instead of stalling another cycle
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 250 * attempt));
        } else {
          aiCooldownUntil = Date.now() + 15000;
          console.warn('WorldNarrativeOrchestrator AI fallback activated:', msg);
        }
      } finally {
        if (timer) clearTimeout(timer);
      }
    }

    return buildDeterministicFallback();
  }
}
