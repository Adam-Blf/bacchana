import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CustomerInfo, Offering, Package } from '@revenuecat/purchases-js'
import { PremiumPaywallModal } from './PremiumPaywallModal'
import { useEntitlementStore, usePurchaseConsentStore } from '@/stores'
import { CGU_VERSION } from '@/components/legal/CguScreen'
import * as billing from '@/lib/billing'
import * as analytics from '@/lib/analytics'

/**
 * Entonnoir de conversion premium (docs/OBSERVABILITE.md, ANALYTICS.md) - la modale doit
 * emettre subscribe_started avant l'appel RevenueCat et subscribe_completed/subscribe_failed
 * une fois le resultat connu, toujours avec le vrai product_id ("premium_lifetime"), jamais
 * l'id de package interne ("lifetime"). Sans ca, aucune conversion n'est mesurable.
 *
 * Double consentement art. 14 CGU/CGV : le paiement doit rester bloque tant que les deux
 * cases (execution immediate + renonciation a la retractation) ne sont pas cochees - sans
 * quoi la clause de renonciation des CGV est inopposable (voir CguScreen.tsx article 14).
 */

async function checkBothConsentBoxes(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('checkbox', { name: /exécution immédiate du contenu numérique/i })
  )
  await user.click(
    screen.getByRole('checkbox', { name: /perds mon droit de rétractation/i })
  )
}

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
  usePurchaseConsentStore.setState({ record: null })
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
      entitlements: { active: { 'Meskova Pro': { isActive: true } } },
    } as unknown as CustomerInfo)
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)

    await screen.findByText('14,99 €')
    await checkBothConsentBoxes(user)
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
    await checkBothConsentBoxes(user)
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

describe('PremiumPaywallModal - double consentement art. 14 CGU/CGV', () => {
  it('renders both consent checkboxes unchecked by default (jamais pré-cochées)', async () => {
    render(<PremiumPaywallModal open onClose={() => {}} />)
    await screen.findByText('14,99 €')

    expect(
      screen.getByRole('checkbox', { name: /exécution immédiate du contenu numérique/i })
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /perds mon droit de rétractation/i })
    ).not.toBeChecked()
  })

  it('keeps the purchase button disabled until both boxes are checked', async () => {
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)
    await screen.findByText('14,99 €')

    const purchaseButton = screen.getByRole('button', { name: /débloquer meskova premium/i })
    const immediateExecution = screen.getByRole('checkbox', {
      name: /exécution immédiate du contenu numérique/i,
    })
    const withdrawalWaiver = screen.getByRole('checkbox', {
      name: /perds mon droit de rétractation/i,
    })

    expect(purchaseButton).toBeDisabled()

    await user.click(immediateExecution)
    expect(purchaseButton).toBeDisabled()

    await user.click(withdrawalWaiver)
    expect(purchaseButton).toBeEnabled()

    // Décocher une seule case suffit à re-bloquer le paiement.
    await user.click(immediateExecution)
    expect(purchaseButton).toBeDisabled()
  })

  it('never calls purchasePackage when the button is clicked with consent missing', async () => {
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)
    await screen.findByText('14,99 €')

    await user.click(screen.getByRole('button', { name: /débloquer meskova premium/i }))

    expect(billing.purchasePackage).not.toHaveBeenCalled()
  })

  it('records a timestamped consent proof tied to the CGU version once both boxes are checked and purchase is confirmed', async () => {
    vi.mocked(billing.purchasePackage).mockResolvedValue({
      entitlements: { active: { 'Meskova Pro': { isActive: true } } },
    } as unknown as CustomerInfo)
    const user = userEvent.setup()
    render(<PremiumPaywallModal open onClose={() => {}} />)
    await screen.findByText('14,99 €')

    expect(usePurchaseConsentStore.getState().record).toBeNull()

    await checkBothConsentBoxes(user)
    await user.click(screen.getByRole('button', { name: /débloquer meskova premium/i }))

    await waitFor(() => expect(billing.purchasePackage).toHaveBeenCalled())
    const record = usePurchaseConsentStore.getState().record
    expect(record).not.toBeNull()
    expect(record?.cguVersion).toBe(CGU_VERSION)
    expect(record?.consentedAt).toBeLessThanOrEqual(Date.now())
  })
})
