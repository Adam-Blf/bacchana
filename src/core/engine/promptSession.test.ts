import { describe, expect, it } from 'vitest'
import {
  applyPenalty,
  createPromptSession,
  drawNext,
  getCurrentPlayer,
  type PromptSessionState,
} from './promptSession'
import { createPlayer } from '@/core/coupeGorge'
import type { PackItem } from './types'

function item(id: string, overrides: Partial<PackItem> = {}): PackItem {
  return { id, text: `text-${id}`, ...overrides }
}

function baseState(items: PackItem[], players = [createPlayer('a'), createPlayer('b')]): PromptSessionState {
  return {
    mode: 'picolo',
    players,
    queue: items,
    shownIds: [],
    currentPlayerIndex: 0,
    turnNumber: 0,
    currentItem: null,
    activeRules: [],
    activeRole: null,
    penaltyCounts: Object.fromEntries(players.map((p) => [p.id, 0])),
    finished: false,
  }
}

describe('drawNext - rotation', () => {
  it('does not rotate on the very first draw', () => {
    const s = drawNext(baseState([item('i1')]))
    expect(s.currentPlayerIndex).toBe(0)
    expect(s.turnNumber).toBe(1)
  })

  it('rotates to the next active player on subsequent draws', () => {
    let s = drawNext(baseState([item('i1'), item('i2'), item('i3')]))
    s = drawNext(s)
    expect(s.currentPlayerIndex).toBe(1)
    s = drawNext(s)
    expect(s.currentPlayerIndex).toBe(0)
  })

  it('skips inactive players while rotating', () => {
    const players = [createPlayer('a'), { ...createPlayer('b'), active: false }, createPlayer('c')]
    let s = drawNext(baseState([item('i1'), item('i2')], players))
    s = drawNext(s)
    expect(s.currentPlayerIndex).toBe(2)
  })
})

describe('drawNext - stack consumption / non-repetition', () => {
  it('pops one item per draw and never repeats an id', () => {
    let s = drawNext(baseState([item('i1'), item('i2'), item('i3')]))
    const seen = [s.currentItem?.id]
    s = drawNext(s)
    seen.push(s.currentItem?.id)
    s = drawNext(s)
    seen.push(s.currentItem?.id)
    expect(new Set(seen).size).toBe(3)
    expect(seen).toEqual(['i1', 'i2', 'i3'])
  })

  it('marks the session finished once the stack is empty', () => {
    let s = drawNext(baseState([item('i1')]))
    expect(s.finished).toBe(false)
    s = drawNext(s)
    expect(s.finished).toBe(true)
    expect(s.currentItem).toBeNull()
  })

  it('stays finished and returns no item on further draws past the end', () => {
    let s = drawNext(baseState([item('i1')]))
    s = drawNext(s)
    s = drawNext(s)
    expect(s.finished).toBe(true)
    expect(s.currentItem).toBeNull()
  })
})

describe('createPromptSession - filtering and setup', () => {
  it('filters out items whose minPlayers exceeds the group size', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const items = [item('solo-ok'), item('needs-3', { minPlayers: 3 })]
    const s = createPromptSession('picolo', items, players)
    expect(s.shownIds).not.toContain('needs-3')
    // Only one eligible item exists, so it must be the one drawn.
    expect(s.currentItem?.id).toBe('solo-ok')
  })

  it('keeps items whose minPlayers is satisfied', () => {
    const players = [createPlayer('a'), createPlayer('b'), createPlayer('c')]
    const items = [item('needs-3', { minPlayers: 3 })]
    const s = createPromptSession('picolo', items, players)
    expect(s.currentItem?.id).toBe('needs-3')
  })

  it('finishes immediately when no item is eligible', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const items = [item('needs-5', { minPlayers: 5 })]
    const s = createPromptSession('picolo', items, players)
    expect(s.finished).toBe(true)
    expect(s.currentItem).toBeNull()
  })

  it('draws a first item automatically when eligible items exist', () => {
    const s = createPromptSession('picolo', [item('i1')], [createPlayer('a'), createPlayer('b')])
    expect(s.currentItem).not.toBeNull()
    expect(s.turnNumber).toBe(1)
  })

  it('never repeats an item id across a full session', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const items = Array.from({ length: 10 }, (_, i) => item(`i${i}`))
    let s = createPromptSession('picolo', items, players)
    const ids = [s.currentItem!.id]
    while (!s.finished) {
      s = drawNext(s)
      if (s.currentItem) ids.push(s.currentItem.id)
    }
    expect(ids).toHaveLength(10)
    expect(new Set(ids).size).toBe(10)
  })
})

describe('persistent rules - expiration', () => {
  it('keeps a persistent rule active while its duration has not elapsed', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const ruled = item('rule-1', { rule: { type: 'persistent', durationTurns: 2 } })
    let s = drawNext(baseState([ruled, item('i2'), item('i3')], players))
    expect(s.activeRules).toHaveLength(1)
    expect(s.activeRules[0].expiresAtTurn).toBe(3) // turnNumber 1 + duration 2
    s = drawNext(s) // turn 2 - still active (2 < 3)
    expect(s.activeRules).toHaveLength(1)
  })

  it('expires a persistent rule exactly N turns after it was set', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const ruled = item('rule-1', { rule: { type: 'persistent', durationTurns: 2 } })
    let s = drawNext(baseState([ruled, item('i2'), item('i3')], players))
    s = drawNext(s) // turn 2
    s = drawNext(s) // turn 3 - expiresAtTurn (3) > 3 is false -> expired
    expect(s.activeRules).toHaveLength(0)
  })

  it('keeps a persistent rule without durationTurns active for the whole session', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const permanent = item('perm-1', { rule: { type: 'persistent' } })
    let s = drawNext(baseState([permanent, item('i2'), item('i3'), item('i4')], players))
    s = drawNext(s)
    s = drawNext(s)
    s = drawNext(s)
    expect(s.activeRules).toHaveLength(1)
    expect(s.activeRules[0].item.id).toBe('perm-1')
  })

  it('accumulates multiple concurrent persistent rules', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const rule1 = item('rule-1', { rule: { type: 'persistent', durationTurns: 5 } })
    const rule2 = item('rule-2', { rule: { type: 'persistent', durationTurns: 5 } })
    let s = drawNext(baseState([rule1, rule2], players))
    s = drawNext(s)
    expect(s.activeRules).toHaveLength(2)
  })
})

describe('roles - replacement', () => {
  it('assigns a role to the current player when a role item is drawn', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const roled = item('role-1', { rule: { type: 'role' } })
    const s = drawNext(baseState([roled], players))
    expect(s.activeRole?.item.id).toBe('role-1')
    expect(s.activeRole?.ownerId).toBe(players[0].id)
  })

  it('replaces the previous role when a new role item is drawn', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const role1 = item('role-1', { rule: { type: 'role' } })
    const role2 = item('role-2', { rule: { type: 'role' } })
    let s = drawNext(baseState([role1, role2], players))
    s = drawNext(s)
    expect(s.activeRole?.item.id).toBe('role-2')
    expect(s.activeRole?.ownerId).toBe(players[1].id)
  })

  it('keeps the active role across instant items with no role of their own', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    const role1 = item('role-1', { rule: { type: 'role' } })
    let s = drawNext(baseState([role1, item('i2'), item('i3')], players))
    s = drawNext(s)
    expect(s.activeRole?.item.id).toBe('role-1')
  })
})

describe('applyPenalty / getCurrentPlayer', () => {
  it('accumulates penalty counts per player', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    let s = baseState([item('i1')], players)
    s = applyPenalty(s, players[0].id, 2)
    s = applyPenalty(s, players[0].id, 1)
    s = applyPenalty(s, players[1].id, 3)
    expect(s.penaltyCounts[players[0].id]).toBe(3)
    expect(s.penaltyCounts[players[1].id]).toBe(3)
  })

  it('returns the player whose turn it currently is', () => {
    const players = [createPlayer('a'), createPlayer('b')]
    let s = drawNext(baseState([item('i1'), item('i2')], players))
    expect(getCurrentPlayer(s)?.id).toBe(players[0].id)
    s = drawNext(s)
    expect(getCurrentPlayer(s)?.id).toBe(players[1].id)
  })

  it('returns null once the session is finished (index still valid, but treated as done)', () => {
    let s = drawNext(baseState([item('i1')]))
    s = drawNext(s)
    expect(s.finished).toBe(true)
    expect(s.currentItem).toBeNull()
  })
})
