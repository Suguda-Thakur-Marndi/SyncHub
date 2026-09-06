import React, { useState } from "react";
import { TaskType } from "@/types/api.type";
import {
  AlertCircle,
  MoreVertical,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface KanbanCardProps {
  task: TaskType;
  onSelectTask: (task: TaskType) => void;
  onMoveTask: (taskId: string, newStatus: string, projectId: string) => void;
}

export default function KanbanCard({
  task,
  onSelectTask,
  onMoveTask,
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const assigneeName = task.assignedTo?.name || "Unassigned";
  const initials = getAvatarFallbackText(assigneeName);
  const avatarColor = getAvatarColor(assigneeName);

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
            <ArrowUp className="w-3 h-3" /> High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <Minus className="w-3 h-3" /> Med
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <ArrowDown className="w-3 h-3" /> Low
          </span>
        );
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("projectId", task.project?._id || "");
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const availableStatuses = [
    { key: "TODO", label: "To Do" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "IN_REVIEW", label: "In Review" },
    { key: "DONE", label: "Done" },
  ].filter((s) => s.key !== task.status);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative clean-card bg-white dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-all cursor-grab active:cursor-grabbing hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md ${
        isDragging ? "opacity-40 scale-95 ring-2 ring-indigo-500" : ""
      }`}
    >
      {/* Card Header: Priority & Action Dropdown */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          {getPriorityBadge(task.priority)}
          <span className="text-[10px] font-mono text-slate-400">
            {task.taskCode || `#TK-${task._id.slice(-4).toUpperCase()}`}
          </span>
        </div>

        {/* Single-Pointer Alternative: "Move to..." menu (WCAG 2.2 AA) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Move task"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Move To Column
            </div>
            {availableStatuses.map((st) => (
              <DropdownMenuItem
                key={st.key}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task._id, st.key, task.project?._id || "");
                }}
                className="text-xs font-semibold flex items-center justify-between cursor-pointer rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span>{st.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelectTask(task);
              }}
              className="text-xs font-semibold cursor-pointer rounded-lg px-2 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
            >
              View Full Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Title (Clickable) */}
      <h4
        onClick={() => onSelectTask(task)}
        className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors mb-2"
      >
        {task.title}
      </h4>

      {/* Project context tag */}
      {task.project && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full">
            <span>{task.project.emoji || "📁"}</span>
            <span className="truncate">{task.project.name}</span>
          </span>
        </div>
      )}

      {/* Card Footer: Assignee & Due Date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-1.5 min-w-0" title={assigneeName}>
          <Avatar className="h-6 w-6 ring-1 ring-slate-200 dark:ring-slate-700">
            <AvatarImage src={task.assignedTo?.profilePicture || ""} alt={assigneeName} />
            <AvatarFallback className={`${avatarColor} text-white text-[10px] font-bold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
            {assigneeName}
          </span>
        </div>

        {/* Due Date Indicator */}
        <div className="flex items-center gap-1">
          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                isOverdue
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400" />
              )}
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : (
            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">No date</span>
          )}
        </div>
      </div>
    </div>
  );
}
