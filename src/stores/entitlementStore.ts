import { create } from 'zustand'

// Stub for BlackOut Premium (arrives in M6 via Supabase). Always false until the real
// entitlement check ships - keeps the gating UI (locks, modals) wired ahead of time
// without pretending payment exists yet.
interface EntitlementStore {
  isPremium: boolean
}

export const useEntitlementStore = create<EntitlementStore>(() => ({
  isPremium: false,
}))
