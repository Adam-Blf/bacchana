import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CustomerInfo, Offering, Package } from '@revenuecat/purchases-js'
import { PremiumPaywallModal } from './PremiumPaywallModal'
import { useEntitlementStore } from '@/stores'
import * as billing from '@/lib/billing'
import * as analytics from '@/lib/analytics'

/**
 * Entonnoir de conversion premium (docs/OBSERVABILITE.md, ANALYTICS.md) - la modale doit
 * emettre subscribe_started avant l'appel RevenueCat et subscribe_completed/subscribe_failed
 * une fois le resultat connu, toujours avec le vrai product_id ("premium_lifetime"), jamais
 * l'id de package interne ("lifetime"). Sans ca, aucune conversion n'est mesurable.
 */

vi.mock('@/lib/billing', async () => {
  const actual = await vi.importActual<typeof import('@/lib/billing')>('@/lib/billing')
  return {
    ...actual,
    BILLING_ENABLED: true,
    fetchCurrentOffering: vi.fn(),
    purchasePackage: vi.fn(),
  }
})

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

const lifetimePackage = {
  identifier: 'lifetime',
  webBillingProduct: { identifier: 'premium_lifetime', price: { formattedPrice: '14,99 €' } },
} as unknown as Package

const offering = { lifetime: lifetimePackage } as unknown as Offering

function resetEntitlementStore() {
  useEntitlementStore.setState({ isPremium: false, hasChecked: false })
}

beforeEach(() => {
  resetEntitlementStore()
  window.localStorage.clear()
  vi.clearAllMocks()
  vi.mocked(billing.fetchCurrentOffering).mockResolvedValue(offering)
})

afterEach(() => {
  cleanup()
})

describe('PremiumPaywallModal - entonnoir de conversion', () => {
  it('tracks premium_paywall_viewed on open', async () => {
    render(<PremiumPaywallModal open onClose={() => {}} />)

    await waitFor(() =>
      expect(analytics.track).toHaveBeenCalledWith({ name: 'premium_paywall_viewed' })
    )
  })

  it('tracks subscribe_started then subscribe_completed with the real product_id on success', async () => {
    vi.mocked(billing.purchasePackage).mockResolvedValue({
      entitlements: { active: { 'La Taverne Pro': { isActive: true } } },
    } as unknown as CustomerInfo)
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)

    await screen.findByText('14,99 €')
    await user.click(screen.getByRole('button', { name: /débloquer meskova premium/i }))

    await waitFor(() =>
      expect(analytics.track).toHaveBeenCalledWith({
        name: 'subscribe_completed',
        props: { product_id: 'premium_lifetime', platform: 'web' },
      })
    )
    expect(analytics.track).toHaveBeenCalledWith({
      name: 'subscribe_started',
      props: { product_id: 'premium_lifetime' },
    })
    expect(useEntitlementStore.getState().isPremium).toBe(true)
  })

  it('tracks subscribe_failed when RevenueCat returns no customer info', async () => {
    vi.mocked(billing.purchasePackage).mockResolvedValue(null)
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)

    await screen.findByText('14,99 €')
    await user.click(screen.getByRole('button', { name: /débloquer meskova premium/i }))

    await waitFor(() =>
      expect(analytics.track).toHaveBeenCalledWith({
        name: 'subscribe_failed',
        props: { product_id: 'premium_lifetime' },
      })
    )
    expect(useEntitlementStore.getState().isPremium).toBe(false)
  })
})
