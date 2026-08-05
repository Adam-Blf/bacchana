import { describe, it, expect } from 'vitest'
import {
  createWouldYouRatherSession,
  castVote,
  allVoted,
  revealVotes,
  nextRound,
  countVotes,
  getMinoritySide,
  getNextVoter,
  MINORITY_PENALTY,
} from './wouldYouRatherSession'
import type { WouldYouRatherQuestion } from '@/content/wouldYouRather'
import type { Player } from '@/types'

const QUESTIONS: WouldYouRatherQuestion[] = Array.from({ length: 5 }, (_, i) => ({
  id: `wyr-${i}`,
  optionA: `Option A ${i}`,
  optionB: `Option B ${i}`,
}))

const PLAYERS: Player[] = [
  { id: 'a', name: 'Alex', active: true },
  { id: 'b', name: 'Sam', active: true },
  { id: 'c', name: 'Lou', active: true },
]

// RNG déterministe : décale toujours le premier élément vers la fin du tableau,
// donc le résultat du shuffle est prévisible et non trivial (pas un no-op).
const rng = () => 0.999

describe('wouldYouRatherSession', () => {
  it('creates a session with a shuffled, non-empty queue and a current question', () => {
    const s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    expect(s.phase).toBe('voting')
    expect(s.currentQuestion).not.toBeNull()
    expect(s.queue).toHaveLength(QUESTIONS.length - 1)
    expect(s.votes).toEqual({})
    expect(s.roundNumber).toBe(1)
  })

  it('only keeps active players', () => {
    const withInactive: Player[] = [...PLAYERS, { id: 'd', name: 'Ino', active: false }]
    const s = createWouldYouRatherSession(QUESTIONS, withInactive, rng)
    expect(s.players.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('castVote is immutable and does not allow a second vote from the same player', () => {
    const s0 = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    const s1 = castVote(s0, 'a', 'A')
    expect(s0.votes).toEqual({})
    expect(s1.votes).toEqual({ a: 'A' })

    const s2 = castVote(s1, 'a', 'B')
    expect(s2.votes).toEqual({ a: 'A' })
  })

  it('ignores votes from unknown players', () => {
    const s0 = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    const s1 = castVote(s0, 'ghost', 'A')
    expect(s1).toBe(s0)
  })

  it('getNextVoter follows table order and allVoted flips once everyone voted', () => {
    let s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    expect(getNextVoter(s)?.id).toBe('a')
    s = castVote(s, 'a', 'A')
    expect(getNextVoter(s)?.id).toBe('b')
    expect(allVoted(s)).toBe(false)
    s = castVote(s, 'b', 'A')
    s = castVote(s, 'c', 'B')
    expect(getNextVoter(s)).toBeNull()
    expect(allVoted(s)).toBe(true)
  })

  it('the minority side is penalized : 1 vote against 2 penalizes the lone voter', () => {
    let s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    s = castVote(s, 'a', 'A')
    s = castVote(s, 'b', 'B')
    s = castVote(s, 'c', 'B')
    expect(getMinoritySide(s)).toBe('A')
    s = revealVotes(s)
    expect(s.phase).toBe('reveal')
    expect(s.penaltyCounts.a).toBe(MINORITY_PENALTY)
    expect(s.penaltyCounts.b).toBeUndefined()
    expect(s.penaltyCounts.c).toBeUndefined()
  })

  it('a perfect tie penalizes nobody', () => {
    const twoPlayers = PLAYERS.slice(0, 2)
    let s = createWouldYouRatherSession(QUESTIONS, twoPlayers, rng)
    s = castVote(s, 'a', 'A')
    s = castVote(s, 'b', 'B')
    expect(countVotes(s)).toEqual({ A: 1, B: 1 })
    expect(getMinoritySide(s)).toBeNull()
    s = revealVotes(s)
    expect(s.penaltyCounts).toEqual({})
  })

  it('a unanimous vote penalizes nobody', () => {
    let s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    s = castVote(s, 'a', 'A')
    s = castVote(s, 'b', 'A')
    s = castVote(s, 'c', 'A')
    expect(getMinoritySide(s)).toBeNull()
    s = revealVotes(s)
    expect(s.penaltyCounts).toEqual({})
  })

  it('accumulates penaltyCounts across multiple rounds', () => {
    let s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    s = castVote(s, 'a', 'A')
    s = castVote(s, 'b', 'B')
    s = castVote(s, 'c', 'B')
    s = revealVotes(s)
    expect(s.penaltyCounts.a).toBe(1)

    s = nextRound(s, rng)
    expect(s.phase).toBe('voting')
    expect(s.roundNumber).toBe(2)
    expect(s.votes).toEqual({})

    s = castVote(s, 'a', 'B')
    s = castVote(s, 'b', 'B')
    s = castVote(s, 'c', 'A')
    s = revealVotes(s)
    expect(s.penaltyCounts.a).toBe(1)
    expect(s.penaltyCounts.c).toBe(1)
  })

  it('transitions to finished once the queue is exhausted', () => {
    let s = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    for (let round = 0; round < QUESTIONS.length; round++) {
      s = castVote(s, 'a', 'A')
      s = castVote(s, 'b', 'A')
      s = castVote(s, 'c', 'A')
      s = revealVotes(s)
      s = nextRound(s, rng)
    }
    expect(s.phase).toBe('finished')
    expect(s.currentQuestion).toBeNull()
  })

  it('nextRound is a no-op outside the reveal phase', () => {
    const s0 = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    expect(nextRound(s0, rng)).toBe(s0)
  })

  it('revealVotes refuses to reveal before everyone has voted', () => {
    const s0 = createWouldYouRatherSession(QUESTIONS, PLAYERS, rng)
    const s1 = castVote(s0, 'a', 'A')
    expect(revealVotes(s1)).toBe(s1)
  })
})
