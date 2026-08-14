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
    useSoireeStore.getState().allerVers('quiz', T0)

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
    useSoireeStore.getState().allerVers('picolo', T0)

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
    useSoireeStore.getState().allerVers('roulette', T0)

    useSoireeStore.getState().reset()

    const etat = useSoireeStore.getState()
    expect(etat.demarreeLe).toBeNull()
    expect(etat.modeCourant).toBeNull()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.derniereActiviteLe).toBeNull()
  })

  it('chaque passage de mode rafraichit la derniere activite', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().allerVers('quiz', PLUS_TARD)
    expect(useSoireeStore.getState().derniereActiviteLe).toBe(PLUS_TARD)
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
})
