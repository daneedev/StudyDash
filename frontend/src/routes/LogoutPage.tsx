import { createRoute, redirect, type AnyRoute } from "@tanstack/react-router";

import { rootRoute, setAuthToken } from "./rootRoute";

const LogoutPage = () => null;

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: "logout",
  component: LogoutPage,
  beforeLoad: () => {
    setAuthToken(null);
    throw redirect({ to: "/login" });
  },
});

type LogoutComponent = typeof LogoutPage & { route?: AnyRoute };
(LogoutPage as LogoutComponent).route = route;

export default LogoutPage;
