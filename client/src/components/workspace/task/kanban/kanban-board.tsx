import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskType } from "@/types/api.type";
import KanbanColumn from "./kanban-column";
import TaskDetailsDialog from "../task-details-dialog";
import { editTaskMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";

import { TaskStatusEnumType } from "@/constant";

interface KanbanBoardProps {
  tasks: TaskType[];
  isLoading?: boolean;
}

export default function KanbanBoard({ tasks, isLoading }: KanbanBoardProps) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  const editTaskMutation = useMutation({
    mutationFn: editTaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics", workspaceId] });
    },
    onError: () => {
      toast({
        title: "Move Failed",
        description: "Could not update task status.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-medium">
        Loading Kanban board...
      </div>
    );
  }

  const handleMoveTask = (taskId: string, newStatus: string, projectId: string) => {
    // If no project ID is present on task object, find from tasks list
    const foundTask = tasks.find((t) => t._id === taskId);
    const effectiveProjectId = projectId || foundTask?.project?._id || "";

    if (!effectiveProjectId) {
      toast({
        title: "Notice",
        description: "Task must belong to a project to change status.",
        variant: "destructive",
      });
      return;
    }

    editTaskMutation.mutate({
      taskId,
      projectId: effectiveProjectId,
      workspaceId,
      data: { status: newStatus as TaskStatusEnumType },
    });

    toast({
      title: "Task Moved",
      description: `Task updated to ${newStatus.replace("_", " ")}.`,
    });
  };

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "TODO" || t.status === "BACKLOG");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const inReviewTasks = tasks.filter((t) => t.status === "IN_REVIEW");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  const columns = [
    {
      id: "TODO",
      title: "To Do",
      tasks: todoTasks,
      colorClass: "bg-slate-400",
      badgeClass: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      tasks: inProgressTasks,
      colorClass: "bg-blue-500",
      badgeClass: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
    },
    {
      id: "IN_REVIEW",
      title: "In Review",
      tasks: inReviewTasks,
      colorClass: "bg-purple-500",
      badgeClass: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
    },
    {
      id: "DONE",
      title: "Done",
      tasks: doneTasks,
      colorClass: "bg-emerald-500",
      badgeClass: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Horizontal scrolling track for Kanban columns */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4 scrollbar">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={col.tasks}
            colorClass={col.colorClass}
            badgeClass={col.badgeClass}
            onDropTask={handleMoveTask}
            onSelectTask={(task) => setSelectedTask(task)}
            onMoveTask={handleMoveTask}
          />
        ))}
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
