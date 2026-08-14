import { describe, it, expect, beforeEach } from 'vitest'
import { useSoireeStore } from './soireeStore'
import type { GameMode } from '@/core/engine/types'

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
    useSoireeStore.getState().allerVers('quiz' as GameMode)

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
    useSoireeStore.getState().allerVers('picolo' as GameMode)

    useSoireeStore.getState().arreter()

    const etat = useSoireeStore.getState()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.demarreeLe).toBe(T0)
    expect(etat.modeCourant).toBe('picolo')
  })

  it('FR-009 : reprendre relance l enchainement sur la soiree existante', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().arreter()

    useSoireeStore.getState().reprendre()

    expect(useSoireeStore.getState().enchainementActif).toBe(true)
    expect(useSoireeStore.getState().demarreeLe).toBe(T0)
  })

  it('reprendre sans soiree lancee ne fait rien', () => {
    useSoireeStore.getState().reprendre()
    const etat = useSoireeStore.getState()
    expect(etat.enchainementActif).toBe(false)
    expect(etat.demarreeLe).toBeNull()
  })

  it('reset repart a neuf', () => {
    useSoireeStore.getState().demarrer(T0)
    useSoireeStore.getState().allerVers('roulette' as GameMode)

    useSoireeStore.getState().reset()

    const etat = useSoireeStore.getState()
    expect(etat.demarreeLe).toBeNull()
    expect(etat.modeCourant).toBeNull()
    expect(etat.enchainementActif).toBe(false)
  })
})
