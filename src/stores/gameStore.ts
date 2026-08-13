import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Coupe-GorgeOptions,
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
import { useEntitlementStore } from '@/stores/entitlementStore'

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

/**
 * Le mode "cartes aleatoires a l'infini" est un avantage premium : `gameOptions` est
 * persiste dans localStorage et donc modifiable a la main hors app. On revalide
 * `infinite` au runtime contre l'entitlement reel a chaque endroit ou l'option devient
 * effective (jamais seulement dans le rendu du bouton du hub).
 */
function enforceInfiniteEntitlement(options: Coupe-GorgeOptions): Coupe-GorgeOptions {
  if (!options.infinite) return options
  const isPremium = useEntitlementStore.getState().isPremium
  return isPremium ? options : { ...options, infinite: false }
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
  gameOptions: Coupe-GorgeOptions
  setGameOptions: (options: Partial<Coupe-GorgeOptions>) => void

  // Game Setup
  initGame: (playerNames?: string[]) => void
  resetGame: () => void

  // Player Management (Welcome Screen)
  setPlayers: (names: string[]) => void
  clearPlayers: () => void
  hasPlayers: () => boolean
  /**
   * Sets a player's optional gender/relationship attributes (used by content targeting,
   * see src/core/engine/targeting.ts). Both fields stay undefined ("non précisé") unless
   * the player explicitly chose one - 100 % local, never sent to analytics.
   */
  setPlayerAttributes: (playerId: string, attrs: Partial<Pick<Player, 'gender' | 'relationship'>>) => void

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
      // Le spread des defaults absorbe les options persistées par d'anciennes
      // versions (sans excludedSuits/excludedRanks).
      setGameOptions: (options) =>
        set({
          gameOptions: enforceInfiniteEntitlement({
            ...DEFAULT_BORDERLAND_OPTIONS,
            ...get().gameOptions,
            ...options,
          }),
        }),

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

        const gameOptions = enforceInfiniteEntitlement({ ...DEFAULT_BORDERLAND_OPTIONS, ...get().gameOptions })
        const deck = shuffleDeck(
          createDeck({
            deckCount: gameOptions.deckCount,
            jokers: gameOptions.jokers,
            excludedSuits: gameOptions.excludedSuits,
            excludedRanks: gameOptions.excludedRanks,
            clubCount: gameOptions.clubCount,
          })
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
          // Persiste la correction : un localStorage trafique (infinite: true sans
          // premium) est assaini des la premiere partie lancee, pas seulement en memoire.
          gameOptions,
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

        // Nom inchangé (même index, même tablée) -> on garde l'objet Player existant
        // (id + stats de la soirée) plutôt que d'en régénérer un neuf a chaque retour
        // sur "Modifier les joueurs".
        const existing = get().players
        const players = sanitizedNames.map((name, index) => {
          const prev = existing[index]
          return prev && prev.name === name ? prev : createPlayer(name)
        })
        set({ players })
      },

      clearPlayers: () => {
        set({ players: [] })
      },

      hasPlayers: () => {
        const { players } = get()
        return players.length >= 2
      },

      setPlayerAttributes: (playerId, attrs) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === playerId ? { ...p, ...attrs } : p
          ),
        }))
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
      name: 'bacchana-game',
      // Fermer l'app remet la tablee a zero : seuls les reglages du paquet
      // survivent (preference de table, comme le theme). Les joueurs et la
      // partie en cours ne sont volontairement pas persistes (2026-08-02).
      partialize: (state) => ({
        gameOptions: state.gameOptions,
      }),
    }
  )
)
