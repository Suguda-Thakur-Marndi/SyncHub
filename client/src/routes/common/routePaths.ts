export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  LANDING: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/auth/google/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  PROJECTS: "/workspace/:workspaceId/projects",
  CALENDAR: "/workspace/:workspaceId/calendar",
  REPORTS: "/workspace/:workspaceId/reports",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};
