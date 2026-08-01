import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BorderlandOptions,
  Card,
  Player,
  GameState,
  ContestState,
  ContestLevel,
  PenaltyResult,
} from '@/types'
import { DEFAULT_BORDERLAND_OPTIONS } from '@/types'
import {
  calculatePenalty,
  createDeck,
  createPlayer,
  getNextPlayerIndex,
  shuffleDeck,
} from '@/core/borderland'

// Pure game logic lives in src/core/borderland.ts - re-exported for existing consumers.
export { createDeck, shuffleDeck, createPlayer, calculatePenalty, getNextPlayerIndex }

// ============================================
// Initial States
// ============================================

const initialContestState: ContestState = {
  active: false,
  level: 0,
  baseCard: null,
  challenger: null,
}

const initialGameState: GameState = {
  deck: [],
  discardPile: [],
  players: [],
  currentPlayerIndex: 0,
  currentCard: null,
  isCardRevealed: false,
  contestState: initialContestState,
  gamePhase: 'setup',
}

// ============================================
// Store Interface
// ============================================

interface GameStore extends GameState {
  // Options de partie (nombre de paquets, jokers, mode infini premium)
  gameOptions: BorderlandOptions
  setGameOptions: (options: Partial<BorderlandOptions>) => void

  // Game Setup
  initGame: (playerNames?: string[]) => void
  resetGame: () => void

  // Player Management (Welcome Screen)
  setPlayers: (names: string[]) => void
  clearPlayers: () => void
  hasPlayers: () => boolean

  // Player Management (In-Game)
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
  deactivatePlayer: (playerId: string) => void

  // Turn Management
  drawCard: () => Card | null
  revealCard: () => void
  nextTurn: () => void

  // Contest System
  startContest: (challenger: Player) => void
  escalateContest: (challenger: Player) => boolean
  resolveContest: (loser: Player) => PenaltyResult | null
  cancelContest: () => void

  // Card Action
  handleCardAction: () => void

  // Getters (computed values)
  getCurrentPlayer: () => Player | null
  getCardsRemaining: () => number
  isGameOver: () => boolean
}

// ============================================
// Store Implementation
// ============================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state spread
      ...initialGameState,

      gameOptions: DEFAULT_BORDERLAND_OPTIONS,
      setGameOptions: (options) =>
        set({ gameOptions: { ...get().gameOptions, ...options } }),

      // ========================================
      // Game Setup Actions
      // ========================================

      initGame: (playerNames?: string[]) => {
        const existingPlayers = get().players

        let players: Player[]

        if (playerNames && playerNames.length >= 2) {
          // Legacy mode: names provided directly
          players = playerNames
            .filter(name => name.trim().length > 0)
            .map(createPlayer)
        } else if (existingPlayers.length >= 2) {
          // New mode: reuse existing players, reactivate all
          players = existingPlayers.map(p => ({ ...p, active: true }))
        } else {
          console.warn('At least 2 players required')
          return
        }

        const { gameOptions } = get()
        const deck = shuffleDeck(
          createDeck({ deckCount: gameOptions.deckCount, jokers: gameOptions.jokers })
        )

        set({
          deck,
          discardPile: [],
          players,
          currentPlayerIndex: 0,
          currentCard: null,
          isCardRevealed: false,
          contestState: initialContestState,
          gamePhase: 'playing',
        })
      },

      resetGame: () => {
        // Reset game state but preserve players
        const { players } = get()
        set({
          ...initialGameState,
          players, // Keep existing players
        })
      },

      // ========================================
      // Player Management (Welcome Screen)
      // ========================================

      setPlayers: (names: string[]) => {
        const sanitizedNames = names
          .map(n => n.trim().slice(0, 20).replace(/[<>]/g, ''))
          .filter(n => n.length > 0)

        if (sanitizedNames.length < 2) {
          console.warn('At least 2 players required')
          return
        }

        const players = sanitizedNames.map(createPlayer)
        set({ players })
      },

      clearPlayers: () => {
        set({ players: [] })
      },

      hasPlayers: () => {
        const { players } = get()
        return players.length >= 2
      },

      // ========================================
      // Player Management Actions
      // ========================================

      addPlayer: (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) return

        const newPlayer = createPlayer(trimmed)
        set(state => ({
          players: [...state.players, newPlayer],
        }))
      },

      removePlayer: (playerId: string) => {
        set(state => ({
          players: state.players.filter(p => p.id !== playerId),
        }))
      },

      deactivatePlayer: (playerId: string) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === playerId ? { ...p, active: false } : p
          ),
        }))
      },

      // ========================================
      // Turn Management Actions
      // ========================================

      drawCard: () => {
        const { deck, gamePhase, gameOptions } = get()

        if (gamePhase !== 'playing' || deck.length === 0) {
          if (deck.length === 0) {
            set({ gamePhase: 'ended' })
          }
          return null
        }

        // Mode aléatoire infini (premium) : le paquet ne s'épuise jamais, chaque
        // tirage pioche au hasard dans le paquet complet.
        if (gameOptions.infinite) {
          const template = deck[Math.floor(Math.random() * deck.length)]
          const drawnCard: Card = { ...template, id: `${template.id}-t${get().discardPile.length}-${Date.now()}` }
          set({ currentCard: drawnCard, isCardRevealed: false })
          return drawnCard
        }

        const [drawnCard, ...remainingDeck] = deck

        set({
          deck: remainingDeck,
          currentCard: drawnCard,
          isCardRevealed: false,
        })

        return drawnCard
      },

      revealCard: () => {
        set({ isCardRevealed: true })
      },

      nextTurn: () => {
        const { currentCard, players, currentPlayerIndex, deck, gameOptions } = get()

        // Move current card to discard if exists
        const discardUpdate = currentCard
          ? { discardPile: [...get().discardPile, currentCard] }
          : {}

        // Check if game should end (never in infinite mode)
        if (deck.length === 0 && !gameOptions.infinite) {
          set({
            ...discardUpdate,
            currentCard: null,
            isCardRevealed: false,
            contestState: initialContestState,
            gamePhase: 'ended',
          })
          return
        }

        const nextIndex = getNextPlayerIndex(currentPlayerIndex, players)

        set({
          ...discardUpdate,
          currentPlayerIndex: nextIndex,
          currentCard: null,
          isCardRevealed: false,
          contestState: initialContestState,
          gamePhase: 'playing',
        })
      },

      // ========================================
      // Contest System Actions
      // ========================================

      startContest: (challenger: Player) => {
        const { currentCard, gamePhase } = get()

        if (!currentCard || gamePhase !== 'playing') {
          return
        }

        set({
          contestState: {
            active: true,
            level: 1,
            baseCard: currentCard,
            challenger,
          },
          gamePhase: 'contest',
        })
      },

      escalateContest: (challenger: Player) => {
        const { contestState } = get()

        if (!contestState.active || contestState.level >= 3) {
          return false
        }

        const newLevel = (contestState.level + 1) as ContestLevel

        set({
          contestState: {
            ...contestState,
            level: newLevel,
            challenger,
          },
        })

        return true
      },

      resolveContest: (loser: Player) => {
        const { contestState, players } = get()

        if (!contestState.active || !contestState.baseCard) {
          return null
        }

        const { baseCard, level } = contestState
        const penalty = calculatePenalty(baseCard.value, level, baseCard.unit)

        // Créditer la pénalité au perdant - sans quoi le récap de fin de partie
        // affichait toujours zéro pour tout le monde.
        set({
          gamePhase: 'resolution',
          players: players.map((p) =>
            p.id === loser.id
              ? {
                  ...p,
                  drinksGorgees: (p.drinksGorgees ?? 0) + (penalty.unit === 'gorgees' ? penalty.amount : 0),
                  drinksShots: (p.drinksShots ?? 0) + (penalty.unit === 'SHOT' ? penalty.amount : 0),
                  contestsLost: (p.contestsLost ?? 0) + 1,
                }
              : p
          ),
        })

        return penalty
      },

      cancelContest: () => {
        set({
          contestState: initialContestState,
          gamePhase: 'playing',
        })
      },

      // ========================================
      // Card Action Handler
      // ========================================

      handleCardAction: () => {
        const { currentCard, gamePhase } = get()

        if (!currentCard || gamePhase !== 'playing') {
          return
        }

        // UI component will use SUIT_RULES to display the appropriate action
      },

      // ========================================
      // Computed Getters
      // ========================================

      getCurrentPlayer: () => {
        const { players, currentPlayerIndex } = get()
        return players[currentPlayerIndex] ?? null
      },

      getCardsRemaining: () => {
        return get().deck.length
      },

      isGameOver: () => {
        const { deck, gamePhase } = get()
        return gamePhase === 'ended' || deck.length === 0
      },
    }),
    {
      name: 'la-tournee-game',
      partialize: (state) => ({
        players: state.players,
        gameOptions: state.gameOptions,
      }),
    }
  )
)
