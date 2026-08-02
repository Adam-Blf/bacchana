import type posthogType from 'posthog-js'

/**
 * PostHog wrapper - EU instance, consent-gated (see consentStore + cookie-banner-spec.md).
 * Never call posthog.init() outside of `initAnalytics()`, and never call `initAnalytics()`
 * without a prior explicit analytics=true consent. Degrades to a no-op when env vars are
 * absent (guest/offline mode, or CI) so the app never crashes on missing config.
 */

export type AnalyticsEvent =
  | { name: 'mode_started'; props: { mode: string; pack?: string } }
  | { name: 'session_completed'; props: { mode: string; turns: number } }
  | { name: 'premium_paywall_viewed'; props?: Record<string, never> }
  | { name: 'consent_updated'; props: { analytics: boolean } }

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let initialized = false
// Charge paresseusement : sans ce report, le bundle PostHog (233 ko) est preleve au
// premier rendu alors que 100 % des premiers lancements sont sans consentement.
let posthog: typeof posthogType | null = null

/** Initializes PostHog. Only call this after explicit analytics consent. No-op without a key. */
export async function initAnalytics(): Promise<void> {
  if (initialized || !POSTHOG_KEY) return

  posthog = (await import('posthog-js')).default
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    // Consent already given at this point - persistence uses localStorage as normal.
    persistence: 'localStorage+cookie',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
  })
  initialized = true
}

/** Typed event tracking. Silently drops the event when analytics isn't initialized. */
export function track(event: AnalyticsEvent): void {
  if (!initialized || !posthog) return
  posthog.capture(event.name, event.props ?? {})
}

/**
 * Called when consent is withdrawn: opts the current user out and clears any local
 * PostHog state, in line with the "retrait aussi facile que le don" requirement.
 */
export function optOutAnalytics(): void {
  if (!initialized || !posthog) return
  posthog.opt_out_capturing()
  posthog.reset()
  initialized = false
}

/** True once PostHog has actually been initialized (consent given + key present). */
export function isAnalyticsInitialized(): boolean {
  return initialized
}
