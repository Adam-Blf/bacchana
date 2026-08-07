/**
 * Possession des packs et credit sur l'achat a vie.
 *
 * Ces deux fonctions decident qui accede a quoi et combien on facture. Une
 * erreur ici ne casse pas le build, elle prend de l'argent sans livrer le
 * contenu, ou livre du contenu sans le facturer. D'ou des cas limites testes
 * explicitement plutot qu'un test heureux.
 *
 * CE QUE CES TESTS NE VOIENT PAS : ils verifient la logique locale, pas que les
 * cles de `PACK_ENTITLEMENT_IDS` existent vraiment dans le projet RevenueCat.
 * Une cle absente du tableau de bord passerait ces tests au vert tout en ne
 * debloquant rien en production. Cette correspondance se verifie par API
 * (scripts de provisionnement), pas ici.
 */
import { describe, expect, it } from 'vitest'
import {
  PACK_ENTITLEMENT_IDS,
  PRIX_PLANCHER_CENTIMES,
  ownedPackIds,
  prixAVieApresCredit,
} from './billing'
import type { CustomerInfo } from '@revenuecat/purchases-js'
import catalogue from '../content/premium-catalog.json'

/** Fabrique un CustomerInfo minimal ne portant que les entitlements cites. */
function client(...cles: string[]): CustomerInfo {
  return {
    entitlements: {
      active: Object.fromEntries(cles.map((c) => [c, { isActive: true }])),
    },
  } as unknown as CustomerInfo
}

describe('PACK_ENTITLEMENT_IDS', () => {
  it('couvre exactement les packs du catalogue, ni plus ni moins', () => {
    // Un pack ajoute au catalogue sans entitlement serait invendable en silence ;
    // un entitlement sans pack serait un acces fantome. Les deux doivent casser ici.
    const duCatalogue = (catalogue as { id: string }[]).map((p) => p.id).sort()
    expect(Object.keys(PACK_ENTITLEMENT_IDS).sort()).toEqual(duCatalogue)
  })

  it('n\'utilise que des slugs stables, jamais un titre affichable', () => {
    // Garde contre la regression qui a casse `Bacchana Pro` : un identifiant
    // distant derive d'une chaine d'affichage se brise au premier renommage.
    for (const cle of Object.values(PACK_ENTITLEMENT_IDS)) {
      expect(cle).toMatch(/^pack_[a-z0-9_]+$/)
    }
  })
})

describe('ownedPackIds', () => {
  it('ne rend rien sans info client', () => {
    expect(ownedPackIds(null)).toEqual([])
  })

  it('ne rend rien quand aucun achat n\'a ete fait', () => {
    expect(ownedPackIds(client())).toEqual([])
  })

  it('ne debloque QUE le pack achete', () => {
    // Le coeur du sujet : un pack a quelques euros ne doit pas ouvrir les autres.
    const info = client(PACK_ENTITLEMENT_IDS['never-hot'])
    expect(ownedPackIds(info)).toEqual(['never-hot'])
  })

  it('cumule plusieurs packs achetes', () => {
    const info = client(
      PACK_ENTITLEMENT_IDS['never-hot'],
      PACK_ENTITLEMENT_IDS['picolo-chaos'],
    )
    expect([...ownedPackIds(info)].sort()).toEqual(['never-hot', 'picolo-chaos'])
  })

  it('rend TOUS les packs a un client premium a vie', () => {
    // Sans cette regle, un client qui a paye l'acces complet verrait ses packs
    // affiches comme verrouilles.
    expect([...ownedPackIds(client('Bacchana Pro'))].sort()).toEqual(
      Object.keys(PACK_ENTITLEMENT_IDS).sort(),
    )
  })

  it('ignore un entitlement inconnu', () => {
    expect(ownedPackIds(client('Bacchus Pro', 'pack_inexistant'))).toEqual([])
  })
})

describe('prixAVieApresCredit', () => {
  it('ne credite rien sans pack possede', () => {
    expect(prixAVieApresCredit(1299, 199, 0)).toEqual({
      creditCentimes: 0,
      aPayerCentimes: 1299,
    })
  })

  it('deduit le prix d\'un pack achete', () => {
    expect(prixAVieApresCredit(1299, 199, 1)).toEqual({
      creditCentimes: 199,
      aPayerCentimes: 1100,
    })
  })

  it('deduit le cumul de plusieurs packs', () => {
    expect(prixAVieApresCredit(1299, 199, 3)).toEqual({
      creditCentimes: 597,
      aPayerCentimes: 702,
    })
  })

  it('plafonne le credit au plancher facturable', () => {
    // 5 packs a 2,99 font 14,95, soit plus que l'achat a vie a 12,99. Sans
    // plafond, le reste a payer serait negatif et le tunnel echouerait.
    const r = prixAVieApresCredit(1299, 299, 5)
    expect(r.aPayerCentimes).toBe(PRIX_PLANCHER_CENTIMES)
    expect(r.creditCentimes).toBe(1299 - PRIX_PLANCHER_CENTIMES)
  })

  it('ne rend jamais un reste a payer negatif, meme sur un cumul absurde', () => {
    const r = prixAVieApresCredit(1299, 999, 99)
    expect(r.aPayerCentimes).toBeGreaterThanOrEqual(PRIX_PLANCHER_CENTIMES)
  })

  it('ignore un nombre de packs negatif au lieu d\'augmenter le prix', () => {
    // Une valeur negative viendrait d'un bug appelant ; elle ne doit jamais
    // FACTURER PLUS que le prix affiche.
    expect(prixAVieApresCredit(1299, 199, -2).aPayerCentimes).toBe(1299)
  })

  it('travaille en centimes entiers, sans derive flottante', () => {
    // 0.1 + 0.2 !== 0.3 : en euros flottants, un cumul de packs finirait par
    // afficher un prix faux d'un centime, ce qui est une infraction d'affichage.
    const r = prixAVieApresCredit(1299, 99, 3)
    expect(Number.isInteger(r.aPayerCentimes)).toBe(true)
    expect(r.aPayerCentimes).toBe(1002)
  })
})
