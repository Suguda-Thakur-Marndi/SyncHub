import React, { useState } from "react";
import { TaskType } from "@/types/api.type";
import KanbanCard from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  colorClass: string;
  badgeClass: string;
  onDropTask: (taskId: string, targetStatus: string, projectId: string) => void;
  onSelectTask: (task: TaskType) => void;
  onMoveTask: (taskId: string, newStatus: string, projectId: string) => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  colorClass,
  badgeClass,
  onDropTask,
  onSelectTask,
  onMoveTask,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    const projectId = e.dataTransfer.getData("projectId");
    if (taskId) {
      onDropTask(taskId, id, projectId);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col min-w-[280px] max-w-[340px] flex-1 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border transition-all duration-200 ${
        isOver
          ? "border-2 border-dashed border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20"
          : "border-slate-200/80 dark:border-slate-800/80"
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Cards Container */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-[450px] overflow-y-auto scrollbar">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-2">
            <p className="text-xs font-medium text-slate-400">No tasks in {title.toLowerCase()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Drop a task card here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onSelectTask={onSelectTask}
              onMoveTask={onMoveTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
