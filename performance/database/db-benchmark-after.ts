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
  const hasSortStage = findStage(executionStages, "SORT");
  const isIndexUsed = findStage(executionStages, "IXSCAN") || totalKeysExamined > 0;
  const stage = isIndexUsed ? "IXSCAN" : (executionStages.stage || (findStage(executionStages, "COLLSCAN") ? "COLLSCAN" : "UNKNOWN"));

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

async function runDbBenchmarkAfter() {
  console.log("Connecting to database for AFTER database benchmarks...");
  await connectDatabase();

  const workspace = await WorkspaceModel.findOne({ name: "Benchmark Performance Workspace" });
  if (!workspace) throw new Error("Benchmark workspace not found.");
  const workspaceId = workspace._id;

  const user = await UserModel.findOne({ email: "benchmark@gpms.io" });
  if (!user) throw new Error("Benchmark user not found.");

  const project = await ProjectModel.findOne({ workspace: workspaceId });
  if (!project) throw new Error("Benchmark project not found.");
  const projectId = project._id;

  const member = await MemberModel.findOne({ workspaceId });
  if (!member) throw new Error("Benchmark member not found.");

  const results: QueryBenchmarkResult[] = [];

  // 1. Task listing by workspace with sort (default table view)
  {
    const explain = await (TaskModel.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Task Listing (workspace + sort createdAt)",
      description: "Default workspace task table view (page 1, 10 items sorted by createdAt desc)",
      ...stats,
      notes: stats.hasSortStage ? "In-memory sort required" : "Indexed sort via { workspace: 1, createdAt: -1 }",
    });
  }

  // 2. Task listing filtered by status
  {
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
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, status: 1, createdAt: -1 }" : "COLLSCAN",
    });
  }

  // 3. Task listing filtered by priority (HIGH)
  {
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
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, priority: 1, createdAt: -1 }" : "COLLSCAN",
    });
  }

  // 4. Project-scoped tasks with status filter
  {
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
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, project: 1, status: 1 }" : "COLLSCAN",
    });
  }

  // 5. Task listing by assignee
  {
    const explain = await (TaskModel.find({
      workspace: workspaceId,
      assignedTo: member.userId,
    }).limit(10) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Tasks by Assignee",
      description: "My Tasks / Assigned To member filter",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, assignedTo: 1, status: 1 }" : "COLLSCAN",
    });
  }

  // 6. Workspace Analytics - count overdue tasks
  {
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
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, dueDate: 1, status: 1 }" : "COLLSCAN",
    });
  }

  // 7. Project Analytics - $facet aggregation
  {
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
    const isIndexUsed = findStage(executionStages, "IXSCAN") || (executionStats.totalKeysExamined ?? 0) > 0;

    results.push({
      queryName: "Project Analytics ($facet Aggregation)",
      description: "Three-branch facet aggregation computing project metrics",
      executionTimeMillis: executionStats.executionTimeMillis ?? 0,
      totalDocsExamined: executionStats.totalDocsExamined ?? 0,
      totalKeysExamined: executionStats.totalKeysExamined ?? 0,
      nReturned: executionStats.nReturned ?? 0,
      stage: isIndexUsed ? "IXSCAN" : "COLLSCAN",
      hasSortStage: false,
      isIndexUsed,
      notes: isIndexUsed ? "Indexed initial $match via { project: 1 }" : "COLLSCAN",
    });
  }

  // 8. Member Role Check
  {
    const explain = await (MemberModel.find({
      userId: user._id,
      workspaceId: workspaceId,
    }) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Member Role Authorization Lookup",
      description: "Permission verification executed on every protected endpoint",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed via compound unique { userId: 1, workspaceId: 1 }" : "COLLSCAN",
    });
  }

  // 9. Project Listing by Workspace
  {
    const explain = await (ProjectModel.find({ workspace: workspaceId })
      .sort({ createdAt: -1 }) as any).explain("executionStats");

    const stats = extractStats(explain);
    results.push({
      queryName: "Project Listing by Workspace",
      description: "Fetch all projects in workspace sorted by createdAt",
      ...stats,
      notes: stats.isIndexUsed ? "Indexed via { workspace: 1, createdAt: -1 }" : "COLLSCAN",
    });
  }

  console.log("\n=== DATABASE BENCHMARK RESULTS (AFTER INDEXING) ===");
  console.table(
    results.map((r) => ({
      Query: r.queryName,
      TimeMs: r.executionTimeMillis,
      DocsExamined: r.totalDocsExamined,
      KeysExamined: r.totalKeysExamined,
      Stage: r.stage,
      InMemSort: r.hasSortStage ? "YES" : "No",
      Indexed: r.isIndexUsed ? "YES (IXSCAN)" : "NO",
    }))
  );

  const outputPath = path.resolve(__dirname, "db-explain-after.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nDetailed explain metrics saved to: ${outputPath}`);

  await mongoose.disconnect();
}

runDbBenchmarkAfter().catch((err) => {
  console.error("DB Benchmark After failed:", err);
  process.exit(1);
});
