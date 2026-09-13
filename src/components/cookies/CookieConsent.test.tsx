import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieConsent } from './CookieConsent'
import { useConsentStore } from '@/stores/consentStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
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
  // L'intro est derriere nous dans tous ces cas : le bandeau ne s'affiche pas
  // pendant le tunnel d'introduction, et c'est teste separement plus bas.
  useOnboardingStore.setState({ hasSeenIntro: true })
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

  /**
   * LE SEQUENCEMENT INTRO -> CONSENTEMENT, et pourquoi il se juge sur
   * `hasSeenIntro` et non sur l'ecran courant.
   *
   * La regle existait deja : pendant l'intro, le bandeau se tait, parce que les
   * deux couches superposees mettaient « Personnaliser » exactement sur
   * « Suivant ». Mais elle se lisait `currentScreen === 'onboarding'`, et au
   * premier lancement l'ecran vaut « welcome » le temps que la bascule se
   * fasse. Le bandeau s'affichait donc, puis s'effacait une demi-seconde plus
   * tard : une couche qui apparait et disparait toute seule a l'ouverture,
   * c'est-a-dire ce que la tablee decrit par « ca clignote ».
   */
  it('se tait tant que l\'intro n\'a pas ete vue, meme hors de l\'ecran d\'intro', () => {
    useOnboardingStore.setState({ hasSeenIntro: false })
    render(<CookieConsent />)
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument()
  })

  it('apparait des que l\'intro est terminee, sans recharger la page', () => {
    useOnboardingStore.setState({ hasSeenIntro: false })
    render(<CookieConsent />)
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument()

    // Abonnement et non lecture ponctuelle : le bandeau doit se reveiller seul.
    act(() => {
      useOnboardingStore.getState().complete()
    })
    expect(screen.getByText(/cookies/i)).toBeInTheDocument()
  })
})
