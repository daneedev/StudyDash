import { createRoute, type AnyRoute } from '@tanstack/react-router'

import { rootRoute } from './routes/rootRoute'

const App = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold">Welcome to StudyDash</h1>
      <p className="text-gray-500">
        Landing page placeholder. Swap in the real content once the design is ready.
      </p>
    </div>
  </main>
)

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

type AppComponent = typeof App & { route?: AnyRoute }
;(App as AppComponent).route = route

export default App
