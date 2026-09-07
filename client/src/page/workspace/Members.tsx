import { Separator } from "@/components/ui/separator";
import InviteMember from "@/components/workspace/member/invite-member";
import AllMembers from "@/components/workspace/member/all-members";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { Users } from "lucide-react";

export default function Members() {
  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Team Members
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage workspace access, collaborate with colleagues, and configure member roles.
          </p>
        </div>
      </div>

      {/* Workspace Identity */}
      <WorkspaceHeader />

      {/* Invitation Section */}
      <div className="section-card">
        <InviteMember />
      </div>

      {/* Member Directory */}
      <div className="section-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Workspace Members
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Members can view all workspace projects, create tasks, and contribute to timelines.
          </p>
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        <AllMembers />
      </div>
    </div>
  );
}

