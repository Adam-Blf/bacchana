import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppScreen } from '@/types'

interface AppState {
  // Navigation
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen) => void
  goToHub: () => void

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
      goToHub: () => set({ currentScreen: 'hub' }),

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
