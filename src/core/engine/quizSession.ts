import type { Player } from '@/types'
import type { QuizQuestion } from '@/content/quiz'

// ============================================
// QUITTE OU DOUBLE - moteur pur (testé)
// Chaque joueur répond à tour de rôle à une question qui vaut 1 à 3 points
// (tirés au hasard). Bonne réponse : les points rejoignent sa cagnotte, puis
// il choisit - cumuler (la cagnotte grossit, le risque aussi) ou distribuer
// (il donne sa cagnotte en pénalités et repart à zéro). Mauvaise réponse :
// il prend sa cagnotte + les points de la question en pénalités.
// ============================================

export type QuizPhase = 'question' | 'choice' | 'finished'

export interface QuizOutcome {
  kind: 'banked' | 'busted'
  playerId: string
  amount: number
}

export interface QuizSessionState {
  players: Player[]
  currentPlayerIndex: number
  queue: QuizQuestion[]
  currentQuestion: QuizQuestion | null
  /** Valeur de la question en cours (1-3 points). */
  currentPoints: number
  /** Cagnotte cumulée par joueur (points en jeu, pas encore bus ni distribués). */
  pots: Record<string, number>
  /** Pénalités réellement prises par joueur (pour le récap). */
  penaltyCounts: Record<string, number>
  /** Pénalités distribuées par joueur (pour la gloire au récap). */
  distributedCounts: Record<string, number>
  /** Dernier événement marquant, affiché en bandeau sur l'écran. */
  lastOutcome: QuizOutcome | null
  phase: QuizPhase
  turnNumber: number
}

type Rng = () => number

function shuffle<T>(input: T[], rng: Rng): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function rollPoints(rng: Rng): number {
  return 1 + Math.floor(rng() * 3)
}

function activePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.active)
}

export function getCurrentQuizPlayer(state: QuizSessionState): Player | null {
  return state.players[state.currentPlayerIndex] ?? null
}

export function createQuizSession(
  questions: QuizQuestion[],
  players: Player[],
  rng: Rng = Math.random
): QuizSessionState {
  const queue = shuffle(questions, rng)
  const currentQuestion = queue.shift() ?? null
  return {
    players: activePlayers(players),
    currentPlayerIndex: 0,
    queue,
    currentQuestion,
    currentPoints: rollPoints(rng),
    pots: {},
    penaltyCounts: {},
    distributedCounts: {},
    lastOutcome: null,
    phase: currentQuestion ? 'question' : 'finished',
    turnNumber: 1,
  }
}

function advance(state: QuizSessionState, rng: Rng): QuizSessionState {
  const nextQuestion = state.queue[0] ?? null
  return {
    ...state,
    queue: state.queue.slice(1),
    currentQuestion: nextQuestion,
    currentPoints: rollPoints(rng),
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    phase: nextQuestion ? 'question' : 'finished',
    turnNumber: state.turnNumber + 1,
  }
}

/** Bonne réponse : les points rejoignent la cagnotte, place au choix. */
export function answerCorrect(state: QuizSessionState): QuizSessionState {
  const player = getCurrentQuizPlayer(state)
  if (!player || state.phase !== 'question') return state
  return {
    ...state,
    pots: { ...state.pots, [player.id]: (state.pots[player.id] ?? 0) + state.currentPoints },
    phase: 'choice',
    lastOutcome: null,
  }
}

/** Mauvaise réponse : le joueur prend sa cagnotte + les points de la question. */
export function answerWrong(state: QuizSessionState, rng: Rng = Math.random): QuizSessionState {
  const player = getCurrentQuizPlayer(state)
  if (!player || state.phase !== 'question') return state
  const amount = (state.pots[player.id] ?? 0) + state.currentPoints
  return advance(
    {
      ...state,
      pots: { ...state.pots, [player.id]: 0 },
      penaltyCounts: {
        ...state.penaltyCounts,
        [player.id]: (state.penaltyCounts[player.id] ?? 0) + amount,
      },
      lastOutcome: { kind: 'busted', playerId: player.id, amount },
    },
    rng
  )
}

/** Le joueur distribue sa cagnotte en pénalités et repart à zéro. */
export function distributePot(state: QuizSessionState, rng: Rng = Math.random): QuizSessionState {
  const player = getCurrentQuizPlayer(state)
  if (!player || state.phase !== 'choice') return state
  const amount = state.pots[player.id] ?? 0
  return advance(
    {
      ...state,
      pots: { ...state.pots, [player.id]: 0 },
      distributedCounts: {
        ...state.distributedCounts,
        [player.id]: (state.distributedCounts[player.id] ?? 0) + amount,
      },
      lastOutcome: { kind: 'banked', playerId: player.id, amount },
    },
    rng
  )
}

/** Le joueur laisse courir sa cagnotte - quitte ou double au prochain tour. */
export function keepPot(state: QuizSessionState, rng: Rng = Math.random): QuizSessionState {
  if (state.phase !== 'choice') return state
  return advance({ ...state, lastOutcome: null }, rng)
}
