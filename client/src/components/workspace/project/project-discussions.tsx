import { useState } from "react";
import { MessageSquare, Send, ThumbsUp, Reply, Pin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

interface DiscussionThread {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  likes: number;
  repliesCount: number;
}

export default function ProjectDiscussions() {
  const [threads, setThreads] = useState<DiscussionThread[]>([
    {
      id: "d-1",
      author: "Alex Morgan",
      role: "Project Manager",
      content:
        "Welcome team! Let's align on Sprint 2 milestones. Please make sure all task deadlines are updated before tomorrow's standup.",
      timestamp: "2 hours ago",
      isPinned: true,
      likes: 4,
      repliesCount: 3,
    },
    {
      id: "d-2",
      author: "Sarah Jenkins",
      role: "Frontend Lead",
      content:
        "We've implemented the high-contrast token set and keyboard navigation for the Kanban board according to WCAG 2.2 AA standards. Ready for QA review.",
      timestamp: "4 hours ago",
      likes: 2,
      repliesCount: 1,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newThread: DiscussionThread = {
      id: `d-${Date.now()}`,
      author: "You",
      role: "Member",
      content: newMessage.trim(),
      timestamp: "Just now",
      likes: 0,
      repliesCount: 0,
    };

    setThreads([newThread, ...threads]);
    setNewMessage("");
    toast({
      title: "Discussion Posted",
      description: "Your message is visible to the project team.",
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Post Discussion Input Box */}
      <div className="clean-card bg-white dark:bg-slate-800 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Start a Team Discussion
        </h4>
        <form onSubmit={handlePostMessage} className="flex flex-col gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share an update, ask a question, or mention @teammates..."
            rows={3}
            className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Tip: Use @name to mention colleagues</span>
            <Button
              type="submit"
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Post Update
            </Button>
          </div>
        </form>
      </div>

      {/* Discussion Threads Stream */}
      <div className="space-y-4">
        {threads.map((thread) => {
          const initials = getAvatarFallbackText(thread.author);
          const avatarColor = getAvatarColor(thread.author);

          return (
            <div
              key={thread.id}
              className={`clean-card bg-white dark:bg-slate-800 p-5 relative ${
                thread.isPinned ? "border-l-4 border-l-indigo-600 dark:border-l-indigo-500" : ""
              }`}
            >
              {thread.isPinned && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  <Pin className="w-3.5 h-3.5 fill-current" /> Pinned announcement
                </div>
              )}

              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
                  <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {thread.author}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {thread.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">{thread.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap">
                    {thread.content}
                  </p>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <button
                      onClick={() => {
                        setThreads((prev) =>
                          prev.map((t) =>
                            t.id === thread.id ? { ...t, likes: t.likes + 1 } : t
                          )
                        );
                      }}
                      className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.likes} Likes</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                      <Reply className="w-3.5 h-3.5" />
                      <span>{thread.repliesCount} Replies</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
