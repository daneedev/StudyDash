import {
  createRoute,
  Outlet,
  redirect,
  type AnyRoute,
} from "@tanstack/react-router";
import "../assets/css/index.css";

import { rootRoute } from "./rootRoute";
import { DashboardNavBar } from "../components/DashboardNavBar";
import { checkAuthToken } from "./rootRoute";

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: DashboardLayout,
  beforeLoad: async ({ location }) => {
    const authResult = await checkAuthToken();
    if (!authResult.isValid) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { userData: authResult.userData };
  },
});

const overallRoute = createRoute({
  getParentRoute: () => route,
  path: "/",
  component: SectionLayout,
});

const notesRoute = createRoute({
  getParentRoute: () => route,
  path: "notes",
  component: SectionLayout, // TODO: Replace with actual Notes component
});
const tasksRoute = createRoute({
  getParentRoute: () => route,
  path: "todo",
  component: SectionLayout, // TODO: Replace with actual To-do component
});
const calendarRoute = createRoute({
  getParentRoute: () => route,
  path: "calendar",
  component: SectionLayout, // TODO: Replace with actual Calendar component
});
const settingsRoute = createRoute({
  getParentRoute: () => route,
  path: "settings",
  component: SectionLayout, // TODO: Replace with actual Settings component
});
const profileRoute = createRoute({
  getParentRoute: () => route,
  path: "profile",
  component: SectionLayout, // TODO: Replace with actual Profile component
});

function DashboardLayout() {
  const { userData } = route.useRouteContext();

  return (
    <>
     <DashboardNavBar username={userData ? userData.username : ''} />
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="space-y-2 text-center">
          <Outlet />
        </div>
      </main>
    </>
  );
}

function SectionLayout() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard -</h1>
      <p className="text-gray-500">
        Protected dashboard placeholder. Users must be authenticated to view
        this route.
      </p>
    </>
  );
}


export const dashboardRouteTree = route.addChildren([
  overallRoute,
  notesRoute,
  profileRoute,
  calendarRoute,
  tasksRoute,
  settingsRoute,
]);

type DashboardComponent = typeof DashboardLayout & { route?: AnyRoute };
(DashboardLayout as DashboardComponent).route = route;

export default DashboardLayout;
