import { getSharedRedisClient, isRedisEnabled } from '../redis/redisClient.js';

const DEFAULT_TTL_SECONDS = 300;

export default class CacheService {
  constructor({ prefix = 'tandem', defaultTtl = DEFAULT_TTL_SECONDS } = {}) {
    this.prefix = prefix;
    this.defaultTtl = defaultTtl;
  }

  buildKey(subkey) {
    return `${this.prefix}:${subkey}`;
  }

  async get(key) {
    if (!isRedisEnabled()) return null;

    try {
      const redis = await getSharedRedisClient('cache');
      const raw = await redis.get(this.buildKey(key));
      if (raw == null) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.error(`[CacheService] get error (${key}):`, error.message);
      return null;
    }
  }

  async set(key, value, ttl) {
    if (!isRedisEnabled()) return;

    try {
      const redis = await getSharedRedisClient('cache');
      const fullKey = this.buildKey(key);
      const serialized = JSON.stringify(value);
      const resolvedTtl = ttl ?? this.defaultTtl;
      if (resolvedTtl > 0) {
        await redis.setex(fullKey, resolvedTtl, serialized);
      } else {
        await redis.set(fullKey, serialized);
      }
    } catch (error) {
      console.error(`[CacheService] set error (${key}):`, error.message);
    }
  }

  async del(key) {
    if (!isRedisEnabled()) return;

    try {
      const redis = await getSharedRedisClient('cache');
      await redis.del(this.buildKey(key));
    } catch (error) {
      console.error(`[CacheService] del error (${key}):`, error.message);
    }
  }

  async delByPattern(pattern) {
    if (!isRedisEnabled()) return;

    try {
      const redis = await getSharedRedisClient('cache');
      const fullPattern = this.buildKey(pattern);
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      console.error(`[CacheService] delByPattern error (${pattern}):`, error.message);
    }
  }

  async getOrSet(key, fetchFn, ttl) {
    if (!isRedisEnabled()) return await fetchFn();

    try {
      const cached = await this.get(key);
      if (cached != null) return cached;

      const value = await fetchFn();
      if (value != null) {
        await this.set(key, value, ttl);
      }
      return value;
    } catch (error) {
      console.error(`[CacheService] getOrSet error (${key}):`, error.message);
      return await fetchFn();
    }
  }

  async mget(keys) {
    if (!isRedisEnabled()) return keys.map(() => null);

    try {
      const redis = await getSharedRedisClient('cache');
      const fullKeys = keys.map((key) => this.buildKey(key));
      const results = await redis.mget(fullKeys);
      return results.map((raw) => (raw ? JSON.parse(raw) : null));
    } catch (error) {
      console.error(`[CacheService] mget error:`, error.message);
      return keys.map(() => null);
    }
  }

  async sadd(key, members) {
    if (!isRedisEnabled()) return 0;

    try {
      const redis = await getSharedRedisClient('cache');
      const args = Array.isArray(members) ? members : [members];
      return await redis.sadd(this.buildKey(key), args);
    } catch (error) {
      console.error(`[CacheService] sadd error (${key}):`, error.message);
      return 0;
    }
  }

  async srem(key, members) {
    if (!isRedisEnabled()) return 0;

    try {
      const redis = await getSharedRedisClient('cache');
      const args = Array.isArray(members) ? members : [members];
      return await redis.srem(this.buildKey(key), args);
    } catch (error) {
      console.error(`[CacheService] srem error (${key}):`, error.message);
      return 0;
    }
  }

  async sismember(key, member) {
    if (!isRedisEnabled()) return false;

    try {
      const redis = await getSharedRedisClient('cache');
      const result = await redis.sismember(this.buildKey(key), String(member));
      return result === 1;
    } catch (error) {
      console.error(`[CacheService] sismember error (${key}):`, error.message);
      return false;
    }
  }

  async expire(key, ttl) {
    if (!isRedisEnabled()) return false;

    try {
      const redis = await getSharedRedisClient('cache');
      return await redis.expire(this.buildKey(key), ttl);
    } catch (error) {
      console.error(`[CacheService] expire error (${key}):`, error.message);
      return false;
    }
  }

  rawClient() {
    if (!isRedisEnabled()) return null;
    return getSharedRedisClient('cache');
  }
}

export const cacheService = new CacheService();
