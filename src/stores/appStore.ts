import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppScreen } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { bindNavigation, navBack, navHome, navPush, navReplace } from '@/core/navigation/history'

interface AppState {
  // Navigation
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen, opts?: { replace?: boolean }) => void
  goBack: () => void
  goToHub: () => void

  // Active mode - which entry of the mode registry is currently being played.
  // null while on welcome/hub/rules, or for the legacy default (Le Borderland).
  activeMode: GameMode | null
  setActiveMode: (mode: GameMode | null) => void

  // "Appuie encore pour quitter" toast, driven by the history exit trap.
  exitToastVisible: boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation - default to hub
      currentScreen: 'hub',
      navigateTo: (screen, opts) => (opts?.replace ? navReplace(screen) : navPush(screen)),
      goBack: () => navBack(),
      goToHub: () => navHome(),

      activeMode: null,
      setActiveMode: (mode) => set({ activeMode: mode }),

      exitToastVisible: false,
    }),
    {
      name: 'la-tournee-app',
      partialize: () => ({
        // Nothing persisted for now - currentScreen always starts at hub
      }),
    }
  )
)

// All screen changes flow through the history layer, so the hardware back button
// and in-app navigation stay in sync.
bindNavigation({
  applyScreen: (screen) =>
    useAppStore.setState(
      screen === 'hub'
        ? { currentScreen: 'hub', activeMode: null }
        : { currentScreen: screen }
    ),
  getScreen: () => useAppStore.getState()?.currentScreen ?? 'hub',
  onExitToast: (visible) => useAppStore.setState({ exitToastVisible: visible }),
})
