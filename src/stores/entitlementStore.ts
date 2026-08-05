import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomerInfo } from '@revenuecat/purchases-js'
import {
  configureBilling,
  fetchCustomerInfo,
  isPremiumFromCustomerInfo,
  isBillingConfigured,
  restorePurchases,
} from '@/lib/billing'

/**
 * Premium entitlement (RevenueCat Web). Technical entitlement id stays `Bacchus Pro` on purpose -
 * see PREMIUM_ENTITLEMENT_ID in lib/billing.ts.
 *
 * SECURITY - why the cache is time-bounded (audit 2026-08-05, finding M1)
 * ----------------------------------------------------------------------
 * `isPremium` is cached in localStorage so a paying player keeps their content offline, which is
 * the whole promise of the app. That cache used to be unbounded: anyone could write
 * `{"state":{"isPremium":true}}` by hand and keep premium forever, because `init()` only
 * overwrites the cache when the server actually answers - and in guest or offline mode it never
 * does.
 *
 * The cache now carries `verifiedAt`, the timestamp of the last real server confirmation, and is
 * only trusted for CACHE_MAX_AGE_MS. Past that, premium is withheld until the server confirms
 * again. Rehydration applies the same rule, so a stale or forged value never grants access even
 * during the few milliseconds before `init()` resolves.
 *
 * This is a mitigation, not a proof. A determined user can also forge `verifiedAt`. Making this
 * invariant sound would require a server, which contradicts an app designed to run offline without
 * an account. The real protection is elsewhere and must stay that way: premium CONTENT is never
 * shipped in the bundle, only its metadata. Forging this flag unlocks a game mode, never a
 * catalogue.
 *
 * Never throws, never blocks rendering.
 */
export type RestoreResult = 'restored-premium' | 'restored-no-premium' | 'unavailable'

/** Seven days offline is generous for a party game, and bounds a forged cache to one week. */
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

/** A cache with no recorded verification is never trusted: that is exactly the forged shape. */
export function isCacheFresh(verifiedAt: number | null | undefined, now = Date.now()): boolean {
  if (typeof verifiedAt !== 'number' || !Number.isFinite(verifiedAt)) return false
  // A timestamp in the future means a tampered clock or a tampered cache. Refuse both.
  if (verifiedAt > now) return false
  return now - verifiedAt < CACHE_MAX_AGE_MS
}

interface EntitlementStore {
  isPremium: boolean
  /** Timestamp of the last server-confirmed entitlement, null when never confirmed. */
  verifiedAt: number | null
  /** True once the startup refresh has resolved (success or failure) at least once. */
  hasChecked: boolean
  init: () => Promise<void>
  /**
   * "Restaurer mes achats" - requis par les guidelines Apple/Play. Retourne 'unavailable' en
   * mode invité (pas de clé RevenueCat) : l'écran Réglages affiche alors "Bientôt disponible"
   * plutôt qu'un faux succès.
   */
  restore: () => Promise<RestoreResult>
  /** Applies a `CustomerInfo` obtained from a just-completed purchase, no extra network call. */
  setFromCustomerInfo: (info: CustomerInfo) => void
}

export const useEntitlementStore = create<EntitlementStore>()(
  persist(
    (set) => ({
      isPremium: false,
      verifiedAt: null,
      hasChecked: false,

      init: async () => {
        await configureBilling()
        const info = await fetchCustomerInfo()
        if (info) {
          set({
            isPremium: isPremiumFromCustomerInfo(info),
            verifiedAt: Date.now(),
            hasChecked: true,
          })
        } else {
          // No server answer (offline, no key, sandbox hiccup). Keep the cached state only while
          // it is still fresh, so an unverifiable cache cannot grant premium indefinitely.
          set((state) => ({
            isPremium: state.isPremium && isCacheFresh(state.verifiedAt),
            hasChecked: true,
          }))
        }
      },

      restore: async () => {
        await configureBilling()
        if (!isBillingConfigured()) return 'unavailable'
        const info = await restorePurchases()
        if (!info) return 'unavailable'
        const isPremium = isPremiumFromCustomerInfo(info)
        set({ isPremium, verifiedAt: Date.now(), hasChecked: true })
        return isPremium ? 'restored-premium' : 'restored-no-premium'
      },

      setFromCustomerInfo: (info) => {
        // A completed purchase is a server-confirmed source, so it refreshes the window.
        set({
          isPremium: isPremiumFromCustomerInfo(info),
          verifiedAt: Date.now(),
          hasChecked: true,
        })
      },
    }),
    {
      name: 'bacchus-entitlement',
      partialize: (state) => ({ isPremium: state.isPremium, verifiedAt: state.verifiedAt }),
      // Apply the freshness rule at load time, before any component reads the flag.
      onRehydrateStorage: () => (state) => {
        if (state && state.isPremium && !isCacheFresh(state.verifiedAt)) {
          state.isPremium = false
        }
      },
    }
  )
)
