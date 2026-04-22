/**
 * Caching layer for estimation engine
 * Optimizes repeated estimates for same category/area combinations
 * Useful for dashboard previews, bulk operations, analytics
 */

interface CacheEntry {
  estimate: any;
  timestamp: number;
  ttlMs: number;
}

class EstimationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 3600000; // 1 hour

  private getCacheKey(
    categoryId: number,
    areaId: number,
    answers: Record<string, any>
  ): string {
    const answerKey = Object.entries(answers)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
      .join("|");
    return `${categoryId}:${areaId}:${answerKey}`;
  }

  get(
    categoryId: number,
    areaId: number,
    answers: Record<string, any>
  ): any | null {
    const key = this.getCacheKey(categoryId, areaId, answers);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.estimate;
  }

  set(
    categoryId: number,
    areaId: number,
    answers: Record<string, any>,
    estimate: any,
    ttlMs?: number
  ): void {
    const key = this.getCacheKey(categoryId, areaId, answers);
    this.cache.set(key, {
      estimate,
      timestamp: Date.now(),
      ttlMs: ttlMs || this.defaultTTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  stats() {
    return {
      entries: this.cache.size,
      expired: Array.from(this.cache.values()).filter(
        (e) => Date.now() - e.timestamp > e.ttlMs
      ).length,
    };
  }
}

export const estimationCache = new EstimationCache();
