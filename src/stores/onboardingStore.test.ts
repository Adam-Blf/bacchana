import { beforeEach, describe, expect, it } from 'vitest'
import { useOnboardingStore } from './onboardingStore'

/**
 * Onboarding premier lancement - hasSeenIntro doit rester false tant qu'aucune
 * action explicite (skip ou fin des panneaux) n'a appelé complete(), et rester
 * true ensuite pour ne jamais réafficher l'intro à la tablée suivante.
 */
function resetStore() {
  useOnboardingStore.setState({ hasSeenIntro: false })
}

beforeEach(() => {
  resetStore()
  window.localStorage.clear()
})

describe('onboardingStore', () => {
  it('starts with hasSeenIntro false before any explicit action', () => {
    expect(useOnboardingStore.getState().hasSeenIntro).toBe(false)
  })

  it('complete() flips hasSeenIntro to true', () => {
    useOnboardingStore.getState().complete()
    expect(useOnboardingStore.getState().hasSeenIntro).toBe(true)
  })

  it('persists hasSeenIntro under the bacchus- prefixed key', () => {
    useOnboardingStore.getState().complete()
    const raw = window.localStorage.getItem('bacchus-onboarding')
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw ?? '{}').state.hasSeenIntro).toBe(true)
  })
})
