import { createRoute, type AnyRoute } from '@tanstack/react-router'

import { LandingPage } from './features/landing/LandingPage'
import { rootRoute } from './routes/rootRoute'

const App = () => <LandingPage />

const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

type AppComponent = typeof App & { route?: AnyRoute }
;(App as AppComponent).route = route

export default App
