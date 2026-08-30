import type { CustomerInfo, Offering, Package, Purchases as PurchasesClass } from '@revenuecat/purchases-js'

/**
 * RevenueCat Web (sandbox) wrapper. Degrades gracefully with no env key: the app runs in
 * guest mode, `isPremium` stays false, and the paywall shows "Bientôt disponible" instead
 * of a real purchase button. Real web purchases stay gated behind VITE_BILLING_ENABLED
 * until Stripe is connected in the RevenueCat dashboard.
 *
 * The SDK itself is dynamically imported and only fetched when a key is actually present,
 * so guest-mode users (or CI, or offline installs) never pay the bundle cost for it.
 */

/** Entitlement identifier configured in the RevenueCat dashboard. */
// Identifiant technique RevenueCat créé sous l'ancien nom du produit - NE PAS renommer
// sans migrer l'entitlement côté dashboard, sinon les abonnés existants perdent l'accès.
export const PREMIUM_ENTITLEMENT_ID = 'Bacchana Pro'

const REVENUECAT_KEY = import.meta.env.VITE_REVENUECAT_TEST_STORE_KEY as string | undefined

/** Real purchases stay off until Stripe is wired into RevenueCat - flips this flag on. */
export const BILLING_ENABLED = import.meta.env.VITE_BILLING_ENABLED === 'true'

const ANON_ID_KEY = 'bacchana-anon-user-id'

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
  try {
    const { Purchases } = await import('@revenuecat/purchases-js')
    purchasesClient = Purchases.configure({
      apiKey: REVENUECAT_KEY,
      appUserId: getOrCreateAnonymousAppUserId(),
    })
  } catch {
    // Chunk RevenueCat inatteignable (hors ligne, precache PWA exclu) - reste en mode
    // invite, jamais de crash pour un SDK de paiement optionnel.
  }
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
 * "Restaurer mes achats" - obligatoire pour la review Apple/Play.
 *
 * DÉFAUT CONNU, relevé le 2026-08-30, non corrigé ici parce que le correctif
 * est un changement de produit et non une ligne de code. RevenueCat Web n'a
 * pas de restauration entre appareils : l'entitlement est lié à l'appUserId
 * ANONYME persisté dans le localStorage (voir getOrCreateAnonymousAppUserId).
 * Cette fonction ne fait donc que re-lire l'appareil courant.
 *
 * Conséquence, sur un achat A VIE : un vidage de cache, un changement de
 * navigateur ou un nouveau téléphone détruit definitivement ce que le joueur a
 * payé, et le bouton dont le seul role est de le reparer ne le peut pas. C'est
 * le genre de defaut qui finit en litige de paiement, pas en ticket de support.
 *
 * Le correctif : capter un identifiant de reprise a l'achat - `customerEmail`
 * existe dans les `PurchaseParams` du SDK - et permettre la reprise par cet
 * identifiant. A faire AVANT la premiere vente reelle, jamais apres : une fois
 * des achats anonymes en circulation, ils ne sont plus rattachables.
 *
 * Retourne null si pas configuré (mode invité) - l'appelant affiche alors
 * "Bientôt disponible" plutôt qu'un faux succès.
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

/**
 * Runs a real purchase for the chosen package. Returns the refreshed `CustomerInfo` on
 * success, `null` on any failure (user cancellation, network error, not configured) -
 * the caller must treat `null` as "no purchase happened", never as a crash.
 */
export async function purchasePackage(pkg: Package): Promise<CustomerInfo | null> {
  if (!purchasesClient) return null
  try {
    const result = await purchasesClient.purchase({ rcPackage: pkg })
    return result.customerInfo
  } catch {
    return null
  }
}
