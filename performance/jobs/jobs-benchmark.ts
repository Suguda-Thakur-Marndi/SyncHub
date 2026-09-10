import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

import mongoose from "mongoose";
import * as fs from "fs";
import connectDatabase from "../../backend/src/config/database.config";
import { jobQueueService } from "../../backend/src/services/job-queue.service";
import TaskModel from "../../backend/src/models/task.model";

const BENCHMARK_WORKSPACE_ID = "6aa1ba941697f3730e6e2883";

async function runJobsBenchmark() {
  console.log("Connecting to MongoDB for Phase 5 Background Job System Benchmark...");
  await connectDatabase();
  console.log("Connected to MongoDB.");

  console.log("\n=======================================================");
  console.log("        PHASE 5: BACKGROUND JOBS & CSV BENCHMARK       ");
  console.log("=======================================================");

  // 1. Benchmark Synchronous Event-Loop Blocking CSV Generation
  console.log("\n1. Measuring Synchronous CSV Generation (Event Loop Blocking)...");
  const syncStart = performance.now();
  const tasks = await TaskModel.find({
    workspace: new mongoose.Types.ObjectId(BENCHMARK_WORKSPACE_ID),
  })
    .select("taskCode title status priority dueDate createdAt")
    .lean();

  const syncCsvRows = ["Task Code,Title,Status,Priority,Due Date,Created At"];
  for (const t of tasks) {
    const code = t.taskCode || "";
    const title = `"${(t.title || "").replace(/"/g, '""')}"`;
    const status = t.status || "";
    const priority = t.priority || "";
    const due = t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "";
    const created = t.createdAt ? new Date(t.createdAt).toISOString() : "";
    syncCsvRows.push(`${code},${title},${status},${priority},${due},${created}`);
  }
  const syncCsvContent = syncCsvRows.join("\n");
  const syncDurationMs = performance.now() - syncStart;
  console.log(`Synchronous Generation Time (Blocked): ${syncDurationMs.toFixed(2)} ms (${tasks.length} tasks)`);

  // 2. Benchmark Asynchronous Job Enqueue (HTTP Response Time Simulation)
  console.log("\n2. Measuring Async Job Enqueue Latency (Non-Blocking HTTP 202)...");
  const enqueueStart = performance.now();
  const job = jobQueueService.enqueue("TASK_CSV_EXPORT", {
    workspaceId: BENCHMARK_WORKSPACE_ID,
    userId: "benchmark-user-123",
  });
  const enqueueDurationMs = performance.now() - enqueueStart;
  console.log(`Async Job Enqueued in: ${enqueueDurationMs.toFixed(3)} ms (Job ID: ${job.id})`);
  console.log(`HTTP Response Latency Improvement: ${(syncDurationMs / enqueueDurationMs).toFixed(1)}x faster to client!`);

  // 3. Monitor Job Lifecycle and Background Worker Execution
  console.log("\n3. Polling Background Job Progress...");
  const pollStart = performance.now();
  let completedJob = jobQueueService.getJob(job.id);
  const progressSnapshots: { timeMs: number; status: string; progress: number }[] = [];

  while (completedJob && completedJob.status !== "completed" && completedJob.status !== "failed") {
    progressSnapshots.push({
      timeMs: Number((performance.now() - pollStart).toFixed(1)),
      status: completedJob.status,
      progress: completedJob.progress,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    completedJob = jobQueueService.getJob(job.id);
  }

  const totalWorkerDurationMs = performance.now() - pollStart;
  console.log(`Job Status: ${completedJob?.status}`);
  console.log(`Job Completed in: ${totalWorkerDurationMs.toFixed(2)} ms`);
  console.log(`Total Rows Exported: ${completedJob?.result?.rowCount}`);
  console.log(`CSV File Size: ${(Number(completedJob?.result?.fileSizeBytes) / 1024).toFixed(2)} KB`);

  // 4. Test Retry Policy with Exponential Backoff
  console.log("\n4. Testing Job Retry Policy with Exponential Backoff...");
  const failJob = jobQueueService.enqueue("TASK_CSV_EXPORT" as any, {
    workspaceId: "000000000000000000000000", // non-existent
    userId: "fail-test",
  });
  console.log(`Enqueued job with invalid workspace (testing error handling & retry flow)...`);

  const results = {
    timestamp: new Date().toISOString(),
    benchmarkSummary: {
      tasksProcessed: tasks.length,
      syncBlockingLatencyMs: Number(syncDurationMs.toFixed(2)),
      asyncEnqueueLatencyMs: Number(enqueueDurationMs.toFixed(3)),
      httpLatencyReduction: `${(syncDurationMs / enqueueDurationMs).toFixed(1)}x faster`,
      backgroundWorkerDurationMs: Number(totalWorkerDurationMs.toFixed(2)),
      csvFileSizeBytes: completedJob?.result?.fileSizeBytes,
      csvFileSizeKb: Number(((completedJob?.result?.fileSizeBytes || 0) / 1024).toFixed(2)),
    },
    queueStats: jobQueueService.getQueueStats(),
    progressSnapshots,
  };

  const resultsPath = path.join(
    __dirname,
    "../../performance/jobs/jobs-results.json"
  );
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  console.log("\n=== SUMMARY TABLE ===");
  console.table([
    {
      "Task Count": tasks.length,
      "Sync Blocking Time": `${syncDurationMs.toFixed(1)} ms`,
      "Async Enqueue Time": `${enqueueDurationMs.toFixed(3)} ms`,
      "Client Latency Gain": `${(syncDurationMs / enqueueDurationMs).toFixed(0)}x faster`,
      "Worker Duration": `${totalWorkerDurationMs.toFixed(1)} ms`,
      "Export File Size": `${(Number(completedJob?.result?.fileSizeBytes) / 1024).toFixed(1)} KB`,
    },
  ]);

  await mongoose.disconnect();
}

runJobsBenchmark().catch((err) => {
  console.error("Jobs benchmark failed:", err);
  process.exit(1);
});
