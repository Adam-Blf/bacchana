import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * "Restaurer mes achats" (écran Réglages) - requis par les guidelines Apple/Play. RevenueCat
 * Web n'a pas de restauration cross-device : le test vérifie seulement le contrat côté store,
 * la synchronisation réelle avec RevenueCat étant couverte par lib/billing.
 */
vi.mock('@/lib/billing', () => ({
  configureBilling: vi.fn().mockResolvedValue(undefined),
  fetchCustomerInfo: vi.fn(),
  isPremiumFromCustomerInfo: vi.fn(
    (info: { entitlements: { active: Record<string, { isActive: boolean }> } } | null) =>
      Boolean(info?.entitlements.active['La Tournee Pro']?.isActive)
  ),
  isBillingConfigured: vi.fn(),
  restorePurchases: vi.fn(),
}))

import { useEntitlementStore } from './entitlementStore'
import { isBillingConfigured, restorePurchases } from '@/lib/billing'

function resetStore() {
  useEntitlementStore.setState({ isPremium: false, hasChecked: false })
}

beforeEach(() => {
  resetStore()
  window.localStorage.clear()
  vi.clearAllMocks()
})

describe('entitlementStore.restore', () => {
  it('returns "unavailable" in guest mode (no RevenueCat key configured)', async () => {
    vi.mocked(isBillingConfigured).mockReturnValue(false)

    const result = await useEntitlementStore.getState().restore()

    expect(result).toBe('unavailable')
    expect(useEntitlementStore.getState().isPremium).toBe(false)
  })

  it('returns "unavailable" when configured but the RevenueCat call fails', async () => {
    vi.mocked(isBillingConfigured).mockReturnValue(true)
    vi.mocked(restorePurchases).mockResolvedValue(null)

    const result = await useEntitlementStore.getState().restore()

    expect(result).toBe('unavailable')
  })

  it('restores premium and marks the entitlement checked on an active subscription', async () => {
    vi.mocked(isBillingConfigured).mockReturnValue(true)
    vi.mocked(restorePurchases).mockResolvedValue({
      entitlements: { active: { 'La Tournee Pro': { isActive: true } } },
      // Minimal shape - only the fields isPremiumFromCustomerInfo reads are relevant here.
    } as never)

    const result = await useEntitlementStore.getState().restore()

    expect(result).toBe('restored-premium')
    expect(useEntitlementStore.getState().isPremium).toBe(true)
    expect(useEntitlementStore.getState().hasChecked).toBe(true)
  })

  it('reports "restored-no-premium" when the account has no active entitlement', async () => {
    vi.mocked(isBillingConfigured).mockReturnValue(true)
    vi.mocked(restorePurchases).mockResolvedValue({
      entitlements: { active: {} },
    } as never)

    const result = await useEntitlementStore.getState().restore()

    expect(result).toBe('restored-no-premium')
    expect(useEntitlementStore.getState().isPremium).toBe(false)
  })
})
