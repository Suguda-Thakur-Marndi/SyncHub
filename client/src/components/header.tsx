import { SidebarTrigger } from "@/components/ui/sidebar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useTheme } from "@/context/theme-provider";
import { useAuthContext } from "@/context/auth-provider";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { Sun, Moon, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InviteMember from "@/components/workspace/member/invite-member";
import NotificationCenter from "@/components/workspace/notifications/notification-center";
import { getAvatarColor } from "@/lib/helper";

const Header = () => {
  const workspaceId = useWorkspaceId();
  const { theme, setTheme } = useTheme();
  const { user } = useAuthContext();
  const workspaceQuery = useGetWorkspaceQuery(workspaceId);

  const workspaceName = workspaceQuery?.data?.workspace?.name || "Workspace";
  const workspaceAvatarLetter = workspaceName.charAt(0).toUpperCase();

  const userInitials = [
    user?.name?.split(" ")?.[0]?.charAt(0),
    user?.name?.split(" ")?.[1]?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const avatarColor = getAvatarColor(user?.name || "User");

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 transition-all duration-200">
      {/* Left: Sidebar trigger & Workspace Title */}
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer" />
        
        {/* Workspace Display */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-sm select-none">
            {workspaceAvatarLetter}
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-slate-100 truncate max-w-[140px] md:max-w-[200px]">
            {workspaceName}
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="relative w-full max-w-xs md:max-w-md hidden md:block mx-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search projects, tasks, members..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500/80 transition-all text-xs font-medium"
        />
      </div>

      {/* Right: Actions (Invite, Notification, Theme, User Avatar) */}
      <div className="flex items-center gap-3">
        {/* Invite Member dialog button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold transition-all rounded-xl shadow-sm text-xs md:text-sm flex items-center gap-1.5 cursor-pointer shrink-0">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Invite Team Members
              </DialogTitle>
            </DialogHeader>
            <InviteMember />
          </DialogContent>
        </Dialog>

        {/* Notifications Center */}
        <NotificationCenter />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer shrink-0"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* User Avatar */}
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-slate-100 dark:ring-slate-800/80">
          <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
          <AvatarFallback className={`${avatarColor} text-white font-bold text-xs`}>
            {userInitials || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
