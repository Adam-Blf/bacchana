import { calculatePenalty } from '@/core/borderland'
import type { PenaltyResult } from '@/types'
import type { PackItem } from './types'

// Extends the Coupe-Gorge penalty logic to the prompt-based modes. Store-safe: the app only
// ever hands out abstract "pénalités", never alcohol quantities. calculatePenalty stays the
// single source of truth for wording (re-exported here for prompt-mode consumers).
export { calculatePenalty }

/**
 * Reads the penalty embedded in a content pack item (if any) and turns it into the same
 * PenaltyResult shape used by Le Coupe-Gorge, so the UI can render both with one component.
 * A `shots` value always wins over `sips` (major penalty takes precedence).
 */
export function penaltyFromItem(item: PackItem): PenaltyResult | null {
  const penalty = item.penalty
  if (!penalty) return null

  if (penalty.shots) {
    return calculatePenalty(penalty.shots, 0, 'SHOT')
  }
  if (penalty.sips) {
    return calculatePenalty(penalty.sips, 0, 'gorgees')
  }
  return null
}

/** Default penalty applied when a player taps "Pénalité" without an item-defined amount. */
export const DEFAULT_MANUAL_PENALTY = 1

/** Formats a running penalty count for HUD display (store-safe, tabular-nums friendly). */
export function formatPenaltyCount(count: number): string {
  return `${count} pénalité${count > 1 ? 's' : ''}`
}
