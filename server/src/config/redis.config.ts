import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      console.warn("[REDIS WARN] Max retries reached. Redis operations will fall back gracefully.");
      return null;
    }
    return Math.min(times * 100, 2000);
  },
});

let isRedisConnected = false;

redis.on("connect", () => {
  isRedisConnected = true;
  console.log("[REDIS SUCCESS] Connected to Redis successfully.");
});

redis.on("error", (err) => {
  isRedisConnected = false;
  console.warn("[REDIS NOTICE] Redis client error or server unreachable:", err.message);
});

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (redis.status !== "ready" && redis.status !== "connecting") {
      await redis.connect().catch(() => { });
    }
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
  } catch (err) {
    console.warn(`[REDIS CACHE READ ERROR] Key "${key}":`, (err as Error).message);
  }
  return null;
};

export const setCache = async (key: string, data: any, ttlSeconds: number = 300): Promise<void> => {
  try {
    if (redis.status !== "ready" && redis.status !== "connecting") {
      await redis.connect().catch(() => { });
    }
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    console.log(`[REDIS CACHE SET] Key: "${key}" (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    console.warn(`[REDIS CACHE WRITE ERROR] Key "${key}":`, (err as Error).message);
  }
};

export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (redis.status !== "ready" && redis.status !== "connecting") {
      await redis.connect().catch(() => { });
    }
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[REDIS INVALIDATE] Cleared ${keys.length} keys matching pattern "${pattern}"`);
    }
  } catch (err) {
    console.warn(`[REDIS CACHE INVALIDATE ERROR] Pattern "${pattern}":`, (err as Error).message);
  }
};
