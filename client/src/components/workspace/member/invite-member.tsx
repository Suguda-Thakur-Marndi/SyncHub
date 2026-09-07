import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";
import { Check, Copy, Loader, Mail, ShieldCheck, Users } from "lucide-react";
import { BASE_ROUTE } from "@/routes/common/routePaths";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const InviteMember = () => {
  const { workspace, workspaceLoading } = useAuthContext();
  const [copied, setCopied] = useState(false);

  const inviteUrl = workspace
    ? `${window.location.origin}${BASE_ROUTE.INVITE_URL.replace(
        ":inviteCode",
        workspace.inviteCode
      )}`
    : "";

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).then(() => {
        setCopied(true);
        toast({
          title: "Link Copied",
          description: "Workspace invitation link copied to clipboard.",
          variant: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const mailtoUrl = inviteUrl
    ? `mailto:?subject=${encodeURIComponent(
        `Join our workspace "${workspace?.name || "GPMS"}"`
      )}&body=${encodeURIComponent(
        `Hi,\n\nYou have been invited to collaborate on "${
          workspace?.name || "GPMS"
        }". Click the link below to join:\n\n${inviteUrl}\n\nSee you on the team!`
      )}`
    : "#";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Invite Colleagues & Collaborators
          </h4>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Share your workspace invitation link. Anyone with this link can join as a team member.
        </p>
      </div>

      <PermissionsGuard showMessage requiredPermission={Permissions.ADD_MEMBER}>
        {workspaceLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Link Copy Box */}
            <div className="flex items-center gap-2">
              <Input
                id="invite-link-input"
                disabled={true}
                className="h-10 text-xs font-mono disabled:opacity-100 disabled:pointer-events-none bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                value={inviteUrl}
                readOnly
                aria-label="Workspace invite link"
              />
              <Button
                type="button"
                className="h-10 px-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </Button>
            </div>

            {/* Quick Email Share & Role Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Invited members join with standard <strong>MEMBER</strong> permissions.</span>
              </div>

              <a
                href={mailtoUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Share via email</span>
              </a>
            </div>
          </div>
        )}
      </PermissionsGuard>
    </div>
  );
};

export default InviteMember;

