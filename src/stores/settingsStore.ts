import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeChoice = 'system' | 'light' | 'dark'

interface SettingsState {
  theme: ThemeChoice
  setTheme: (theme: ThemeChoice) => void
}

const THEME_COLORS = { light: '#FFF9F0', dark: '#181411' } as const

function resolveDark(theme: ThemeChoice): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Pose la classe .dark sur <html> et aligne la barre de statut (theme-color). */
export function applyTheme(theme: ThemeChoice) {
  if (typeof document === 'undefined') return
  const dark = resolveDark(theme)
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'la-tournee-settings',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? 'system')
      },
    }
  )
)

// En mode « system », suivre les changements de préférence de l'OS en direct.
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (useSettingsStore.getState().theme === 'system') applyTheme('system')
    })
}
