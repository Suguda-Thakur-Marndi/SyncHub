import { describe, it, expect, beforeEach } from "vitest";
import { cacheService } from "../services/cache.service";

describe("Cache-Aside Service & Invalidation Unit Tests", () => {
  beforeEach(async () => {
    await cacheService.flush();
    cacheService.resetMetrics();
  });

  it("should set and retrieve values from cache", async () => {
    const key = "test:user:123";
    const data = { name: "Bob", role: "ADMIN" };

    await cacheService.set(key, data, 10);
    const retrieved = await cacheService.get<typeof data>(key);

    expect(retrieved).toEqual(data);
  });

  it("should return null on cache miss and record telemetry metrics", async () => {
    const result = await cacheService.get("non-existent-key");
    expect(result).toBeNull();

    const metrics = cacheService.getMetrics();
    expect(metrics.misses).toBe(1);
    expect(metrics.hits).toBe(0);
  });

  it("should delete cached keys individually", async () => {
    const key = "test:delete:key";
    await cacheService.set(key, { active: true }, 60);

    const before = await cacheService.get(key);
    expect(before).not.toBeNull();

    await cacheService.del(key);
    const after = await cacheService.get(key);
    expect(after).toBeNull();
  });

  it("should delete keys matching wildcard pattern", async () => {
    await cacheService.set("workspace:analytics:ws1", { count: 10 }, 60);
    await cacheService.set("workspace:analytics:ws2", { count: 20 }, 60);
    await cacheService.set("project:analytics:ws1:p1", { count: 5 }, 60);

    await cacheService.delByPattern("workspace:analytics:*");

    expect(await cacheService.get("workspace:analytics:ws1")).toBeNull();
    expect(await cacheService.get("workspace:analytics:ws2")).toBeNull();
    expect(await cacheService.get("project:analytics:ws1:p1")).not.toBeNull();
  });

  it("should accurately compute hit ratio and dbCallsAvoided", async () => {
    const key = "metric:test";
    await cacheService.set(key, { value: 42 });

    await cacheService.get(key); // Hit 1
    await cacheService.get(key); // Hit 2
    await cacheService.get(key); // Hit 3
    await cacheService.get("miss:1"); // Miss 1

    const metrics = cacheService.getMetrics();
    expect(metrics.hits).toBe(3);
    expect(metrics.misses).toBe(1);
    expect(metrics.dbCallsAvoided).toBe(3);
    expect(metrics.hitRatio).toBe(0.75); // 3 / 4 = 75%
  });
});
