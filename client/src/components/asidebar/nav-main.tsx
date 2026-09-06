"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { hasPermission } = useAuthContext();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );

  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const pathname = location.pathname;

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: "Projects",
      url: `/workspace/${workspaceId}/projects`,
      icon: FolderKanban,
    },
    {
      title: "Members",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    {
      title: "Calendar",
      url: `/workspace/${workspaceId}/calendar`,
      icon: Calendar,
    },
    {
      title: "Reports",
      url: `/workspace/${workspaceId}/reports`,
      icon: BarChart3,
    },
    ...(canManageSettings
      ? [
          {
            title: "Settings",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <SidebarGroup className="px-2 py-1">
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          // Strict dashboard match, prefix match for others
          const isActive =
            item.title === "Dashboard"
              ? pathname === item.url
              : pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title} className="relative">
              {/* Left active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-indigo-600 dark:bg-indigo-500 z-10" />
              )}
              <SidebarMenuButton
                isActive={isActive}
                asChild
                className={`
                  rounded-xl h-10 transition-all duration-200 text-xs font-semibold
                  ${isActive
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/30 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  }
                `}
              >
                <Link to={item.url} className="flex items-center gap-3 px-3">
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
