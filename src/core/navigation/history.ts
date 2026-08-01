import type { AppScreen } from '@/types'

// Bridge between window.history and the app's Zustand navigation state.
//
// The app has a single URL, so the browser history is used purely as a back-button
// channel: one history entry per in-app screen or open overlay. Hardware/browser
// back and in-app back buttons flow through the same popstate handler, which keeps
// both worlds in lockstep.
//
// History layout: position 0 is an "exit trap" sitting under the root screen.
// Backing onto it shows a "press again to quit" toast instead of leaving the app;
// a second back within the toast window really exits.

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
  onExitToast: (visible: boolean) => void
}

const EXIT_TOAST_MS = 2000

let bindings: NavBindings | null = null
let initialized = false
// stack[i] corresponds to history position i + 1 (position 0 is the exit trap).
let stack: NavEntry[] = []
let currentPos = 0
let ignorePops = 0
let exitArmedUntil = 0
let exitToastTimer: ReturnType<typeof setTimeout> | undefined
// Returns true when it consumed the back gesture (e.g. opened a quit confirmation).
let backGuard: (() => boolean) | null = null
let bypassGuardOnce = false

function navState(pos: number) {
  return { lt: pos }
}

function top(): NavEntry | undefined {
  return stack[stack.length - 1]
}

function armExitToast() {
  exitArmedUntil = Date.now() + EXIT_TOAST_MS
  bindings?.onExitToast(true)
  if (exitToastTimer) clearTimeout(exitToastTimer)
  exitToastTimer = setTimeout(() => bindings?.onExitToast(false), EXIT_TOAST_MS)
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
    if (Date.now() < exitArmedUntil) {
      window.history.back()
      return
    }
    armExitToast()
    window.history.pushState(navState(1), '')
    currentPos = 1
    bypassGuardOnce = false
    const root = stack[0]
    if (root?.kind === 'screen') bindings.applyScreen(root.screen)
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
  const entry = top()
  if (entry?.kind === 'screen') bindings.applyScreen(entry.screen)
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

/** Unwind everything back to the root screen (explicit quit - bypasses guards). */
export function navHome() {
  if (!initialized) {
    bindings?.applyScreen('hub')
    return
  }
  const depth = currentPos - 1
  if (depth <= 0) {
    const root = stack[0]
    if (root?.kind === 'screen') bindings?.applyScreen(root.screen)
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
  if (exitToastTimer) clearTimeout(exitToastTimer)
  bindings = null
  initialized = false
  stack = []
  currentPos = 0
  ignorePops = 0
  exitArmedUntil = 0
  backGuard = null
  bypassGuardOnce = false
}
