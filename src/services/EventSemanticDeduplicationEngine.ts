import { CatalogEventDefinition, EventCatalogCategory } from '../types';

export interface EventFingerprint {
  id: string;
  normalizedTitle: string;
  normalizedDescription: string;
  category: EventCatalogCategory;
  subcategory: string;
  tokenSet: Set<string>;
  choiceSignature: string;
}

export interface CatalogAuditReport {
  originalCount: number;
  exactDuplicates: number;
  semanticDuplicatesConfirmed: number;
  recordsDiscarded: number;
  recordsConsolidated: number;
  recordsPreserved: number;
  trulyUniqueRecords: number;
  incompleteRecords: number;
  correctedRecords: number;
  categoryBreakdown: Record<EventCatalogCategory, { original: number; unique: number; duplicates: number }>;
  auditLogs: string[];
}

export class EventFingerprintEngine {
  static normalizeText(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static tokenize(text: string): Set<string> {
    const norm = this.normalizeText(text);
    const stopWords = new Set([
      'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para',
      'com', 'um', 'uma', 'uns', 'umas', 'e', 'o', 'a', 'os', 'as', 'que', 'se', 'ao',
      'aos', 'ou', 'como', 'mas', 'foi', 'ser', 'ter', 'sua', 'seu', 'suas', 'seus',
    ]);
    const words = norm.split(' ').filter((w) => w.length > 2 && !stopWords.has(w));
    return new Set(words);
  }

  static createFingerprint(def: CatalogEventDefinition): EventFingerprint {
    const normTitle = this.normalizeText(def.title.replace(/#\d+$/, '').replace(/\(.*?\)/g, ''));
    const normDesc = this.normalizeText(def.description.replace(/^Em .*?, no contexto de .*?, /, ''));
    const combinedText = `${normTitle} ${normDesc}`;
    const tokenSet = this.tokenize(combinedText);

    const choiceSig = (def.choices || [])
      .map((c) => `${c.id}:${this.normalizeText(c.text).slice(0, 15)}`)
      .sort()
      .join('|');

    return {
      id: def.id,
      normalizedTitle: normTitle,
      normalizedDescription: normDesc,
      category: def.category,
      subcategory: def.subcategory || 'Geral',
      tokenSet,
      choiceSignature: choiceSig,
    };
  }
}

export class EventSimilarityAnalyzer {
  static computeJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 && setB.size === 0) return 1.0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }

  static areSemanticallyEquivalent(fpA: EventFingerprint, fpB: EventFingerprint, threshold = 0.82): boolean {
    if (fpA.category !== fpB.category) return false;
    if (fpA.normalizedTitle === fpB.normalizedTitle) return true;

    const jaccard = this.computeJaccardSimilarity(fpA.tokenSet, fpB.tokenSet);
    if (jaccard >= threshold && fpA.choiceSignature === fpB.choiceSignature) {
      return true;
    }
    return false;
  }
}

export class EventSemanticDeduplicationEngine {
  static auditAndDeduplicate(events: CatalogEventDefinition[]): {
    deduplicatedEvents: CatalogEventDefinition[];
    report: CatalogAuditReport;
  } {
    const originalCount = events.length;
    const auditLogs: string[] = [];
    const fingerprints = events.map((e) => EventFingerprintEngine.createFingerprint(e));

    const exactIdMap = new Map<string, CatalogEventDefinition>();
    let exactDuplicates = 0;
    let incompleteRecords = 0;
    let correctedRecords = 0;

    const validEvents: CatalogEventDefinition[] = [];

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const fp = fingerprints[i];

      // Validate completeness
      let isValid = true;
      let needsCorrection = false;
      if (!ev.id || !ev.title || !ev.description || !ev.choices || ev.choices.length < 2) {
        incompleteRecords++;
        isValid = false;
      }

      if (exactIdMap.has(ev.id)) {
        exactDuplicates++;
        isValid = false;
      }

      if (!isValid) {
        if (ev.id && ev.title && ev.description && ev.choices?.length >= 2 && !exactIdMap.has(ev.id)) {
          // Recoverable
          correctedRecords++;
        } else {
          auditLogs.push(`Descartado registro incompleto ou ID duplicado: ${ev.id}`);
          continue;
        }
      }

      if (ev.id) exactIdMap.set(ev.id, ev);
      validEvents.push(ev);
    }

    // Semantic deduplication pass
    const preserved: CatalogEventDefinition[] = [];
    const validFps = validEvents.map((e) => EventFingerprintEngine.createFingerprint(e));
    const semanticDuplicatesConfirmed = new Set<string>();

    const categoryStats = {} as Record<EventCatalogCategory, { original: number; unique: number; duplicates: number }>;

    for (const ev of validEvents) {
      const cat = ev.category;
      if (!categoryStats[cat]) categoryStats[cat] = { original: 0, unique: 0, duplicates: 0 };
      categoryStats[cat].original++;
    }

    for (let i = 0; i < validEvents.length; i++) {
      const evA = validEvents[i];
      const fpA = validFps[i];
      let isDuplicate = false;

      for (let j = 0; j < preserved.length; j++) {
        const evB = preserved[j];
        const fpB = validFps[validEvents.indexOf(evB)];

        if (EventSimilarityAnalyzer.areSemanticallyEquivalent(fpA, fpB, 0.85)) {
          isDuplicate = true;
          semanticDuplicatesConfirmed.add(evA.id);
          auditLogs.push(`Duplicidade semântica confirmada: [${evA.id}] "${evA.title}" assemelha-se a [${evB.id}] "${evB.title}"`);
          break;
        }
      }

      if (!isDuplicate) {
        preserved.push(evA);
        categoryStats[evA.category].unique++;
      } else {
        categoryStats[evA.category].duplicates++;
      }
    }

    for (const cat of Object.keys(categoryStats) as EventCatalogCategory[]) {
      const st = categoryStats[cat];
      auditLogs.push(`Categoria [${cat}]: Original=${st.original}, Únicos=${st.unique}, Duplicatas=${st.duplicates}`);
    }

    const recordsDiscarded = exactDuplicates + semanticDuplicatesConfirmed.size;
    const recordsConsolidated = semanticDuplicatesConfirmed.size;
    const recordsPreserved = preserved.length;

    const report: CatalogAuditReport = {
      originalCount,
      exactDuplicates,
      semanticDuplicatesConfirmed: semanticDuplicatesConfirmed.size,
      recordsDiscarded,
      recordsConsolidated,
      recordsPreserved,
      trulyUniqueRecords: recordsPreserved,
      incompleteRecords,
      correctedRecords,
      categoryBreakdown: categoryStats,
      auditLogs,
    };

    return {
      deduplicatedEvents: preserved,
      report,
    };
  }
}
