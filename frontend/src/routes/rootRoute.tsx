import { createRootRouteWithContext } from '@tanstack/react-router'

import RootComponent from './RootComponent'

const AUTH_TOKEN_KEY = 'studydash_token'

const getStoredToken = () => {
  if (typeof localStorage === 'undefined') {
    return null
  }

  return localStorage.getItem(AUTH_TOKEN_KEY)
}

const storedToken = getStoredToken()

export type AuthState = {
  isAuthenticated: boolean
  accessToken: string | null
}

export type RouterContext = {
  auth: AuthState
}

export const authState: AuthState = {
  isAuthenticated: Boolean(storedToken),
  accessToken: storedToken,
}

export const setAuthToken = (token: string | null) => {
  authState.accessToken = token
  authState.isAuthenticated = Boolean(token)

  if (typeof localStorage === 'undefined') {
    return
  }

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})
