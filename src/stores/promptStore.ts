import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player } from '@/types'
import type { ContentPack, GameMode, PackItem } from '@/core/engine/types'
import { idsDejaVus, marquerVu } from '@/stores/vuStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import {
  applyPenalty,
  createPromptSession,
  drawNext,
  type PromptSessionState,
} from '@/core/engine/promptSession'

/** Params needed to relaunch the exact same pack/tablée - "Revanche" replays this, not the hub. */
interface LastSessionParams {
  mode: GameMode
  pack: ContentPack
  players: Player[]
  extraItems: PackItem[]
}

interface PromptStore {
  session: PromptSessionState | null
  packTitle: string | null
  lastParams: LastSessionParams | null

  /**
   * Starts a fresh session for a prompt-based mode using the given pack and player list.
   * `extraItems` (e.g. the user's custom rules) are shuffled into the deck.
   */
  startSession: (mode: GameMode, pack: ContentPack, players: Player[], extraItems?: PackItem[]) => void
  /** Advances to the next prompt (rotates turn, expires rules, may finish the session). */
  next: () => void
  /** Records a penalty for a player (defaults to +1). */
  penalize: (playerId: string, amount?: number) => void
  /**
   * Relaunches the same pack/tablée from scratch ("Revanche" on the recap screen) - a
   * true replay, not a bounce back to the hub. No-op if no session was ever started.
   */
  replay: () => void
  /** Clears the session, e.g. when leaving the mode without finishing. */
  reset: () => void
}

/**
 * PERSISTE depuis le 2026-08-31, et l'en-tete precedent disait exactement le
 * contraire : « ephemere par construction ».
 *
 * Sept modes lisent leur manche ici. Elle ne vivait qu'en memoire, donc un
 * rechargement de page l'effacait - et l'ecran, ne trouvant plus de session,
 * renvoyait au hub sans un mot. Le service worker declenche lui-meme ce
 * rechargement quand une mise a jour s'applique : la tablee perdait sa manche
 * sans avoir rien touche.
 *
 * L'instantane n'est repris que s'il a moins de quatre heures - meme seuil que
 * la soiree, meme raison : reprendre a la reouverture n'est pas reprendre le
 * lendemain.
 */
const SEUIL_REPRISE_MS = 4 * 60 * 60 * 1000

export const usePromptStore = create<PromptStore>()(persist((set, get) => ({
  session: null,
  packTitle: null,
  lastParams: null,

  startSession: (mode, pack, players, extraItems = []) => {
    const session = createPromptSession(mode, [...pack.items, ...extraItems], players, {
      dejaVus: idsDejaVus(),
      longueur: usePreferencesStore.getState().longueurManche,
    })
    marquerVu(session.currentItem?.id)
    set({
      session,
      packTitle: pack.pack.title,
      lastParams: { mode, pack, players, extraItems },
    })
  },

  next: () => {
    const { session } = get()
    if (!session) return
    const suivante = drawNext(session)
    // Marquee ICI et non a la constitution de la pioche : une pioche de quinze
    // cartes tiree sur un paquet de quatre-vingts en marquerait quatre-vingts,
    // et la soiree se croirait epuisee des la premiere manche.
    marquerVu(suivante.currentItem?.id)
    set({ session: suivante })
  },

  penalize: (playerId, amount = 1) => {
    const { session } = get()
    if (!session) return
    set({ session: applyPenalty(session, playerId, amount) })
  },

  replay: () => {
    const { lastParams } = get()
    if (!lastParams) return
    const { mode, pack, players, extraItems } = lastParams
    const session = createPromptSession(mode, [...pack.items, ...extraItems], players, {
      dejaVus: idsDejaVus(),
      longueur: usePreferencesStore.getState().longueurManche,
    })
    marquerVu(session.currentItem?.id)
    set({ session, packTitle: pack.pack.title })
  },

  reset: () => set({ session: null, packTitle: null, lastParams: null }),
}), {
  name: 'bacchana-prompt',
  // `majLe` est pose a CHAQUE ecriture : il n'y a pas d'action « la manche a
  // bouge » a instrumenter une par une, et une horloge posee a un seul endroit
  // finit toujours par rater un chemin.
  partialize: (state) => ({
    session: state.session,
    packTitle: state.packTitle,
    lastParams: state.lastParams,
    majLe: Date.now(),
  }),
  onRehydrateStorage: () => (etat, erreur) => {
    if (erreur || !etat) return
    const majLe = (etat as unknown as { majLe?: number }).majLe ?? 0
    if (Date.now() - majLe >= SEUIL_REPRISE_MS) {
      usePromptStore.setState({ session: null, packTitle: null, lastParams: null })
    }
  },
}))
