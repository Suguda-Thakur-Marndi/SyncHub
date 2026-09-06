import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import TaskTable from "@/components/workspace/task/task-table";
import KanbanBoard from "@/components/workspace/task/kanban/kanban-board";
import { LayoutList, Kanban as KanbanIcon, Layers } from "lucide-react";

export default function Tasks() {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () => getAllTasksQueryFn({ workspaceId, pageSize: 100 }),
    enabled: !!workspaceId,
  });

  const tasks = data?.tasks || [];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Workspace Tasks
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, prioritize, and manage tasks across all workspace initiatives.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* Table / Kanban toggle button group */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>

          <div className="shrink-0">
            <CreateTaskDialog />
          </div>
        </div>
      </div>

      {/* Main View Container */}
      {viewMode === "table" ? (
        <div className="section-card !p-5 sm:!p-6">
          <TaskTable />
        </div>
      ) : (
        <div className="animate-fade-in">
          <KanbanBoard tasks={tasks} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
