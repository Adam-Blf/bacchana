/**
 * Porte d'age. C'est une garde juridique, pas une preference d'affichage : elle
 * porte la coherence entre la classification 18+ annoncee aux stores et le
 * parcours reel, et elle etaye la position au regard de la loi Evin.
 *
 * CE QUE CES TESTS NE VOIENT PAS : ils verifient la decision (`peutEntrer`) et sa
 * persistance, pas le CABLAGE dans `App.tsx`. Si quelqu'un supprimait le
 * `if (!peutEntrer(...))` en amont du routeur, ces tests resteraient verts et la
 * porte ne bloquerait plus rien. Ce point est verifie a la main au lancement, et
 * garde par le commentaire qui l'accompagne dans App.tsx.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { peutEntrer, useAgeGateStore } from './ageGateStore'

describe('peutEntrer', () => {
  it('bloque tant que la question n\'a pas ete posee', () => {
    // Le defaut est FERME. Une porte qui s'ouvre par defaut n'est pas une porte.
    expect(peutEntrer(null)).toBe(false)
  })

  it('bloque un mineur declare', () => {
    expect(peutEntrer('mineur')).toBe(false)
  })

  it('ouvre uniquement sur une declaration de majorite', () => {
    expect(peutEntrer('majeur')).toBe(true)
  })
})

describe('useAgeGateStore', () => {
  beforeEach(() => {
    useAgeGateStore.setState({ reponse: null, declareLe: null })
  })

  it('part fermee', () => {
    expect(peutEntrer(useAgeGateStore.getState().reponse)).toBe(false)
  })

  it('memorise le refus, pour qu\'un relancement ne le contourne pas', () => {
    // Point cle : si le refus n'etait pas persiste, il suffirait de fermer et
    // rouvrir l'application pour repasser la porte. La restriction serait alors
    // purement decorative, ce qui est exactement le defaut qu'on corrige.
    useAgeGateStore.getState().declarer('mineur')
    expect(useAgeGateStore.getState().reponse).toBe('mineur')
    expect(peutEntrer(useAgeGateStore.getState().reponse)).toBe(false)
  })

  it('horodate la declaration, comme trace en cas de controle', () => {
    useAgeGateStore.getState().declarer('majeur')
    const { declareLe } = useAgeGateStore.getState()
    expect(typeof declareLe).toBe('number')
    expect(declareLe).toBeGreaterThan(0)
  })

  it('ne stocke aucune date de naissance', () => {
    // Minimisation (RGPD art. 5.1.c) : une date de naissance serait une donnee
    // personnelle de plus, pour une fiabilite identique a une case a cocher.
    useAgeGateStore.getState().declarer('majeur')
    const etat = useAgeGateStore.getState() as unknown as Record<string, unknown>
    expect(Object.keys(etat).sort()).toEqual(['declareLe', 'declarer', 'reponse'])
  })
})
