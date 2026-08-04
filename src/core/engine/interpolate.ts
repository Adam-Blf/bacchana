import type { Player } from '@/types'
import { seededRng } from './targeting'

/**
 * Interpolates a prompt template with the current player and, when the
 * template needs it, a second distinct player picked at random.
 * `{player}` -> current player's name.
 * `{player2}` -> another active player, never the current one (falls back to
 * the current player only when nobody else is available, so single-player
 * previews never crash).
 *
 * `seed`, when provided (e.g. `${item.id}-${turnNumber}`), makes the `{player2}`
 * pick deterministic for the turn - the same as `resolveTarget`'s seeding - so it
 * never changes across re-renders of the same turn. Without a seed, falls back to
 * `Math.random` (previous behaviour, still used by call sites with no stable turn key).
 */
export function interpolate(text: string, players: Player[], currentPlayer: Player, seed?: string): string {
  let result = text.split('{player}').join(currentPlayer.name)

  if (result.includes('{player2}')) {
    const others = players.filter((p) => p.id !== currentPlayer.id && p.active)
    const rng = seed !== undefined ? seededRng(seed) : Math.random
    const pick = others.length > 0
      ? others[Math.floor(rng() * others.length)]
      : currentPlayer
    result = result.split('{player2}').join(pick.name)
  }

  return result
}
