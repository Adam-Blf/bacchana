import { beforeEach, describe, expect, it } from 'vitest'
import { nightRanking, useNightStore } from './nightStore'

describe('nightStore', () => {
  beforeEach(() => {
    useNightStore.getState().reset()
  })

  it('accumulates penalties across games, keyed by player name', () => {
    const { record } = useNightStore.getState()
    record('borderland', { Léa: 4, Marco: 2 })
    record('picolo', { Léa: 1, Marco: 5, Jules: 3 })

    const s = useNightStore.getState()
    expect(s.gamesPlayed).toBe(2)
    expect(s.ledger['Léa']).toEqual({ total: 5, games: 2 })
    expect(s.ledger['Marco']).toEqual({ total: 7, games: 2 })
    expect(s.ledger['Jules']).toEqual({ total: 3, games: 1 })
  })

  it('tracks distinct modes only once', () => {
    const { record } = useNightStore.getState()
    record('borderland', { A: 1 })
    record('borderland', { A: 1 })
    record('picolo', { A: 1 })
    expect(useNightStore.getState().modesPlayed).toEqual(['borderland', 'picolo'])
  })

  it('ranks the ledger from most to least charged', () => {
    const { record } = useNightStore.getState()
    record('borderland', { A: 2, B: 9, C: 4 })
    expect(nightRanking(useNightStore.getState().ledger).map((e) => e.name)).toEqual(['B', 'C', 'A'])
  })

  it('resets to a clean slate', () => {
    useNightStore.getState().record('borderland', { A: 2 })
    useNightStore.getState().reset()
    const s = useNightStore.getState()
    expect(s.ledger).toEqual({})
    expect(s.gamesPlayed).toBe(0)
    expect(s.modesPlayed).toEqual([])
  })
})
