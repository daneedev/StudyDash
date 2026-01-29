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
import { main } from "framer-motion/client";
import { useState } from "react";

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "classes",
  component: ClassesPage,
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

function ClassesPage() {
  return (
    <main className="flex flex-col flex-1 p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Třídy
      </h1>
      <p className="text-gray-700 dark:text-gray-300">
        Zde bude seznam vašich tříd.
      </p>
    </main>
  );
}

type ClassesPageComponent = typeof ClassesPage & { route?: AnyRoute };
(ClassesPage as ClassesPageComponent).route = route;

export default ClassesPage;
