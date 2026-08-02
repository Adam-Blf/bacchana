import { create } from 'zustand'
import type { GameMode } from '@/core/engine/types'

/**
 * L'ardoise de la soirée - cumul des pénalités de TOUS les jeux joués depuis
 * l'ouverture de l'app. Volontairement non persisté : la session se remet à
 * zéro à chaque lancement (règle produit "tout doit être reset"), l'ardoise
 * suit. Clé = identifiant du joueur, jamais le prénom : deux "Adam" à la même
 * table fusionnaient leurs pénalités et faussaient le classement.
 */
interface NightEntry {
  name: string
  total: number
  games: number
}

interface NightState {
  /** Cumul par identifiant de joueur. */
  ledger: Record<string, NightEntry>
  /** Nombre de parties terminées cette soirée, tous jeux confondus. */
  gamesPlayed: number
  /** Modes distincts joués cette soirée. */
  modesPlayed: GameMode[]

  /** Enregistre une partie terminée. entries = pénalités par joueur. */
  record: (mode: GameMode, entries: { id: string; name: string; total: number }[]) => void
  reset: () => void
}

export const useNightStore = create<NightState>()((set, get) => ({
  ledger: {},
  gamesPlayed: 0,
  modesPlayed: [],

  record: (mode, entries) => {
    const ledger = { ...get().ledger }
    for (const { id, name, total } of entries) {
      const prev = ledger[id] ?? { name, total: 0, games: 0 }
      // Le nom le plus récent gagne : un joueur renommé en cours de soirée reste
      // la même ligne d'ardoise.
      ledger[id] = { name, total: prev.total + total, games: prev.games + 1 }
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
export function nightRanking(ledger: Record<string, NightEntry>): { id: string; name: string; total: number }[] {
  return Object.entries(ledger)
    .map(([id, e]) => ({ id, name: e.name, total: e.total }))
    .sort((a, b) => b.total - a.total)
}
