import { describe, it, expect, beforeEach } from 'vitest'
import { useCustomRulesStore } from './customRulesStore'
import { PackItemSchema } from '@/core/engine/types'

describe('customRulesStore', () => {
  beforeEach(() => {
    useCustomRulesStore.setState({ rules: [] })
  })

  it('adds a prompt rule with penalty and exposes it as a valid PackItem', () => {
    useCustomRulesStore.getState().add({
      kind: 'prompt',
      text: '{player} chante le refrain de sa chanson honteuse préférée.',
      sips: 2,
    })
    const items = useCustomRulesStore.getState().getPromptItemsFor('picolo')
    expect(items).toHaveLength(1)
    expect(items[0].penalty).toEqual({ sips: 2 })
    // Un item custom doit passer le schéma des packs pour se mélanger au deck.
    expect(() => PackItemSchema.parse(items[0])).not.toThrow()
  })

  it('scopes prompt rules to their target modes', () => {
    useCustomRulesStore.getState().add({ kind: 'prompt', text: 'Règle ciblée', modes: ['picolo'] })
    expect(useCustomRulesStore.getState().getPromptItemsFor('picolo')).toHaveLength(1)
    expect(useCustomRulesStore.getState().getPromptItemsFor('truthOrDare')).toHaveLength(0)
  })

  it('disabled rules are not injected anywhere', () => {
    useCustomRulesStore.getState().add({ kind: 'roulette', text: 'Segment perso' })
    const id = useCustomRulesStore.getState().rules[0].id
    useCustomRulesStore.getState().toggle(id)
    expect(useCustomRulesStore.getState().getRouletteSegments()).toHaveLength(0)
    useCustomRulesStore.getState().toggle(id)
    expect(useCustomRulesStore.getState().getRouletteSegments()).toHaveLength(1)
  })

  it('roulette segments get a truncated label and full detail', () => {
    const text = 'Tout le monde change de place dans le sens des aiguilles.'
    useCustomRulesStore.getState().add({ kind: 'roulette', text })
    const [segment] = useCustomRulesStore.getState().getRouletteSegments()
    expect(segment.detail).toBe(text)
    expect(segment.label.length).toBeLessThanOrEqual(18)
  })

  it('update and remove work', () => {
    useCustomRulesStore.getState().add({ kind: 'prompt', text: 'Avant' })
    const id = useCustomRulesStore.getState().rules[0].id
    useCustomRulesStore.getState().update(id, { text: 'Après' })
    expect(useCustomRulesStore.getState().rules[0].text).toBe('Après')
    useCustomRulesStore.getState().remove(id)
    expect(useCustomRulesStore.getState().rules).toHaveLength(0)
  })
})
