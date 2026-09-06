import { useState } from "react";
import { TaskType } from "@/types/api.type";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import TaskDetailsDialog from "@/components/workspace/task/task-details-dialog";

interface ProjectTimelineProps {
  tasks: TaskType[];
  projectName?: string;
}

export default function ProjectTimeline({ tasks, projectName }: ProjectTimelineProps) {
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [timeScale, setTimeScale] = useState<"days" | "weeks">("days");

  // Generate 14 day intervals for visualization
  const today = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-emerald-500 border-emerald-600 text-white";
      case "IN_PROGRESS":
        return "bg-indigo-600 border-indigo-700 text-white";
      case "IN_REVIEW":
        return "bg-purple-600 border-purple-700 text-white";
      case "TODO":
      default:
        return "bg-slate-300 dark:bg-slate-700 border-slate-400 text-slate-800 dark:text-slate-200";
    }
  };

  return (
    <div className="clean-card bg-white dark:bg-slate-800 p-6 flex flex-col gap-6 overflow-hidden">
      {/* Timeline Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Project Schedule & Gantt Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {projectName ? `${projectName} delivery schedule, deadlines, and milestone checkpoints.` : "Chronological task delivery schedules, deadlines, and milestone checkpoints."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timescale selector */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setTimeScale("days")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeScale === "days"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-400"
              }`}
            >
              Days
            </button>
            <button
              onClick={() => setTimeScale("weeks")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeScale === "weeks"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-400"
              }`}
            >
              Weeks
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Matrix Grid */}
      <div className="overflow-x-auto pb-4 scrollbar">
        <div className="min-w-[760px]">
          {/* Days Header */}
          <div className="grid grid-cols-12 border-b border-slate-200 dark:border-slate-700/80 pb-3 mb-4 text-center">
            <div className="col-span-4 text-left font-bold text-xs uppercase tracking-wider text-slate-400 px-3">
              Task Item
            </div>
            <div className="col-span-8 grid grid-cols-7 gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {days.slice(0, 7).map((day, idx) => {
                const isCurrentDay = day.toDateString() === today.toDateString();
                return (
                  <div
                    key={idx}
                    className={`py-1 rounded-lg ${
                      isCurrentDay
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500/40"
                        : ""
                    }`}
                  >
                    <span>{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
                    <span className="block text-[10px] font-mono">{day.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Rows */}
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tasks scheduled in this project yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => {
                // Determine bar placement based on status/due date
                const isDone = task.status === "DONE";
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < today && !isDone;

                return (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className="grid grid-cols-12 items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    {/* Task Label */}
                    <div className="col-span-4 flex items-center gap-2 pr-3 min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        #{index + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {task.title}
                      </p>
                    </div>

                    {/* Gantt Bar Track */}
                    <div className="col-span-8 relative h-7 bg-slate-100/60 dark:bg-slate-900/40 rounded-lg overflow-hidden flex items-center px-1">
                      <div
                        className={`h-5 rounded-md px-2.5 flex items-center justify-between text-[10px] font-bold shadow-xs transition-all duration-300 ${getStatusColor(
                          task.status
                        )}`}
                        style={{
                          width: isDone ? "100%" : task.status === "IN_PROGRESS" ? "65%" : task.status === "IN_REVIEW" ? "85%" : "35%",
                        }}
                      >
                        <span className="truncate">{task.status.replace("_", " ")}</span>
                        {isDone && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                        {isOverdue && <AlertCircle className="w-3 h-3 text-white shrink-0" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Dialog Modal */}
      <TaskDetailsDialog
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
