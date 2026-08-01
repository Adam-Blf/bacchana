export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

/** App-level navigation screens (separate from game phases) */
export type AppScreen = 'welcome' | 'hub' | 'game' | 'rules'

// ============================================
// Le Borderland Card Game Types
// ============================================

/** Card suits */
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'

/** French suit names for display */
export const SUIT_FRENCH_NAMES: Record<Suit, string> = {
  clubs: 'Trefle',
  diamonds: 'Carreau',
  hearts: 'Coeur',
  spades: 'Pique',
} as const

/** Suit symbols for UI display */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  clubs: '\u2663',
  diamonds: '\u2666',
  hearts: '\u2665',
  spades: '\u2660',
} as const

/** Card ranks from Ace to King */
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

/**
 * Unit type for penalties.
 * Internal identifiers only (persistence + logic) - never shown to the user.
 * 'gorgees' = standard penalty, 'SHOT' = major penalty (Ace).
 */
export type PenaltyUnit = 'gorgees' | 'SHOT'

/** A single playing card */
export interface Card {
  /** Unique identifier (e.g., 'clubs-A', 'hearts-10') */
  id: string
  /** Card suit */
  suit: Suit
  /** Card rank */
  rank: Rank
  /** Numeric value (A=1, 2-10=face, J=11, Q=12, K=13) */
  value: number
  /** Penalty unit - CRITICAL: Ace MUST be 'SHOT' (major penalty), all others 'gorgees' */
  unit: PenaltyUnit
}

/** A player in the game */
export interface Player {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Whether player is still in the game */
  active: boolean
  /** Total standard penalties received in current session */
  drinksGorgees?: number
  /** Total major penalties received */
  drinksShots?: number
  /** Number of contests initiated */
  contestsWon?: number
  /** Number of contests lost */
  contestsLost?: number
  /** Cards drawn */
  cardsDrawn?: number
}

/** Contest/Duel escalation levels */
export type ContestLevel = 0 | 1 | 2 | 3

/** Contest multipliers by level */
export const CONTEST_MULTIPLIERS: Record<ContestLevel, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 4,
} as const

/** Current state of a contest/duel */
export interface ContestState {
  /** Whether a contest is currently active */
  active: boolean
  /** Current escalation level (0-3) */
  level: ContestLevel
  /** The card being contested */
  baseCard: Card | null
  /** Player who initiated or last escalated the contest */
  challenger: Player | null
}

/** Game phases */
export type GamePhase = 'setup' | 'playing' | 'contest' | 'resolution' | 'ended'

/** French rule texts for each suit */
export interface SuitRule {
  title: string
  description: string
}

export const SUIT_RULES: Record<Suit, SuitRule> = {
  clubs: {
    title: 'Le Guess',
    description: 'La carte est FACE CACHÉE. Demande à un joueur de deviner sa valeur exacte (ex: Roi). Clique pour révéler. S\'il a juste, tu distribues. Sinon, il prend une pénalité.',
  },
  diamonds: {
    title: 'L\'Action',
    description: 'Donne une action au joueur de ton choix.',
  },
  hearts: {
    title: 'La Question',
    description: 'Pose une question au joueur de ton choix.',
  },
  spades: {
    title: 'La Contrainte',
    description: 'Donne une contrainte à accomplir au joueur de ton choix.',
  },
} as const

/** Complete game state */
export interface GameState {
  /** Remaining cards in deck */
  deck: Card[]
  /** Cards that have been played */
  discardPile: Card[]
  /** All players */
  players: Player[]
  /** Index of current player in players array */
  currentPlayerIndex: number
  /** Currently drawn card */
  currentCard: Card | null
  /** Whether the current card is revealed (face up) */
  isCardRevealed: boolean
  /** Contest/duel state */
  contestState: ContestState
  /** Current phase of the game */
  gamePhase: GamePhase
}

/** Result of a penalty calculation */
export interface PenaltyResult {
  amount: number
  unit: PenaltyUnit
  displayText: string
}

// Prompt-based modes (Le Meneur, Action ou Vérité, ...) now live in the multi-mode engine:
// see src/core/engine/types.ts (GameMode, ContentPack, ModeDefinition).
