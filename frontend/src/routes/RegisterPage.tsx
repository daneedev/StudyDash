import { createRoute, type AnyRoute } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'

const RegisterPage = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <p className="text-gray-500">
        Registration screen placeholder. Replace with the real form once authentication is ready.
      </p>
    </div>
  </main>
)

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: 'register',
  component: RegisterPage,
})

type RegisterComponent = typeof RegisterPage & { route?: AnyRoute }
;(RegisterPage as RegisterComponent).route = route

export default RegisterPage
