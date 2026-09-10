import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";
import { cacheService } from "./cache.service";

//********************************
// CREATE NEW WORKSPACE
//**************** **************/
export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return {
    workspace,
  };
};

//********************************
// GET WORKSPACES USER IS A MEMBER
//**************** **************/
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  // Extract workspace details from memberships
  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({
    workspaceId,
  }).populate("role");

  // Auto-heal logic for missing/orphaned member roles
  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });

  for (const member of members) {
    if (!member.role && ownerRole && memberRole) {
      const isOwner = workspace.owner.equals(member.userId);
      const targetRole = isOwner ? ownerRole : memberRole;
      member.role = targetRole._id as any;
      await member.save();
      member.role = targetRole;
    }
  }

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return {
    workspace: workspaceWithMembers,
  };
};

//********************************
// GET ALL MEMEBERS IN WORKSPACE
//**************** **************/

export const getWorkspaceMembersService = async (workspaceId: string) => {
  // Fetch all members of the workspace

  const members = await MemberModel.find({
    workspaceId,
  })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  // Auto-heal logic for missing/orphaned member roles
  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
  const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });
  const workspace = await WorkspaceModel.findById(workspaceId);

  for (const member of members) {
    if (!member.role && ownerRole && memberRole && workspace) {
      const memberUserId = (member.userId as any)?._id || member.userId;
      const isOwner = workspace.owner.equals(memberUserId);
      const targetRole = isOwner ? ownerRole : memberRole;
      await MemberModel.updateOne({ _id: member._id }, { role: targetRole._id });
      member.role = targetRole;
    }
  }

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const cacheKey = `workspace:analytics:${workspaceId}`;
  const cached = await cacheService.get<{
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
  }>(cacheKey);

  if (cached) {
    return { analytics: cached };
  }

  const currentDate = new Date();
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

  const [result] = await TaskModel.aggregate([
    { $match: { workspace: wsObjectId } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", TaskStatusEnum.DONE] },
                  { $lt: ["$dueDate", currentDate] },
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

  const analytics = {
    totalTasks: result?.totalTasks || 0,
    overdueTasks: result?.overdueTasks || 0,
    completedTasks: result?.completedTasks || 0,
  };

  // Cache for 60 seconds
  await cacheService.set(cacheKey, analytics, 60);

  return { analytics };
};

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });

  if (!member) {
    throw new Error("Member not found in the workspace");
  }

  member.role = role;
  await member.save();

  return {
    member,
  };
};

//********************************
// UPDATE WORKSPACE
//**************** **************/
export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Update the workspace details
  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();

  return {
    workspace,
  };
};

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) {
    throw new BadRequestException(
      "You are not authorized to delete this workspace"
    );
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  await ProjectModel.deleteMany({ workspace: workspace._id });
  await TaskModel.deleteMany({ workspace: workspace._id });

  await MemberModel.deleteMany({
    workspaceId: workspace._id,
  });

  if (user?.currentWorkspace?.equals(workspaceId)) {
    const memberWorkspace = await MemberModel.findOne({ userId });
    user.currentWorkspace = memberWorkspace
      ? memberWorkspace.workspaceId
      : null;

    await user.save();
  }

  await workspace.deleteOne();

  return {
    currentWorkspace: user.currentWorkspace,
  };
};
