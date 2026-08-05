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
      Boolean(info?.entitlements.active['Bacchus Pro']?.isActive)
  ),
  isBillingConfigured: vi.fn(),
  restorePurchases: vi.fn(),
}))

import { CACHE_MAX_AGE_MS, isCacheFresh, useEntitlementStore } from './entitlementStore'
import { fetchCustomerInfo, isBillingConfigured, restorePurchases } from '@/lib/billing'

function resetStore() {
  useEntitlementStore.setState({ isPremium: false, verifiedAt: null, hasChecked: false })
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
      entitlements: { active: { 'Bacchus Pro': { isActive: true } } },
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

/**
 * Audit 2026-08-05, finding M1. These tests exist so the time-bound on the cached entitlement is
 * never silently removed: without them, deleting `verifiedAt` would look like a harmless cleanup
 * while restoring an unbounded forgeable premium flag.
 */
describe('entitlementStore cache freshness (anti-tampering)', () => {
  it('refuses a cache that never recorded a server verification', () => {
    // This is exactly the shape a hand-written localStorage entry produces.
    expect(isCacheFresh(null)).toBe(false)
    expect(isCacheFresh(undefined)).toBe(false)
  })

  it('refuses a non-numeric or non-finite timestamp', () => {
    expect(isCacheFresh('hier' as unknown as number)).toBe(false)
    expect(isCacheFresh(Number.NaN)).toBe(false)
    expect(isCacheFresh(Number.POSITIVE_INFINITY)).toBe(false)
  })

  it('refuses a timestamp in the future (tampered clock or tampered cache)', () => {
    const now = 1_000_000_000_000
    expect(isCacheFresh(now + 60_000, now)).toBe(false)
  })

  it('accepts a recent verification and refuses one past the window', () => {
    const now = 1_000_000_000_000
    expect(isCacheFresh(now - 1000, now)).toBe(true)
    expect(isCacheFresh(now - (CACHE_MAX_AGE_MS - 1000), now)).toBe(true)
    expect(isCacheFresh(now - CACHE_MAX_AGE_MS, now)).toBe(false)
    expect(isCacheFresh(now - CACHE_MAX_AGE_MS * 2, now)).toBe(false)
  })
})

describe('entitlementStore.init offline behaviour', () => {
  it('drops premium when the server is unreachable and the cache is stale', async () => {
    // A genuine payer who went offline more than the allowed window ago.
    useEntitlementStore.setState({
      isPremium: true,
      verifiedAt: Date.now() - CACHE_MAX_AGE_MS - 1,
      hasChecked: false,
    })
    vi.mocked(fetchCustomerInfo).mockResolvedValue(null)

    await useEntitlementStore.getState().init()

    expect(useEntitlementStore.getState().isPremium).toBe(false)
    expect(useEntitlementStore.getState().hasChecked).toBe(true)
  })

  it('drops premium when the server is unreachable and no verification was ever recorded', async () => {
    // The forged case: isPremium written by hand, no verifiedAt to back it.
    useEntitlementStore.setState({ isPremium: true, verifiedAt: null, hasChecked: false })
    vi.mocked(fetchCustomerInfo).mockResolvedValue(null)

    await useEntitlementStore.getState().init()

    expect(useEntitlementStore.getState().isPremium).toBe(false)
  })

  it('keeps premium offline while the cache is still fresh', async () => {
    // The legitimate case this whole mechanism must not break: a payer plays offline.
    useEntitlementStore.setState({
      isPremium: true,
      verifiedAt: Date.now() - 60_000,
      hasChecked: false,
    })
    vi.mocked(fetchCustomerInfo).mockResolvedValue(null)

    await useEntitlementStore.getState().init()

    expect(useEntitlementStore.getState().isPremium).toBe(true)
  })

  it('records a verification timestamp when the server does answer', async () => {
    vi.mocked(fetchCustomerInfo).mockResolvedValue({
      entitlements: { active: { 'Bacchus Pro': { isActive: true } } },
    } as never)

    const before = Date.now()
    await useEntitlementStore.getState().init()
    const state = useEntitlementStore.getState()

    expect(state.isPremium).toBe(true)
    expect(state.verifiedAt).not.toBeNull()
    expect(state.verifiedAt as number).toBeGreaterThanOrEqual(before)
  })

  it('revokes premium when the server answers that the entitlement is gone', async () => {
    useEntitlementStore.setState({ isPremium: true, verifiedAt: Date.now(), hasChecked: false })
    vi.mocked(fetchCustomerInfo).mockResolvedValue({ entitlements: { active: {} } } as never)

    await useEntitlementStore.getState().init()

    expect(useEntitlementStore.getState().isPremium).toBe(false)
  })
})
