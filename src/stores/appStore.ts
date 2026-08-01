import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppScreen } from '@/types'
import type { GameMode } from '@/core/engine/types'

interface AppState {
  // Navigation
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen) => void
  goToHub: () => void

  // Active mode - which entry of the mode registry is currently being played.
  // null while on welcome/hub/rules, or for the legacy default (Le Borderland).
  activeMode: GameMode | null
  setActiveMode: (mode: GameMode | null) => void

  // Menu
  isMenuOpen: boolean
  toggleMenu: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation - default to hub
      currentScreen: 'hub',
      navigateTo: (screen) => set({ currentScreen: screen }),
      goToHub: () => set({ currentScreen: 'hub', activeMode: null }),

      activeMode: null,
      setActiveMode: (mode) => set({ activeMode: mode }),

      // Menu
      isMenuOpen: false,
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
    }),
    {
      name: 'blackout-storage',
      partialize: () => ({
        // Nothing persisted for now - currentScreen always starts at hub
      }),
    }
  )
)
