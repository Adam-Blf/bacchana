import { describe, it, expect } from 'vitest'
import {
  createQuizSession,
  answerCorrect,
  answerWrong,
  distributePot,
  keepPot,
  getCurrentQuizPlayer,
} from './quizSession'
import type { QuizQuestion } from '@/content/quiz'
import type { Player } from '@/types'

const QUESTIONS: QuizQuestion[] = Array.from({ length: 6 }, (_, i) => ({
  id: `q-${i}`,
  category: 'Culture G',
  question: `Question ${i}`,
  answer: `Réponse ${i}`,
}))

const PLAYERS: Player[] = [
  { id: 'a', name: 'Alex', active: true },
  { id: 'b', name: 'Sam', active: true },
]

// rng déterministe : 0.5 -> questions non mélangées de façon prévisible, points = 2
const rng = () => 0.5

describe('quizSession', () => {
  it('creates a session with a first question and 1-3 points', () => {
    const s = createQuizSession(QUESTIONS, PLAYERS, rng)
    expect(s.phase).toBe('question')
    expect(s.currentQuestion).not.toBeNull()
    expect(s.currentPoints).toBeGreaterThanOrEqual(1)
    expect(s.currentPoints).toBeLessThanOrEqual(3)
    expect(getCurrentQuizPlayer(s)?.id).toBe('a')
  })

  it('correct answer feeds the pot and opens the choice', () => {
    let s = createQuizSession(QUESTIONS, PLAYERS, rng)
    const points = s.currentPoints
    s = answerCorrect(s)
    expect(s.phase).toBe('choice')
    expect(s.pots['a']).toBe(points)
  })

  it('keepPot lets the pot grow across the player own turns', () => {
    let s = createQuizSession(QUESTIONS, PLAYERS, rng)
    const p1 = s.currentPoints
    s = keepPot(answerCorrect(s), rng) // Alex cumule
    expect(getCurrentQuizPlayer(s)?.id).toBe('b')
    s = answerWrong(s, rng) // Sam se plante
    expect(getCurrentQuizPlayer(s)?.id).toBe('a')
    const p2 = s.currentPoints
    s = answerCorrect(s)
    expect(s.pots['a']).toBe(p1 + p2)
  })

  it('wrong answer costs pot + current points and resets the pot', () => {
    let s = createQuizSession(QUESTIONS, PLAYERS, rng)
    const p1 = s.currentPoints
    s = keepPot(answerCorrect(s), rng) // Alex cumule p1
    s = answerWrong(s, rng) // Sam : 0 + points de sa question
    s = { ...s } // Alex de nouveau
    const p2 = s.currentPoints
    s = answerWrong(s, rng) // Alex se plante avec p1 en cagnotte
    expect(s.penaltyCounts['a']).toBe(p1 + p2)
    expect(s.pots['a']).toBe(0)
  })

  it('distributePot cashes out and resets', () => {
    let s = createQuizSession(QUESTIONS, PLAYERS, rng)
    const p1 = s.currentPoints
    s = distributePot(answerCorrect(s), rng)
    expect(s.distributedCounts['a']).toBe(p1)
    expect(s.pots['a']).toBe(0)
    expect(s.lastOutcome).toEqual({ kind: 'banked', playerId: 'a', amount: p1 })
  })

  it('finishes when the queue runs out', () => {
    let s = createQuizSession(QUESTIONS.slice(0, 2), PLAYERS, rng)
    s = answerWrong(s, rng)
    expect(s.phase).toBe('question')
    s = answerWrong(s, rng)
    expect(s.phase).toBe('finished')
  })
})
