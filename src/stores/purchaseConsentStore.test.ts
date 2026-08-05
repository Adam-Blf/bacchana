import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePurchaseConsentStore } from './purchaseConsentStore'

/**
 * Preuve de double consentement avant paiement (CGU/CGV art. 14) : le record ne doit
 * jamais exister avant un appel explicite à recordConsent, doit porter un horodatage réel
 * et rester rattaché à la version des CGU passée en argument.
 */

function resetStore() {
  usePurchaseConsentStore.setState({ record: null })
}

beforeEach(() => {
  resetStore()
  window.localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('purchaseConsentStore', () => {
  it('has no record before any explicit consent', () => {
    expect(usePurchaseConsentStore.getState().record).toBeNull()
  })

  it('recordConsent stores a timestamp and the CGU version it was given under', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-05T12:00:00.000Z'))

    usePurchaseConsentStore.getState().recordConsent('Version applicable au 4 août 2026')

    expect(usePurchaseConsentStore.getState().record).toEqual({
      consentedAt: new Date('2026-08-05T12:00:00.000Z').getTime(),
      cguVersion: 'Version applicable au 4 août 2026',
    })
  })

  it('a later recordConsent call overwrites the previous proof (latest consent wins)', () => {
    usePurchaseConsentStore.getState().recordConsent('Version A')
    usePurchaseConsentStore.getState().recordConsent('Version B')

    expect(usePurchaseConsentStore.getState().record?.cguVersion).toBe('Version B')
  })
})
