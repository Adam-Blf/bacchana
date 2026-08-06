import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Thème clair/sombre de Bacchana. « system » suit prefers-color-scheme et
 * réagit en direct au changement d'OS ; le choix explicite est persisté sur
 * l'appareil. L'application se fait via [data-theme] sur <html>, consommé par
 * tokens.css, et la meta theme-color suit pour la barre de statut PWA.
 */
export type ThemePreference = 'system' | 'light' | 'dark'

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** Bascule simple clair/sombre depuis le thème effectif courant. */
  toggle: () => void
}

const THEME_COLORS = { light: '#fff9f0', dark: '#141216' } as const

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(preference)
  document.documentElement.dataset.theme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved])
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (preference) => {
        applyTheme(preference)
        set({ preference })
      },
      toggle: () => {
        const next = resolveTheme(get().preference) === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        set({ preference: next })
      },
    }),
    {
      name: 'bacchana-theme',
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.preference ?? 'system')
      },
    }
  )
)

// Premier rendu avant réhydratation, et suivi du thème OS en mode « system ».
if (typeof window !== 'undefined') {
  applyTheme(useThemeStore.getState().preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { preference } = useThemeStore.getState()
    if (preference === 'system') applyTheme(preference)
  })
}
