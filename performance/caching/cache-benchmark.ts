import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

import mongoose from "mongoose";
import * as fs from "fs";
import connectDatabase from "../../backend/src/config/database.config";
import { config } from "../../backend/src/config/app.config";
import { cacheService } from "../../backend/src/services/cache.service";
import { getWorkspaceAnalyticsService } from "../../backend/src/services/workspace.service";
import { getProjectAnalyticsService } from "../../backend/src/services/project.service";
import ProjectModel from "../../backend/src/models/project.model";
import WorkspaceModel from "../../backend/src/models/workspace.model";
import TaskModel from "../../backend/src/models/task.model";

const BENCHMARK_WORKSPACE_ID = "6aa1ba941697f3730e6e2883";

interface BenchmarkSummary {
  metric: string;
  coldRunLatencyMs: number;
  warmRunsAvgLatencyMs: number;
  warmRunsP95LatencyMs: number;
  speedupMultiplier: string;
  cacheHitRatio: string;
  dbCallsAvoided: number;
}

function calculatePercentile(numbers: number[], percentile: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Number(sorted[Math.max(0, index)].toFixed(2));
}

async function runCacheBenchmark() {
  console.log("Connecting to MongoDB for Phase 4 Caching Benchmarks...");
  await connectDatabase();
  console.log("Connected to MongoDB.");

  const workspace = await WorkspaceModel.findById(BENCHMARK_WORKSPACE_ID);
  if (!workspace) {
    throw new Error(`Benchmark workspace ${BENCHMARK_WORKSPACE_ID} not found.`);
  }

  const project = await ProjectModel.findOne({ workspace: workspace._id });
  if (!project) {
    throw new Error("No project found in benchmark workspace.");
  }
  const projectId = project._id.toString();

  // Reset cache and metrics
  await cacheService.flush();
  cacheService.resetMetrics();

  console.log("\n=======================================================");
  console.log("             PHASE 4: CACHE PERFORMANCE BENCHMARK     ");
  console.log("=======================================================");

  // 1. Workspace Analytics Benchmark
  console.log("\n1. Testing Workspace Analytics Caching...");
  // Flush before cold run
  await cacheService.flush();

  const coldStartWs = performance.now();
  const coldWsResult = await getWorkspaceAnalyticsService(
    BENCHMARK_WORKSPACE_ID
  );
  const coldWsLatency = performance.now() - coldStartWs;
  console.log(`Cold Run (Miss -> DB Read): ${coldWsLatency.toFixed(2)} ms`);

  const warmWsLatencies: number[] = [];
  const WARM_ITERATIONS = 200;
  for (let i = 0; i < WARM_ITERATIONS; i++) {
    const start = performance.now();
    await getWorkspaceAnalyticsService(BENCHMARK_WORKSPACE_ID);
    warmWsLatencies.push(performance.now() - start);
  }

  const warmWsAvg =
    warmWsLatencies.reduce((a, b) => a + b, 0) / warmWsLatencies.length;
  const warmWsP95 = calculatePercentile(warmWsLatencies, 95);
  console.log(
    `Warm Runs (${WARM_ITERATIONS} iterations): Avg = ${warmWsAvg.toFixed(
      3
    )} ms, p95 = ${warmWsP95.toFixed(3)} ms`
  );
  console.log(
    `Speedup: ${(coldWsLatency / warmWsAvg).toFixed(
      1
    )}x faster than direct DB query`
  );

  // 2. Project Analytics Benchmark
  console.log("\n2. Testing Project Analytics Caching...");
  await cacheService.del(`project:analytics:${BENCHMARK_WORKSPACE_ID}:${projectId}`);

  const coldStartProj = performance.now();
  await getProjectAnalyticsService(BENCHMARK_WORKSPACE_ID, projectId);
  const coldProjLatency = performance.now() - coldStartProj;
  console.log(`Cold Run (Miss -> DB Read): ${coldProjLatency.toFixed(2)} ms`);

  const warmProjLatencies: number[] = [];
  for (let i = 0; i < WARM_ITERATIONS; i++) {
    const start = performance.now();
    await getProjectAnalyticsService(BENCHMARK_WORKSPACE_ID, projectId);
    warmProjLatencies.push(performance.now() - start);
  }

  const warmProjAvg =
    warmProjLatencies.reduce((a, b) => a + b, 0) / warmProjLatencies.length;
  const warmProjP95 = calculatePercentile(warmProjLatencies, 95);
  console.log(
    `Warm Runs (${WARM_ITERATIONS} iterations): Avg = ${warmProjAvg.toFixed(
      3
    )} ms, p95 = ${warmProjP95.toFixed(3)} ms`
  );
  console.log(
    `Speedup: ${(coldProjLatency / warmProjAvg).toFixed(
      1
    )}x faster than direct DB query`
  );

  // 3. Cache Invalidation Verification
  console.log("\n3. Testing Cache Invalidation on Mutation...");
  const wsKey = `workspace:analytics:${BENCHMARK_WORKSPACE_ID}`;
  const isWsCachedBefore = (await cacheService.get(wsKey)) !== null;
  console.log(`Is Workspace Cached Before Mutation: ${isWsCachedBefore}`);

  // Invalidate
  await cacheService.del(wsKey);
  const isWsCachedAfter = (await cacheService.get(wsKey)) !== null;
  console.log(`Is Workspace Cached After Mutation Invalidation: ${isWsCachedAfter}`);

  // 4. Collect Cache Engine Metrics
  const metrics = cacheService.getMetrics();
  console.log("\n=== CACHE TELEMETRY & METRICS ===");
  console.table([
    {
      "Active Mode": metrics.activeMode,
      "Cache Hits": metrics.hits,
      "Cache Misses": metrics.misses,
      "Hit Ratio": `${(metrics.hitRatio * 100).toFixed(2)}%`,
      "DB Calls Avoided": metrics.dbCallsAvoided,
    },
  ]);

  const outputSummary: BenchmarkSummary[] = [
    {
      metric: "Workspace Analytics",
      coldRunLatencyMs: Number(coldWsLatency.toFixed(2)),
      warmRunsAvgLatencyMs: Number(warmWsAvg.toFixed(3)),
      warmRunsP95LatencyMs: Number(warmWsP95.toFixed(3)),
      speedupMultiplier: `${(coldWsLatency / warmWsAvg).toFixed(1)}x`,
      cacheHitRatio: `${(
        (WARM_ITERATIONS / (WARM_ITERATIONS + 1)) *
        100
      ).toFixed(2)}%`,
      dbCallsAvoided: WARM_ITERATIONS,
    },
    {
      metric: "Project Analytics",
      coldRunLatencyMs: Number(coldProjLatency.toFixed(2)),
      warmRunsAvgLatencyMs: Number(warmProjAvg.toFixed(3)),
      warmRunsP95LatencyMs: Number(warmProjP95.toFixed(3)),
      speedupMultiplier: `${(coldProjLatency / warmProjAvg).toFixed(1)}x`,
      cacheHitRatio: `${(
        (WARM_ITERATIONS / (WARM_ITERATIONS + 1)) *
        100
      ).toFixed(2)}%`,
      dbCallsAvoided: WARM_ITERATIONS,
    },
  ];

  const resultsPath = path.join(
    __dirname,
    "../../performance/caching/cache-results.json"
  );
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        telemetry: metrics,
        benchmarks: outputSummary,
        rawLatencies: {
          warmWsLatencies: warmWsLatencies.slice(0, 20),
          warmProjLatencies: warmProjLatencies.slice(0, 20),
        },
      },
      null,
      2
    )
  );

  console.log(`\nDetailed caching metrics saved to: ${resultsPath}`);
  await mongoose.disconnect();
}

runCacheBenchmark().catch((err) => {
  console.error("Cache benchmark failed:", err);
  process.exit(1);
});
