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

// Pure game logic for Le CoupeGorge - no store, no DOM, fully testable.

export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

/** Maps rank to numeric value (Joker = 0 : carte blanche, jamais de pénalité chiffrée) */
export const RANK_VALUES: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'JOKER': 0,
}

export interface CreateDeckOptions {
  /** Nombre de paquets de 52 cartes mélangés ensemble. */
  deckCount?: number
  /** Ajoute 2 jokers par paquet (un rouge, un noir). */
  jokers?: boolean
  /** Couleurs à retirer du paquet (les jokers ne sont pas concernés). */
  excludedSuits?: Suit[]
  /** Valeurs à retirer du paquet (les jokers ne sont pas concernés). */
  excludedRanks?: Rank[]
  /**
   * Nombre de trèfles gardés par paquet (0 à 13, défaut 13).
   *
   * Le trèfle est la seule enseigne à phase face cachée (« Le Guess »),
   * donc ce nombre règle la fréquence des tours de devinette.
   */
  clubCount?: number
  /**
   * Source d'aléa, injectable pour les tests. Elle ne sert QUE si des
   * trèfles sont retirés : garder « les N premiers » ne laisserait que
   * l'As, le 2, le 3..., donc uniquement de petites valeurs, ce qui
   * biaiserait les pénalités en plus de la fréquence.
   */
  rng?: () => number
}

/**
 * Tire `combien` rangs au hasard parmi `rangs`, sans remise.
 *
 * Utilisé pour choisir quels trèfles restent dans le paquet. Un tirage plutôt
 * qu'une troncature : garder les N premiers rangs ne laisserait que les petites
 * valeurs, ce qui changerait la distribution des pénalités et pas seulement la
 * fréquence du Guess.
 */
function tirerRangs(rangs: Rank[], combien: number, rng: () => number): Rank[] {
  const pioche = [...rangs]
  for (let i = pioche.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pioche[i], pioche[j]] = [pioche[j], pioche[i]]
  }
  return pioche.slice(0, combien)
}

/**
 * Creates a deck of `deckCount` standard 52-card packs (plus 2 jokers per pack
 * when enabled), minus the excluded suits/ranks. Ids are suffixed per pack so
 * every physical card stays unique.
 * CRITICAL: Ace cards have unit 'SHOT' (major penalty), all others 'gorgees'.
 */
export function createDeck(options: CreateDeckOptions = {}): Card[] {
  const {
    deckCount = 1,
    jokers = false,
    excludedSuits = [],
    excludedRanks = [],
    clubCount = RANKS.length,
    rng = Math.random,
  } = options
  const deck: Card[] = []
  const trefflesGardes = Math.max(0, Math.min(RANKS.length, Math.floor(clubCount)))

  for (let d = 0; d < deckCount; d++) {
    const packSuffix = deckCount > 1 || jokers ? `-p${d + 1}` : ''
    for (const suit of SUITS) {
      if (excludedSuits.includes(suit)) continue
      // Les trèfles retirés sont tirés au hasard, et le tirage est refait à
      // chaque paquet : sur un paquet double, deux tirages différents évitent
      // qu'un même rang manque systématiquement.
      const rangsDeLEnseigne =
        suit === 'clubs' && trefflesGardes < RANKS.length
          ? tirerRangs(RANKS.filter((r) => !excludedRanks.includes(r)), trefflesGardes, rng)
          : RANKS
      for (const rank of rangsDeLEnseigne) {
        if (excludedRanks.includes(rank)) continue
        const value = RANK_VALUES[rank]
        // CRITICAL RULE: Ace = major penalty ('SHOT'), everything else = standard ('gorgees')
        const unit: PenaltyUnit = rank === 'A' ? 'SHOT' : 'gorgees'

        deck.push({
          id: `${suit}-${rank}${packSuffix}`,
          suit,
          rank,
          value,
          unit,
        })
      }
    }

    if (jokers) {
      deck.push(
        { id: `joker-red${packSuffix}`, suit: 'hearts', rank: 'JOKER', value: 0, unit: 'gorgees' },
        { id: `joker-black${packSuffix}`, suit: 'spades', rank: 'JOKER', value: 0, unit: 'gorgees' }
      )
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
