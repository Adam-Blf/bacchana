import { create } from 'zustand'
import type { Player } from '@/types'
import type { ContentPack, GameMode, PackItem } from '@/core/engine/types'
import {
  applyPenalty,
  createPromptSession,
  drawNext,
  type PromptSessionState,
} from '@/core/engine/promptSession'

interface PromptStore {
  session: PromptSessionState | null
  packTitle: string | null

  /**
   * Starts a fresh session for a prompt-based mode using the given pack and player list.
   * `extraItems` (e.g. the user's custom rules) are shuffled into the deck.
   */
  startSession: (mode: GameMode, pack: ContentPack, players: Player[], extraItems?: PackItem[]) => void
  /** Advances to the next prompt (rotates turn, expires rules, may finish the session). */
  next: () => void
  /** Records a penalty for a player (defaults to +1). */
  penalize: (playerId: string, amount?: number) => void
  /** Clears the session, e.g. when leaving the mode without finishing. */
  reset: () => void
}

// Ephemeral by design (no persist middleware) - a session lives only for its own play-through,
// unlike the Borderland gameStore which persists players across app restarts.
export const usePromptStore = create<PromptStore>((set, get) => ({
  session: null,
  packTitle: null,

  startSession: (mode, pack, players, extraItems = []) => {
    set({
      session: createPromptSession(mode, [...pack.items, ...extraItems], players),
      packTitle: pack.pack.title,
    })
  },

  next: () => {
    const { session } = get()
    if (!session) return
    set({ session: drawNext(session) })
  },

  penalize: (playerId, amount = 1) => {
    const { session } = get()
    if (!session) return
    set({ session: applyPenalty(session, playerId, amount) })
  },

  reset: () => set({ session: null, packTitle: null }),
}))
