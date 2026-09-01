import type { Player } from '@/types'
import { getNextPlayerIndex } from '@/core/borderland'
import type { GameMode, PackItem } from './types'
import { constituerPioche, type OptionsManche } from './fraicheur'

/** A persistent rule currently in effect, tracked until it expires or the session ends. */
export interface ActivePersistentRule {
  item: PackItem
  /** Turn number at which the rule expires (exclusive). `Infinity` = active until session end. */
  expiresAtTurn: number
  ownerId: string
}

/** A permanent role, active until a new role item replaces it. */
export interface ActiveRole {
  item: PackItem
  ownerId: string
}

export interface PromptSessionState {
  mode: GameMode
  players: Player[]
  /** Remaining shuffled stack - popped one item at a time, never repeats within a session. */
  queue: PackItem[]
  shownIds: string[]
  currentPlayerIndex: number
  turnNumber: number
  currentItem: PackItem | null
  activeRules: ActivePersistentRule[]
  activeRole: ActiveRole | null
  penaltyCounts: Record<string, number>
  finished: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Builds a fresh session: filters items whose `minPlayers` exceeds the group size, shuffles
 * the remaining stack (no repetition within a session by construction), and draws the first
 * prompt so the caller gets a ready-to-render state.
 */
export function createPromptSession(
  mode: GameMode,
  items: PackItem[],
  players: Player[],
  options: OptionsManche = {}
): PromptSessionState {
  const eligible = items.filter((item) => !item.minPlayers || players.length >= item.minPlayers)
  const queue = constituerPioche(eligible, shuffle, options)

  const base: PromptSessionState = {
    mode,
    players,
    queue,
    shownIds: [],
    currentPlayerIndex: 0,
    turnNumber: 0,
    currentItem: null,
    activeRules: [],
    activeRole: null,
    penaltyCounts: Object.fromEntries(players.map((p) => [p.id, 0])),
    finished: queue.length === 0,
  }

  return base.finished ? base : drawNext(base)
}

/**
 * Advances the session by one turn: rotates to the next active player (skipped on the very
 * first draw), expires persistent rules whose duration ran out, and pops the next prompt off
 * the shuffled stack. A `role` item replaces the active role; a `persistent` item is added to
 * the active rules list (permanently if it has no `durationTurns`). Marks the session finished
 * once the stack is empty.
 */
export function drawNext(state: PromptSessionState): PromptSessionState {
  if (state.finished || state.queue.length === 0) {
    return { ...state, finished: true, currentItem: null }
  }

  const turnNumber = state.turnNumber + 1
  const currentPlayerIndex =
    state.turnNumber === 0
      ? state.currentPlayerIndex
      : getNextPlayerIndex(state.currentPlayerIndex, state.players)

  const survivingRules = state.activeRules.filter((rule) => rule.expiresAtTurn > turnNumber)

  const [item, ...rest] = state.queue
  const currentPlayer = state.players[currentPlayerIndex]

  let activeRole = state.activeRole
  let activeRules = survivingRules

  if (item.rule?.type === 'role' && currentPlayer) {
    activeRole = { item, ownerId: currentPlayer.id }
  }

  if (item.rule?.type === 'persistent' && currentPlayer) {
    const expiresAtTurn = item.rule.durationTurns
      ? turnNumber + item.rule.durationTurns
      : Number.POSITIVE_INFINITY
    activeRules = [...survivingRules, { item, expiresAtTurn, ownerId: currentPlayer.id }]
  }

  return {
    ...state,
    queue: rest,
    shownIds: [...state.shownIds, item.id],
    currentPlayerIndex,
    turnNumber,
    currentItem: item,
    activeRules,
    activeRole,
    finished: false,
  }
}

/** Adds a penalty count to a player's running total for the session. */
export function applyPenalty(
  state: PromptSessionState,
  playerId: string,
  amount = 1
): PromptSessionState {
  return {
    ...state,
    penaltyCounts: {
      ...state.penaltyCounts,
      [playerId]: (state.penaltyCounts[playerId] ?? 0) + amount,
    },
  }
}

/** The player whose turn it currently is, or null before the session starts / after it ends. */
export function getCurrentPlayer(state: PromptSessionState): Player | null {
  return state.players[state.currentPlayerIndex] ?? null
}
