import { Suspense } from 'react'
import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

const showDevtools =
  import.meta.env.DEV // stačí to spustit pomocí 'npm run dev' pro zobrazení dev tools

const RootComponent = () => (
  <>
    <Outlet />
    {showDevtools && (
      <Suspense fallback={null}>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    )}
  </>
)

export default RootComponent
