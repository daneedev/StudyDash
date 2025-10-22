import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'

const DashboardPage = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-500">
        Protected dashboard placeholder. Users must be authenticated to view this route.
      </p>
    </div>
  </main>
)

const route = createRoute({
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

type DashboardComponent = typeof DashboardPage & { route?: AnyRoute }
;(DashboardPage as DashboardComponent).route = route

export default DashboardPage
