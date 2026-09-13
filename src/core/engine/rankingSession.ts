import type { Player } from '@/types'
import type { RankingQuestion } from '@/content/ranking'
import { constituerPioche, type OptionsManche } from './fraicheur'

// ============================================
// LE PODIUM - moteur pur (testé)
// Un juge découvre une question secrète et classe les autres joueurs selon
// elle. Le groupe voit le podium et doit retrouver la vraie question parmi
// quatre propositions. Trouvé : le juge prend les pénalités. Raté : tout le
// groupe en prend une chacun.
// ============================================

export type RankingPhase = 'handoff' | 'judging' | 'return' | 'guessing' | 'reveal' | 'finished'

export const JUDGE_PENALTY = 3
export const GROUP_PENALTY = 1

export interface RankingRound {
  question: RankingQuestion
  /** 4 propositions mélangées, dont la vraie question. */
  choices: RankingQuestion[]
}

export interface RankingSessionState {
  players: Player[]
  allQuestions: RankingQuestion[]
  queue: RankingQuestion[]
  judgeIndex: number
  roundNumber: number
  round: RankingRound | null
  /** Ids des joueurs classés par le juge, du haut du podium vers le bas. */
  ranked: string[]
  guessedId: string | null
  phase: RankingPhase
  penaltyCounts: Record<string, number>
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

export function getJudge(state: RankingSessionState): Player | null {
  return state.players[state.judgeIndex] ?? null
}

export function getContestants(state: RankingSessionState): Player[] {
  const judge = getJudge(state)
  return state.players.filter((p) => p.id !== judge?.id)
}

function buildRound(
  question: RankingQuestion,
  allQuestions: RankingQuestion[],
  rng: Rng
): RankingRound {
  const decoys = shuffle(
    allQuestions.filter((q) => q.id !== question.id),
    rng
  ).slice(0, 3)
  return { question, choices: shuffle([question, ...decoys], rng) }
}

export function createRankingSession(
  questions: RankingQuestion[],
  players: Player[],
  rng: Rng = Math.random,
  options: OptionsManche = {}
): RankingSessionState {
  // La pioche est coupee a la longueur demandee, mais `allQuestions` garde le
  // paquet ENTIER : les mauvaises reponses proposees a la tablee y sont tirees,
  // et les couper avec la pioche appauvrirait les leurres.
  const queue = constituerPioche(questions, (liste) => shuffle(liste, rng), options)
  const first = queue.shift() ?? null
  return {
    players: players.filter((p) => p.active),
    allQuestions: questions,
    queue,
    judgeIndex: 0,
    roundNumber: 1,
    round: first ? buildRound(first, questions, rng) : null,
    ranked: [],
    guessedId: null,
    phase: first ? 'handoff' : 'finished',
    penaltyCounts: {},
  }
}

/** Le juge a le téléphone en main : place au classement secret. */
export function startJudging(state: RankingSessionState): RankingSessionState {
  if (state.phase !== 'handoff') return state
  return { ...state, phase: 'judging' }
}

/** Ajoute (ou retire) un joueur au podium du juge, dans l'ordre des taps. */
export function toggleRanked(state: RankingSessionState, playerId: string): RankingSessionState {
  if (state.phase !== 'judging') return state
  const judge = getJudge(state)
  if (playerId === judge?.id) return state
  const ranked = state.ranked.includes(playerId)
    ? state.ranked.filter((id) => id !== playerId)
    : [...state.ranked, playerId]
  return { ...state, ranked }
}

/** Le juge valide son podium et rend le téléphone à la table. */
export function confirmRanking(state: RankingSessionState): RankingSessionState {
  if (state.phase !== 'judging') return state
  if (state.ranked.length !== getContestants(state).length) return state
  return { ...state, phase: 'return' }
}

/** Le téléphone est de retour au centre : le groupe découvre le podium. */
export function startGuessing(state: RankingSessionState): RankingSessionState {
  if (state.phase !== 'return') return state
  return { ...state, phase: 'guessing' }
}

/** Le groupe choisit une proposition ; les pénalités tombent immédiatement. */
export function guessQuestion(state: RankingSessionState, questionId: string): RankingSessionState {
  if (state.phase !== 'guessing' || !state.round) return state
  const judge = getJudge(state)
  const correct = questionId === state.round.question.id
  const penaltyCounts = { ...state.penaltyCounts }
  if (correct && judge) {
    penaltyCounts[judge.id] = (penaltyCounts[judge.id] ?? 0) + JUDGE_PENALTY
  } else {
    for (const p of getContestants(state)) {
      penaltyCounts[p.id] = (penaltyCounts[p.id] ?? 0) + GROUP_PENALTY
    }
  }
  return { ...state, guessedId: questionId, penaltyCounts, phase: 'reveal' }
}

/** Manche suivante : le rôle de juge tourne, nouvelle question secrète. */
export function nextRound(state: RankingSessionState, rng: Rng = Math.random): RankingSessionState {
  if (state.phase !== 'reveal') return state
  const queue = [...state.queue]
  const next = queue.shift() ?? null
  return {
    ...state,
    queue,
    judgeIndex: (state.judgeIndex + 1) % state.players.length,
    roundNumber: state.roundNumber + 1,
    round: next ? buildRound(next, state.allQuestions, rng) : null,
    ranked: [],
    guessedId: null,
    phase: next ? 'handoff' : 'finished',
  }
}
