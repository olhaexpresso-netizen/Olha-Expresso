export const VISUAL_ENGINE_VERSION = 9;

export class CharacterVisualCache<T> {
  private cache = new Map<string, T>();
  private maxEntries: number;
  private version: number;

  constructor(maxEntries = 450, version = VISUAL_ENGINE_VERSION) {
    this.maxEntries = maxEntries;
    this.version = version;
  }

  get currentVersion(): number {
    return this.version;
  }

  /**
   * Invalidates cache if engine version changes and returns whether key matched current version.
   */
  ensureVersion(version: number): void {
    if (version !== this.version) {
      this.cache.clear();
      this.version = version;
    }
  }

  get(key: string): T | undefined {
    const val = this.cache.get(key);
    if (val !== undefined) {
      // Refresh LRU order
      this.cache.delete(key);
      this.cache.set(key, val);
    }
    return val;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  invalidateCharacter(characterId: string): number {
    let removed = 0;
    const prefix = `${characterId}|`;
    for (const k of this.cache.keys()) {
      if (k.startsWith(prefix)) {
        this.cache.delete(k);
        removed++;
      }
    }
    return removed;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const visualModelCache = new CharacterVisualCache<unknown>(500, VISUAL_ENGINE_VERSION);
