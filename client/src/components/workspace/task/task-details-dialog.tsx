import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskType } from "@/types/api.type";
import { editTaskMutationFn, deleteTaskMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Trash2,
  Plus,
  Send,
  CheckSquare,
  Square,
  FileText,
  FileCode,
  ExternalLink,
  Loader,
} from "lucide-react";
import { TaskPriorityEnumType, TaskStatusEnumType } from "@/constant";

interface TaskDetailsDialogProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: string;
  authorPicture?: string;
  content: string;
  timestamp: string;
}

function TaskDetailsContent({
  task,
  onClose,
}: {
  task: TaskType;
  onClose: () => void;
}) {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const projectId = task.project?._id || "";

  // Direct initialization from props (keyed by task._id)
  const [currentStatus, setCurrentStatus] = useState<string>(task.status);
  const [currentPriority, setCurrentPriority] = useState<string>(task.priority);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // Subtasks state
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: "st-1", title: "Review technical architecture & requirements", completed: true },
    { id: "st-2", title: "Draft implementation components & UI states", completed: false },
    { id: "st-3", title: "Run responsive & accessibility validation", completed: false },
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c-1",
      author: "Alex Morgan",
      content: "Ensure the single-pointer alternative is keyboard accessible for WCAG 2.2 AA.",
      timestamp: "Yesterday at 4:32 PM",
    },
    {
      id: "c-2",
      author: task.assignedTo?.name || "Assignee",
      content: "Working on the column drag interactions now, looking great!",
      timestamp: "Today at 10:15 AM",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  // Active section tab
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");

  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: editTaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics", workspaceId] });
      toast({
        title: "Task Updated",
        description: "Task changes have been saved successfully.",
      });
      setIsSaving(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics", workspaceId] });
      toast({
        title: "Task Deleted",
        description: "The task has been permanently removed.",
      });
      onClose();
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    if (projectId) {
      editTaskMutation.mutate({
        taskId: task._id,
        projectId,
        workspaceId,
        data: { status: newStatus as TaskStatusEnumType },
      });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    setCurrentPriority(newPriority);
    if (projectId) {
      editTaskMutation.mutate({
        taskId: task._id,
        projectId,
        workspaceId,
        data: { priority: newPriority as TaskPriorityEnumType },
      });
    }
  };

  const handleSaveDetails = () => {
    setIsSaving(true);
    if (projectId) {
      editTaskMutation.mutate({
        taskId: task._id,
        projectId,
        workspaceId,
        data: {
          title,
          description,
          status: currentStatus as TaskStatusEnumType,
          priority: currentPriority as TaskPriorityEnumType,
        },
      });
    }
    setIsEditingTitle(false);
  };

  // Subtask handlers
  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ]);
    setNewSubtaskTitle("");
  };

  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // Comment handlers
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: "You",
        content: newComment.trim(),
        timestamp: "Just now",
      },
    ]);
    setNewComment("");
  };

  // Assignee formatting
  const assigneeName = task.assignedTo?.name || "Unassigned";
  const initials = getAvatarFallbackText(assigneeName);
  const avatarColor = getAvatarColor(assigneeName);

  // Overdue check
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && currentStatus !== "DONE";

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {task.taskCode || `#TK-${task._id.slice(-4).toUpperCase()}`}
            </span>
            {task.project && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>{task.project.emoji || "📁"}</span>
                <span>{task.project.name}</span>
              </span>
            )}
          </div>

          {/* Quick Status and Priority Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-8 text-xs font-bold px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
              <option value="BACKLOG">Backlog</option>
            </select>

            <select
              value={currentPriority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="h-8 text-xs font-bold px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>
        </div>

        {/* Editable Title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold px-3 py-1.5 rounded-xl border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveDetails} className="bg-indigo-600 text-white cursor-pointer">
              Save
            </Button>
          </div>
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            title="Click to edit title"
          >
            {title}
          </h2>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-4 bg-white dark:bg-slate-900">
        {(["details", "comments", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-xs font-semibold border-b-2 capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab === "details" ? "Overview & Subtasks" : tab === "comments" ? `Comments (${comments.length})` : "Activity Audit"}
          </button>
        ))}
      </div>

      {/* Body Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar">
        {activeTab === "details" && (
          <>
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
              {/* Assignee */}
              <div>
                <span className="text-slate-400 block mb-1 font-medium">Assignee</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedTo?.profilePicture || ""} />
                    <AvatarFallback className={`${avatarColor} text-white text-[10px] font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {assigneeName}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <span className="text-slate-400 block mb-1 font-medium">Deadline</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className={`font-semibold ${
                      isOverdue
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                  </span>
                  {isOverdue && (
                    <span className="text-[10px] font-bold text-rose-500 uppercase">
                      (Overdue)
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <span className="text-slate-400 block mb-1 font-medium">Status</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a detailed description for this task..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
              />
            </div>

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subtasks Checklist ({completedSubtasks}/{subtasks.length})
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {subtaskProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Subtask Items */}
              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => toggleSubtask(st.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        st.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700 dark:text-slate-200 font-medium"
                      }`}
                    >
                      {st.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Add Subtask input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" size="sm" className="h-9 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </form>
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Attachments & Files
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        specs-v2.md
                      </p>
                      <span className="text-[10px] text-slate-400">14 KB</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        design-system-tokens.pdf
                      </p>
                      <span className="text-[10px] text-slate-400">2.4 MB</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {c.author}
                    </span>
                    <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or type @ to mention a teammate..."
                className="flex-1 h-10 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  Task status changed to <span className="font-bold">{currentStatus}</span>
                </p>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  Task assigned to <span className="font-bold">{assigneeName}</span>
                </p>
                <span className="text-[10px] text-slate-400">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Earlier"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-slate-800 dark:text-slate-200 font-medium">Task created</p>
                <span className="text-[10px] text-slate-400">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Created"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm("Are you sure you want to delete this task?")) {
              deleteTaskMutation.mutate({
                workspaceId,
                taskId: task._id,
              });
            }
          }}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Task
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl cursor-pointer"
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleSaveDetails}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs rounded-xl cursor-pointer"
          >
            {isSaving ? <Loader className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function TaskDetailsDialog({
  task,
  isOpen,
  onClose,
}: TaskDetailsDialogProps) {
  if (!task || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <TaskDetailsContent key={task._id} task={task} onClose={onClose} />
    </Dialog>
  );
}
