import { useEffect, useState } from "react";
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
import { DashboardProfilePage } from "./DashboardProfilePage";
import { DashboardNotesPage } from "./DashboardNotesPage";
import { DashboardLoader } from "../components/DashboardLoader";
import { DashboardNotesProvider } from "../context/DashboardNotesContext";

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
  component: DashboardNotesPage, // TODO: Replace with actual Notes component
});
const noteRoute = createRoute({
  getParentRoute: () => route,
  path: "notes/$noteId",
  component: DashboardNotePage,
});
const notesSubjectRoute = createRoute({
  getParentRoute: () => route,
  path: "notes/subj/$subjectId",
  component: DashboardSubjectNotesPage,
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
  component: DashboardProfilePage,
});

function DashboardLayout() {
  const { userData } = route.useRouteContext();
  const getStoredProfile = () => {
    const raw = localStorage.getItem("user_profile");
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as { username?: string };
    } catch {
      return null;
    }
  };
  const [profileUsername, setProfileUsername] = useState(
    userData?.username ?? getStoredProfile()?.username ?? ""
  );

  useEffect(() => {
    setProfileUsername(userData?.username ?? getStoredProfile()?.username ?? "");
  }, [userData]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as { username?: string } | undefined;
      if (detail?.username) {
        setProfileUsername(detail.username);
      }
    };
    window.addEventListener("user-profile-updated", handler);
    return () => window.removeEventListener("user-profile-updated", handler);
  }, []);

  return (
    <DashboardNotesProvider>
      <>
        <DashboardNavBar username={profileUsername} />
        <main className="relative z-0 flex min-h-screen justify-center p-6 ml-[72px]">
          <DashboardLoader />
          <Outlet />
        </main>
      </>
    </DashboardNotesProvider>
  );
}

function SectionLayout() {
  return (
    <>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">
          Protected dashboard placeholder. Users must be authenticated to view
          this route.
        </p>
      </div>
      
    </>
  );
}

function DashboardSubjectNotesPage() {
  return (
    <></>
  );
}

function DashboardNotePage() {
  return <></>;
}

export const dashboardRouteTree = route.addChildren([
  overallRoute,
  notesRoute,
  noteRoute,
  notesSubjectRoute,
  profileRoute,
  calendarRoute,
  tasksRoute,
  settingsRoute,
]);

type DashboardComponent = typeof DashboardLayout & { route?: AnyRoute };
(DashboardLayout as DashboardComponent).route = route;

export default DashboardLayout;
