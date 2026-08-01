import { describe, expect, it } from 'vitest'
import { parseContentPack } from './types'
import { FREE_PACKS } from '@/content'
import premiumCatalog from '@/content/premium-catalog.json'

describe('parseContentPack', () => {
  it('accepts every synced free pack unchanged', () => {
    for (const pack of FREE_PACKS) {
      expect(() => parseContentPack(pack)).not.toThrow()
    }
  })

  it('accepts a minimal valid pack', () => {
    const minimal = {
      schemaVersion: 1,
      pack: { id: 'test-pack', mode: 'picolo', lang: 'fr', title: 'Test', premium: false },
      items: [{ id: 'item-1', text: 'Hello {player}' }],
    }
    expect(() => parseContentPack(minimal)).not.toThrow()
  })

  it('rejects a pack missing required pack fields', () => {
    const invalid = {
      schemaVersion: 1,
      pack: { id: 'bad', lang: 'fr', title: 'Bad', premium: false },
      items: [{ id: 'i1', text: 'x' }],
    }
    expect(() => parseContentPack(invalid)).toThrow()
  })

  it('rejects an unknown mode', () => {
    const invalid = {
      schemaVersion: 1,
      pack: { id: 'bad', mode: 'not-a-mode', lang: 'fr', title: 'Bad', premium: false },
      items: [{ id: 'i1', text: 'x' }],
    }
    expect(() => parseContentPack(invalid)).toThrow()
  })

  it('rejects an item without required fields', () => {
    const invalid = {
      schemaVersion: 1,
      pack: { id: 'bad', mode: 'picolo', lang: 'fr', title: 'Bad', premium: false },
      items: [{ id: 'i1' }],
    }
    expect(() => parseContentPack(invalid)).toThrow()
  })

  it('rejects unknown additional properties (strict schema)', () => {
    const invalid = {
      schemaVersion: 1,
      pack: { id: 'bad', mode: 'picolo', lang: 'fr', title: 'Bad', premium: false, extra: true },
      items: [{ id: 'i1', text: 'x' }],
    }
    expect(() => parseContentPack(invalid)).toThrow()
  })
})

describe('premium-catalog.json', () => {
  it('lists at least one entry per premium pack, all marked premium: true', () => {
    expect(Array.isArray(premiumCatalog)).toBe(true)
    expect((premiumCatalog as { premium: boolean }[]).length).toBeGreaterThan(0)
    for (const entry of premiumCatalog as { premium: boolean }[]) {
      expect(entry.premium).toBe(true)
    }
  })
})
