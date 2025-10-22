import { createRoute, type AnyRoute } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'

const LoginPage = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-gray-500">
        Login screen placeholder. Replace with the real form once authentication is ready.
      </p>
    </div>
  </main>
)

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

type LoginComponent = typeof LoginPage & { route?: AnyRoute }
;(LoginPage as LoginComponent).route = route

export default LoginPage
