import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PackItem } from '@/core/engine/types'
import type { GameMode } from '@/core/engine/types'
import type { RouletteSegment } from '@/content/roulette'
import {
  CustomRuleSchema,
  customRuleToPackItem,
  customRuleToRouletteSegment,
  type CustomRule,
  type CustomRuleKind,
} from '@/core/engine/customRules'

interface CustomRulesState {
  rules: CustomRule[]

  add: (input: { kind: CustomRuleKind; text: string; modes?: GameMode[]; sips?: number }) => void
  update: (id: string, patch: Partial<Pick<CustomRule, 'text' | 'modes' | 'penalty' | 'kind'>>) => void
  remove: (id: string) => void
  toggle: (id: string) => void

  /** Items de pack actifs à injecter dans une session du mode donné. */
  getPromptItemsFor: (mode: GameMode) => PackItem[]
  /** Segments actifs à ajouter à la roue. */
  getRouletteSegments: () => RouletteSegment[]
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const useCustomRulesStore = create<CustomRulesState>()(
  persist(
    (set, get) => ({
      rules: [],

      add: ({ kind, text, modes, sips }) => {
        const now = Date.now()
        const rule: CustomRule = {
          id: makeId(),
          kind,
          text: text.trim(),
          ...(modes && modes.length > 0 ? { modes } : {}),
          ...(sips && sips > 0 ? { penalty: { sips } } : {}),
          enabled: true,
          createdAt: now,
          updatedAt: now,
        }
        set({ rules: [...get().rules, rule] })
      },

      update: (id, patch) => {
        set({
          rules: get().rules.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        })
      },

      remove: (id) => set({ rules: get().rules.filter((r) => r.id !== id) }),

      toggle: (id) =>
        set({
          rules: get().rules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled, updatedAt: Date.now() } : r
          ),
        }),

      getPromptItemsFor: (mode) =>
        get()
          .rules.filter(
            (r) =>
              r.enabled &&
              r.kind === 'prompt' &&
              (!r.modes || r.modes.length === 0 || r.modes.includes(mode))
          )
          .map(customRuleToPackItem),

      getRouletteSegments: () =>
        get()
          .rules.filter((r) => r.enabled && r.kind === 'roulette')
          .map(customRuleToRouletteSegment),
    }),
    {
      name: 'meskova-custom-rules',
      version: 1,
      partialize: (state) => ({ rules: state.rules }),
      // Toute entrée corrompue/inconnue est silencieusement écartée plutôt que de
      // bloquer l'hydratation du store.
      migrate: (persisted) => {
        const raw = (persisted as { rules?: unknown[] } | undefined)?.rules ?? []
        const rules = raw
          .map((r) => CustomRuleSchema.safeParse(r))
          .filter((res): res is { success: true; data: CustomRule } => res.success)
          .map((res) => res.data)
        return { rules }
      },
    }
  )
)
