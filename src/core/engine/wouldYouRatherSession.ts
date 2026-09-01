import type { Player } from '@/types'
import type { WouldYouRatherQuestion } from '@/content/wouldYouRather'
import { constituerPioche, type OptionsManche } from './fraicheur'

// ============================================
// TU PRÉFÈRES - moteur pur (testé)
// Un dilemme A/B s'affiche, le téléphone tourne et chaque joueur actif tape
// son camp. Au reveal, la minorité prend la pénalité - égalité parfaite ou
// vote unanime, personne n'est pénalisé. Récap local uniquement (pas de
// ticket partagé cross-jeux) : penaltyCounts par joueur.
// ============================================

export type WouldYouRatherSide = 'A' | 'B'
export type WouldYouRatherPhase = 'voting' | 'reveal' | 'finished'

/** Pénalité infligée à chaque joueur du camp minoritaire au reveal. */
export const MINORITY_PENALTY = 1

export interface WouldYouRatherSessionState {
  players: Player[]
  allQuestions: WouldYouRatherQuestion[]
  queue: WouldYouRatherQuestion[]
  roundNumber: number
  currentQuestion: WouldYouRatherQuestion | null
  /** Vote de chaque joueur pour la manche en cours. */
  votes: Record<string, WouldYouRatherSide>
  phase: WouldYouRatherPhase
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

function activePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.active)
}

export function createWouldYouRatherSession(
  questions: WouldYouRatherQuestion[],
  players: Player[],
  rng: Rng = Math.random,
  options: OptionsManche = {}
): WouldYouRatherSessionState {
  const queue = constituerPioche(questions, (liste) => shuffle(liste, rng), options)
  const currentQuestion = queue.shift() ?? null
  return {
    players: activePlayers(players),
    allQuestions: questions,
    queue,
    roundNumber: 1,
    currentQuestion,
    votes: {},
    phase: currentQuestion ? 'voting' : 'finished',
    penaltyCounts: {},
  }
}

/** Le prochain joueur qui n'a pas encore voté cette manche (ordre de la table). */
export function getNextVoter(state: WouldYouRatherSessionState): Player | null {
  return state.players.find((p) => state.votes[p.id] === undefined) ?? null
}

/** Tous les joueurs actifs ont-ils tapé leur camp ? */
export function allVoted(state: WouldYouRatherSessionState): boolean {
  return state.players.length > 0 && state.players.every((p) => state.votes[p.id] !== undefined)
}

/** Compte les votes par camp. */
export function countVotes(state: WouldYouRatherSessionState): { A: number; B: number } {
  let a = 0
  let b = 0
  for (const side of Object.values(state.votes)) {
    if (side === 'A') a += 1
    else b += 1
  }
  return { A: a, B: b }
}

/**
 * Le camp minoritaire (celui qui prend la pénalité). Renvoie null en cas
 * d'égalité parfaite ou de vote unanime : dans ces deux cas, personne n'est
 * pénalisé.
 */
export function getMinoritySide(state: WouldYouRatherSessionState): WouldYouRatherSide | null {
  const { A, B } = countVotes(state)
  if (A === B) return null
  if (A === 0 || B === 0) return null
  return A < B ? 'A' : 'B'
}

/** Un joueur tape son camp. Une seule fois par manche, joueurs actifs uniquement. */
export function castVote(
  state: WouldYouRatherSessionState,
  playerId: string,
  side: WouldYouRatherSide
): WouldYouRatherSessionState {
  if (state.phase !== 'voting') return state
  if (!state.players.some((p) => p.id === playerId)) return state
  if (state.votes[playerId] !== undefined) return state
  return { ...state, votes: { ...state.votes, [playerId]: side } }
}

/** Tout le monde a voté : on révèle le split et on applique la pénalité à la minorité. */
export function revealVotes(state: WouldYouRatherSessionState): WouldYouRatherSessionState {
  if (state.phase !== 'voting' || !allVoted(state)) return state
  const minority = getMinoritySide(state)
  const penaltyCounts = { ...state.penaltyCounts }
  if (minority) {
    for (const [playerId, side] of Object.entries(state.votes)) {
      if (side === minority) {
        penaltyCounts[playerId] = (penaltyCounts[playerId] ?? 0) + MINORITY_PENALTY
      }
    }
  }
  return { ...state, phase: 'reveal', penaltyCounts }
}

/**
 * Manche suivante : dilemme suivant de la file, votes remis à zéro.
 * Le paramètre rng n'est pas utilisé ici (la file entière est déjà mélangée à
 * la création) mais reste présent pour matcher la signature des autres
 * moteurs embarqués (rankingSession, quizSession) et rester substituable.
 */
export function nextRound(
  state: WouldYouRatherSessionState,
  _rng: Rng = Math.random
): WouldYouRatherSessionState {
  if (state.phase !== 'reveal') return state
  const queue = [...state.queue]
  const next = queue.shift() ?? null
  return {
    ...state,
    queue,
    roundNumber: state.roundNumber + 1,
    currentQuestion: next,
    votes: {},
    phase: next ? 'voting' : 'finished',
  }
}
