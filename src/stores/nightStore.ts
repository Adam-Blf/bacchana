import { create } from 'zustand'
import type { GameMode } from '@/core/engine/types'

/**
 * L'ardoise de la soirée - cumul des pénalités de TOUS les jeux joués depuis
 * l'ouverture de l'app. Volontairement non persisté : la session se remet à
 * zéro à chaque lancement (règle produit "tout doit être reset"), l'ardoise
 * suit. Clé = prénom du joueur (les ids de session changent d'un mode à
 * l'autre, pas les prénoms de la tablée).
 */
interface NightEntry {
  total: number
  games: number
}

interface NightState {
  /** Cumul par prénom. */
  ledger: Record<string, NightEntry>
  /** Nombre de parties terminées cette soirée, tous jeux confondus. */
  gamesPlayed: number
  /** Modes distincts joués cette soirée. */
  modesPlayed: GameMode[]

  /** Enregistre une partie terminée. counts = pénalités par prénom. */
  record: (mode: GameMode, counts: Record<string, number>) => void
  reset: () => void
}

export const useNightStore = create<NightState>()((set, get) => ({
  ledger: {},
  gamesPlayed: 0,
  modesPlayed: [],

  record: (mode, counts) => {
    const ledger = { ...get().ledger }
    for (const [name, total] of Object.entries(counts)) {
      const prev = ledger[name] ?? { total: 0, games: 0 }
      ledger[name] = { total: prev.total + total, games: prev.games + 1 }
    }
    const modes = get().modesPlayed
    set({
      ledger,
      gamesPlayed: get().gamesPlayed + 1,
      modesPlayed: modes.includes(mode) ? modes : [...modes, mode],
    })
  },

  reset: () => set({ ledger: {}, gamesPlayed: 0, modesPlayed: [] }),
}))

/** Classement de la soirée, du plus chargé au plus épargné. */
export function nightRanking(ledger: Record<string, NightEntry>): { name: string; total: number }[] {
  return Object.entries(ledger)
    .map(([name, e]) => ({ name, total: e.total }))
    .sort((a, b) => b.total - a.total)
}
