import useWorkspaceId from "@/hooks/use-workspace-id";
import AnalyticsCard from "./common/analytics-card";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn, getWorkspaceAnalyticsQueryFn } from "@/lib/api";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { useAuthContext } from "@/context/auth-provider";

const WorkspaceAnalytics = () => {
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();

  const { data: analyticsData, isPending: isAnalyticsPending } = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: () => getWorkspaceAnalyticsQueryFn(workspaceId),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const { data: projectsData, isPending: isProjectsPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 1,
  });

  const { data: myTasksData, isPending: isMyTasksPending } = useQuery({
    queryKey: ["my-tasks-count", workspaceId, user?._id],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        assignedTo: user?._id,
        pageSize: 1,
      }),
    enabled: !!workspaceId && !!user?._id,
  });

  const analytics = analyticsData?.analytics;
  const activeProjectsCount = projectsData?.pagination?.totalCount || projectsData?.projects?.length || 0;
  const myTasksCount = myTasksData?.pagination?.totalCount || 0;

  return (
    <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsCard
        isLoading={isProjectsPending}
        title="Active Projects"
        value={activeProjectsCount}
      />
      <AnalyticsCard
        isLoading={isMyTasksPending}
        title="My Tasks"
        value={myTasksCount}
      />
      <AnalyticsCard
        isLoading={isAnalyticsPending}
        title="Completed Tasks"
        value={analytics?.completedTasks || 0}
      />
      <AnalyticsCard
        isLoading={isAnalyticsPending}
        title="Overdue Tasks"
        value={analytics?.overdueTasks || 0}
      />
    </div>
  );
};

export default WorkspaceAnalytics;

