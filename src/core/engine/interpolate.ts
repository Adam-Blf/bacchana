import type { Player } from '@/types'

/**
 * Interpolates a prompt template with the current player and, when the
 * template needs it, a second distinct player picked at random.
 * `{player}` -> current player's name.
 * `{player2}` -> another active player, never the current one (falls back to
 * the current player only when nobody else is available, so single-player
 * previews never crash).
 */
export function interpolate(text: string, players: Player[], currentPlayer: Player): string {
  let result = text.split('{player}').join(currentPlayer.name)

  if (result.includes('{player2}')) {
    const others = players.filter((p) => p.id !== currentPlayer.id && p.active)
    const pick = others.length > 0
      ? others[Math.floor(Math.random() * others.length)]
      : currentPlayer
    result = result.split('{player2}').join(pick.name)
  }

  return result
}
