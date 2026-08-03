import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  configureBilling,
  fetchCustomerInfo,
  isPremiumFromCustomerInfo,
  isBillingConfigured,
  restorePurchases,
} from '@/lib/billing'

/**
 * La Taverne Premium entitlement (RevenueCat Web, sandbox in M6). `isPremium` is cached in
 * localStorage so the app keeps working offline with the last known state - `init()` does a
 * best-effort refresh at startup and silently keeps the cache on failure (no key, offline,
 * sandbox hiccup). Never throws, never blocks rendering.
 */
export type RestoreResult = 'restored-premium' | 'restored-no-premium' | 'unavailable'

interface EntitlementStore {
  isPremium: boolean
  /** True once the startup refresh has resolved (success or failure) at least once. */
  hasChecked: boolean
  init: () => Promise<void>
  /**
   * "Restaurer mes achats" - requis par les guidelines Apple/Play. Retourne 'unavailable' en
   * mode invité (pas de clé RevenueCat) : l'écran Réglages affiche alors "Bientôt disponible"
   * plutôt qu'un faux succès.
   */
  restore: () => Promise<RestoreResult>
}

export const useEntitlementStore = create<EntitlementStore>()(
  persist(
    (set) => ({
      isPremium: false,
      hasChecked: false,

      init: async () => {
        await configureBilling()
        const info = await fetchCustomerInfo()
        if (info) {
          set({ isPremium: isPremiumFromCustomerInfo(info), hasChecked: true })
        } else {
          // Offline / no key / sandbox hiccup - keep whatever was cached, just mark checked.
          set({ hasChecked: true })
        }
      },

      restore: async () => {
        await configureBilling()
        if (!isBillingConfigured()) return 'unavailable'
        const info = await restorePurchases()
        if (!info) return 'unavailable'
        const isPremium = isPremiumFromCustomerInfo(info)
        set({ isPremium, hasChecked: true })
        return isPremium ? 'restored-premium' : 'restored-no-premium'
      },
    }),
    {
      name: 'la-taverne-entitlement',
      partialize: (state) => ({ isPremium: state.isPremium }),
    }
  )
)
