
import { Link, useParams } from "react-router-dom";
import CreateTaskDialog from "../task/create-task-dialog";
import EditProjectDialog from "./edit-project-dialog";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProjectByIdQueryFn } from "@/lib/api";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";
import { Loader, AlertTriangle, ArrowLeft } from "lucide-react";

const ProjectHeader = () => {
  const param = useParams();
  const projectId = param.projectId as string;
  const workspaceId = useWorkspaceId();

  const { data, isPending, isError } = useQuery({
    queryKey: ["singleProject", projectId],
    queryFn: () =>
      getProjectByIdQueryFn({
        workspaceId,
        projectId,
      }),
    staleTime: Infinity,
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });

  const project = data?.project;
  const projectEmoji = project?.emoji || "📁";
  const projectName = project?.name || "Untitled Project";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Project title area with Back link */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/workspace/${workspaceId}/projects`}
          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title="Back to Projects"
          aria-label="Back to projects directory"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400">Loading project...</span>
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Failed to load project</span>
          </div>
        ) : (
          <>
            {/* Emoji box */}
            <div className="shrink-0 w-11 h-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-2xl shadow-xs select-none">
              {projectEmoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {projectName}
                </h1>
                <PermissionsGuard requiredPermission={Permissions.EDIT_PROJECT}>
                  <EditProjectDialog project={project} />
                </PermissionsGuard>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {project?.description || "Project Workspace · All Tasks"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0">
        <CreateTaskDialog projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectHeader;

