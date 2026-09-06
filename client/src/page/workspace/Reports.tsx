import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn, getMembersInWorkspaceQueryFn } from "@/lib/api";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { TaskType } from "@/types/api.type";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Users,
  Table as TableIcon,
  Download,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Reports() {
  const workspaceId = useWorkspaceId();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [showDataTable, setShowDataTable] = useState(false);

  // Queries
  const { data: tasksData } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () => getAllTasksQueryFn({ workspaceId }),
    enabled: !!workspaceId,
  });

  const { data: membersData } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 50,
  });

  const allTasks: TaskType[] = tasksData?.tasks || [];
  const filteredTasks =
    selectedProjectId === "all"
      ? allTasks
      : allTasks.filter((t) => t.project?._id === selectedProjectId);

  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];

  // Calculations
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const inReviewTasks = filteredTasks.filter((t) => t.status === "IN_REVIEW").length;
  const todoTasks = filteredTasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG").length;
  const overdueTasks = filteredTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const onTimeRate =
    totalTasks > 0 ? Math.max(0, Math.round(((totalTasks - overdueTasks) / totalTasks) * 100)) : 100;

  // Workload per member
  const memberWorkload = members.map((m) => {
    const assignedTasks = allTasks.filter((t) => t.assignedTo?._id === m.userId._id);
    const completed = assignedTasks.filter((t) => t.status === "DONE").length;
    return {
      user: m.userId,
      total: assignedTasks.length,
      completed,
      pending: assignedTasks.length - completed,
      rate: assignedTasks.length > 0 ? Math.round((completed / assignedTasks.length) * 100) : 0,
    };
  });

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Reports & Performance Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven performance insights, team velocity metrics, and delivery health across your workspace.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Project Filter Selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Workspace Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.emoji || "📁"} {p.name}
              </option>
            ))}
          </select>

          {/* Accessible Table View Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowDataTable(!showDataTable)}
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <TableIcon className="w-4 h-4 text-slate-500" />
            <span>{showDataTable ? "Visual Charts" : "Raw Data Table"}</span>
          </Button>

          {/* Export Report Button */}
          <Button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                ["Task Title,Status,Priority,Due Date,Assignee"]
                  .concat(
                    filteredTasks.map(
                      (t) =>
                        `"${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${
                          t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "N/A"
                        }","${t.assignedTo?.name || "Unassigned"}"`
                    )
                  )
                  .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `workspace-report-${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Velocity */}
        <div className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workspace Velocity
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {completionRate}%
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> On Target
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total & Done Tasks */}
        <div className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed Tasks
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {completedTasks}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                of {totalTasks} tasks
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {totalTasks - completedTasks} active tasks pending
            </p>
          </div>
        </div>

        {/* Overdue Alert */}
        <div className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overdue Risk
            </span>
            <span
              className={`p-2 rounded-xl ${
                overdueTasks > 0
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-400"
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  overdueTasks > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {overdueTasks}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {overdueTasks === 1 ? "task overdue" : "tasks overdue"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              On-time delivery index: {onTimeRate}%
            </p>
          </div>
        </div>

        {/* Active Contributors */}
        <div className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Team Engagement
            </span>
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {members.length}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                collaborators
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Across {projects.length} active initiatives
            </p>
          </div>
        </div>
      </div>

      {showDataTable ? (
        /* Accessible Raw Data Table */
        <div className="clean-card bg-white dark:bg-slate-800 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Raw Task Data & Execution Audit
            </h3>
            <span className="text-xs text-slate-400">{filteredTasks.length} total entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {task.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {task.assignedTo?.name || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Analytics Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Status Breakdown Segmented Visualization */}
          <div className="lg:col-span-6 clean-card bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Task Lifecycle Distribution
                </h3>
                <span className="text-xs text-slate-400">{totalTasks} tasks</span>
              </div>

              {/* Visual Segmented Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-4 rounded-full overflow-hidden flex gap-0.5 my-4">
                {totalTasks > 0 ? (
                  <>
                    <div
                      title={`Completed: ${completedTasks}`}
                      style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                      className="bg-emerald-500 transition-all"
                    />
                    <div
                      title={`In Review: ${inReviewTasks}`}
                      style={{ width: `${(inReviewTasks / totalTasks) * 100}%` }}
                      className="bg-purple-500 transition-all"
                    />
                    <div
                      title={`In Progress: ${inProgressTasks}`}
                      style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }}
                      className="bg-blue-500 transition-all"
                    />
                    <div
                      title={`To Do: ${todoTasks}`}
                      style={{ width: `${(todoTasks / totalTasks) * 100}%` }}
                      className="bg-slate-400 transition-all"
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-300 dark:bg-slate-600" />
                )}
              </div>

              {/* Legend & Count Items */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Completed</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{completedTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In Progress</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{inProgressTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">In Review</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{inReviewTasks}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">To Do</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{todoTasks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Workload Distribution */}
          <div className="lg:col-span-6 clean-card bg-white dark:bg-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Workload & Throughput by Member
                </h3>
                <span className="text-xs text-slate-400">{members.length} members</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {memberWorkload.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No member activity recorded.</p>
                ) : (
                  memberWorkload.map((mw) => {
                    const avatarColor = getAvatarColor(mw.user?.name || "Member");
                    const initials = getAvatarFallbackText(mw.user?.name || "Member");

                    return (
                      <div
                        key={mw.user?._id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={mw.user?.profilePicture} />
                            <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {mw.user?.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {mw.completed} done / {mw.pending} pending
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${mw.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-9 text-right">
                            {mw.rate}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Project Health Index */}
          <div className="lg:col-span-12 clean-card bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Project Health & Delivery Index
              </h3>
              <span className="text-xs text-slate-400">{projects.length} total projects</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const projTasks = allTasks.filter(
                  (t) => t.project?._id === proj._id
                );
                const done = projTasks.filter((t) => t.status === "DONE").length;
                const overdue = projTasks.filter(
                  (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
                ).length;
                const progress = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0;

                return (
                  <div
                    key={proj._id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {proj.emoji || "📁"}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {proj.name}
                        </h4>
                      </div>
                      {overdue > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400">
                          {overdue} Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                          On Track
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                      <span>{projTasks.length} tasks</span>
                      <span>{done} completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
