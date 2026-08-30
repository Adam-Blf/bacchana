import { describe, it, expect } from 'vitest'
import { contrastRatio, pickForeground, INK_DARK, INK_LIGHT } from './contrast'

describe('contrastRatio', () => {
  it('returns 21:1 for pure black vs pure white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
  })

  it('returns 1:1 for identical colors', () => {
    expect(contrastRatio('#ffd029', '#ffd029')).toBeCloseTo(1, 5)
  })

  it('is symmetric regardless of argument order', () => {
    const a = contrastRatio('#111111', '#ffd029')
    const b = contrastRatio('#ffd029', '#111111')
    expect(a).toBeCloseTo(b, 10)
  })
})

describe('pickForeground', () => {
  it('picks the dark ink on the light aplat-1 token (light theme)', () => {
    expect(pickForeground('#ffd029')).toBe(INK_DARK)
  })

  it('picks the dark ink on the light aplat-4 token (dark theme)', () => {
    expect(pickForeground('#a6f05a')).toBe(INK_DARK)
  })

  it('picks the light ink on a near-black background', () => {
    expect(pickForeground('#141216')).toBe(INK_LIGHT)
  })

  it('always clears the WCAG AA normal-text threshold (4.5:1) for its own choice', () => {
    const bgSamples = ['#ffd029', '#ff6fb2', '#6e9bff', '#9be94c', '#ffd84d', '#ff7fbe', '#7fb0ff', '#a6f05a']
    for (const bg of bgSamples) {
      const fg = pickForeground(bg)
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    }
  })
})
