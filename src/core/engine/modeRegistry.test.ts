import { describe, expect, it } from 'vitest'
import { MODE_REGISTRY, PLAYABLE_MODES, getModeDefinition } from './modeRegistry'
import { GAME_MODES } from './types'

describe('MODE_REGISTRY', () => {
  it('has one definition per known game mode', () => {
    expect(Object.keys(MODE_REGISTRY).sort()).toEqual([...GAME_MODES].sort())
  })

  it('every definition has a positive minPlayers and non-empty title', () => {
    for (const mode of GAME_MODES) {
      const def = MODE_REGISTRY[mode]
      expect(def.minPlayers).toBeGreaterThanOrEqual(2)
      expect(def.title.length).toBeGreaterThan(0)
    }
  })

  it('gives every mode a stable tile colour drawn from the pop palette', () => {
    // La couleur etait attribuee par position dans la liste filtree du hub :
    // elle changeait quand un joueur rejoignait la table. Ancree sur le mode,
    // elle devient un repere que le joueur peut apprendre.
    const palette = ['bg-aplat-1', 'bg-aplat-2', 'bg-aplat-3', 'bg-aplat-4']
    for (const mode of GAME_MODES) {
      expect(palette).toContain(MODE_REGISTRY[mode].tileColor)
    }
  })

  it('exposes free pack ids for modes that have free content', () => {
    expect(MODE_REGISTRY.picolo.freePackIds).toContain('picolo-soiree')
    expect(MODE_REGISTRY.truthOrDare.freePackIds).toContain('action-verite-classique')
  })

  it('flags premium availability only for modes present in the premium catalog', () => {
    expect(MODE_REGISTRY.picolo.hasPremiumPacks).toBe(true)
    expect(MODE_REGISTRY.wouldYouRather.hasPremiumPacks).toBe(false)
  })

  it('borderland, tribunal and roulette have no pack ids (embedded logic)', () => {
    expect(MODE_REGISTRY.borderland.freePackIds).toEqual([])
    expect(MODE_REGISTRY.tribunal.freePackIds).toEqual([])
    expect(MODE_REGISTRY.roulette.freePackIds).toEqual([])
  })

  it('getModeDefinition returns the matching entry', () => {
    expect(getModeDefinition('roulette').id).toBe('roulette')
  })

  it('PLAYABLE_MODES preserves canonical GAME_MODES order', () => {
    expect(PLAYABLE_MODES.map((m) => m.id)).toEqual(GAME_MODES)
  })

  it('every one of the 13 modes has non-empty rules with 3 to 5 steps', () => {
    expect(GAME_MODES.length).toBe(13)
    for (const mode of GAME_MODES) {
      const { rules } = MODE_REGISTRY[mode]
      expect(rules.title.length).toBeGreaterThan(0)
      expect(rules.steps.length).toBeGreaterThanOrEqual(3)
      expect(rules.steps.length).toBeLessThanOrEqual(5)
      for (const step of rules.steps) {
        expect(step.length).toBeGreaterThan(0)
      }
    }
  })
})
