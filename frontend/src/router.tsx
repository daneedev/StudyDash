import { Suspense } from 'react'
import {
  Outlet,
  RouterProvider,
  createRoute,
  createRootRouteWithContext,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import LandingPage from './App'
import LoginPage from './routes/LoginPage'
import RegisterPage from './routes/RegisterPage'
import DashboardPage from './routes/DashboardPage'

type AuthState = {
  isAuthenticated: boolean
}

type RouterContext = {
  auth: AuthState
}

const authState: AuthState = {
  isAuthenticated: true,
}

const RootComponent = () => (
  <>
    <Outlet />
    {import.meta.env.DEV && (
      <Suspense fallback={null}>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    )}
  </>
)

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'register',
  component: RegisterPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardPage,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
])

export const router = createRouter({
  routeTree,
  context: {
    auth: authState,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

type RouterProps = {
  children?: never
}

export const AppRouter = (_props: RouterProps) => <RouterProvider router={router} />
