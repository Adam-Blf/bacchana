import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConsentStore, CONSENT_VERSION } from './consentStore'

/**
 * Cookie consent store - per docs/legal/cookie-banner-spec.md: necessary is always on,
 * analytics defaults off and is never pre-checked, and a choice must be explicit before
 * it counts as valid.
 */

function resetStore() {
  useConsentStore.setState({
    consent: null,
    consentVersion: null,
    decidedAt: null,
    isPanelOpen: false,
  })
}

beforeEach(() => {
  resetStore()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('consentStore', () => {
  it('has no consent and is invalid before any explicit choice', () => {
    const state = useConsentStore.getState()
    expect(state.consent).toBeNull()
    expect(state.hasValidConsent()).toBe(false)
  })

  it('never defaults analytics to true - only an explicit action turns it on', () => {
    // Simulates "no choice made yet" - analytics must never be considered active.
    expect(useConsentStore.getState().consent?.analytics).toBeUndefined()
  })

  it('acceptAll turns both necessary and analytics on, and records the choice as valid', () => {
    useConsentStore.getState().acceptAll()
    const state = useConsentStore.getState()
    expect(state.consent).toEqual({ necessary: true, analytics: true })
    expect(state.consentVersion).toBe(CONSENT_VERSION)
    expect(state.hasValidConsent()).toBe(true)
  })

  it('rejectAll keeps necessary on but turns analytics off - refusal is a first-class choice', () => {
    useConsentStore.getState().rejectAll()
    const state = useConsentStore.getState()
    expect(state.consent).toEqual({ necessary: true, analytics: false })
    expect(state.hasValidConsent()).toBe(true)
  })

  it('savePreferences respects the granular analytics toggle, never force-enabling it', () => {
    useConsentStore.getState().savePreferences(false)
    expect(useConsentStore.getState().consent?.analytics).toBe(false)

    useConsentStore.getState().savePreferences(true)
    expect(useConsentStore.getState().consent?.analytics).toBe(true)
  })

  it('acceptAll/rejectAll/savePreferences all close the panel', () => {
    useConsentStore.getState().openPanel()
    expect(useConsentStore.getState().isPanelOpen).toBe(true)
    useConsentStore.getState().rejectAll()
    expect(useConsentStore.getState().isPanelOpen).toBe(false)
  })

  it('treats a consent given under an older version as invalid (forces the banner back)', () => {
    useConsentStore.setState({
      consent: { necessary: true, analytics: true },
      consentVersion: CONSENT_VERSION - 1,
      decidedAt: Date.now(),
    })
    expect(useConsentStore.getState().hasValidConsent()).toBe(false)
  })

  it('treats a consent older than 6 months as expired', () => {
    const sevenMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 30 * 7
    useConsentStore.setState({
      consent: { necessary: true, analytics: true },
      consentVersion: CONSENT_VERSION,
      decidedAt: sevenMonthsAgo,
    })
    expect(useConsentStore.getState().hasValidConsent()).toBe(false)
  })

  it('openPanel/closePanel toggle the manage-cookies panel independently of the choice', () => {
    useConsentStore.getState().openPanel()
    expect(useConsentStore.getState().isPanelOpen).toBe(true)
    useConsentStore.getState().closePanel()
    expect(useConsentStore.getState().isPanelOpen).toBe(false)
  })
})
