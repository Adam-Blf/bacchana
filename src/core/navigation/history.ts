import type { AppScreen } from '@/types'

// Bridge between window.history and the app's Zustand navigation state.
//
// The app has a single URL, so the browser history is used purely as a back-button
// channel: one history entry per in-app screen or open overlay. Hardware/browser
// back and in-app back buttons flow through the same popstate handler, which keeps
// both worlds in lockstep.
//
// History layout: position 0 is an "exit trap" sitting under the root screen.
//
// Ce que la trappe fait, depuis le 2026-08-31 : plus rien d'AFFICHÉ. Elle
// montrait « Appuie encore pour quitter », et cette notification surgissait au
// milieu des parties, sur tous les modes. Le double appui n'était pas en cause :
// c'est la pile qui dérivait. Un sélecteur fermé restait inscrit dans
// `stack` sans que son entrée d'historique soit retirée (voir `closeOverlay`),
// si bien qu'un retour retombait sur une entrée d'overlay morte, n'appliquait
// AUCUN écran, et il fallait appuyer plusieurs fois - jusqu'à tomber sur la
// position 0 et déclencher la notification. Elle avait donc l'air aléatoire
// parce qu'elle dépendait du nombre de sélecteurs ouverts avant.
//
// Deux corrections, et pas une seule : la notification est retirée, ET le
// retour applique désormais le dernier écran RÉEL sous les overlays morts.
// Retirer l'affichage sans réparer la dérive aurait juste rendu le défaut
// muet, ce qui est pire - le geste de retour aurait fini par quitter l'app.

interface ScreenEntry {
  kind: 'screen'
  screen: AppScreen
}

interface OverlayEntry {
  kind: 'overlay'
  id: string
  onClose: () => void
  closed: boolean
}

type NavEntry = ScreenEntry | OverlayEntry

interface NavBindings {
  applyScreen: (screen: AppScreen) => void
  getScreen: () => AppScreen
  /**
   * Vrai quand il n'y a rien à protéger et que le geste de retour peut
   * réellement fermer l'application. Faux pendant une partie ou une soirée :
   * on retombe alors sur l'écran racine, ce qui est une action VISIBLE, plutôt
   * que de fermer l'app ou d'afficher une notification.
   */
  peutQuitter: () => boolean
}

let bindings: NavBindings | null = null
let initialized = false
// stack[i] corresponds to history position i + 1 (position 0 is the exit trap).
let stack: NavEntry[] = []
let currentPos = 0
let ignorePops = 0
// Returns true when it consumed the back gesture (e.g. opened a quit confirmation).
let backGuard: (() => boolean) | null = null
let bypassGuardOnce = false

function navState(pos: number) {
  return { lt: pos }
}

function top(): NavEntry | undefined {
  return stack[stack.length - 1]
}

/**
 * Le dernier écran RÉEL de la pile, en traversant les overlays.
 *
 * `top()` ne suffit pas : un overlay fermé pendant que la navigation avançait
 * reste en haut de pile, et se fier à lui laissait l'écran affiché figé sur
 * l'écran précédent pendant que l'historique, lui, avait bougé.
 */
function dernierEcran(): AppScreen | null {
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i]
    if (entry.kind === 'screen') return entry.screen
  }
  return null
}

function appliquerDernierEcran() {
  const screen = dernierEcran()
  if (screen) bindings?.applyScreen(screen)
}

function popEntries(count: number) {
  for (let i = 0; i < count; i++) {
    const popped = stack.pop()
    if (popped && popped.kind === 'overlay' && !popped.closed) {
      popped.closed = true
      popped.onClose()
    }
  }
}

function handlePopState(event: PopStateEvent) {
  if (!bindings) return
  if (ignorePops > 0) {
    ignorePops -= 1
    return
  }

  const target = (event.state as { lt?: number } | null)?.lt
  if (typeof target !== 'number') {
    // Foreign history entry - re-anchor onto our current position.
    window.history.replaceState(navState(currentPos), '')
    return
  }

  if (target >= currentPos) {
    // Forward navigation: those entries were dropped on pop, snap back.
    ignorePops += 1
    window.history.go(currentPos - target)
    return
  }

  if (target === 0) {
    // Landed on the exit trap under the root screen.
    popEntries(stack.length - 1)
    if (bindings.peutQuitter()) {
      // Rien en cours : le geste de retour fait ce qu'il annonce, il sort.
      window.history.back()
      return
    }
    // Une partie ou une soirée court : on remonte sur l'écran racine plutôt
    // que de fermer. Le geste a fait quelque chose de visible, sans notification.
    window.history.pushState(navState(1), '')
    currentPos = 1
    bypassGuardOnce = false
    appliquerDernierEcran()
    return
  }

  const delta = currentPos - target

  if (delta === 1 && !bypassGuardOnce && backGuard) {
    const entry = top()
    if (entry?.kind === 'screen' && backGuard()) {
      // Guard consumed the back gesture - restore the history entry.
      window.history.pushState(navState(currentPos), '')
      return
    }
  }

  popEntries(delta)
  currentPos = target
  bypassGuardOnce = false
  appliquerDernierEcran()
}

export function bindNavigation(b: NavBindings) {
  bindings = b
  if (initialized || typeof window === 'undefined') return
  initialized = true
  stack = [{ kind: 'screen', screen: b.getScreen() ?? 'hub' }]
  window.history.replaceState(navState(0), '')
  window.history.pushState(navState(1), '')
  currentPos = 1
  window.addEventListener('popstate', handlePopState)
}

/** Navigate forward to a screen (adds a history entry). */
export function navPush(screen: AppScreen) {
  if (!initialized) {
    bindings?.applyScreen(screen)
    return
  }
  const entry = top()
  if (entry?.kind === 'screen' && entry.screen === screen) return
  stack.push({ kind: 'screen', screen })
  currentPos += 1
  window.history.pushState(navState(currentPos), '')
  bindings?.applyScreen(screen)
}

/** Navigate to a screen without adding a history entry (redirects). */
export function navReplace(screen: AppScreen) {
  if (!initialized) {
    bindings?.applyScreen(screen)
    return
  }
  const entry = top()
  if (entry?.kind === 'screen') {
    entry.screen = screen
    window.history.replaceState(navState(currentPos), '')
    bindings?.applyScreen(screen)
  } else {
    navPush(screen)
  }
}

/** One step back - same path as the hardware/browser back button. */
export function navBack() {
  if (!initialized) {
    bindings?.applyScreen('hub')
    return
  }
  window.history.back()
}

/**
 * Unwind everything back to the HUB (explicit quit - bypasses guards).
 *
 * Elle rendait « le dernier ecran », pas le hub, et les deux ont longtemps
 * coincide : l'application demarrait toujours sur la saisie des joueurs, et la
 * racine devenait le hub des qu'on y entrait.
 *
 * Ce n'est plus vrai depuis qu'une partie en cours est reprise apres un
 * rafraichissement. Au rechargement, `bindNavigation` prend l'ecran courant
 * pour racine, et cet ecran peut etre un JEU. « Quitter » redonnait alors le
 * jeu qu'on venait de quitter, c'est-a-dire rien du tout. Repere par un
 * parcours automatise, sur un retour au hub qui n'arrivait jamais.
 *
 * La racine est donc REECRITE avant de derouler : le hub est une destination,
 * pas l'endroit ou l'on se trouve par hasard au moment du rechargement.
 */
export function navHome() {
  if (!initialized) {
    bindings?.applyScreen('hub')
    return
  }
  const root = stack[0]
  if (root?.kind === 'screen') root.screen = 'hub'

  const depth = currentPos - 1
  if (depth <= 0) {
    window.history.replaceState(navState(currentPos), '')
    appliquerDernierEcran()
    return
  }
  bypassGuardOnce = true
  window.history.go(-depth)
}

/** Register an open overlay so the back button closes it before leaving the screen. */
export function pushOverlay(id: string, onClose: () => void) {
  if (!initialized) return
  stack.push({ kind: 'overlay', id, onClose, closed: false })
  currentPos += 1
  window.history.pushState(navState(currentPos), '')
}

/** An overlay closed itself (X button, backdrop, Escape) - pop its history entry. */
export function closeOverlay(id: string) {
  if (!initialized) return
  for (let i = stack.length - 1; i >= 1; i--) {
    const entry = stack[i]
    if (entry.kind === 'overlay' && entry.id === id && !entry.closed) {
      entry.closed = true
      if (i === stack.length - 1) window.history.back()
      return
    }
  }
}

/**
 * Intercept the next single-step back on the current screen. Return true to consume
 * the gesture (e.g. to show a quit confirmation instead of leaving mid-game).
 */
export function setBackGuard(guard: (() => boolean) | null) {
  backGuard = guard
}

/** Test-only: tear down module state so each test starts from a clean slate. */
export function __resetNavigationForTests() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handlePopState)
  }
  bindings = null
  initialized = false
  stack = []
  currentPos = 0
  ignorePops = 0
  backGuard = null
  bypassGuardOnce = false
}
