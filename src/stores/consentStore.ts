import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cookie/tracker consent, per docs/legal/cookie-banner-spec.md.
 *
 * Rules encoded here (do not weaken without re-reading the spec):
 * - 'necessary' (Supabase session) is always on, exempt from consent, never asked.
 * - 'analytics' (PostHog) defaults to OFF and is never pre-checked.
 * - No tracker fires before an explicit, informed, unambiguous choice is recorded.
 * - "Tout refuser" must be as easy and as visible as "Tout accepter".
 */

/** Bump when the tracker list changes substantially - forces the banner to reappear. */
export const CONSENT_VERSION = 1

/** CNIL recommendation: consent expires after 6 months, banner reappears past that. */
const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 * 6

export interface ConsentChoice {
  necessary: true
  analytics: boolean
}

interface ConsentState {
  /** null until the user has made an explicit first choice. */
  consent: ConsentChoice | null
  /** Version of these terms the consent was given under. */
  consentVersion: number | null
  /** Epoch ms of the last explicit choice. */
  decidedAt: number | null
  /** Whether the customize/manage panel is currently open. */
  isPanelOpen: boolean

  openPanel: () => void
  closePanel: () => void
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (analytics: boolean) => void
  /** True when a fresh, non-expired choice exists and the banner should stay hidden. */
  hasValidConsent: () => boolean
}

function isExpired(decidedAt: number | null): boolean {
  if (decidedAt === null) return true
  return Date.now() - decidedAt > CONSENT_MAX_AGE_MS
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consent: null,
      consentVersion: null,
      decidedAt: null,
      isPanelOpen: false,

      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),

      acceptAll: () =>
        set({
          consent: { necessary: true, analytics: true },
          consentVersion: CONSENT_VERSION,
          decidedAt: Date.now(),
          isPanelOpen: false,
        }),

      rejectAll: () =>
        set({
          consent: { necessary: true, analytics: false },
          consentVersion: CONSENT_VERSION,
          decidedAt: Date.now(),
          isPanelOpen: false,
        }),

      savePreferences: (analytics) =>
        set({
          consent: { necessary: true, analytics },
          consentVersion: CONSENT_VERSION,
          decidedAt: Date.now(),
          isPanelOpen: false,
        }),

      hasValidConsent: () => {
        const { consent, consentVersion, decidedAt } = get()
        if (!consent || consentVersion !== CONSENT_VERSION) return false
        return !isExpired(decidedAt)
      },
    }),
    {
      name: 'la-taverne-consent',
      partialize: (state) => ({
        consent: state.consent,
        consentVersion: state.consentVersion,
        decidedAt: state.decidedAt,
      }),
    }
  )
)
