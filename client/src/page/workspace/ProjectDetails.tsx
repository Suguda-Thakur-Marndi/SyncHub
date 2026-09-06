import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn, getProjectByIdQueryFn } from "@/lib/api";
import { TaskType } from "@/types/api.type";
import ProjectHeader from "@/components/workspace/project/project-header";
import ProjectAnalytics from "@/components/workspace/project/project-analytics";
import TaskTable from "@/components/workspace/task/task-table";
import KanbanBoard from "@/components/workspace/task/kanban/kanban-board";
import ProjectTimeline from "@/components/workspace/project/project-timeline";
import ProjectFiles from "@/components/workspace/project/project-files";
import ProjectDiscussions from "@/components/workspace/project/project-discussions";
import {
  LayoutDashboard,
  LayoutList,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export default function ProjectDetails() {
  const param = useParams();
  const projectId = param.projectId as string;
  const workspaceId = useWorkspaceId();

  const [activeTab, setActiveTab] = useState<
    "overview" | "tasks" | "board" | "timeline" | "files" | "discussions"
  >("overview");

  // Fetch project tasks for board and timeline views
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, projectId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        projectId,
        pageSize: 100,
      }),
    enabled: !!workspaceId && !!projectId,
  });

  const { data: projectData } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () =>
      getProjectByIdQueryFn({
        workspaceId,
        projectId,
      }),
    enabled: !!workspaceId && !!projectId,
  });

  const tasks: TaskType[] = tasksData?.tasks || [];
  const project = projectData?.project;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", count: totalTasks, icon: LayoutList },
    { id: "board", label: "Board", icon: KanbanIcon },
    { id: "timeline", label: "Timeline", icon: CalendarIcon },
    { id: "files", label: "Files", icon: FileText },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
  ] as const;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Project Header */}
      <ProjectHeader />

      {/* Workspace Navigation Tab Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {"count" in tab && typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-indigo-600 text-white dark:bg-indigo-500"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Analytics Cards */}
          <ProjectAnalytics />

          {/* Project Health & Milestone Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Progress Card */}
            <div className="lg:col-span-7 clean-card bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Sprint Delivery Progress
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {progressPercent}% Complete
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {completedTasks}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">
                      {inProgressTasks}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">In Progress</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span
                      className={`block text-lg font-bold ${
                        overdueTasks > 0 ? "text-rose-600" : "text-slate-400"
                      }`}
                    >
                      {overdueTasks}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Overdue</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Description: {project?.description || "No project description provided."}</span>
              </div>
            </div>

            {/* Quick Actions & Shortlist */}
            <div className="lg:col-span-5 clean-card bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-3">
                  Urgent Project Items
                </h3>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.status !== "DONE")
                    .slice(0, 4)
                    .map((task) => (
                      <div
                        key={task._id}
                        onClick={() => setActiveTab("board")}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between hover:border-indigo-400 transition-colors cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {task.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {task.status}
                        </span>
                      </div>
                    ))}
                  {tasks.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">No tasks in this project.</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveTab("tasks")}
                className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-left"
              >
                View all project tasks →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="section-card !p-5 sm:!p-6 animate-fade-in">
          <TaskTable />
        </div>
      )}

      {activeTab === "board" && (
        <div className="animate-fade-in">
          <KanbanBoard tasks={tasks} isLoading={isTasksLoading} />
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="animate-fade-in">
          <ProjectTimeline tasks={tasks} projectName={project?.name} />
        </div>
      )}

      {activeTab === "files" && (
        <div className="animate-fade-in">
          <ProjectFiles />
        </div>
      )}

      {activeTab === "discussions" && (
        <div className="animate-fade-in">
          <ProjectDiscussions />
        </div>
      )}
    </div>
  );
}
