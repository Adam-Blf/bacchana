import './utils/migrateStorage'
import './stores/themeStore'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { lireApercu } from './utils/previewFromUrl'
import { useAppStore, useGameStore } from './stores'
import { brancherMiseAJour } from './lib/miseAJour'

// Galerie de debug design (les 52 cartes) : /?cards
const showCardGallery = new URLSearchParams(window.location.search).has('cards')

const Root = showCardGallery
  ? lazy(() => import('./components/game/CardGallery').then((m) => ({ default: m.CardGallery })))
  : App

// Ouverture d'un ecran precis depuis l'URL : /?screen=settings, /?screen=game&mode=quiz
//
// L'application choisit son ecran depuis l'etat du magasin. Sans ce pont, un outil
// externe qui lit une page - plugin d'import Figma, capture, test visuel - ne peut
// atteindre que l'accueil. On seme donc l'etat minimal AVANT le premier rendu, pour
// que ces outils voient les composants reels et non une maquette qui divergerait.
//
// Sans parametre `screen`, `lireApercu` rend null et rien de tout ceci ne s'execute.
const apercu = lireApercu(window.location.search)
if (apercu) {
  useGameStore.getState().setPlayers(apercu.joueurs)
  const app = useAppStore.getState()
  if (apercu.mode) {
    app.setActiveMode(apercu.mode as Parameters<typeof app.setActiveMode>[0])
  }
  // `replace` : l'ecran demande devient l'etat initial, sans laisser un retour
  // vers un accueil que l'utilisateur n'a jamais vu.
  app.navigateTo(apercu.ecran, { replace: true })
}

// La PWA va chercher une nouvelle version au retour dans l'application, au
// retour du reseau et toutes les heures, puis l'applique entre deux parties.
brancherMiseAJour()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Root />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
)
