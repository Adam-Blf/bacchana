import { describe, it, expect, beforeEach } from 'vitest'
import {
  usePartieStore,
  lireValeur,
  empreinteDe,
  oublierManche,
  SEUIL_REPRISE_PARTIE_MS,
} from './partieStore'
import type { Player } from '@/types'

const TABLE: Player[] = [
  { id: 'p1', name: 'Léa', active: true },
  { id: 'p2', name: 'Marco', active: true },
]
const AUTRE_TABLE: Player[] = [
  { id: 'p3', name: 'Sam', active: true },
  { id: 'p4', name: 'Nour', active: true },
]

describe('partieStore', () => {
  beforeEach(() => {
    usePartieStore.getState().toutEffacer()
  })

  it('rend la valeur ecrite pour la meme tablee', () => {
    usePartieStore.getState().ecrire('quiz', 'session', { tour: 3 }, empreinteDe(TABLE), 1000)
    expect(lireValeur('quiz', 'session', empreinteDe(TABLE), 1000)).toEqual({ valeur: { tour: 3 } })
  })

  // Sans l'empreinte, changer de joueurs puis relancer un mode ressuscitait la
  // partie des precedents, avec leurs noms et leurs penalites.
  it('ne rend rien a une autre tablee', () => {
    usePartieStore.getState().ecrire('quiz', 'session', { tour: 3 }, empreinteDe(TABLE), 1000)
    expect(lireValeur('quiz', 'session', empreinteDe(AUTRE_TABLE), 1000)).toBeNull()
  })

  it('ne rend rien au dela du seuil de reprise', () => {
    usePartieStore.getState().ecrire('quiz', 'session', { tour: 3 }, empreinteDe(TABLE), 1000)
    expect(lireValeur('quiz', 'session', empreinteDe(TABLE), 1000 + SEUIL_REPRISE_PARTIE_MS)).toBeNull()
  })

  // `undefined`, `null` et `false` sont des etats legitimes : les confondre
  // avec « rien d'ecrit » remettrait la valeur initiale par-dessus une reprise
  // valable.
  it('distingue une valeur fausse d une absence de valeur', () => {
    usePartieStore.getState().ecrire('quiz', 'reponseVue', false, empreinteDe(TABLE), 1000)
    expect(lireValeur('quiz', 'reponseVue', empreinteDe(TABLE), 1000)).toEqual({ valeur: false })
    expect(lireValeur('quiz', 'jamaisEcrite', empreinteDe(TABLE), 1000)).toBeNull()
  })

  it('repart d une feuille blanche quand la tablee change', () => {
    usePartieStore.getState().ecrire('quiz', 'a', 1, empreinteDe(TABLE), 1000)
    usePartieStore.getState().ecrire('quiz', 'b', 2, empreinteDe(AUTRE_TABLE), 1100)
    expect(lireValeur('quiz', 'a', empreinteDe(AUTRE_TABLE), 1100)).toBeNull()
    expect(lireValeur('quiz', 'b', empreinteDe(AUTRE_TABLE), 1100)).toEqual({ valeur: 2 })
  })

  it('oublie une manche sans toucher aux autres', () => {
    usePartieStore.getState().ecrire('quiz', 'session', 1, empreinteDe(TABLE), 1000)
    usePartieStore.getState().ecrire('roulette', 'tours', 4, empreinteDe(TABLE), 1000)
    oublierManche('quiz')
    expect(lireValeur('quiz', 'session', empreinteDe(TABLE), 1000)).toBeNull()
    expect(lireValeur('roulette', 'tours', empreinteDe(TABLE), 1000)).toEqual({ valeur: 4 })
  })
})
