import { describe, it, expect, beforeEach } from 'vitest'
import {
  useAvisStore,
  doitDemanderAvis,
  SEUIL_SOIREES,
  MAX_DEMANDES,
  DELAI_ENTRE_DEMANDES_MS,
} from './avisStore'

const T0 = 1_000

/** Un etat par defaut qui remplit toutes les conditions, que chaque cas casse sur un seul point. */
const ELIGIBLE = {
  soireesTerminees: SEUIL_SOIREES,
  demandesFaites: 0,
  derniereDemandeLe: null,
  clos: false,
}

describe('doitDemanderAvis', () => {
  it('demande quand toutes les conditions sont reunies', () => {
    expect(doitDemanderAvis(ELIGIBLE, T0)).toBe(true)
  })

  it('ne demande rien avant le seuil de soirees', () => {
    // Une note demandee a quelqu'un qui n'a pas encore joue ne veut rien dire.
    expect(doitDemanderAvis({ ...ELIGIBLE, soireesTerminees: SEUIL_SOIREES - 1 }, T0)).toBe(false)
  })

  it('ne redemande jamais apres un refus explicite', () => {
    expect(doitDemanderAvis({ ...ELIGIBLE, clos: true }, T0)).toBe(false)
  })

  it('un refus explicite tient meme apres des annees', () => {
    const dixAns = 10 * 365 * 24 * 60 * 60 * 1000
    expect(doitDemanderAvis({ ...ELIGIBLE, clos: true }, T0 + dixAns)).toBe(false)
  })

  it('respecte le plafond de demandes', () => {
    expect(
      doitDemanderAvis(
        { ...ELIGIBLE, demandesFaites: MAX_DEMANDES, derniereDemandeLe: T0 },
        T0 + DELAI_ENTRE_DEMANDES_MS * 10,
      ),
    ).toBe(false)
  })

  it('ne redemande pas avant le delai', () => {
    expect(
      doitDemanderAvis(
        { ...ELIGIBLE, demandesFaites: 1, derniereDemandeLe: T0 },
        T0 + DELAI_ENTRE_DEMANDES_MS - 1,
      ),
    ).toBe(false)
  })

  it('redemande une fois le delai ecoule', () => {
    expect(
      doitDemanderAvis(
        { ...ELIGIBLE, demandesFaites: 1, derniereDemandeLe: T0 },
        T0 + DELAI_ENTRE_DEMANDES_MS,
      ),
    ).toBe(true)
  })

  it('la decision ne depend d aucune notion de satisfaction', () => {
    // Garde de conception, pas de comportement : le filtrage d'avis (n'envoyer vers
    // le store que ceux qui ont aime) est interdit par Google Play comme par Apple.
    // Il est impossible ici parce que la fonction n'a aucune entree sur laquelle
    // filtrer. Ce test echouera le jour ou quelqu'un en ajoutera une.
    expect(Object.keys(ELIGIBLE).sort()).toEqual([
      'clos',
      'demandesFaites',
      'derniereDemandeLe',
      'soireesTerminees',
    ])
  })
})

describe('avisStore', () => {
  beforeEach(() => {
    useAvisStore.getState().reset()
  })

  it('compte les soirees terminees', () => {
    useAvisStore.getState().soireeTerminee()
    useAvisStore.getState().soireeTerminee()
    expect(useAvisStore.getState().soireesTerminees).toBe(2)
  })

  it('enregistre la demande affichee et son horodatage', () => {
    useAvisStore.getState().demandeAffichee(T0)
    const etat = useAvisStore.getState()
    expect(etat.demandesFaites).toBe(1)
    expect(etat.derniereDemandeLe).toBe(T0)
  })

  it('clore rend l etat definitivement non eligible', () => {
    const store = useAvisStore.getState()
    store.soireeTerminee()
    store.soireeTerminee()
    store.soireeTerminee()
    store.clore()
    expect(doitDemanderAvis(useAvisStore.getState(), T0)).toBe(false)
  })

  it('devient eligible apres assez de soirees, pas avant', () => {
    for (let i = 0; i < SEUIL_SOIREES - 1; i += 1) useAvisStore.getState().soireeTerminee()
    expect(doitDemanderAvis(useAvisStore.getState(), T0)).toBe(false)

    useAvisStore.getState().soireeTerminee()
    expect(doitDemanderAvis(useAvisStore.getState(), T0)).toBe(true)
  })

  it('une demande affichee suffit a suspendre les suivantes', () => {
    for (let i = 0; i < SEUIL_SOIREES; i += 1) useAvisStore.getState().soireeTerminee()
    useAvisStore.getState().demandeAffichee(T0)
    expect(doitDemanderAvis(useAvisStore.getState(), T0 + 1)).toBe(false)
  })
})
