import type { CustomerInfo, Offering, Package, Purchases as PurchasesClass } from '@revenuecat/purchases-js'
import { enregistrerLienDeReprise } from './lienDeReprise'

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
// sans migrer l'entitlement côté dashboard, sinon les acheteurs existants perdent l'accès.
export const PREMIUM_ENTITLEMENT_ID = 'Bacchana Pro'

const REVENUECAT_KEY = import.meta.env.VITE_REVENUECAT_TEST_STORE_KEY as string | undefined

/** Real purchases stay off until Stripe is wired into RevenueCat - flips this flag on. */
export const BILLING_ENABLED = import.meta.env.VITE_BILLING_ENABLED === 'true'

const ANON_ID_KEY = 'bacchana-anon-user-id'

/**
 * Préfixe qu'un identifiant DOIT porter pour que RevenueCat le tienne pour anonyme.
 *
 * Ce n'est pas une convention de nommage, c'est un test exécuté par le SDK :
 * `isAnonymous() { return this._appUserId.startsWith('$RCAnonymousID:') }`, relevé dans
 * `Purchases.es.js` de la version 1.51.0 installée.
 */
const PREFIXE_ANONYME = '$RCAnonymousID:'

/** Sauvegarde de l'identifiant d'avant la migration - on n'efface jamais une clé de compte. */
const ANON_ID_KEY_AVANT_MIGRATION = 'bacchana-anon-user-id-avant-migration'

/**
 * Rend l'identifiant de l'appareil, au format anonyme de RevenueCat.
 *
 * POURQUOI CE N'EST PAS UN `crypto.randomUUID()`, et pourquoi ça se corrige AVANT la
 * première vente et jamais après.
 *
 * Le code précédent posait un UUID nu. Un UUID nu ne commence pas par `$RCAnonymousID:`,
 * donc `isAnonymous()` rend faux et RevenueCat classe l'acheteur comme IDENTIFIÉ. Or la
 * documentation du SDK dit, sur `RedemptionInfo`, qu'elle donne accès aux données de
 * reprise « when the purchase can be redeemed to a mobile user, like in the case of
 * anonymous users ». Un acheteur identifié ne reçoit donc pas de lien de reprise :
 * `redemptionInfo` arrive à `null`, et le SEUL mécanisme officiel de récupération d'un
 * achat web est désactivé à la source, sans le moindre message.
 *
 * La correction n'est pas rétroactive. Un achat déjà encaissé sous un UUID nu reste
 * attaché à cet identifiant, sans lien de reprise, et rien ne peut le rattraper côté
 * client. C'est pour ça que ce correctif passe avant la première vente réelle.
 *
 * L'ancien identifiant est conservé sous une autre clé plutôt qu'écrasé : il ne sert plus
 * à rien côté SDK, mais c'est la seule trace permettant de retrouver à la main un achat
 * qui aurait été fait sous l'ancien format.
 */
function obtenirIdentifiantAnonyme(Purchases: typeof PurchasesClass): string {
  try {
    const existant = window.localStorage.getItem(ANON_ID_KEY)
    if (existant && existant.startsWith(PREFIXE_ANONYME)) return existant
    const id = Purchases.generateRevenueCatAnonymousAppUserId()
    if (existant) window.localStorage.setItem(ANON_ID_KEY_AVANT_MIGRATION, existant)
    window.localStorage.setItem(ANON_ID_KEY, id)
    return id
  } catch {
    // localStorage indisponible (navigation privée) - identifiant de session seulement.
    // L'achat serait alors irrécupérable sur cet appareil : c'est exactement le cas que le
    // lien de reprise couvre.
    return Purchases.generateRevenueCatAnonymousAppUserId()
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
      appUserId: obtenirIdentifiantAnonyme(Purchases),
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
 * « Restaurer mes achats » - obligatoire pour la revue Apple et Play.
 *
 * CE QUE CETTE FONCTION FAIT, exactement : elle relit l'entitlement de l'appareil courant.
 * Elle sert donc quand l'état local a divergé du serveur - cache expiré, appareil resté
 * longtemps hors ligne, achat encaissé dans un autre onglet.
 *
 * CE QU'ELLE NE FAIT PAS, et ce n'est pas un oubli de code : le SDK Web n'a aucune
 * restauration entre appareils. L'entitlement est attaché à l'identifiant anonyme du
 * navigateur (voir obtenirIdentifiantAnonyme). Un nouveau navigateur ou un stockage vidé
 * repart d'un identifiant neuf, qui ne possède rien.
 *
 * Le pont existe dans un seul sens : le LIEN DE REPRISE rendu à l'achat rattache l'achat
 * web à l'application mobile (voir lienDeReprise.ts). Web vers mobile est couvert ; web
 * vers un autre navigateur ne l'est pas, et ne peut pas l'être sans un identifiant que
 * nous détiendrions - un compte, ou un service à nous.
 *
 * Retourne null si pas configuré (mode invité) - l'appelant affiche alors
 * « Bientôt disponible » plutôt qu'un faux succès.
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

/** Ce qu'un achat abouti rend à l'appelant. */
export interface ResultatAchat {
  customerInfo: CustomerInfo
  /**
   * Lien à usage unique qui rattache cet achat web à l'application mobile. Null quand
   * RevenueCat n'en émet pas - acheteur non anonyme, ou fonctionnalité désactivée dans le
   * tableau de bord. Valable 60 minutes d'après la documentation des liens de reprise.
   */
  redeemUrl: string | null
}

/**
 * Lance l'achat réel du paquet choisi. Rend le `CustomerInfo` rafraîchi ET le lien de
 * reprise, `null` sur tout échec (annulation, réseau, non configuré) - l'appelant traite
 * `null` comme « aucun achat n'a eu lieu », jamais comme un plantage.
 *
 * `courrielAcheteur` est facultatif : sans lui, le tunnel RevenueCat demande l'adresse
 * lui-même. La passer n'évite qu'une saisie quand on la connaît déjà. Cette adresse est ce
 * qui reçoit le reçu, donc la seule preuve d'achat que l'acheteur garde en dehors de son
 * navigateur.
 */
export async function purchasePackage(
  pkg: Package,
  courrielAcheteur?: string
): Promise<ResultatAchat | null> {
  if (!purchasesClient) return null
  try {
    const result = await purchasesClient.purchase({
      rcPackage: pkg,
      ...(courrielAcheteur ? { customerEmail: courrielAcheteur } : {}),
    })
    const redeemUrl = result.redemptionInfo?.redeemUrl ?? null
    // Écrit AVANT de rendre la main : si l'écran de succès ne s'affiche jamais - onglet
    // fermé, rafraîchissement - le lien reste retrouvable dans les Réglages.
    if (redeemUrl) enregistrerLienDeReprise(redeemUrl)
    return { customerInfo: result.customerInfo, redeemUrl }
  } catch {
    return null
  }
}
