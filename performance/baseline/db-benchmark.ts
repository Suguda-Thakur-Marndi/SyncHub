import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDatabase from "../../backend/src/config/database.config";
import TaskModel from "../../backend/src/models/task.model";
import WorkspaceModel from "../../backend/src/models/workspace.model";
import ProjectModel from "../../backend/src/models/project.model";
import MemberModel from "../../backend/src/models/member.model";
import UserModel from "../../backend/src/models/user.model";
import { TaskStatusEnum } from "../../backend/src/enums/task.enum";

interface QueryBenchmarkResult {
  queryName: string;
  description: string;
  executionTimeMillis: number;
  totalDocsExamined: number;
  totalKeysExamined: number;
  nReturned: number;
  stage: string;
  hasSortStage: boolean;
  isIndexUsed: boolean;
  notes: string;
}

function findStage(plan: any, stageName: string): boolean {
  if (!plan) return false;
  if (plan.stage === stageName) return true;
  if (plan.inputStage && findStage(plan.inputStage, stageName)) return true;
  if (Array.isArray(plan.inputStages)) {
    return plan.inputStages.some((s: any) => findStage(s, stageName));
  }
  return false;
}

function extractStats(explainOutput: any): {
  executionTimeMillis: number;
  totalDocsExamined: number;
  totalKeysExamined: number;
  nReturned: number;
  stage: string;
  hasSortStage: boolean;
  isIndexUsed: boolean;
} {
  const executionStats = explainOutput.executionStats || explainOutput.stages?.[0]?.executionStats || {};
  const executionTimeMillis = executionStats.executionTimeMillis ?? 0;
  const totalDocsExamined = executionStats.totalDocsExamined ?? 0;
  const totalKeysExamined = executionStats.totalKeysExamined ?? 0;
  const nReturned = executionStats.nReturned ?? 0;

  const executionStages = executionStats.executionStages || {};
  const stage = executionStages.stage || (findStage(executionStages, "COLLSCAN") ? "COLLSCAN" : "UNKNOWN");
  const hasSortStage = findStage(executionStages, "SORT");
  const isIndexUsed = findStage(executionStages, "IXSCAN") || totalKeysExamined > 0;

  return {
    executionTimeMillis,
    totalDocsExamined,
    totalKeysExamined,
    nReturned,
    stage,
    hasSortStage,
    isIndexUsed,
  };
}

async function runDbBenchmark() {
  console.log("Connecting to database for baseline database benchmarks...");
  await connectDatabase();

  const workspace = await WorkspaceModel.findOne({ name: "Benchmark Performance Workspace" });
  if (!workspace) {
    throw new Error("Benchmark workspace not found. Run seed-data.ts first.");
  }
  const workspaceId = workspace._id;

  const user = await UserModel.findOne({ email: "benchmark@gpms.io" });
  if (!user) throw new Error("Benchmark user not found.");

  const project = await ProjectModel.findOne({ workspace: workspaceId });
  if (!project) throw new Error("Benchmark project not found.");
  const projectId = project._id;

  const member = await MemberModel.findOne({ workspaceId });
  if (!member) throw new Error("Benchmark member not found.");

  const results: QueryBenchmarkResult[] = [];

  console.log(`\nStarting Database Benchmarking against Workspace ID: ${workspaceId} (5,000 tasks)...`);

  // 1. Task listing by workspace with sort (default table view)
  {
    console.log("Benchmarking: Task Listing (workspace + sort createdAt: -1)...");
    const explain = await (TaskModel.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Task Listing (workspace + sort createdAt)",
      description: "Default workspace task table view (page 1, 10 items sorted by createdAt desc)",
      ...stats,
      notes: stats.hasSortStage ? "In-memory sort required due to missing compound index" : "Indexed sort",
    });
  }

  // 2. Task listing filtered by status
  {
    console.log("Benchmarking: Task Listing by status (IN_PROGRESS)...");
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      status: TaskStatusEnum.IN_PROGRESS,
    })
      .sort({ createdAt: -1 })
      .limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Task Listing by Status (IN_PROGRESS)",
      description: "Kanban column query and status filtering",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed" : "Full collection scan across all workspace tasks",
    });
  }

  // 3. Task listing filtered by priority (HIGH)
  {
    console.log("Benchmarking: Task Listing by priority (HIGH)...");
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      priority: "HIGH",
    })
      .sort({ createdAt: -1 })
      .limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Task Listing by Priority (HIGH)",
      description: "Priority filtering in task table",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed" : "Full collection scan across tasks",
    });
  }

  // 4. Project-scoped tasks with status filter
  {
    console.log("Benchmarking: Project Tasks by Status...");
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      project: projectId,
      status: TaskStatusEnum.TODO,
    }).limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Project Tasks by Status (TODO)",
      description: "Project detail task view and board filtering",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed" : "Full collection scan",
    });
  }

  // 5. Task listing by assignee
  {
    console.log("Benchmarking: Tasks by Assignee...");
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      assignedTo: member.userId,
    }).limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Tasks by Assignee",
      description: "My Tasks / Assigned To member filter",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed" : "Full collection scan",
    });
  }

  // 6. Keyword title search
  {
    console.log("Benchmarking: Task Search (Regex substring)...");
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      title: { $regex: "Optimization 42", $options: "i" },
    }).limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Task Search (Regex substring)",
      description: "Keyword search in task table filter toolbar",
      ...stats,
      notes: "Unindexed regex search forces full collection scan",
    });
  }

  // 7. Workspace Analytics - count overdue tasks
  {
    console.log("Benchmarking: Workspace Analytics (Overdue Tasks Count)...");
    const currentDate = new Date();
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      dueDate: { $lt: currentDate },
      status: { $ne: TaskStatusEnum.DONE },
    }) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Workspace Analytics (Overdue Tasks)",
      description: "Count of overdue, incomplete tasks in workspace analytics",
      ...stats,
      notes: "Scans all tasks in collection without index on dueDate/status",
    });
  }

  // 8. Project Analytics - $facet aggregation
  {
    console.log("Benchmarking: Project Analytics ($facet aggregation)...");
    const currentDate = new Date();
    const explain = await TaskModel.aggregate([
      { $match: { project: projectId } },
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
    ]).explain("executionStats");

    const executionStats = (explain as any).executionStats || {};
    const executionStages = executionStats.executionStages || {};
    const executionTimeMillis = executionStats.executionTimeMillis ?? 0;
    const totalDocsExamined = executionStats.totalDocsExamined ?? 0;
    const totalKeysExamined = executionStats.totalKeysExamined ?? 0;
    const nReturned = executionStats.nReturned ?? 0;

    results.push({
      queryName: "Project Analytics ($facet Aggregation)",
      description: "Three-branch facet aggregation computing project metrics",
      executionTimeMillis,
      totalDocsExamined,
      totalKeysExamined,
      nReturned,
      stage: executionStages.stage || "COLLSCAN",
      hasSortStage: false,
      isIndexUsed: totalKeysExamined > 0,
      notes: "Aggregation matching unindexed project field",
    });
  }

  // 9. Member Role Check (Executed on EVERY authenticated request)
  {
    console.log("Benchmarking: Member Role Lookup...");
    const explain = await (MemberModel.find({
      userId: user._id,
      workspaceId: workspaceId,
    }) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Member Role Authorization Lookup",
      description: "Permission verification executed on every protected endpoint",
      ...stats,
      notes: "Unindexed compound lookup on { userId, workspaceId }",
    });
  }

  // 10. Project Listing by Workspace
  {
    console.log("Benchmarking: Projects in Workspace Listing...");
    const explain = await (ProjectModel.find({ workspace: workspaceId })
      .sort({ createdAt: -1 }) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Project Listing by Workspace",
      description: "Fetch all projects in workspace sorted by createdAt",
      ...stats,
      notes: "Unindexed workspace lookup and in-memory sort",
    });
  }

  console.log("\n=== DATABASE BENCHMARK RESULTS (BASELINE) ===");
  console.table(
    results.map((r) => ({
      Query: r.queryName,
      TimeMs: r.executionTimeMillis,
      DocsExamined: r.totalDocsExamined,
      KeysExamined: r.totalKeysExamined,
      Stage: r.stage,
      InMemSort: r.hasSortStage ? "YES (Warning)" : "No",
      Indexed: r.isIndexUsed ? "YES" : "NO (COLLSCAN)",
    }))
  );

  const outputPath = path.resolve(__dirname, "db-explain.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nDetailed explain metrics saved to: ${outputPath}`);

  await mongoose.disconnect();
}

runDbBenchmark().catch((err) => {
  console.error("DB Benchmark failed:", err);
  process.exit(1);
});
