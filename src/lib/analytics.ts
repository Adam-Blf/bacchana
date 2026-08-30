import type posthogType from 'posthog-js'

/**
 * PostHog wrapper - EU instance, consent-gated (see consentStore + cookie-banner-spec.md).
 * Never call posthog.init() outside of `initAnalytics()`, and never call `initAnalytics()`
 * without a prior explicit analytics=true consent. Degrades to a no-op when env vars are
 * absent (guest/offline mode, or CI) so the app never crashes on missing config.
 */

export type AnalyticsEvent =
  | { name: 'mode_started'; props: { mode: string; pack?: string } }
  // Depart d'un enchainement automatique. Sans props : l'interet est de savoir
  // combien de tablees passent par ce chemin plutot que par le menu, pas de
  // suivre qui joue a quoi.
  | { name: 'soiree_lancee'; props?: Record<string, never> }
  | { name: 'session_completed'; props: { mode: string; turns: number } }
  // Une tablee qui abandonne en cours de manche etait invisible avant le
  // 2026-08-30 : `handleQuit` remettait a zero sans rien emettre. Rapporte au
  // total de la manche, `turn` dit a quel quart du paquet le groupe decroche -
  // tot, c'est le demarrage qui echoue ; au milieu, c'est la lassitude.
  | { name: 'session_abandoned'; props: { mode: string; turn: number; total: number } }
  // Dans Bacchana on ne SAUTE pas une consigne, on paie la penalite pour ne
  // pas la jouer. `outcome` est donc l'equivalent d'un taux de saut, et il est
  // rattache a l'item : il designe les consignes qui se paient au lieu de se
  // jouer. Aucun texte ecrit par un joueur n'est collecte, seulement son
  // identifiant de contenu livre.
  | { name: 'item_resolved'; props: { mode: string; itemId: string; outcome: 'done' | 'penalty' } }
  | { name: 'premium_paywall_viewed'; props?: Record<string, never> }
  | { name: 'consent_updated'; props: { analytics: boolean } }
  // L'unique achat possible cote web est l'acces a vie (voir PRICING.md), product_id vaut
  // toujours "premium_lifetime" - pas d'enum de plans ici, RevenueCat reste la source du prix.
  | { name: 'subscribe_started'; props: { product_id: string } }
  | { name: 'subscribe_completed'; props: { product_id: string; platform: 'web' } }
  | { name: 'subscribe_failed'; props: { product_id: string } }

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com'

let initialized = false
// Charge paresseusement : sans ce report, le bundle PostHog (233 ko) est preleve au
// premier rendu alors que 100 % des premiers lancements sont sans consentement.
let posthog: typeof posthogType | null = null

/** Initializes PostHog. Only call this after explicit analytics consent. No-op without a key. */
export async function initAnalytics(): Promise<void> {
  if (initialized || !POSTHOG_KEY) return

  try {
    posthog = (await import('posthog-js')).default
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      // Consent already given at this point - persistence uses localStorage as normal.
      persistence: 'localStorage+cookie',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      // SECURITE, audit 2026-08-05. PostHog charge par defaut deux scripts distants
      // depuis eu-assets.i.posthog.com : sa configuration a distance et son module de
      // sondages. Les deux violent `script-src 'self'`, et les autoriser reviendrait a
      // ouvrir l'execution de code tiers dans la page pour deux fonctions que
      // l'application n'utilise pas. On les coupe a la source plutot que d'affaiblir la
      // politique de securite du contenu.
      disable_external_dependency_loading: true,
      disable_surveys: true,
      // Aucun drapeau de fonctionnalite n'est utilise : evite un aller-retour reseau et
      // une dependance distante de plus.
      advanced_disable_feature_flags: true,
    })
    // PostHog persiste l'opt-out precedent (localStorage+cookie) : sans cet appel, un
    // ré-accord après un refus ne réactive jamais la capture (RGPD - le consentement
    // doit rester réversible dans les deux sens).
    posthog.opt_in_capturing()
    initialized = true
  } catch {
    // Chunk PostHog inatteignable (hors ligne, precache PWA exclu) - reste en no-op,
    // jamais de crash pour un tracker optionnel.
  }
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

/**
 * Applies an analytics consent choice: the single side effect both CookieConsent and
 * SettingsScreen must trigger whenever the "Mesure d'audience" toggle changes, so a
 * withdrawal always stops PostHog capture and a later re-consent always restarts it.
 */
export function applyAnalyticsConsent(analytics: boolean): void {
  if (analytics) {
    // initAnalytics charge PostHog a la demande : l'evenement doit attendre que le
    // module soit pret, sinon il est silencieusement perdu.
    void initAnalytics().then(() => track({ name: 'consent_updated', props: { analytics: true } }))
  } else {
    optOutAnalytics()
  }
}
