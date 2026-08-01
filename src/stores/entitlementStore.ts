import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { configureBilling, fetchCustomerInfo, isPremiumFromCustomerInfo } from '@/lib/billing'

/**
 * BlackOut Premium entitlement (RevenueCat Web, sandbox in M6). `isPremium` is cached in
 * localStorage so the app keeps working offline with the last known state - `init()` does a
 * best-effort refresh at startup and silently keeps the cache on failure (no key, offline,
 * sandbox hiccup). Never throws, never blocks rendering.
 */
interface EntitlementStore {
  isPremium: boolean
  /** True once the startup refresh has resolved (success or failure) at least once. */
  hasChecked: boolean
  init: () => Promise<void>
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
    }),
    {
      name: 'la-tournee-entitlement',
      partialize: (state) => ({ isPremium: state.isPremium }),
    }
  )
)
