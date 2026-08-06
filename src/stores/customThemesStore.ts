import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuctionTheme } from '@/content/auction'

/**
 * Thèmes de Criée créés par la tablée, persistés sur l'appareil - même
 * philosophie que « Mes règles » (customRulesStore) : zéro compte, zéro réseau,
 * les données restent locales.
 */
export interface CustomTheme {
  id: string
  text: string
  enabled: boolean
  createdAt: number
}

export const CUSTOM_THEME_MAX_LENGTH = 80

interface CustomThemesState {
  themes: CustomTheme[]

  /** Ajoute un thème (trim + longueur bornée). Renvoie false si texte vide. */
  add: (text: string) => boolean
  remove: (id: string) => void
  toggle: (id: string) => void

  /** Thèmes actifs au format AuctionTheme, prêts à rejoindre le pool. */
  getAuctionThemes: () => AuctionTheme[]
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function isValidTheme(raw: unknown): raw is CustomTheme {
  if (typeof raw !== 'object' || raw === null) return false
  const t = raw as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    t.text.trim().length > 0 &&
    typeof t.enabled === 'boolean' &&
    typeof t.createdAt === 'number'
  )
}

export const useCustomThemesStore = create<CustomThemesState>()(
  persist(
    (set, get) => ({
      themes: [],

      add: (text) => {
        const clean = text.trim().slice(0, CUSTOM_THEME_MAX_LENGTH)
        if (clean.length === 0) return false
        const theme: CustomTheme = {
          id: makeId(),
          text: clean,
          enabled: true,
          createdAt: Date.now(),
        }
        set({ themes: [...get().themes, theme] })
        return true
      },

      remove: (id) => set({ themes: get().themes.filter((t) => t.id !== id) }),

      toggle: (id) =>
        set({
          themes: get().themes.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
        }),

      getAuctionThemes: () =>
        get()
          .themes.filter((t) => t.enabled)
          .map((t) => ({ id: `custom-${t.id}`, text: t.text })),
    }),
    {
      name: 'bacchana-custom-themes',
      version: 1,
      partialize: (state) => ({ themes: state.themes }),
      // Toute entrée corrompue est écartée plutôt que de bloquer l'hydratation.
      migrate: (persisted) => {
        const raw = (persisted as { themes?: unknown[] } | undefined)?.themes ?? []
        return { themes: raw.filter(isValidTheme) }
      },
    }
  )
)
