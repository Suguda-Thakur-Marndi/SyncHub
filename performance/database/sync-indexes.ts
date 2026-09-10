import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../../backend/src/config/database.config";
import TaskModel from "../../backend/src/models/task.model";
import MemberModel from "../../backend/src/models/member.model";
import ProjectModel from "../../backend/src/models/project.model";
import WorkspaceModel from "../../backend/src/models/workspace.model";
import AccountModel from "../../backend/src/models/account.model";

async function syncAllIndexes() {
  console.log("Connecting to MongoDB to synchronize all collection indexes...");
  await connectDatabase();

  console.log("1. Building TaskModel indexes...");
  await TaskModel.syncIndexes();
  const taskIndexes = await TaskModel.listIndexes();
  console.log("TaskModel active indexes:", taskIndexes.map((i: any) => i.name));

  console.log("2. Building MemberModel indexes...");
  await MemberModel.syncIndexes();
  const memberIndexes = await MemberModel.listIndexes();
  console.log("MemberModel active indexes:", memberIndexes.map((i: any) => i.name));

  console.log("3. Building ProjectModel indexes...");
  await ProjectModel.syncIndexes();
  const projIndexes = await ProjectModel.listIndexes();
  console.log("ProjectModel active indexes:", projIndexes.map((i: any) => i.name));

  console.log("4. Building WorkspaceModel indexes...");
  await WorkspaceModel.syncIndexes();
  const wsIndexes = await WorkspaceModel.listIndexes();
  console.log("WorkspaceModel active indexes:", wsIndexes.map((i: any) => i.name));

  console.log("5. Building AccountModel indexes...");
  await AccountModel.syncIndexes();
  const accIndexes = await AccountModel.listIndexes();
  console.log("AccountModel active indexes:", accIndexes.map((i: any) => i.name));

  await mongoose.disconnect();
  console.log("Index synchronization complete!");
}

syncAllIndexes().catch((err) => {
  console.error("Index sync failed:", err);
  process.exit(1);
});
