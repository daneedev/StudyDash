import { createRouter, type AnyRoute } from '@tanstack/react-router'

import { authState, rootRoute } from './routes/rootRoute'

type RouteModule = {
  route?: AnyRoute
  default?: unknown
}

const routeModules = import.meta.glob<true, string, RouteModule>('./routes/**/*Page.tsx', {
  eager: true,
})

const appModules = import.meta.glob<true, string, RouteModule>('./App.tsx', {
  eager: true,
})

const childRoutes = [...Object.values(routeModules), ...Object.values(appModules)]
  .map<AnyRoute | undefined>((module) => {
    if (module.route) {
      return module.route
    }

    if (module.default && typeof module.default === 'object') {
      const maybeRoute = Reflect.get(module.default, 'route')
      if (maybeRoute) {
        return maybeRoute as AnyRoute
      }
    }

    if (typeof module.default === 'function') {
      const maybeRoute = Reflect.get(module.default, 'route')
      if (maybeRoute) {
        return maybeRoute as AnyRoute
      }
    }

    return undefined
  })
  .filter((route): route is AnyRoute => route !== undefined)

const routeTree = rootRoute.addChildren(childRoutes)

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
