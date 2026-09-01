import './utils/migrateStorage'
import './stores/themeStore'
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { lireApercu } from './utils/previewFromUrl'
import { useAppStore, useGameStore } from './stores'
import { lireReprise } from './stores/appStore'
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

// Reprise apres un rechargement de page.
//
// Ne vaut que pour un ECRAN DE JEU, et seulement si la tablee est encore la.
// Rouvrir sur l'accueil est la regle produit (une ouverture d'application est
// une nouvelle tablee) ; ce qu'on repare ici est le rechargement subi - retour
// d'appel, mise a jour appliquee par le service worker, onglet recycle par le
// systeme - apres lequel la partie existait toujours en memoire sans que rien
// ne l'affiche.
//
// L'ecran d'accueil est pose en RACINE avant de pousser le jeu : sans cela, le
// geste de retour depuis la partie tomberait directement sur la trappe de
// sortie au lieu de revenir au menu.
const reprise = apercu ? null : lireReprise()
if (reprise?.ecran === 'game' && useGameStore.getState().hasPlayers()) {
  const app = useAppStore.getState()
  app.navigateTo('hub', { replace: true })
  app.navigateTo('game')
  // LE MODE SE POSE EN DERNIER, et l'ordre n'est pas un detail de style.
  //
  // Passer par le hub appelle `applyScreen('hub')`, qui remet volontairement
  // `activeMode` a null - c'est ce qui fait qu'on ne revient jamais sur le menu
  // avec un mode encore arme. Le declarer AVANT le detour revenait donc a
  // l'effacer aussitot, et la reprise atterrissait sur l'ecran de jeu sans mode
  // actif. Sans mode actif, le routeur bascule sur le flux du Borderland, dont
  // la phase vaut `setup` apres un rechargement, et une garde d'App renvoyait
  // alors sur la saisie des joueurs.
  //
  // Le symptome etait donc « le rafraichissement perd la partie », alors que la
  // partie, la tablee et le point de reprise etaient tous les trois intacts sur
  // l'appareil. Mesure par `scripts/parcours_navigateur.mjs` le 2026-09-01 :
  // point de reprise ecrit {"ecran":"game","mode":"quiz"}, relu, puis reecrit en
  // {"ecran":"welcome","mode":null} une seconde plus tard.
  app.setActiveMode(reprise.mode)
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
