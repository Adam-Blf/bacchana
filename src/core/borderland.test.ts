import { describe, expect, it } from 'vitest'
import {
  calculatePenalty,
  createDeck,
  createPlayer,
  getNextPlayerIndex,
  shuffleDeck,
} from './borderland'
import { CONTEST_MULTIPLIERS } from '@/types'
import type { Player } from '@/types'

describe('createDeck', () => {
  const deck = createDeck()

  it('contains exactly 52 unique cards', () => {
    expect(deck).toHaveLength(52)
    expect(new Set(deck.map(c => c.id)).size).toBe(52)
  })

  it('has 13 cards per suit', () => {
    for (const suit of ['clubs', 'diamonds', 'hearts', 'spades'] as const) {
      expect(deck.filter(c => c.suit === suit)).toHaveLength(13)
    }
  })

  it('maps values A=1 through K=13', () => {
    expect(deck.find(c => c.id === 'clubs-A')?.value).toBe(1)
    expect(deck.find(c => c.id === 'hearts-10')?.value).toBe(10)
    expect(deck.find(c => c.id === 'spades-J')?.value).toBe(11)
    expect(deck.find(c => c.id === 'diamonds-Q')?.value).toBe(12)
    expect(deck.find(c => c.id === 'clubs-K')?.value).toBe(13)
  })

  it('CRITICAL: aces are major penalties (SHOT), everything else standard (gorgees)', () => {
    const aces = deck.filter(c => c.rank === 'A')
    expect(aces).toHaveLength(4)
    for (const ace of aces) expect(ace.unit).toBe('SHOT')
    for (const card of deck.filter(c => c.rank !== 'A')) {
      expect(card.unit).toBe('gorgees')
    }
  })
})

describe('shuffleDeck', () => {
  it('preserves all cards and does not mutate the original', () => {
    const deck = createDeck()
    const snapshot = [...deck]
    const shuffled = shuffleDeck(deck)

    expect(deck).toEqual(snapshot)
    expect(shuffled).toHaveLength(52)
    expect(new Set(shuffled.map(c => c.id)).size).toBe(52)
  })
})

describe('createPlayer', () => {
  it('trims the name and starts with zeroed stats', () => {
    const p = createPlayer('  Adam  ')
    expect(p.name).toBe('Adam')
    expect(p.active).toBe(true)
    expect(p.drinksGorgees).toBe(0)
    expect(p.drinksShots).toBe(0)
    expect(p.contestsWon).toBe(0)
    expect(p.contestsLost).toBe(0)
    expect(p.cardsDrawn).toBe(0)
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createPlayer('x').id))
    expect(ids.size).toBe(100)
  })
})

describe('calculatePenalty', () => {
  it('applies contest multipliers {0:1, 1:1, 2:2, 3:4}', () => {
    expect(CONTEST_MULTIPLIERS).toEqual({ 0: 1, 1: 1, 2: 2, 3: 4 })
    expect(calculatePenalty(5, 0, 'gorgees').amount).toBe(5)
    expect(calculatePenalty(5, 1, 'gorgees').amount).toBe(5)
    expect(calculatePenalty(5, 2, 'gorgees').amount).toBe(10)
    expect(calculatePenalty(5, 3, 'gorgees').amount).toBe(20)
  })

  it('keeps the unit and formats store-safe display text with plurals', () => {
    expect(calculatePenalty(1, 0, 'SHOT').displayText).toBe('PÉNALITÉ MAJEURE')
    expect(calculatePenalty(1, 2, 'SHOT').displayText).toBe('PÉNALITÉ MAJEURE x2')
    expect(calculatePenalty(1, 0, 'gorgees').displayText).toBe('1 pénalité')
    expect(calculatePenalty(3, 0, 'gorgees').displayText).toBe('3 pénalités')
  })
})

describe('getNextPlayerIndex', () => {
  const player = (name: string, active = true): Player => ({
    ...createPlayer(name),
    active,
  })

  it('rotates circularly through active players', () => {
    const players = [player('a'), player('b'), player('c')]
    expect(getNextPlayerIndex(0, players)).toBe(1)
    expect(getNextPlayerIndex(2, players)).toBe(0)
  })

  it('skips inactive players', () => {
    const players = [player('a'), player('b', false), player('c')]
    expect(getNextPlayerIndex(0, players)).toBe(2)
  })

  it('returns 0 when nobody is active', () => {
    const players = [player('a', false), player('b', false)]
    expect(getNextPlayerIndex(0, players)).toBe(0)
  })
})
