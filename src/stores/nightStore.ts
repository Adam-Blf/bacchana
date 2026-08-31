import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameMode } from '@/core/engine/types'

/**
 * L'ardoise de la soirée - cumul des pénalités de TOUS les jeux joués depuis
 * l'ouverture de l'app. Clé = identifiant du joueur, jamais le prénom : deux
 * "Adam" à la même table fusionnaient leurs pénalités et faussaient le
 * classement.
 *
 * PERSISTÉE depuis le 2026-08-31, avec une date de péremption de quatre heures.
 * Elle ne l'était pas, au nom de la règle « tout doit être reset au
 * lancement » : un simple rechargement de page effaçait donc le cumul de toute
 * la soirée, y compris quand c'est la mise à jour de l'application qui l'avait
 * déclenché. La règle visait la réouverture du lendemain, pas l'accident du
 * milieu de soirée - le seuil fait désormais la différence.
 */
const SEUIL_REPRISE_MS = 4 * 60 * 60 * 1000
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

export const useNightStore = create<NightState>()(persist((set, get) => ({
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
}), {
  name: 'bacchana-ardoise',
  partialize: (state) => ({
    ledger: state.ledger,
    gamesPlayed: state.gamesPlayed,
    modesPlayed: state.modesPlayed,
    majLe: Date.now(),
  }),
  onRehydrateStorage: () => (etat, erreur) => {
    if (erreur || !etat) return
    const majLe = (etat as unknown as { majLe?: number }).majLe ?? 0
    if (Date.now() - majLe >= SEUIL_REPRISE_MS) {
      useNightStore.setState({ ledger: {}, gamesPlayed: 0, modesPlayed: [] })
    }
  },
}))

/** Classement de la soirée, du plus chargé au plus épargné. */
export function nightRanking(ledger: Record<string, NightEntry>): { id: string; name: string; total: number }[] {
  return Object.entries(ledger)
    .map(([id, e]) => ({ id, name: e.name, total: e.total }))
    .sort((a, b) => b.total - a.total)
}
