import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../../backend/src/config/database.config";
import UserModel from "../../backend/src/models/user.model";
import AccountModel from "../../backend/src/models/account.model";
import WorkspaceModel from "../../backend/src/models/workspace.model";
import RoleModel from "../../backend/src/models/roles-permission.model";
import MemberModel from "../../backend/src/models/member.model";
import ProjectModel from "../../backend/src/models/project.model";
import TaskModel from "../../backend/src/models/task.model";
import { Roles } from "../../backend/src/enums/role.enum";
import { ProviderEnum } from "../../backend/src/enums/account-provider.enum";
import { TaskPriorityEnum, TaskStatusEnum } from "../../backend/src/enums/task.enum";
import { RolePermissions } from "../../backend/src/utils/role-permission";
import { generateTaskCode } from "../../backend/src/utils/uuid";

async function seedBenchmarkData() {
  console.log("Connecting to database for seeding benchmark data...");
  await connectDatabase();

  // 1. Ensure Roles exist
  console.log("Verifying standard roles...");
  for (const roleName of Object.values(Roles)) {
    const existingRole = await RoleModel.findOne({ name: roleName });
    if (!existingRole) {
      await RoleModel.create({
        name: roleName,
        permissions: RolePermissions[roleName],
      });
      console.log(`Created role: ${roleName}`);
    }
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });
  if (!ownerRole || !memberRole) {
    throw new Error("Required roles could not be resolved.");
  }

  // 2. Create or find Benchmark Admin/Owner User
  const benchmarkEmail = "benchmark@gpms.io";
  let user = await UserModel.findOne({ email: benchmarkEmail });
  if (!user) {
    user = new UserModel({
      name: "Benchmark Admin",
      email: benchmarkEmail,
      password: "Password123!",
    });
    await user.save();

    await AccountModel.create({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: benchmarkEmail,
    });
    console.log(`Created benchmark user: ${benchmarkEmail}`);
  }

  // 3. Create or find Benchmark Workspace
  let workspace = await WorkspaceModel.findOne({ name: "Benchmark Performance Workspace" });
  if (!workspace) {
    workspace = await WorkspaceModel.create({
      name: "Benchmark Performance Workspace",
      description: "Dedicated workspace for reproducible performance and latency benchmarks",
      owner: user._id,
    });

    await MemberModel.create({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();
    console.log(`Created benchmark workspace: ${workspace._id}`);
  }

  // 4. Create 10 benchmark team members
  const memberUserIds: mongoose.Types.ObjectId[] = [user._id as mongoose.Types.ObjectId];
  for (let i = 1; i <= 10; i++) {
    const memberEmail = `benchmark_dev_${i}@gpms.io`;
    let mUser = await UserModel.findOne({ email: memberEmail });
    if (!mUser) {
      mUser = await UserModel.create({
        name: `Dev Member ${i}`,
        email: memberEmail,
        password: "Password123!",
      });
      await AccountModel.create({
        userId: mUser._id,
        provider: ProviderEnum.EMAIL,
        providerId: memberEmail,
      });
    }
    memberUserIds.push(mUser._id as mongoose.Types.ObjectId);

    const existingMember = await MemberModel.findOne({
      userId: mUser._id,
      workspaceId: workspace._id,
    });
    if (!existingMember) {
      await MemberModel.create({
        userId: mUser._id,
        workspaceId: workspace._id,
        role: memberRole._id,
        joinedAt: new Date(),
      });
    }
  }

  // 5. Create 5 benchmark projects
  const projectIds: mongoose.Types.ObjectId[] = [];
  const projectNames = [
    { name: "Frontend Core Engine", emoji: "⚡" },
    { name: "Backend Performance API", emoji: "🚀" },
    { name: "Database Storage Layer", emoji: "💾" },
    { name: "Real-Time Collaboration", emoji: "🔄" },
    { name: "Analytics & Reporting", emoji: "📊" },
  ];

  for (const p of projectNames) {
    let project = await ProjectModel.findOne({
      workspace: workspace._id,
      name: p.name,
    });
    if (!project) {
      project = await ProjectModel.create({
        name: p.name,
        emoji: p.emoji,
        description: `Benchmark project for ${p.name}`,
        workspace: workspace._id,
        createdBy: user._id,
      });
    }
    projectIds.push(project._id as mongoose.Types.ObjectId);
  }

  // 6. Check existing tasks count
  const existingCount = await TaskModel.countDocuments({ workspace: workspace._id });
  console.log(`Current tasks in benchmark workspace: ${existingCount}`);

  const TARGET_TASKS = 5000;
  if (existingCount < TARGET_TASKS) {
    const tasksToCreate = TARGET_TASKS - existingCount;
    console.log(`Seeding ${tasksToCreate} additional tasks to reach ${TARGET_TASKS}...`);

    const statuses = [
      TaskStatusEnum.BACKLOG,
      TaskStatusEnum.TODO,
      TaskStatusEnum.IN_PROGRESS,
      TaskStatusEnum.IN_REVIEW,
      TaskStatusEnum.DONE,
    ];
    const priorities = [
      TaskPriorityEnum.LOW,
      TaskPriorityEnum.MEDIUM,
      TaskPriorityEnum.HIGH,
    ];

    const now = new Date();
    const batchSize = 1000;
    let created = 0;

    while (created < tasksToCreate) {
      const currentBatchSize = Math.min(batchSize, tasksToCreate - created);
      const batch = [];

      for (let i = 0; i < currentBatchSize; i++) {
        const globalIndex = existingCount + created + i + 1;
        const status = statuses[globalIndex % statuses.length];
        const priority = priorities[globalIndex % priorities.length];
        const project = projectIds[globalIndex % projectIds.length];
        const assignedTo = memberUserIds[globalIndex % memberUserIds.length];

        // Some due dates in past (for overdue checks), some in future
        const isOverdueTarget = globalIndex % 4 === 0 && status !== TaskStatusEnum.DONE;
        const dueDate = isOverdueTarget
          ? new Date(now.getTime() - (globalIndex % 30 + 1) * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + (globalIndex % 30 + 1) * 24 * 60 * 60 * 1000);

        batch.push({
          taskCode: `task-${globalIndex}-${Date.now().toString(36)}`,
          title: `Benchmark Task #${globalIndex} - Implement Feature Optimization ${globalIndex % 100}`,
          description: `Detailed description for benchmark task #${globalIndex} to evaluate full collection scans and query execution latency.`,
          project,
          workspace: workspace._id,
          status,
          priority,
          assignedTo,
          createdBy: user._id,
          dueDate,
          createdAt: new Date(now.getTime() - (globalIndex % 90) * 24 * 60 * 60 * 1000),
          updatedAt: now,
        });
      }

      await TaskModel.insertMany(batch, { ordered: false });
      created += currentBatchSize;
      console.log(`Seeded ${created}/${tasksToCreate} tasks...`);
    }
  }

  const finalTotal = await TaskModel.countDocuments({ workspace: workspace._id });
  console.log(`Seeding complete. Total tasks in workspace: ${finalTotal}`);
  console.log(`Workspace ID: ${workspace._id}`);
  console.log(`User Email: ${benchmarkEmail}`);
  console.log(`User Password: Password123!`);

  await mongoose.disconnect();
}

seedBenchmarkData().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
