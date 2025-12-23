import { createRootRouteWithContext } from "@tanstack/react-router";

import RootComponent from "./RootComponent";

export type AuthState = {
  isAuthenticated: boolean;
};


export type RouterContext = {
  auth: AuthState;
};

export const authState: AuthState = {
  isAuthenticated: Boolean(getStoredToken()),
};



function getStoredToken(): string | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage.getItem("auth_token");
}

export async function checkAuthToken(token?: string): Promise<{isValid: boolean, userData?: any}> {
  const currentToken = token || getStoredToken() ;
    if (!currentToken) {
        return {isValid: false};
    }
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${currentToken}`,
            },
        });
        localStorage.setItem("auth_token", currentToken);
        if (response.ok) {
            const data = await response.json();
            return {isValid: true, userData: data.data};
        } else {
            localStorage.removeItem("auth_token");
            return {isValid: false};
        }
    }
    catch (error) {
        return {isValid: false};
    }
}   

export async function setAuthToken(token: string | null): Promise<void> {
    const result = token ? await checkAuthToken(token) : {isValid: false};
    if (result.isValid && token) {
        authState.isAuthenticated = true;
        localStorage.setItem("auth_token", token);
    } else {
        authState.isAuthenticated = false;
        localStorage.removeItem("auth_token");
    }
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
