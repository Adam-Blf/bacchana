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

/**
 * Clé de l'entitlement, telle qu'elle existe dans le tableau de bord RevenueCat.
 *
 * CETTE VALEUR EST UN IDENTIFIANT DISTANT, PAS UN NOM DE PRODUIT. Elle doit
 * correspondre au caractère près au `lookup_key` d'un entitlement RevenueCat.
 * Si les deux divergent, le SDK répond simplement « pas premium » : aucune
 * erreur, aucune trace, et un client qui a payé n'obtient rien.
 *
 * C'est arrivé le 2026-08-07. Le renommage automatique Bacchus -> Bacchana a
 * réécrit cette ligne comme n'importe quelle autre chaîne, alors que le
 * checkpoint avertissait qu'elle ne devait pas bouger. Le code a cherché
 * `Bacchana Pro` pendant que le tableau de bord ne connaissait que
 * `Bacchus Pro`. Corrigé en créant la clé manquante côté RevenueCat, et non en
 * faisant reculer le code : le produit s'appelle Bacchana.
 *
 * MÊME RÈGLE QUE `migrateStorage.ts` : ce fichier est exclu de tout renommage
 * automatique de produit. Avant de toucher à cette ligne, vérifier la liste
 * réelle des entitlements du projet `proj896fa1e2`.
 */
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
 * Clé d'entitlement RevenueCat pour chaque pack vendu à l'unité.
 *
 * MÊME AVERTISSEMENT QUE `PREMIUM_ENTITLEMENT_ID` : ce sont des identifiants
 * distants. Les valeurs sont volontairement des slugs stables, et NON les titres
 * affichés des packs. Un premier jeu d'entitlements avait été créé sous la forme
 * `Pack Action ou Vérité - Extrême` ; renommer un pack dans
 * `content/premium-catalog.json` aurait alors révoqué l'accès de tous ceux qui
 * l'avaient acheté, sans la moindre erreur. Le titre change, la clé ne bouge pas.
 *
 * Les clés sont l'exact miroir des `store_identifier` du catalogue
 * (`bacchana_pack_<slug>`), pour qu'un humain qui lit le tableau de bord
 * RevenueCat retrouve la correspondance sans documentation.
 */
export const PACK_ENTITLEMENT_IDS: Readonly<Record<string, string>> = {
  'action-verite-extreme': 'pack_action_verite_extreme',
  'cest-un-10-redflags': 'pack_cest_un_10_redflags',
  'never-hot': 'pack_never_hot',
  'picolo-chaos': 'pack_picolo_chaos',
  'qui-de-nous-sale': 'pack_qui_de_nous_sale',
}

/**
 * Identifiants des packs réellement possédés.
 *
 * L'achat à vie ouvre TOUT : il renvoie donc la liste complète, sans quoi un
 * client premium verrait ses packs affichés comme verrouillés alors qu'il y a
 * accès. C'est le sens de `PREMIUM_ENTITLEMENT_ID`, pas une faveur.
 */
export function ownedPackIds(info: CustomerInfo | null): readonly string[] {
  if (!info) return []
  const tous = Object.keys(PACK_ENTITLEMENT_IDS)
  if (isPremiumFromCustomerInfo(info)) return tous
  return tous.filter(
    (packId) => info.entitlements.active[PACK_ENTITLEMENT_IDS[packId]]?.isActive ?? false,
  )
}

/**
 * Prix plancher facturable, en centimes.
 *
 * Un achat à 0 n'est pas un achat : aucun processeur ne l'accepte, et le tunnel
 * échouerait au lieu de délivrer le contenu. Le crédit est donc plafonné pour
 * que le reste à payer ne descende jamais sous ce seuil.
 */
export const PRIX_PLANCHER_CENTIMES = 100

/**
 * Grille tarifaire, en centimes. SOURCE UNIQUE.
 *
 * Ces valeurs vivaient dans le composant du paywall. Elles n'y avaient rien à
 * faire : ce ne sont pas des libellés d'interface, ce sont les montants que
 * Stripe encaisse et que RevenueCat doit refléter au centime près. Un prix qui
 * vit dans un composant finit toujours par diverger du catalogue distant.
 *
 * Arbitrage du 2026-08-07, sur relevé de 16 fiches store FR et un sondage de
 * 16 personnes :
 *
 * - **1299 à vie.** Le sondage place le prix juste dans la bande 5-15 EUR
 *   (7 voix sur 16) et 5 répondants décrochent dès 15 EUR : 12,99 passe juste
 *   sous cette marche. Côté marché, c'est sous presque toutes les boîtes de
 *   cartes physiques (9,95 à 27,95) et très en dessous des abonnements annuels
 *   du segment (29,99 à 49,99). Descendre à 6,99 pour battre le seul concurrent
 *   moins cher coûterait la moitié du revenu sur un critère que 3 répondants
 *   sur 16 seulement ont retenu.
 * - **199 le pack.** Ce prix est imposé par le CRÉDIT, pas choisi pour faire joli.
 *
 *   Invariant : acheter des packs puis passer à vie ne doit JAMAIS coûter plus
 *   cher que prendre l'accès à vie directement, sinon on punit exactement les
 *   clients qui ont commencé petit, c'est-à-dire ceux que le pack sert à
 *   recruter. Formellement, `nb_packs * PRIX_PACK <= PRIX_A_VIE`.
 *
 *   À 2,99 l'invariant casse : cinq packs coûtent 14,95, le crédit plafonne à
 *   11,99 (plancher facturable oblige), et le client débourse 15,95 au total pour
 *   finir au même endroit qu'un autre ayant payé 12,99. À 1,99, les cinq packs
 *   font 9,95, le crédit les couvre intégralement, l'accès à vie coûte alors 3,04,
 *   et le total retombe **exactement** sur 12,99 : tous les chemins convergent.
 *
 *   Le marché suit : le plancher constaté des packs de contenu est 2,99 (Chopine,
 *   Sombre soirée, Cap ou pas cap), Picolo est à 3,99, Action ou Vérité de 3,99 à
 *   7,99. À 1,99, Bacchana est le pack le moins cher du segment. Le sondage
 *   confirme, 1,99 y étant la deuxième réponse des acheteurs de packs.
 */
export const PRIX_A_VIE_CENTIMES = 1299
export const PRIX_PACK_CENTIMES = 199

/**
 * Crédit ouvert par chaque pack acheté, en centimes.
 *
 * VALEUR CONTRACTUELLE, DISTINCTE DU PRIX DE VENTE DU PACK, même si les deux
 * coïncident aujourd'hui. La distinction n'est pas cosmétique : le crédit est une
 * promesse déjà vendue à des clients, le prix de vente est une variable
 * commerciale qui bougera. Les confondre ferait qu'une baisse du prix des packs
 * réduirait rétroactivement le crédit de gens ayant déjà payé, ce qui est une
 * modification unilatérale du contrat.
 *
 * Toute évolution de cette constante doit être répercutée dans les CGV, qui
 * doivent énoncer le montant, sa durée de validité, et le sort du crédit si le
 * prix de l'achat à vie change entre-temps.
 */
export const CREDIT_PAR_PACK_CENTIMES = 199

/**
 * Applique le crédit des packs déjà achetés sur l'achat à vie.
 *
 * Règle produit : ce qui a été dépensé en packs se déduit de l'achat à vie. Le
 * pack cesse d'être un concurrent de l'achat unique pour en devenir la porte
 * d'entrée, ce qui supprime la cannibalisation.
 *
 * Le second paramètre est un CRÉDIT, pas un prix de vente. Voir
 * `CREDIT_PAR_PACK_CENTIMES` : les appelants ne doivent jamais y passer le prix
 * courant d'un pack.
 *
 * Fonction pure et exportée pour être testable seule : c'est de l'arithmétique
 * qui engage de l'argent réel, elle ne doit pas vivre dans un composant.
 *
 * Tout est en CENTIMES, jamais en euros flottants : `0.1 + 0.2 !== 0.3` en
 * virgule flottante, et une erreur d'un centime sur un prix affiché est une
 * erreur d'affichage de prix, donc une infraction, pas un détail.
 */
export function prixAVieApresCredit(
  prixAVieCentimes: number,
  creditParPackCentimes: number,
  nbPacksPossedes: number,
): { creditCentimes: number; aPayerCentimes: number } {
  const creditBrut = Math.max(0, creditParPackCentimes * nbPacksPossedes)
  // Plafond : le reste à payer ne peut pas passer sous le plancher facturable.
  const creditMax = Math.max(0, prixAVieCentimes - PRIX_PLANCHER_CENTIMES)
  const creditCentimes = Math.min(creditBrut, creditMax)
  return { creditCentimes, aPayerCentimes: prixAVieCentimes - creditCentimes }
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
