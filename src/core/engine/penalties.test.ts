import { describe, expect, it } from 'vitest'
import { penaltyFromItem, formatPenaltyCount } from './penalties'
import type { PackItem } from './types'

function item(overrides: Partial<PackItem> = {}): PackItem {
  return { id: 'x', text: 'x', ...overrides }
}

describe('penaltyFromItem', () => {
  it('returns null when the item has no penalty', () => {
    expect(penaltyFromItem(item())).toBeNull()
  })

  it('converts sips into a standard penalty result', () => {
    const result = penaltyFromItem(item({ penalty: { sips: 3 } }))
    expect(result).toEqual({ amount: 3, unit: 'gorgees', displayText: '3 pénalités' })
  })

  it('converts shots into a major penalty result', () => {
    const result = penaltyFromItem(item({ penalty: { shots: 1 } }))
    expect(result).toEqual({ amount: 1, unit: 'SHOT', displayText: 'PÉNALITÉ MAJEURE' })
  })

  it('prefers shots over sips when both are present', () => {
    const result = penaltyFromItem(item({ penalty: { sips: 5, shots: 1 } }))
    expect(result?.unit).toBe('SHOT')
  })
})

describe('formatPenaltyCount', () => {
  it('singular for 1', () => {
    expect(formatPenaltyCount(1)).toBe('1 pénalité')
  })

  it('plural for more than 1', () => {
    expect(formatPenaltyCount(3)).toBe('3 pénalités')
  })

  it('singular for 0 (matches the existing Borderland convention: plural only above 1)', () => {
    expect(formatPenaltyCount(0)).toBe('0 pénalité')
  })
})
