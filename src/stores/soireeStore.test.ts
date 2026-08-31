import { describe, it, expect, beforeEach } from 'vitest'
import { useSoireeStore, estReprenable, SEUIL_REPRISE_MS } from './soireeStore'

const T0 = 1_000
const PLUS_TARD = 500_000

describe('soireeStore', () => {
  beforeEach(() => {
    useSoireeStore.getState().reset()
  })

  it('demarre une soiree et active l enchainement', () => {
    useSoireeStore.getState().demarrer(T0)
    const etat = useSoireeStore.getState()
    expect(etat.demarreeLe).toBe(T0)
    expect(etat.enchainementActif).toBe(true)
  })

  it('FR-017 : un second demarrage n ecrase pas la soiree en cours', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)

    useSoireeStore.getState().demarrer(PLUS_TARD)

    const etat = useSoireeStore.getState()
    expect(etat.demarreeLe).toBe(T0)
    expect(etat.modeCourant).toBe('quiz')
  })

  it('un second appui reactive l enchainement s il avait ete arrete', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().arreter()
    expect(useSoireeStore.getState().enchainementActif).toBe(false)

    useSoireeStore.getState().demarrer(PLUS_TARD)

    const etat = useSoireeStore.getState()
    expect(etat.enchainementActif).toBe(true)
    expect(etat.demarreeLe).toBe(T0)
  })

  it('FR-008 : arreter l enchainement ne detruit pas la soiree', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('picolo', T0)

    useSoireeStore.getState().arreter()

    const etat = useSoireeStore.getState()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.demarreeLe).toBe(T0)
    expect(etat.modeCourant).toBe('picolo')
  })

  it('FR-009 : reprendre relance l enchainement sur la soiree existante', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().arreter()

    useSoireeStore.getState().reprendre(PLUS_TARD)

    expect(useSoireeStore.getState().enchainementActif).toBe(true)
    expect(useSoireeStore.getState().demarreeLe).toBe(T0)
  })

  it('reprendre sans soiree lancee ne fait rien', () => {
    useSoireeStore.getState().reprendre(T0)
    const etat = useSoireeStore.getState()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.demarreeLe).toBeNull()
  })

  it('reset repart a neuf', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('roulette', T0)

    useSoireeStore.getState().reset()

    const etat = useSoireeStore.getState()
    expect(etat.demarreeLe).toBeNull()
    expect(etat.modeCourant).toBeNull()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.derniereActiviteLe).toBeNull()
  })

  it('chaque passage de mode rafraichit la derniere activite', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', PLUS_TARD)
    expect(useSoireeStore.getState().derniereActiviteLe).toBe(PLUS_TARD)
  })

  it('retient les modes enchaines, dans l ordre', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)
    useSoireeStore.getState().demarrerMode('picolo', T0)
    expect(useSoireeStore.getState().modesJoues).toEqual(['quiz', 'picolo'])
  })

  it('ne compte pas deux fois un mode redistribue au second tour', () => {
    // Sinon la liste enfle et le cycle suivant se declenche trop tot.
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)
    useSoireeStore.getState().demarrerMode('picolo', T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)
    expect(useSoireeStore.getState().modesJoues).toEqual(['quiz', 'picolo'])
  })

  it('les modes enchaines survivent a un arret puis une reprise', () => {
    // C'est la raison d'etre de ce champ : l'ardoise repart de zero apres une
    // fermeture, l'enchainement non. Lire l'ardoise ferait redistribuer les
    // memes modes juste apres une reprise.
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)
    useSoireeStore.getState().arreter()
    useSoireeStore.getState().reprendre(PLUS_TARD)
    expect(useSoireeStore.getState().modesJoues).toEqual(['quiz'])
  })

  it('demarrer une nouvelle soiree repart sur une liste vide', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().demarrerMode('quiz', T0)
    useSoireeStore.getState().reset()
    useSoireeStore.getState().demarrer(PLUS_TARD)
    expect(useSoireeStore.getState().modesJoues).toEqual([])
  })
})

describe('estReprenable', () => {
  it('une soiree jamais lancee n est pas reprenable', () => {
    expect(estReprenable({ demarreeLe: null, derniereActiviteLe: null }, T0)).toBe(false)
  })

  it('une soiree qui vient de bouger est reprenable', () => {
    expect(estReprenable({ demarreeLe: T0, derniereActiviteLe: T0 }, T0 + 60_000)).toBe(true)
  })

  it('une soiree inactive depuis plus que le seuil ne l est plus', () => {
    // Le telephone verrouille deux minutes reprend. La soiree de la veille, non.
    expect(estReprenable({ demarreeLe: T0, derniereActiviteLe: T0 }, T0 + SEUIL_REPRISE_MS + 1)).toBe(false)
  })

  it('une longue soiree reste reprenable tant qu on y joue', () => {
    // L'expiration se calcule sur la derniere activite, pas sur le debut : une
    // soiree de cinq heures encore active ne doit pas expirer.
    const cinqHeures = 5 * 60 * 60 * 1000
    expect(
      estReprenable({ demarreeLe: T0, derniereActiviteLe: T0 + cinqHeures }, T0 + cinqHeures + 60_000),
    ).toBe(true)
  })

  // Vue rouge avant le 2026-08-31 : la proposition n'existait pas, elle etait
  // recalculee a chaque rendu du hub. Le mode affiche pouvait donc changer
  // entre l'affichage et l'appui.
  it('garde la proposition ecrite jusqu a un geste explicite', () => {
    useSoireeStore.getState().reset()
    const magasin = useSoireeStore.getState()
    magasin.demarrer(1000)
    magasin.proposer({ id: 'quiz', secondTour: false }, 1000)

    // Un fait de soiree change (activite), la proposition ne bouge pas.
    useSoireeStore.getState().proposer(useSoireeStore.getState().proposition!, 2000)
    expect(useSoireeStore.getState().proposition).toEqual({ id: 'quiz', secondTour: false })

    useSoireeStore.getState().demarrerMode('quiz', 3000)
    expect(useSoireeStore.getState().proposition).toBeNull()
    expect(useSoireeStore.getState().modeCourant).toBe('quiz')
    expect(useSoireeStore.getState().derniersModes).toEqual(['quiz'])
  })

  it('passer un mode le retient comme vu sans le compter comme joue', () => {
    useSoireeStore.getState().reset()
    const magasin = useSoireeStore.getState()
    magasin.demarrer(1000)
    magasin.proposer({ id: 'roulette', secondTour: false }, 1000)

    useSoireeStore.getState().passerMode('roulette', 2000)

    expect(useSoireeStore.getState().proposition).toBeNull()
    expect(useSoireeStore.getState().modesJoues).toContain('roulette')
    // Il n'a pas ete LANCE : il ne pese pas dans la fenetre anti-repetition.
    expect(useSoireeStore.getState().derniersModes).toEqual([])
  })

  it('borne l historique des modes lances', () => {
    useSoireeStore.getState().reset()
    const magasin = useSoireeStore.getState()
    magasin.demarrer(1000)
    for (let i = 0; i < 12; i++) {
      useSoireeStore.getState().demarrerMode(i % 2 === 0 ? 'quiz' : 'roulette', 1000 + i)
    }
    expect(useSoireeStore.getState().derniersModes).toHaveLength(8)
  })
})
