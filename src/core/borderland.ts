import type {
  Card,
  ContestLevel,
  PenaltyResult,
  PenaltyUnit,
  Player,
  Rank,
  Suit,
} from '@/types'
import { CONTEST_MULTIPLIERS } from '@/types'

// Pure game logic for Le Borderland - no store, no DOM, fully testable.

export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

/** Maps rank to numeric value */
export const RANK_VALUES: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
}

/**
 * Creates a standard 52-card deck
 * CRITICAL: Ace cards have unit 'SHOT' (major penalty), all others 'gorgees' (standard penalty)
 * Unit values are internal identifiers only - display wording lives in calculatePenalty.
 */
export function createDeck(): Card[] {
  const deck: Card[] = []

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const value = RANK_VALUES[rank]
      // CRITICAL RULE: Ace = major penalty ('SHOT'), everything else = standard ('gorgees')
      const unit: PenaltyUnit = rank === 'A' ? 'SHOT' : 'gorgees'

      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value,
        unit,
      })
    }
  }

  return deck
}

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array (does not mutate original)
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Creates a player with a unique ID
 */
export function createPlayer(name: string): Player {
  return {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name: name.trim(),
    active: true,
    drinksGorgees: 0,
    drinksShots: 0,
    contestsWon: 0,
    contestsLost: 0,
    cardsDrawn: 0,
  }
}

/**
 * Calculates the final penalty based on contest level
 * Unit stays the same - only the amount is multiplied.
 * Display wording is store-safe: the app hands out abstract penalties,
 * the group decides in real life what a penalty is worth.
 */
export function calculatePenalty(
  baseAmount: number,
  level: ContestLevel,
  unit: PenaltyUnit
): PenaltyResult {
  const multiplier = CONTEST_MULTIPLIERS[level]
  const amount = baseAmount * multiplier

  const displayText = unit === 'SHOT'
    ? (amount > 1 ? `PÉNALITÉ MAJEURE x${amount}` : 'PÉNALITÉ MAJEURE')
    : `${amount} pénalité${amount > 1 ? 's' : ''}`

  return { amount, unit, displayText }
}

/**
 * Gets the next player index (circular)
 */
export function getNextPlayerIndex(
  currentIndex: number,
  players: Player[]
): number {
  const activePlayers = players.filter(p => p.active)
  if (activePlayers.length === 0) return 0

  let nextIndex = (currentIndex + 1) % players.length

  // Skip inactive players
  while (!players[nextIndex]?.active && nextIndex !== currentIndex) {
    nextIndex = (nextIndex + 1) % players.length
  }

  return nextIndex
}
