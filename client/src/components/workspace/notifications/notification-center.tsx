import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, AlertTriangle, UserPlus, CheckCircle2, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface NotificationItem {
  id: string;
  type: "ASSIGNMENT" | "DEADLINE" | "MENTION" | "MILESTONE" | "MEMBER";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link: string;
}

export default function NotificationCenter() {
  const workspaceId = useWorkspaceId();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "MENTIONS">("ALL");

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      type: "DEADLINE",
      title: "Task Deadline Approaching",
      description: 'Task "Design System Tokens" is due in 24 hours.',
      timestamp: "10m ago",
      read: false,
      link: `/workspace/${workspaceId}/tasks`,
    },
    {
      id: "n-2",
      type: "ASSIGNMENT",
      title: "New Task Assigned",
      description: 'You were assigned to "Implement Kanban Board Drag-and-Drop".',
      timestamp: "1h ago",
      read: false,
      link: `/workspace/${workspaceId}/tasks`,
    },
    {
      id: "n-3",
      type: "MENTION",
      title: "Alex mentioned you",
      description: '"@you Can you review the revised Gantt timeline schedule?"',
      timestamp: "3h ago",
      read: false,
      link: `/workspace/${workspaceId}/tasks`,
    },
    {
      id: "n-4",
      type: "MILESTONE",
      title: "Milestone Completed",
      description: 'Sprint 1 milestone "Frontend Architecture" has been achieved.',
      timestamp: "1d ago",
      read: true,
      link: `/workspace/${workspaceId}/reports`,
    },
    {
      id: "n-5",
      type: "MEMBER",
      title: "New Member Joined",
      description: "Sarah Jenkins joined your workspace via invite link.",
      timestamp: "2d ago",
      read: true,
      link: `/workspace/${workspaceId}/members`,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.read;
    if (activeTab === "MENTIONS") return n.type === "MENTION";
    return true;
  });

  const getCategoryIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "DEADLINE":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "ASSIGNMENT":
        return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
      case "MENTION":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "MILESTONE":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "MEMBER":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer relative shrink-0"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 p-0 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
        align="end"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 pt-2 gap-2 bg-slate-50/50 dark:bg-slate-900/40">
          {(["ALL", "UNREAD", "MENTIONS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs font-semibold px-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
            >
              {tab === "ALL" ? "All" : tab === "UNREAD" ? "Unread" : "Mentions"}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex flex-col max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-slate-500">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                onClick={() => markAsRead(n.id)}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left ${
                  !n.read ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                }`}
              >
                <span className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs shrink-0 mt-0.5">
                  {getCategoryIcon(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 self-center" />
                )}
              </Link>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
