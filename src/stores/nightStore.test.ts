import { beforeEach, describe, expect, it } from 'vitest'
import { nightRanking, useNightStore } from './nightStore'

describe('nightStore', () => {
  beforeEach(() => {
    useNightStore.getState().reset()
  })

  it('accumulates penalties across games, keyed by player name', () => {
    const { record } = useNightStore.getState()
    record('borderland', [
      { id: 'p1', name: 'Léa', total: 4 },
      { id: 'p2', name: 'Marco', total: 2 },
    ])
    record('picolo', [
      { id: 'p1', name: 'Léa', total: 1 },
      { id: 'p2', name: 'Marco', total: 5 },
      { id: 'p3', name: 'Jules', total: 3 },
    ])

    const s = useNightStore.getState()
    expect(s.gamesPlayed).toBe(2)
    expect(s.ledger['p1']).toEqual({ name: 'Léa', total: 5, games: 2 })
    expect(s.ledger['p2']).toEqual({ name: 'Marco', total: 7, games: 2 })
    expect(s.ledger['p3']).toEqual({ name: 'Jules', total: 3, games: 1 })
  })

  it('tracks distinct modes only once', () => {
    const { record } = useNightStore.getState()
    record('borderland', [{ id: 'a', name: 'A', total: 1 }])
    record('borderland', [{ id: 'a', name: 'A', total: 1 }])
    record('picolo', [{ id: 'a', name: 'A', total: 1 }])
    expect(useNightStore.getState().modesPlayed).toEqual(['borderland', 'picolo'])
  })

  it('ranks the ledger from most to least charged', () => {
    const { record } = useNightStore.getState()
    record('borderland', [
      { id: 'a', name: 'A', total: 2 },
      { id: 'b', name: 'B', total: 9 },
      { id: 'c', name: 'C', total: 4 },
    ])
    expect(nightRanking(useNightStore.getState().ledger).map((e) => e.name)).toEqual(['B', 'C', 'A'])
  })

  it('resets to a clean slate', () => {
    useNightStore.getState().record('borderland', [{ id: 'a', name: 'A', total: 2 }])
    useNightStore.getState().reset()
    const s = useNightStore.getState()
    expect(s.ledger).toEqual({})
    expect(s.gamesPlayed).toBe(0)
    expect(s.modesPlayed).toEqual([])
  })
})
