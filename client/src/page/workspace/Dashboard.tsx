import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import WorkspaceAnalytics from "@/components/workspace/workspace-analytics";

import RecentProjects from "@/components/workspace/project/recent-projects";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";

// Import custom widgets
import UpcomingDeadlines from "@/components/workspace/dashboard-widgets/UpcomingDeadlines";
import RecentActivity from "@/components/workspace/dashboard-widgets/RecentActivity";
import TodayTasks from "@/components/workspace/dashboard-widgets/TodayTasks";
import TeamMembersList from "@/components/workspace/dashboard-widgets/TeamMembersList";
import MiniCalendar from "@/components/workspace/dashboard-widgets/MiniCalendar";
import ProjectProgressCard from "@/components/workspace/dashboard-widgets/ProjectProgressCard";

const WorkspaceDashboard = () => {
  const { onOpen } = useCreateProjectDialog();
  const { user } = useAuthContext();
  const workspaceId = useWorkspaceId();

  // Fetch counts dynamically for welcome banner
  const { data: analyticsData } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 1,
  });

  const totalTasks = analyticsData?.analytics?.totalTasks || 0;
  const completedTasks = analyticsData?.analytics?.completedTasks || 0;
  const pendingTasksCount = totalTasks - completedTasks;
  const activeProjectsCount = projectsData?.pagination?.totalCount || 0;

  // Determine dynamic greeting message
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();
  const userName = user?.name || "Workspace Member";

  return (
    <main className="flex flex-1 flex-col gap-6 pb-10 animate-fade-in">
      {/* Page Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, {userName} 👋
          </h1>
          <h2 className="text-[22px] font-semibold tracking-tight text-slate-800 dark:text-slate-200 mt-1">
            Workspace Overview
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
            You have <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{pendingTasksCount}</span> pending tasks and{" "}
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{activeProjectsCount}</span> active projects today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <CreateTaskDialog
            buttonVariant="outline"
            buttonText="Create Task"
            buttonClassName="h-10 px-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-all rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
          />
          <Button
            onClick={onOpen}
            className="h-10 px-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold transition-all rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <WorkspaceAnalytics />

      {/* Responsive columns grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Left Column (Recent Projects, Upcoming Deadlines, Recent Activity) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-3">
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200">
                Recent Projects
              </h3>
            </div>
            <RecentProjects />
          </div>

          <UpcomingDeadlines />
          
          <RecentActivity />
        </div>

        {/* Right Column (Today's Tasks, Team Members, Calendar, Project Progress) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <TodayTasks />
          
          <TeamMembersList />
          
          <MiniCalendar />
          
          <ProjectProgressCard />
        </div>
      </div>
    </main>
  );
};

export default WorkspaceDashboard;
