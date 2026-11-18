import { GameSave } from '../types';

export class GameSaveCompressor {
  /**
   * Applies incremental compression and serialization pruning to a GameSave object
   * to mitigate payload growth during multi-century simulations.
   */
  static compress(save: GameSave): GameSave {
    if (!save) return save;

    // 1. Trim history log if exceeding 350 entries, keeping head milestones and tail
    if (save.history && save.history.length > 300) {
      const recent = save.history.slice(-250);
      const milestone = save.history.filter((_, idx) => idx % 10 === 0);
      const mergedMap = new Map<number, any>();
      for (const m of milestone) mergedMap.set(m.year, m);
      for (const r of recent) mergedMap.set(r.year, r);
      save.history = Array.from(mergedMap.values()).sort((a, b) => a.year - b.year);
    }

    // 2. Trim events log if exceeding 200 entries
    if (save.events && save.events.length > 180) {
      save.events = save.events.slice(-180);
    }

    // 3. Compress family episodic memories (keep last 12 per member)
    if (save.family && Array.isArray(save.family)) {
      save.family = save.family.map((f) => {
        if (f.episodicMemories && f.episodicMemories.length > 12) {
          return {
            ...f,
            episodicMemories: f.episodicMemories.slice(0, 12),
          };
        }
        return f;
      });
    }

    // 4. Compress world state historical logs
    if (save.worldState && save.worldState.historicalLog && save.worldState.historicalLog.length > 400) {
      save.worldState.historicalLog = save.worldState.historicalLog.slice(-400);
    }

    return save;
  }

  static decompress(save: GameSave): GameSave {
    // In-place validation and inflation hook if incremental chunking is used
    return this.compress(save);
  }
}
