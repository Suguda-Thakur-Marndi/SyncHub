import { useState } from "react";
import { ChevronDown, Loader, Search, Shield } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Permissions } from "@/constant";
import { format } from "date-fns";

const roleBadgeColors: Record<string, string> = {
  OWNER:
    "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  ADMIN:
    "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  MEMBER:
    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
};

const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast({
          title: "Success",
          description: "Member role updated successfully.",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = m.userId?.name?.toLowerCase() || "";
    const email = m.userId?.email?.toLowerCase() || "";
    return name.includes(q) || email.includes(q);
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Members Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter members by name or email..."
          className="w-full h-9 pl-9 pr-4 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-medium">
          No members found matching "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const name = member.userId?.name;
            const initials = getAvatarFallbackText(name);
            const avatarColor = getAvatarColor(name);
            const roleName = member.role?.name || "MEMBER";
            const roleBadge = roleBadgeColors[roleName] || roleBadgeColors.MEMBER;
            const isCurrentUser = member.userId._id === user?._id;
            const joinedDate = member.joinedAt || member.createdAt;

            return (
              <div
                key={member.userId._id}
                className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-150"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-700 shadow-sm shrink-0">
                    <AvatarImage
                      src={member.userId?.profilePicture || ""}
                      alt={name}
                    />
                    <AvatarFallback className={`${avatarColor} text-sm font-bold`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {name}
                      </p>
                      {isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800 shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="truncate">{member.userId.email}</span>
                      {joinedDate && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Joined {format(new Date(joinedDate), "MMM d, yyyy")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Badge / Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Static badge for non-changeable roles */}
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full hidden sm:inline-flex ${roleBadge}`}>
                    {roleName.toLowerCase()}
                  </span>


              {/* Role changer popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium capitalize rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoading || !canChangeMemberRole || isCurrentUser}
                  >
                    <Shield className="w-3 h-3 mr-1.5 text-slate-400" />
                    {member.role.name?.toLowerCase()}
                    {canChangeMemberRole && !isCurrentUser && (
                      <ChevronDown className="ml-1.5 w-3 h-3 text-slate-400" />
                    )}
                  </Button>
                </PopoverTrigger>
                {canChangeMemberRole && (
                  <PopoverContent className="p-0 w-56 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700" align="end">
                    <Command className="rounded-xl">
                      <CommandInput
                        placeholder="Select role..."
                        disabled={isLoading}
                        className="text-sm"
                      />
                      <CommandList>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader className="w-5 h-5 animate-spin text-indigo-500" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty className="text-sm text-slate-500 py-4 text-center">
                              No roles found.
                            </CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role) =>
                                  role.name !== "OWNER" && (
                                    <CommandItem
                                      key={role._id}
                                      disabled={isLoading}
                                      className="flex flex-col items-start gap-0.5 px-4 py-3 cursor-pointer rounded-lg m-1"
                                      onSelect={() => {
                                        handleSelect(role._id, member.userId._id);
                                      }}
                                    >
                                      <p className="font-semibold capitalize text-sm">
                                        {role.name?.toLowerCase()}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {role.name === "ADMIN" &&
                                          "Can view, create, edit tasks, projects and manage settings."}
                                        {role.name === "MEMBER" &&
                                          "Can view and edit only tasks assigned to them."}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
};

export default AllMembers;
