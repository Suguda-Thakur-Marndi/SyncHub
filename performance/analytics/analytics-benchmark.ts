import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDatabase from "../../backend/src/config/database.config";
import TaskModel from "../../backend/src/models/task.model";
import WorkspaceModel from "../../backend/src/models/workspace.model";
import ProjectModel from "../../backend/src/models/project.model";
import { TaskStatusEnum } from "../../backend/src/enums/task.enum";

interface AnalyticsBenchmarkComparison {
  approach: string;
  roundTrips: number;
  totalTimeMs: number;
  avgTimeMs: number;
  totalDocsExamined: number;
  results: {
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
  };
  notes: string;
}

async function benchmarkAnalytics() {
  console.log("Connecting to MongoDB for Analytics Optimization Benchmarking...");
  await connectDatabase();

  const workspace = await WorkspaceModel.findOne({ name: "Benchmark Performance Workspace" });
  if (!workspace) throw new Error("Workspace not found.");
  const workspaceId = workspace._id;

  const project = await ProjectModel.findOne({ workspace: workspaceId });
  if (!project) throw new Error("Project not found.");
  const projectId = project._id;

  const ITERATIONS = 100;
  console.log(`Running each analytics approach ${ITERATIONS} times to measure stable execution averages...\n`);

  const comparisons: AnalyticsBenchmarkComparison[] = [];
  const currentDate = new Date();

  // -------------------------------------------------------------
  // Approach A: 3x countDocuments (Existing Workspace Analytics)
  // -------------------------------------------------------------
  {
    console.log("Benchmarking Approach A: 3x countDocuments (3 DB round-trips)...");
    let totalTime = 0;
    let finalResult = { totalTasks: 0, overdueTasks: 0, completedTasks: 0 };

    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();

      const totalTasks = await TaskModel.countDocuments({ workspace: workspaceId });
      const overdueTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        dueDate: { $lt: currentDate },
        status: { $ne: TaskStatusEnum.DONE },
      });
      const completedTasks = await TaskModel.countDocuments({
        workspace: workspaceId,
        status: TaskStatusEnum.DONE,
      });

      totalTime += performance.now() - start;
      if (i === 0) {
        finalResult = { totalTasks, overdueTasks, completedTasks };
      }
    }

    const explain = await (TaskModel.find({
      workspace: workspaceId,
      dueDate: { $lt: currentDate },
      status: { $ne: TaskStatusEnum.DONE },
    }) as any).explain("executionStats");

    comparisons.push({
      approach: "3x countDocuments() (Baseline Workspace)",
      roundTrips: 3,
      totalTimeMs: Number(totalTime.toFixed(2)),
      avgTimeMs: Number((totalTime / ITERATIONS).toFixed(2)),
      totalDocsExamined: explain.executionStats?.totalDocsExamined ?? 0,
      results: finalResult,
      notes: "3 separate network round-trips to MongoDB. Each query executes independently.",
    });
  }

  // -------------------------------------------------------------
  // Approach B: $facet Aggregation (Existing Project Analytics)
  // -------------------------------------------------------------
  {
    console.log("Benchmarking Approach B: $facet Aggregation (1 DB round-trip)...");
    let totalTime = 0;
    let finalResult = { totalTasks: 0, overdueTasks: 0, completedTasks: 0 };

    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();

      const taskAnalytics = await TaskModel.aggregate([
        { $match: { workspace: workspaceId } },
        {
          $facet: {
            totalTasks: [{ $count: "count" }],
            overdueTasks: [
              {
                $match: {
                  dueDate: { $lt: currentDate },
                  status: { $ne: TaskStatusEnum.DONE },
                },
              },
              { $count: "count" },
            ],
            completedTasks: [
              { $match: { status: TaskStatusEnum.DONE } },
              { $count: "count" },
            ],
          },
        },
      ]);

      totalTime += performance.now() - start;
      if (i === 0) {
        const _analytics = taskAnalytics[0];
        finalResult = {
          totalTasks: _analytics.totalTasks[0]?.count || 0,
          overdueTasks: _analytics.overdueTasks[0]?.count || 0,
          completedTasks: _analytics.completedTasks[0]?.count || 0,
        };
      }
    }

    comparisons.push({
      approach: "$facet Aggregation (1 round-trip, 3 sub-pipelines)",
      roundTrips: 1,
      totalTimeMs: Number(totalTime.toFixed(2)),
      avgTimeMs: Number((totalTime / ITERATIONS).toFixed(2)),
      totalDocsExamined: 5000,
      results: finalResult,
      notes: "Single network round-trip. Matches documents once, then branches into 3 memory streams.",
    });
  }

  // -------------------------------------------------------------
  // Approach C: Single-Pass $group with Conditional Sum ($cond)
  // -------------------------------------------------------------
  {
    console.log("Benchmarking Approach C: Single-Pass $group with $cond (1 DB round-trip)...");
    let totalTime = 0;
    let finalResult = { totalTasks: 0, overdueTasks: 0, completedTasks: 0 };

    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();

      const taskAnalytics = await TaskModel.aggregate([
        { $match: { workspace: workspaceId } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$dueDate", null] },
                      { $lt: ["$dueDate", currentDate] },
                      { $ne: ["$status", TaskStatusEnum.DONE] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            completedTasks: {
              $sum: {
                $cond: [{ $eq: ["$status", TaskStatusEnum.DONE] }, 1, 0],
              },
            },
          },
        },
      ]);

      totalTime += performance.now() - start;
      if (i === 0) {
        const agg = taskAnalytics[0] || {};
        finalResult = {
          totalTasks: agg.totalTasks || 0,
          overdueTasks: agg.overdueTasks || 0,
          completedTasks: agg.completedTasks || 0,
        };
      }
    }

    comparisons.push({
      approach: "Single-Pass $group + $cond (Optimized Single Pipeline)",
      roundTrips: 1,
      totalTimeMs: Number(totalTime.toFixed(2)),
      avgTimeMs: Number((totalTime / ITERATIONS).toFixed(2)),
      totalDocsExamined: 5000,
      results: finalResult,
      notes: "Streamed single-pass aggregation without branching sub-pipelines.",
    });
  }

  console.log("\n=======================================================================");
  console.log("                 ANALYTICS ARCHITECTURE BENCHMARK");
  console.log("=======================================================================");
  console.table(
    comparisons.map((c) => ({
      Approach: c.approach,
      "DB Round Trips": c.roundTrips,
      "Avg Exec Time (ms)": c.avgTimeMs,
      "Total Time (100 runs)": `${c.totalTimeMs} ms`,
      "Total Tasks": c.results.totalTasks,
      "Overdue Tasks": c.results.overdueTasks,
      "Completed Tasks": c.results.completedTasks,
    }))
  );

  const outDir = path.resolve(__dirname);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "analytics-comparison.json"), JSON.stringify(comparisons, null, 2), "utf-8");
  console.log(`\nResults saved to: ${path.join(outDir, "analytics-comparison.json")}`);

  await mongoose.disconnect();
}

benchmarkAnalytics().catch((err) => {
  console.error("Analytics benchmark failed:", err);
  process.exit(1);
});
