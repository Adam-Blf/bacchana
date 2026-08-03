import type { CustomerInfo, Offering, Purchases as PurchasesClass } from '@revenuecat/purchases-js'

/**
 * RevenueCat Web (sandbox) wrapper. Degrades gracefully with no env key: the app runs in
 * guest mode, `isPremium` stays false, and the paywall shows "Bientot disponible" instead
 * of a real purchase button. Real web purchases stay gated behind VITE_BILLING_ENABLED
 * until Stripe is connected in the RevenueCat dashboard.
 *
 * The SDK itself is dynamically imported and only fetched when a key is actually present,
 * so guest-mode users (or CI, or offline installs) never pay the bundle cost for it.
 */

/** Entitlement identifier configured in the RevenueCat dashboard. */
// Identifiant technique RevenueCat créé sous l'ancien nom du produit - NE PAS renommer
// sans migrer l'entitlement côté dashboard, sinon les abonnés existants perdent l'accès.
export const PREMIUM_ENTITLEMENT_ID = 'La Taverne Pro'

const REVENUECAT_KEY = import.meta.env.VITE_REVENUECAT_TEST_STORE_KEY as string | undefined

/** Real purchases stay off until Stripe is wired into RevenueCat - flips this flag on. */
export const BILLING_ENABLED = import.meta.env.VITE_BILLING_ENABLED === 'true'

const ANON_ID_KEY = 'la-taverne-anon-user-id'

function getOrCreateAnonymousAppUserId(): string {
  try {
    const existing = window.localStorage.getItem(ANON_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    window.localStorage.setItem(ANON_ID_KEY, id)
    return id
  } catch {
    // localStorage unavailable (private browsing edge cases) - fall back to a session-only id.
    return crypto.randomUUID()
  }
}

let purchasesClient: PurchasesClass | null = null

/** Configures the RevenueCat SDK. No-op without a key (guest mode). Safe to call multiple times. */
export async function configureBilling(): Promise<void> {
  if (purchasesClient || !REVENUECAT_KEY) return
  const { Purchases } = await import('@revenuecat/purchases-js')
  purchasesClient = Purchases.configure({
    apiKey: REVENUECAT_KEY,
    appUserId: getOrCreateAnonymousAppUserId(),
  })
}

/** True once RevenueCat has been configured (key present). */
export function isBillingConfigured(): boolean {
  return purchasesClient !== null
}

/**
 * Best-effort customer info fetch. Returns null on any failure (offline, no key, sandbox
 * hiccup) - callers must treat null as "not premium, try again later", never as a crash.
 */
export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (!purchasesClient) return null
  try {
    return await purchasesClient.getCustomerInfo()
  } catch {
    return null
  }
}

export function isPremiumFromCustomerInfo(info: CustomerInfo | null): boolean {
  if (!info) return false
  return info.entitlements.active[PREMIUM_ENTITLEMENT_ID]?.isActive ?? false
}

/**
 * "Restaurer mes achats" - obligatoire pour la review Apple/Play. RevenueCat Web n'a pas de
 * notion de restauration cross-device : l'entitlement est déjà lié à l'appUserId anonyme
 * persisté sur l'appareil (voir getOrCreateAnonymousAppUserId), donc "restaurer" revient à
 * re-synchroniser le customerInfo courant. Retourne null si pas configuré (mode invité) -
 * l'appelant affiche alors "Bientôt disponible" plutôt qu'un faux succès.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!purchasesClient) return null
  try {
    return await purchasesClient.getCustomerInfo()
  } catch {
    return null
  }
}

/** Best-effort current offering fetch for the paywall (prices, package titles). Null on failure. */
export async function fetchCurrentOffering(): Promise<Offering | null> {
  if (!purchasesClient) return null
  try {
    const offerings = await purchasesClient.getOfferings()
    return offerings.current
  } catch {
    return null
  }
}
