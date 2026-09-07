import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar as CalendarIcon,
  ChevronRight,
  Loader,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";

const Projects = () => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "tasks">("recent");

  const { data, isPending } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageNumber: 1,
    pageSize: 100, // Load all projects
  });

  // Query workspace tasks to compute project progress and task counts
  const { data: tasksData } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () => getAllTasksQueryFn({ workspaceId, pageSize: 200 }),
    enabled: !!workspaceId,
  });

  const projects = useMemo(() => data?.projects || [], [data?.projects]);
  const allTasks = useMemo(() => tasksData?.tasks || [], [tasksData?.tasks]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "tasks") {
      result.sort((a, b) => {
        const aCount = allTasks.filter((t) => t.project?._id === a._id).length;
        const bCount = allTasks.filter((t) => t.project?._id === b._id).length;
        return bCount - aCount;
      });
    } else {
      // Recent (by createdAt)
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [projects, searchQuery, sortBy, allTasks]);

  return (
    <main className="flex flex-1 flex-col gap-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Projects
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Organize, monitor, and deliver all initiatives in your workspace.
          </p>
        </div>

        <Button
          onClick={onOpen}
          className="h-10 px-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold transition-all rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Controls Bar: Search, Sort, and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full h-9 pl-9 pr-4 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "name" | "tasks")}
              className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Alphabetical</option>
              <option value="tasks">Most Tasks</option>
            </select>
          </div>

          {/* Grid / List view toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="List View"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-24">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : filteredProjects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center clean-card bg-white dark:bg-slate-800 border-dashed border-2 max-w-2xl mx-auto w-full mt-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[32px] mb-4 select-none shadow-sm">
            📁
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {searchQuery ? "No Matching Projects" : "No Projects Yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-1.5 mb-6 leading-relaxed">
            {searchQuery
              ? `No projects found matching "${searchQuery}". Try adjusting your search query.`
              : "Create your first project to start organizing tasks and collaborating with your team."}
          </p>
          {!searchQuery && (
            <Button
              onClick={onOpen}
              className="h-10 px-5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const creatorName = project.createdBy?.name || "Workspace Member";
            const initials = getAvatarFallbackText(creatorName);
            const avatarColor = getAvatarColor(creatorName);

            // Compute task counts and progress
            const projectTasks = allTasks.filter((t) => t.project?._id === project._id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter((t) => t.status === "DONE").length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const isFinished = totalTasks > 0 && completedTasks === totalTasks;

            return (
              <Link
                key={project._id}
                to={`/workspace/${workspaceId}/project/${project._id}`}
                className="clean-card bg-white dark:bg-slate-800 p-5 flex flex-col justify-between group hover:border-indigo-500/40 dark:hover:border-indigo-400/40 transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Emoji, Status, and Arrow */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xl select-none shadow-xs">
                        {project.emoji || "📁"}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isFinished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                        }`}
                      >
                        {isFinished ? "Completed" : "Active"}
                      </span>
                    </div>

                    <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <ChevronRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || "No project description provided."}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 ring-1 ring-white dark:ring-slate-700">
                      <AvatarImage
                        src={project.createdBy?.profilePicture || ""}
                        alt={creatorName}
                      />
                      <AvatarFallback className={`${avatarColor} text-[9px] font-bold`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[90px]">
                      {creatorName.split(" ")[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{project.createdAt ? format(project.createdAt, "MMM d") : "—"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="clean-card bg-white dark:bg-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
          {filteredProjects.map((project) => {
            const creatorName = project.createdBy?.name || "Workspace Member";
            const initials = getAvatarFallbackText(creatorName);
            const avatarColor = getAvatarColor(creatorName);

            const projectTasks = allTasks.filter((t) => t.project?._id === project._id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter((t) => t.status === "DONE").length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const isFinished = totalTasks > 0 && completedTasks === totalTasks;

            return (
              <Link
                key={project._id}
                to={`/workspace/${workspaceId}/project/${project._id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
              >
                {/* Left: Emoji, Title & Description */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xl select-none shadow-xs">
                    {project.emoji || "📁"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {project.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isFinished
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}
                      >
                        {isFinished ? "Completed" : "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Center: Progress bar */}
                <div className="hidden md:flex items-center gap-3 w-40 shrink-0">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 w-8 text-right">
                    {progress}%
                  </span>
                </div>

                {/* Right: Tasks, Creator, Date & Arrow */}
                <div className="flex items-center gap-4 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                    {completedTasks}/{totalTasks} tasks
                  </span>

                  <Avatar className="h-6 w-6 ring-1 ring-white dark:ring-slate-700 hidden sm:flex">
                    <AvatarImage
                      src={project.createdBy?.profilePicture || ""}
                      alt={creatorName}
                    />
                    <AvatarFallback className={`${avatarColor} text-[9px] font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden lg:inline text-[11px]">
                    {project.createdAt ? format(project.createdAt, "MMM d, yyyy") : "—"}
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Projects;

