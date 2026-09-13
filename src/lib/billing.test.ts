import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * L'identifiant d'appareil DOIT être au format anonyme de RevenueCat.
 *
 * Ce test verrouille un défaut réel du 2026-08-30. Le code posait un
 * `crypto.randomUUID()`, qui ne commence pas par `$RCAnonymousID:`. Le SDK teste
 * exactement ce préfixe (`isAnonymous() { return this._appUserId.startsWith(...) }`,
 * relevé dans `Purchases.es.js` 1.51.0), donc RevenueCat classait chaque acheteur comme
 * IDENTIFIÉ, et un acheteur identifié ne reçoit AUCUN lien de reprise - `redemptionInfo`
 * arrive à null. Le seul mécanisme officiel de récupération d'un achat web était coupé à
 * la source, sans le moindre message.
 *
 * Rien ne pouvait le voir : le typecheck passe, l'achat aboutit, l'entitlement est bien
 * accordé. Seul un achat réel aurait montré l'absence du lien - c'est-à-dire trop tard,
 * puisqu'un achat encaissé sous un identifiant non anonyme n'est pas rattrapable.
 */

const CLE_ID = 'bacchana-anon-user-id'
const CLE_AVANT_MIGRATION = 'bacchana-anon-user-id-avant-migration'
const PREFIXE = '$RCAnonymousID:'

let compteur = 0
const configure = vi.fn()
const purchase = vi.fn()

vi.mock('@revenuecat/purchases-js', () => ({
  Purchases: {
    configure: (params: { appUserId: string }) => {
      configure(params)
      return { purchase, getCustomerInfo: vi.fn(), getOfferings: vi.fn() }
    },
    generateRevenueCatAnonymousAppUserId: () => `${PREFIXE}genere${++compteur}`,
  },
}))

async function chargerBilling() {
  vi.resetModules()
  return import('./billing')
}

describe('identifiant d\'appareil RevenueCat', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_REVENUECAT_TEST_STORE_KEY', 'cle-de-test')
    window.localStorage.clear()
    configure.mockClear()
    purchase.mockReset()
    compteur = 0
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('porte le préfixe anonyme - sans lui, aucun lien de reprise n\'est jamais émis', async () => {
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(configure).toHaveBeenCalledTimes(1)
    expect(configure.mock.calls[0][0].appUserId.startsWith(PREFIXE)).toBe(true)
  })

  it('réutilise l\'identifiant déjà stocké, pour ne pas perdre l\'achat de cet appareil', async () => {
    window.localStorage.setItem(CLE_ID, `${PREFIXE}dejala`)
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(configure.mock.calls[0][0].appUserId).toBe(`${PREFIXE}dejala`)
  })

  it('remplace un ancien identifiant nu, qui est précisément le défaut à corriger', async () => {
    window.localStorage.setItem(CLE_ID, '2f1c9a10-0000-4000-8000-000000000000')
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(configure.mock.calls[0][0].appUserId.startsWith(PREFIXE)).toBe(true)
    expect(window.localStorage.getItem(CLE_ID)?.startsWith(PREFIXE)).toBe(true)
  })

  it('conserve l\'ancien identifiant au lieu de l\'écraser - une clé de compte ne s\'efface pas', async () => {
    window.localStorage.setItem(CLE_ID, '2f1c9a10-0000-4000-8000-000000000000')
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(window.localStorage.getItem(CLE_AVANT_MIGRATION)).toBe(
      '2f1c9a10-0000-4000-8000-000000000000'
    )
  })

  it('n\'écrit aucune sauvegarde quand il n\'y avait rien à sauvegarder', async () => {
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(window.localStorage.getItem(CLE_AVANT_MIGRATION)).toBeNull()
  })

  it('ne configure rien sans clé - le mode invité ne doit jamais toucher au stockage', async () => {
    vi.stubEnv('VITE_REVENUECAT_TEST_STORE_KEY', '')
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(configure).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(CLE_ID)).toBeNull()
  })
})

describe('achat et lien de reprise', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_REVENUECAT_TEST_STORE_KEY', 'cle-de-test')
    window.localStorage.clear()
    configure.mockClear()
    purchase.mockReset()
    compteur = 0
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  const infoClient = { entitlements: { active: {} } }

  it('rend le lien de reprise ET l\'écrit, avant même que l\'écran de succès s\'affiche', async () => {
    purchase.mockResolvedValue({
      customerInfo: infoClient,
      redemptionInfo: { redeemUrl: 'https://reprise.example/xyz' },
    })
    const billing = await chargerBilling()
    await billing.configureBilling()
    const resultat = await billing.purchasePackage({} as never)
    expect(resultat?.redeemUrl).toBe('https://reprise.example/xyz')
    // Écrit tout de suite : un onglet fermé sur l'écran de succès ne doit pas coûter le
    // seul pont entre cet achat et le téléphone du joueur.
    const { lireLienDeReprise } = await import('./lienDeReprise')
    expect(lireLienDeReprise()?.url).toBe('https://reprise.example/xyz')
  })

  it('accepte un achat sans lien plutôt que de le refuser', async () => {
    // RevenueCat peut ne pas en émettre - fonctionnalité coupée dans le tableau de bord.
    // L'achat reste valide sur cet appareil : on ne casse pas une vente pour ça.
    purchase.mockResolvedValue({ customerInfo: infoClient, redemptionInfo: null })
    const billing = await chargerBilling()
    await billing.configureBilling()
    const resultat = await billing.purchasePackage({} as never)
    expect(resultat?.customerInfo).toBe(infoClient)
    expect(resultat?.redeemUrl).toBeNull()
    const { lireLienDeReprise } = await import('./lienDeReprise')
    expect(lireLienDeReprise()).toBeNull()
  })

  it('passe le courriel au tunnel quand on le connaît, et ne l\'invente jamais sinon', async () => {
    purchase.mockResolvedValue({ customerInfo: infoClient, redemptionInfo: null })
    const billing = await chargerBilling()
    await billing.configureBilling()

    await billing.purchasePackage({} as never, 'joueur@example.fr')
    expect(purchase.mock.calls[0][0].customerEmail).toBe('joueur@example.fr')

    await billing.purchasePackage({} as never)
    expect('customerEmail' in purchase.mock.calls[1][0]).toBe(false)
  })

  it('rend null sur annulation ou erreur - jamais un faux succès', async () => {
    purchase.mockRejectedValue(new Error('annule'))
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(await billing.purchasePackage({} as never)).toBeNull()
  })

  it('rend null en mode invité, sans jamais appeler le SDK', async () => {
    vi.stubEnv('VITE_REVENUECAT_TEST_STORE_KEY', '')
    const billing = await chargerBilling()
    await billing.configureBilling()
    expect(await billing.purchasePackage({} as never)).toBeNull()
    expect(purchase).not.toHaveBeenCalled()
  })
})
