import { describe, it, expect } from 'vitest'
import {
  createRankingSession,
  startJudging,
  toggleRanked,
  confirmRanking,
  startGuessing,
  guessQuestion,
  nextRound,
  getJudge,
  getContestants,
  JUDGE_PENALTY,
  GROUP_PENALTY,
} from './rankingSession'
import type { RankingQuestion } from '@/content/ranking'
import type { Player } from '@/types'

const QUESTIONS: RankingQuestion[] = Array.from({ length: 8 }, (_, i) => ({
  id: `rk-${i}`,
  text: `Classement ${i}`,
}))

const PLAYERS: Player[] = [
  { id: 'a', name: 'Alex', active: true },
  { id: 'b', name: 'Sam', active: true },
  { id: 'c', name: 'Lou', active: true },
  { id: 'd', name: 'Nia', active: true },
]

const rng = () => 0.5

function reachGuessing() {
  let s = createRankingSession(QUESTIONS, PLAYERS, rng)
  s = startJudging(s)
  for (const p of getContestants(s)) {
    s = toggleRanked(s, p.id)
  }
  s = confirmRanking(s)
  s = startGuessing(s)
  return s
}

describe('rankingSession', () => {
  it('builds a round with 4 choices including the real question', () => {
    const s = createRankingSession(QUESTIONS, PLAYERS, rng)
    expect(s.phase).toBe('handoff')
    expect(s.round?.choices).toHaveLength(4)
    expect(s.round?.choices.some((c) => c.id === s.round?.question.id)).toBe(true)
  })

  it('the judge cannot rank themselves and must rank everyone else', () => {
    let s = startJudging(createRankingSession(QUESTIONS, PLAYERS, rng))
    const judge = getJudge(s)!
    s = toggleRanked(s, judge.id)
    expect(s.ranked).toHaveLength(0)
    expect(confirmRanking(s).phase).toBe('judging') // incomplet -> refus
    for (const p of getContestants(s)) s = toggleRanked(s, p.id)
    expect(confirmRanking(s).phase).toBe('return')
  })

  it('a correct group guess sends the penalties to the judge', () => {
    let s = reachGuessing()
    const judge = getJudge(s)!
    s = guessQuestion(s, s.round!.question.id)
    expect(s.phase).toBe('reveal')
    expect(s.penaltyCounts[judge.id]).toBe(JUDGE_PENALTY)
  })

  it('a wrong guess penalizes every contestant', () => {
    let s = reachGuessing()
    const wrong = s.round!.choices.find((c) => c.id !== s.round!.question.id)!
    const contestants = getContestants(s)
    s = guessQuestion(s, wrong.id)
    for (const p of contestants) {
      expect(s.penaltyCounts[p.id]).toBe(GROUP_PENALTY)
    }
  })

  it('nextRound rotates the judge and resets the podium', () => {
    let s = reachGuessing()
    const firstJudge = getJudge(s)!.id
    s = guessQuestion(s, s.round!.question.id)
    s = nextRound(s, rng)
    expect(s.phase).toBe('handoff')
    expect(getJudge(s)!.id).not.toBe(firstJudge)
    expect(s.ranked).toHaveLength(0)
    expect(s.roundNumber).toBe(2)
  })
})
