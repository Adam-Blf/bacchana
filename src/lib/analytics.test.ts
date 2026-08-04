import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P0 (RGPD) - le toggle "Mesure d'audience" doit couper PostHog au retrait du
 * consentement ET pouvoir le relancer a un re-accord ulterieur. PostHog persiste son
 * propre opt-out (localStorage+cookie) : sans un opt_in_capturing() explicite dans
 * initAnalytics, un re-accord apres un refus ne relance jamais la capture.
 */

const posthogMock = {
  init: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  reset: vi.fn(),
  capture: vi.fn(),
}

vi.mock('posthog-js', () => ({ default: posthogMock }))

async function loadAnalytics() {
  vi.resetModules()
  return import('./analytics')
}

describe('analytics consent lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('opts back in on every initAnalytics call, so a re-consent after a refusal restarts capture', async () => {
    const analytics = await loadAnalytics()

    await analytics.initAnalytics()

    expect(posthogMock.init).toHaveBeenCalledTimes(1)
    expect(posthogMock.opt_in_capturing).toHaveBeenCalledTimes(1)
  })

  it('applyAnalyticsConsent(true) initializes PostHog and tracks the consent event', async () => {
    const analytics = await loadAnalytics()

    analytics.applyAnalyticsConsent(true)
    // Laisse le import() dynamique + le .then(...) de initAnalytics se resoudre.
    await vi.waitFor(() => expect(posthogMock.init).toHaveBeenCalledTimes(1))

    expect(posthogMock.capture).toHaveBeenCalledWith('consent_updated', { analytics: true })
  })

  it('applyAnalyticsConsent(false) opts the current user out without touching init', async () => {
    const analytics = await loadAnalytics()
    await analytics.initAnalytics()
    posthogMock.init.mockClear()

    analytics.applyAnalyticsConsent(false)

    expect(posthogMock.opt_out_capturing).toHaveBeenCalledTimes(1)
    expect(posthogMock.reset).toHaveBeenCalledTimes(1)
    expect(posthogMock.init).not.toHaveBeenCalled()
  })

  it('never throws when the PostHog chunk is unreachable (offline install)', async () => {
    posthogMock.init.mockImplementationOnce(() => {
      throw new Error('chunk unreachable offline')
    })
    const analytics = await loadAnalytics()

    await expect(analytics.initAnalytics()).resolves.toBeUndefined()
    expect(analytics.isAnalyticsInitialized()).toBe(false)
  })
})
