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

import { DashboardOverview } from "../components/DashboardOverview";
import { useState } from "react";

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
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const marginClass = isNavExpanded ? "ml-48" : "ml-14 md:ml-18";

  return (
    <>
      <DashboardNavBar
        username={userData ? userData.username : ""}
        isExpanded={isNavExpanded}
        onToggle={setIsNavExpanded}
      />
      <main
        className={`${marginClass} pt-6 pb-6 px-6 h-screen transition-all duration-200`}
      >
        <Outlet />
      </main>
    </>
  );
}

function SectionLayout() {
  const { userData } = route.useRouteContext();
  return (
    <>
      <DashboardOverview username={userData ? userData.username : ""} />
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
