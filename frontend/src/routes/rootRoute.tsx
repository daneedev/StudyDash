import { createRootRouteWithContext } from "@tanstack/react-router";

import RootComponent from "./RootComponent";

const AUTH_TOKEN_KEY = "studydash_token";

const getStoredToken = () => {
  if (typeof localStorage === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const storedToken = getStoredToken();

export type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
};

export type RouterContext = {
  auth: AuthState;
};

export const authState: AuthState = {
  isAuthenticated: Boolean(storedToken),
  accessToken: storedToken,
};

export const setAuthToken = async (token: string | null) => {
  if (token) {
    authState.accessToken = token;
    authState.isAuthenticated = true;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } else {
    authState.accessToken = null;
    authState.isAuthenticated = false;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  if (token) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        authState.accessToken = null;
        authState.isAuthenticated = false;
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (error) {
      // Při chybě sítě ponechte token (offline mode)
      console.error("Failed to verify token:", error);
    }
  }
};

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
