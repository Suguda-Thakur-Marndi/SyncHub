import { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Loader, LogOut, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroupContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import LogoutDialog from "./logout-dialog";
import HelpDialog from "./help-dialog";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { Separator } from "../ui/separator";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { getAvatarColor } from "@/lib/helper";

const Asidebar = () => {
  const { isLoading, user } = useAuthContext();
  const { open } = useSidebar();
  const workspaceId = useWorkspaceId();
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);


  const userInitials = [
    user?.name?.split(" ")?.[0]?.charAt(0),
    user?.name?.split(" ")?.[1]?.charAt(0),
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const avatarColor = getAvatarColor(user?.name || "User");

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 transition-colors duration-200"
      >
        {/* Header */}
        <SidebarHeader className="border-b border-slate-200 dark:border-slate-800/60 !py-0 bg-white dark:bg-slate-900">
          <div className="flex h-[72px] w-full items-center justify-start gap-3 overflow-hidden px-4">
            <Logo url={`/workspace/${workspaceId}`} />
            {open && (
              <Link
                to={`/workspace/${workspaceId}`}
                className="ml-1 flex items-center text-base font-extrabold tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                GPMS
              </Link>
            )}
          </div>
        </SidebarHeader>

        {/* Content */}
        <SidebarContent className="!mt-0 bg-white dark:bg-slate-900 overflow-y-auto scrollbar">
          <SidebarGroup className="!py-0">
            <SidebarGroupContent className="space-y-0 pt-3">
              <WorkspaceSwitcher />
              <NavMain />
              <Separator className="mx-3 my-2 w-auto bg-slate-100 dark:bg-slate-800/60" />
              <NavProjects />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-white dark:bg-slate-900 py-4 px-4 border-t border-slate-200 dark:border-slate-800/60">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader size={16} className="animate-spin text-slate-400" />
                </div>
              ) : open ? (
                /* Expanded Sidebar Footer (Direct Actions) */
                <div className="flex items-center justify-between gap-3 w-full animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-9 w-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800/80">
                      <AvatarImage src={user?.profilePicture || ""} />
                      <AvatarFallback className={`${avatarColor} text-white font-bold text-xs`}>
                        {userInitials || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left leading-tight min-w-0">
                      <span className="truncate font-semibold text-slate-900 dark:text-slate-100 text-[13px]">
                        {user?.name}
                      </span>
                      <span className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setIsHelpOpen(true)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Help & Shortcuts"
                      aria-label="Help and shortcuts"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/workspace/${workspaceId}/settings`}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title="Settings"
                      aria-label="Workspace settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Logout"
                      aria-label="Log out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Collapsed Sidebar Footer (Dropdown Trigger) */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-0 flex items-center justify-center cursor-pointer"
                    >
                      <Avatar className="h-9 w-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800/80">
                        <AvatarImage src={user?.profilePicture || ""} />
                        <AvatarFallback className={`${avatarColor} text-white font-bold text-xs`}>
                          {userInitials || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-56 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5"
                    side="right"
                    align="end"
                    sideOffset={12}
                  >
                    <div className="px-3 py-2 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {user?.email}
                      </p>
                    </div>

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => setIsHelpOpen(true)}
                        className="cursor-pointer rounded-xl px-2.5 py-2 flex items-center gap-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Help & Shortcuts</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-xl px-2.5 py-2 flex items-center gap-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Link to={`/workspace/${workspaceId}/settings`}>
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/60 my-1" />

                    <DropdownMenuItem
                      onClick={() => setIsOpen(true)}
                      className="cursor-pointer rounded-xl px-2.5 py-2 flex items-center gap-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 text-sm font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      <HelpDialog isOpen={isHelpOpen} setIsOpen={setIsHelpOpen} />
    </>
  );
};


export default Asidebar;
