import Redis from "ioredis";
import { config } from "../config/app.config";

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  dbCallsAvoided: number;
  hitRatio: number;
  isRedisConnected: boolean;
  activeMode: "redis" | "memory-fallback";
  memoryCacheKeysCount: number;
}

interface MemoryCacheEntry {
  value: string;
  expiresAt: number | null;
}

class CacheService {
  private redisClient: Redis | null = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, MemoryCacheEntry>();

  private hits = 0;
  private misses = 0;
  private sets = 0;
  private deletes = 0;

  constructor() {
    this.initRedis();
  }

  private initRedis() {
    try {
      const redisOptions = {
        host: config.REDIS_HOST,
        port: parseInt(config.REDIS_PORT || "6379", 10),
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: (times: number) => {
          if (times > 3) return null; // Don't loop endlessly if Redis isn't running
          return 2000;
        },
      };

      this.redisClient = config.REDIS_URL
        ? new Redis(config.REDIS_URL, {
            lazyConnect: true,
            enableOfflineQueue: false,
            maxRetriesPerRequest: 1,
          })
        : new Redis(redisOptions);

      this.redisClient.on("connect", () => {
        this.isRedisConnected = true;
        console.log("[CacheService] Connected to Redis server");
      });

      this.redisClient.on("ready", () => {
        this.isRedisConnected = true;
      });

      this.redisClient.on("error", (err) => {
        if (this.isRedisConnected) {
          console.warn("[CacheService] Redis connection error:", err.message);
        }
        this.isRedisConnected = false;
      });

      this.redisClient.on("close", () => {
        this.isRedisConnected = false;
      });

      // Attempt initial connection asynchronously
      this.redisClient.connect().catch(() => {
        this.isRedisConnected = false;
        console.log(
          "[CacheService] Redis offline. Operating with resilient in-memory fallback cache."
        );
      });
    } catch (err: any) {
      console.warn(
        "[CacheService] Failed to initialize Redis client:",
        err?.message
      );
      this.isRedisConnected = false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.hits++;
          return JSON.parse(raw) as T;
        }
        this.misses++;
        return null;
      } catch (err) {
        console.warn(
          `[CacheService] Redis GET error for key "${key}", falling back to memory:`,
          err
        );
        this.isRedisConnected = false;
      }
    }

    // Memory Fallback
    const entry = this.memoryCache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return JSON.parse(entry.value) as T;
  }

  public async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = 60
  ): Promise<void> {
    this.sets++;
    const serialized = JSON.stringify(value);

    if (this.isRedisConnected && this.redisClient) {
      try {
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, "EX", ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return;
      } catch (err) {
        console.warn(
          `[CacheService] Redis SET error for key "${key}", falling back to memory:`,
          err
        );
        this.isRedisConnected = false;
      }
    }

    // Memory Fallback
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value: serialized, expiresAt });
  }

  public async del(key: string): Promise<void> {
    this.deletes++;
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        console.warn(`[CacheService] Redis DEL error for key "${key}":`, err);
      }
    }

    this.memoryCache.delete(key);
  }

  public async delByPattern(pattern: string): Promise<void> {
    this.deletes++;
    if (this.isRedisConnected && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err) {
        console.warn(
          `[CacheService] Redis DEL by pattern "${pattern}" error:`,
          err
        );
      }
    }

    // Memory fallback pattern matching (regex support)
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  public async flush(): Promise<void> {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err) {
        console.warn("[CacheService] Redis FLUSHDB error:", err);
      }
    }
    this.memoryCache.clear();
  }

  public getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      deletes: this.deletes,
      dbCallsAvoided: this.hits,
      hitRatio: Number(hitRatio.toFixed(4)),
      isRedisConnected: this.isRedisConnected,
      activeMode: this.isRedisConnected ? "redis" : "memory-fallback",
      memoryCacheKeysCount: this.memoryCache.size,
    };
  }

  public resetMetrics(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
  }
}

export const cacheService = new CacheService();
