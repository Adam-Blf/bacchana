import { describe, expect, it, vi, afterEach } from 'vitest'
import { interpolate } from './interpolate'
import { createPlayer } from '@/core/borderland'

describe('interpolate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('replaces {player} with the current player name', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const result = interpolate('{player}, fais 10 pompes', [alice, bob], alice)
    expect(result).toBe('Alice, fais 10 pompes')
  })

  it('replaces every occurrence of {player}', () => {
    const alice = createPlayer('Alice')
    const result = interpolate('{player} regarde {player}', [alice], alice)
    expect(result).toBe('Alice regarde Alice')
  })

  it('replaces {player2} with a distinct active player', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const result = interpolate('{player} et {player2}', [alice, bob], alice)
    expect(result).toBe('Alice et Bob')
  })

  it('never picks the current player for {player2} when others exist', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const carol = createPlayer('Carol')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = interpolate('{player2}', [alice, bob, carol], alice)
    expect(result).not.toBe('Alice')
    expect(['Bob', 'Carol']).toContain(result)
  })

  it('ignores inactive players when picking {player2}', () => {
    const alice = createPlayer('Alice')
    const bob = { ...createPlayer('Bob'), active: false }
    const carol = createPlayer('Carol')
    const result = interpolate('{player2}', [alice, bob, carol], alice)
    expect(result).toBe('Carol')
  })

  it('falls back to the current player when nobody else is available', () => {
    const alice = createPlayer('Alice')
    const result = interpolate('{player2}', [alice], alice)
    expect(result).toBe('Alice')
  })

  it('leaves text without placeholders untouched', () => {
    const alice = createPlayer('Alice')
    expect(interpolate('Rafale générale, tout le monde applaudit', [alice], alice)).toBe(
      'Rafale générale, tout le monde applaudit'
    )
  })
})
