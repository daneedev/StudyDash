import { createRootRouteWithContext } from '@tanstack/react-router'

import RootComponent from './RootComponent'

export type AuthState = {
  isAuthenticated: boolean
}

export type RouterContext = {
  auth: AuthState
}

export const authState: AuthState = {
  isAuthenticated: true,
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})
