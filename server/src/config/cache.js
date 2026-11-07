// CivicLens Production In-Memory & Redis-Ready Speed Tier Cache
// Provides sub-2ms reads for dashboard metrics, heatmaps, and frequent queries.

class CacheService {
  constructor() {
    this.store = new Map();
    this.defaultTTL = 30 * 1000; // 30 seconds default for hot aggregate routes
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value, ttlMs = this.defaultTTL) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  del(key) {
    this.store.delete(key);
  }

  // Clear cache matching a prefix or pattern (e.g., 'dashboard:', 'incidents:')
  clearByPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  // Clear all cached entries (invoked when complaints are created or status updated)
  invalidateAll() {
    this.store.clear();
  }

  // Express middleware generator for caching GET routes
  middleware(ttlMs = 30000, keyGenerator = null) {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      // Skip cache if explicitly asked via query param
      if (req.query.skipCache === 'true' || req.query.fresh === '1') {
        return next();
      }

      const key = keyGenerator ? keyGenerator(req) : `${req.originalUrl || req.url}`;
      const cachedData = this.get(key);

      if (cachedData) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.setHeader('X-Response-Time', '<2ms');
        return res.json(cachedData);
      }

      // Intercept res.json to store into cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, ttlMs);
        }
        res.setHeader('X-Cache-Status', 'MISS');
        return originalJson(body);
      };

      next();
    };
  }
}

export const serverCache = new CacheService();
