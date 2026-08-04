import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieConsent } from './CookieConsent'
import { useConsentStore } from '@/stores/consentStore'
import * as analytics from '@/lib/analytics'

/**
 * Consent-gated analytics - the whole point of the banner (docs/legal/cookie-banner-spec.md).
 * PostHog must never initialize before an explicit choice, and "Tout refuser" must stay a
 * real no-op for tracking, not a soft version of "accept".
 */

vi.mock('@/lib/analytics', () => {
  const initAnalytics = vi.fn().mockResolvedValue(undefined)
  const optOutAnalytics = vi.fn()
  const track = vi.fn()
  // Mirrors the real applyAnalyticsConsent (analytics.ts) so CookieConsent's single call
  // site still exercises init/opt-out exactly like production, just against fakes.
  const applyAnalyticsConsent = vi.fn((analytics: boolean) => {
    if (analytics) {
      void initAnalytics().then(() => track({ name: 'consent_updated', props: { analytics: true } }))
    } else {
      optOutAnalytics()
    }
  })
  return { initAnalytics, optOutAnalytics, track, applyAnalyticsConsent }
})

function resetConsentStore() {
  useConsentStore.setState({
    consent: null,
    consentVersion: null,
    decidedAt: null,
    isPanelOpen: false,
  })
}

beforeEach(() => {
  resetConsentStore()
  window.localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CookieConsent', () => {
  it('does not initialize PostHog on first render without any consent', () => {
    render(<CookieConsent />)
    expect(analytics.initAnalytics).not.toHaveBeenCalled()
  })

  it('shows the banner with "Tout refuser" and "Accepter l\'analyse" as same-weight buttons', () => {
    render(<CookieConsent />)
    expect(screen.getByRole('button', { name: /tout refuser/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accepter l'analyse/i })).toBeInTheDocument()
  })

  it('never initializes PostHog when the user clicks "Tout refuser"', async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)

    await user.click(screen.getByRole('button', { name: /tout refuser/i }))

    expect(analytics.initAnalytics).not.toHaveBeenCalled()
    expect(analytics.optOutAnalytics).toHaveBeenCalled()
    expect(useConsentStore.getState().consent).toEqual({ necessary: true, analytics: false })
  })

  it('initializes PostHog only after the user clicks "Accepter l\'analyse"', async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)

    expect(analytics.initAnalytics).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /accepter l'analyse/i }))

    expect(analytics.initAnalytics).toHaveBeenCalledTimes(1)
    expect(useConsentStore.getState().consent).toEqual({ necessary: true, analytics: true })
  })

  it('renders nothing once a valid choice already exists and analytics is off', () => {
    useConsentStore.getState().rejectAll()
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog', { name: /préférences de cookies/i })).not.toBeInTheDocument()
    expect(analytics.initAnalytics).not.toHaveBeenCalled()
  })

  it('never pre-checks the analytics toggle in the customize panel', async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)

    await user.click(screen.getByRole('button', { name: /personnaliser/i }))

    const toggle = screen.getByRole('checkbox', { name: /activer la mesure d'audience/i })
    expect(toggle).not.toBeChecked()
    expect(analytics.initAnalytics).not.toHaveBeenCalled()
  })
})
