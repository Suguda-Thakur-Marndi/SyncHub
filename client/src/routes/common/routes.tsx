import { lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";

const RouteLoader = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

const Landing = lazy(() => import("@/page/landing/Landing"));
const SignIn = lazy(() => import("@/page/auth/Sign-in"));
const SignUp = lazy(() => import("@/page/auth/Sign-up"));
const GoogleOAuthFailure = lazy(() => import("@/page/auth/GoogleOAuthFailure"));

const WorkspaceDashboard = lazy(() => import("@/page/workspace/Dashboard"));
const Tasks = lazy(() => import("@/page/workspace/Tasks"));
const Members = lazy(() => import("@/page/workspace/Members"));
const Settings = lazy(() => import("@/page/workspace/Settings"));
const ProjectDetails = lazy(() => import("@/page/workspace/ProjectDetails"));
const Projects = lazy(() => import("@/page/workspace/Projects"));
const Calendar = lazy(() => import("@/page/workspace/Calendar"));
const Reports = lazy(() => import("@/page/workspace/Reports"));
const InviteUser = lazy(() => import("@/page/invite/InviteUser"));

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.LANDING, element: withSuspense(Landing) },
  { path: AUTH_ROUTES.SIGN_IN, element: withSuspense(SignIn) },
  { path: AUTH_ROUTES.SIGN_UP, element: withSuspense(SignUp) },
  { path: AUTH_ROUTES.GOOGLE_OAUTH_CALLBACK, element: withSuspense(GoogleOAuthFailure) },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: withSuspense(WorkspaceDashboard) },
  { path: PROTECTED_ROUTES.TASKS, element: withSuspense(Tasks) },
  { path: PROTECTED_ROUTES.MEMBERS, element: withSuspense(Members) },
  { path: PROTECTED_ROUTES.SETTINGS, element: withSuspense(Settings) },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: withSuspense(ProjectDetails) },
  { path: PROTECTED_ROUTES.PROJECTS, element: withSuspense(Projects) },
  { path: PROTECTED_ROUTES.CALENDAR, element: withSuspense(Calendar) },
  { path: PROTECTED_ROUTES.REPORTS, element: withSuspense(Reports) },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.INVITE_URL, element: withSuspense(InviteUser) },
];
