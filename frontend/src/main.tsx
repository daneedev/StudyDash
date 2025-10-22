import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {HeroUIProvider} from '@heroui/react'
import {AppRouter} from './AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <AppRouter />
    </HeroUIProvider>
  </StrictMode>,
)
