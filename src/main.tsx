import './utils/migrateStorage'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

// Galerie de debug design (les 52 cartes) : /?cards
const showCardGallery = new URLSearchParams(window.location.search).has('cards')

const Root = showCardGallery
  ? lazy(() => import('./components/game/CardGallery').then((m) => ({ default: m.CardGallery })))
  : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Root />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
)
