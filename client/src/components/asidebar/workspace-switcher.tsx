import * as React from "react";
import { Check, ChevronDown, Loader, Plus, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type WorkspaceType = {
  _id: string;
  name: string;
};

export function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const { open } = useSidebar();

  const { onOpen } = useCreateWorkspaceDialog();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    staleTime: 1,
    refetchOnMount: true,
  });

  const workspaces = data?.workspaces;

  const activeWorkspace = React.useMemo(() => {
    if (!workspaces?.length) return undefined;
    return workspaceId
      ? workspaces.find((ws) => ws._id === workspaceId)
      : workspaces[0];
  }, [workspaceId, workspaces]);

  React.useEffect(() => {
    if (workspaces?.length && !workspaceId && activeWorkspace) {
      navigate(`/workspace/${activeWorkspace._id}`);
    }
  }, [workspaceId, workspaces, activeWorkspace, navigate]);

  const onSelect = (workspace: WorkspaceType) => {
    navigate(`/workspace/${workspace._id}`);
  };

  // Fetch count of members and projects dynamically
  const { data: membersData } = useGetWorkspaceMembers(workspaceId);
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 1, // Minimize payload since we just need the pagination.totalCount or count
  });

  const memberCount = membersData?.members?.length || 0;
  const projectCount = projectsData?.pagination?.totalCount || projectsData?.projects?.length || 0;

  return (
    <SidebarMenu className="px-2 mb-4">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-16 w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-slate-800 text-slate-700 dark:text-slate-300 p-2.5 flex items-center gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer"
            >
              {/* Workspace Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-base shadow-md select-none">
                {activeWorkspace?.name?.charAt(0).toUpperCase() || "W"}
              </div>

              {/* Workspace Name & counts */}
              {open && (
                <div className="grid flex-1 text-left leading-tight min-w-0">
                  <span className="truncate font-bold text-sm text-slate-900 dark:text-slate-100">
                    {activeWorkspace?.name || "Loading..."}
                  </span>
                  <span className="truncate text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {memberCount} members • {projectCount} projects
                  </span>
                </div>
              )}

              {open && (
                <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5"
            align="start"
            side="bottom"
            sideOffset={6}
          >
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2.5 py-2">
              Your Workspaces
            </DropdownMenuLabel>

            {isPending ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : null}

            {workspaces?.map((workspace) => (
              <DropdownMenuItem
                key={workspace._id}
                onClick={() => onSelect(workspace)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs">
                  {workspace?.name?.split(" ")?.[0]?.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 truncate font-semibold text-slate-800 dark:text-slate-200">
                  {workspace.name}
                </span>
                {workspace._id === workspaceId && (
                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800/60 my-1" />

            <DropdownMenuItem
              className="flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/55 dark:hover:bg-indigo-950/20 focus:bg-indigo-50/55 dark:focus:bg-indigo-950/20 focus:text-indigo-600 text-sm font-semibold transition-colors"
              onClick={onOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700">
                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span>Create workspace</span>
            </DropdownMenuItem>

            {workspaceId && (
              <DropdownMenuItem
                asChild
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                <Link to={`/workspace/${workspaceId}/settings`}>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700">
                    <Settings className="w-4 h-4 text-slate-400" />
                  </div>
                  <span>Workspace settings</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}


