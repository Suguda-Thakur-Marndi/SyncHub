import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";
import { useAuthContext } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Settings as SettingsIcon,
  Building2,
  Palette,
  User,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Check,
  ShieldCheck,
  KeyRound,
  LogOut,
} from "lucide-react";
import LogoutDialog from "@/components/asidebar/logout-dialog";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "account" | "danger">("general");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, workspace } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      label: "Light",
      description: "Clean, crisp light mode for daylight work",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark",
      description: "Deep, contrast-tuned dark mode for focused sessions",
      icon: Moon,
    },
    {
      id: "system",
      label: "System default",
      description: "Automatically match your operating system theme",
      icon: Monitor,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-indigo-600/10 p-2.5 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-1.5 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                Workspace Preferences
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Workspace & Account Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage workspace identity, customize theme aesthetics, and view session details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace identity pill */}
      <WorkspaceHeader />

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "general"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="h-4 w-4" />
          General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "appearance"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Palette className="h-4 w-4" />
          Appearance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "account"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <User className="h-4 w-4" />
          Account & Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("danger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "danger"
              ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800/80"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </button>
      </div>

      {/* Tab Panels */}
      <div className="max-w-4xl">
        {/* General Tab */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Workspace Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Update your workspace name, identity, and shared purpose.
                  </p>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Active Workspace
                </div>
              </div>
              <Separator className="mb-6 bg-slate-200 dark:bg-slate-800" />
              <EditWorkspaceForm />
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Theme Appearance
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Customize the interface mode for your comfort and lighting conditions.
                </p>
              </div>
              <Separator className="mb-6 bg-slate-200 dark:bg-slate-800" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`relative flex flex-col items-start p-5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between mb-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <Check className="h-4 w-4" />
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {t.label}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Your Profile
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Account identity associated with your active session.
                </p>
              </div>
              <Separator className="mb-6 bg-slate-200 dark:bg-slate-800" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 mb-6">
                <Avatar className="h-16 w-16 border-2 border-indigo-200 dark:border-indigo-900 shadow-sm">
                  <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-indigo-600 text-white text-lg font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || "Member"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user?.email || "No email available"}
                  </p>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Authenticated via Secure Session
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100 font-medium text-sm">
                    <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Session Authentication
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Secured with HttpOnly cookie sessions and encrypted credentials.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-slate-100 font-medium text-sm">
                    <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Current Organization
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Connected to workspace <strong>{workspace?.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsLogoutOpen(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out of account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 dark:border-red-950/60 dark:bg-red-950/10 shadow-sm">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
                    Danger Zone
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Irreversible actions that permanently affect this workspace and its team assets.
                  </p>
                </div>
                <div className="rounded-full border border-red-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-slate-900/70 dark:text-red-300">
                  High impact
                </div>
              </div>
              <Separator className="mb-5 bg-red-200 dark:bg-red-900/60" />
              <DeleteWorkspaceCard />
            </div>
          </div>
        )}
      </div>

      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </div>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
