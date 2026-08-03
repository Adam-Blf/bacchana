import { describe, expect, it } from 'vitest'
import { isResolvableTarget, resolveTarget, seededRng } from './targeting'
import type { Player } from '@/types'

function player(overrides: Partial<Player> = {}): Player {
  return { id: 'p', name: 'Joueur', active: true, ...overrides }
}

/** Deterministic rng that always picks the first candidate (never shuffles). */
const noShuffle = () => 0

describe('isResolvableTarget', () => {
  it('recognizes the resolvable targets', () => {
    expect(isResolvableTarget('gender-m')).toBe(true)
    expect(isResolvableTarget('gender-f')).toBe(true)
    expect(isResolvableTarget('pair')).toBe(true)
    expect(isResolvableTarget('single')).toBe(true)
    expect(isResolvableTarget('couple')).toBe(true)
  })

  it('rejects targets outside its scope', () => {
    expect(isResolvableTarget('self')).toBe(false)
    expect(isResolvableTarget('chosen')).toBe(false)
    expect(isResolvableTarget('all')).toBe(false)
    expect(isResolvableTarget(undefined)).toBe(false)
  })
})

describe('resolveTarget', () => {
  const players: Player[] = [
    player({ id: 'a', name: 'Alice', gender: 'f', relationship: 'single' }),
    player({ id: 'b', name: 'Bob', gender: 'm', relationship: 'couple' }),
    player({ id: 'c', name: 'Chris', gender: 'x' }),
    player({ id: 'd', name: 'Dana', gender: 'f', relationship: 'couple' }),
  ]

  it('resolves gender-m to a matching player', () => {
    const result = resolveTarget(players, 'gender-m', noShuffle)
    expect(result).toHaveLength(1)
    expect(result[0].gender).toBe('m')
  })

  it('resolves gender-f to a matching player', () => {
    const result = resolveTarget(players, 'gender-f', noShuffle)
    expect(result).toHaveLength(1)
    expect(result[0].gender).toBe('f')
  })

  it('resolves single to a matching player', () => {
    const result = resolveTarget(players, 'single', noShuffle)
    expect(result).toHaveLength(1)
    expect(result[0].relationship).toBe('single')
  })

  it('resolves couple to a matching player', () => {
    const result = resolveTarget(players, 'couple', noShuffle)
    expect(result).toHaveLength(1)
    expect(result[0].relationship).toBe('couple')
  })

  it('resolves pair to two distinct players', () => {
    const result = resolveTarget(players, 'pair', noShuffle)
    expect(result).toHaveLength(2)
    expect(result[0].id).not.toBe(result[1].id)
  })

  it('falls back to a random active player when nobody matches the criterion', () => {
    const noAttributes: Player[] = [player({ id: 'x', name: 'X' }), player({ id: 'y', name: 'Y' })]
    const result = resolveTarget(noAttributes, 'gender-m', noShuffle)
    expect(result).toHaveLength(1)
    expect(['X', 'Y']).toContain(result[0].name)
  })

  it('falls back gracefully for a single player with no matching attribute', () => {
    const solo: Player[] = [player({ id: 'z', name: 'Zoé' })]
    expect(resolveTarget(solo, 'couple', noShuffle)).toEqual([player({ id: 'z', name: 'Zoé' })])
  })

  it('ignores inactive players', () => {
    const withInactive: Player[] = [
      player({ id: 'a', name: 'Alice', gender: 'f', active: false }),
      player({ id: 'b', name: 'Bob', gender: 'm', active: true }),
    ]
    const result = resolveTarget(withInactive, 'gender-f', noShuffle)
    // Alice matches gender-f but is inactive -> falls back to the only active player.
    expect(result).toEqual([player({ id: 'b', name: 'Bob', gender: 'm', active: true })])
  })

  it('respects the injected rng deterministically', () => {
    const always1 = () => 0.999
    const a = resolveTarget(players, 'pair', always1)
    const b = resolveTarget(players, 'pair', always1)
    expect(a).toEqual(b)
  })

  it('returns an empty list when there are no players at all', () => {
    expect(resolveTarget([], 'pair', noShuffle)).toEqual([])
  })

  it('resolves the same target across calls with the same seeded rng (stable per turn)', () => {
    const rngA = seededRng('item-3-turn-5')
    const rngB = seededRng('item-3-turn-5')
    expect(resolveTarget(players, 'pair', rngA)).toEqual(resolveTarget(players, 'pair', rngB))
  })

  it('can resolve differently for a different seed', () => {
    const seeds = ['a-1', 'b-2', 'c-3', 'd-4', 'e-5', 'f-6']
    const results = seeds.map((seed) => resolveTarget(players, 'gender-f', seededRng(seed))[0]?.id)
    expect(new Set(results).size).toBeGreaterThan(1)
  })
})

describe('seededRng', () => {
  it('produces numbers in [0, 1)', () => {
    const rng = seededRng('some-seed')
    for (let i = 0; i < 20; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
