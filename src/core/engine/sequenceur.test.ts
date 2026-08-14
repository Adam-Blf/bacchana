import { describe, it, expect } from 'vitest'
import { seededRng } from './targeting'
import {
  choisirModeSuivant,
  phaseDeSoiree,
  SEUIL_FIN_DE_SOIREE_MS,
  type EtatSoiree,
} from './sequenceur'
import type { GameMode, ModeDefinition, DureeIndicative } from './types'
import { MODE_REGISTRY } from './modeRegistry'

/**
 * Fabrique un mode de test. Le registre reel porte une quinzaine de champs dont
 * aucun n'interesse le sequenceur ; on ne renseigne ici que ce qui pese sur la
 * decision, le reste est du remplissage inerte.
 */
function mode(
  id: GameMode,
  options: {
    minPlayers?: number
    duree?: DureeIndicative
    explication?: boolean
    freePackIds?: string[]
    hasPremiumPacks?: boolean
  } = {},
): ModeDefinition {
  return {
    id,
    title: id,
    subtitle: '',
    icon: 'pique',
    tileColor: '',
    minPlayers: options.minPlayers ?? 2,
    dureeIndicative: options.duree ?? 'moyen',
    demandeExplication: options.explication ?? false,
    component: () => Promise.resolve({ default: () => null }),
    freePackIds: options.freePackIds ?? ['pack'],
    hasPremiumPacks: options.hasPremiumPacks ?? false,
    rules: { title: id, steps: [] },
  } as ModeDefinition
}

function soiree(partiel: Partial<EtatSoiree> = {}): EtatSoiree {
  return { demarreeLe: 0, modesJoues: [], ...partiel }
}

const T0 = 0
const APRES_DEUX_HEURES = SEUIL_FIN_DE_SOIREE_MS * 2

describe('sequenceur, eligibilite', () => {
  it('ecarte les modes qui demandent plus de joueurs que la tablee', () => {
    const registre = [mode('quiz', { minPlayers: 2 }), mode('ranking', { minPlayers: 6 })]
    for (let i = 0; i < 20; i++) {
      const choix = choisirModeSuivant(soiree(), 3, registre, T0, seededRng(`s${i}`))
      expect(choix.type).toBe('mode')
      if (choix.type === 'mode') expect(choix.id).toBe('quiz')
    }
  })

  it('ecarte les modes inaccessibles quand la tablee n a pas le premium', () => {
    const registre = [
      mode('quiz', { freePackIds: ['a'] }),
      mode('roulette', { freePackIds: [], hasPremiumPacks: false }),
      mode('picolo', { freePackIds: [], hasPremiumPacks: true }),
    ]
    for (let i = 0; i < 20; i++) {
      const choix = choisirModeSuivant(soiree(), 4, registre, T0, seededRng(`p${i}`), false)
      expect(choix.type).toBe('mode')
      if (choix.type === 'mode') expect(choix.id).not.toBe('picolo')
    }
  })

  it('accepte les modes payants quand la tablee a le premium', () => {
    const registre = [mode('picolo', { freePackIds: [], hasPremiumPacks: true })]
    const choix = choisirModeSuivant(soiree(), 4, registre, T0, seededRng('x'), true)
    expect(choix.type).toBe('mode')
  })

  it('rend aucun quand rien n est eligible, sans jamais lever', () => {
    const registre = [mode('ranking', { minPlayers: 8 })]
    const choix = choisirModeSuivant(soiree(), 2, registre, T0, seededRng('x'))
    expect(choix).toEqual({ type: 'aucun', raison: 'aucun-mode-eligible' })
  })
})

describe('sequenceur, repetitions', () => {
  it('ne represente pas un mode deja joue tant qu il en reste', () => {
    const registre = [mode('quiz'), mode('picolo'), mode('roulette')]
    const choix = choisirModeSuivant(soiree({ modesJoues: ['quiz', 'picolo'] }), 4, registre, T0, seededRng('x'))
    expect(choix.type).toBe('mode')
    if (choix.type === 'mode') {
      expect(choix.id).toBe('roulette')
      expect(choix.secondTour).toBe(false)
    }
  })

  it('annonce le second tour quand tous les modes eligibles ont ete joues', () => {
    const registre = [mode('quiz'), mode('picolo')]
    const choix = choisirModeSuivant(soiree({ modesJoues: ['quiz', 'picolo'] }), 4, registre, T0, seededRng('x'))
    expect(choix.type).toBe('mode')
    if (choix.type === 'mode') expect(choix.secondTour).toBe(true)
  })

  it('le second tour ne ressuscite pas un mode inaccessible', () => {
    const registre = [mode('quiz'), mode('picolo', { freePackIds: [], hasPremiumPacks: true })]
    const choix = choisirModeSuivant(soiree({ modesJoues: ['quiz'] }), 4, registre, T0, seededRng('x'), false)
    expect(choix.type).toBe('mode')
    if (choix.type === 'mode') {
      expect(choix.id).toBe('quiz')
      expect(choix.secondTour).toBe(true)
    }
  })
})

describe('sequenceur, rythme', () => {
  it('privilegie un mode a explications a l ouverture', () => {
    const registre = [mode('roulette', { explication: false }), mode('quiz', { explication: true })]
    for (let i = 0; i < 20; i++) {
      const choix = choisirModeSuivant(soiree(), 4, registre, T0, seededRng(`o${i}`))
      expect(choix.type).toBe('mode')
      if (choix.type === 'mode') {
        expect(choix.id).toBe('quiz')
        expect(choix.phase).toBe('ouverture')
      }
    }
  })

  it('ne force plus l explication une fois qu un mode explique a ete joue', () => {
    const registre = [mode('quiz', { explication: true }), mode('roulette', { explication: false })]
    const choix = choisirModeSuivant(
      soiree({ modesJoues: ['quiz'] }),
      4,
      registre,
      T0,
      seededRng('x'),
    )
    expect(choix.type).toBe('mode')
    if (choix.type === 'mode') expect(choix.id).toBe('roulette')
  })

  it('privilegie les modes courts en fin de soiree', () => {
    const registre = [mode('borderland', { duree: 'long' }), mode('sevenSeconds', { duree: 'court' })]
    for (let i = 0; i < 20; i++) {
      const choix = choisirModeSuivant(soiree(), 4, registre, APRES_DEUX_HEURES, seededRng(`f${i}`))
      expect(choix.type).toBe('mode')
      if (choix.type === 'mode') {
        expect(choix.id).toBe('sevenSeconds')
        expect(choix.phase).toBe('fin')
      }
    }
  })

  it('se rabat sur les modes disponibles quand la preference ne peut pas etre satisfaite', () => {
    // Aucun mode court : la regle de fin de soiree ne doit pas bloquer le tirage.
    const registre = [mode('borderland', { duree: 'long' })]
    const choix = choisirModeSuivant(soiree(), 4, registre, APRES_DEUX_HEURES, seededRng('x'))
    expect(choix.type).toBe('mode')
    if (choix.type === 'mode') expect(choix.id).toBe('borderland')
  })

  it('calcule la phase depuis le temps ecoule et le nombre de modes joues', () => {
    expect(phaseDeSoiree(soiree(), T0)).toBe('ouverture')
    expect(phaseDeSoiree(soiree({ modesJoues: ['quiz', 'picolo', 'roulette'] }), T0)).toBe('croisiere')
    expect(phaseDeSoiree(soiree(), APRES_DEUX_HEURES)).toBe('fin')
  })
})

describe('sequenceur, simulations sur le registre reel', () => {
  const REGISTRE_REEL = Object.values(MODE_REGISTRY)

  /** Deroule une soiree complete et rend les modes tires, dans l'ordre. */
  function derouler(effectif: number, premium: boolean, graine: string, tours = 15): GameMode[] {
    const etat: EtatSoiree = { demarreeLe: 0, modesJoues: [] }
    const rng = seededRng(graine)
    const tires: GameMode[] = []
    for (let i = 0; i < tours; i++) {
      const choix = choisirModeSuivant(etat, effectif, REGISTRE_REEL, i * 5 * 60 * 1000, rng, premium)
      if (choix.type === 'aucun') break
      tires.push(choix.id)
      etat.modesJoues = [...etat.modesJoues, choix.id]
    }
    return tires
  }

  it('SC-003 : sur 20 enchainements a 3 joueurs, aucun mode n exige davantage', () => {
    for (let i = 0; i < 20; i++) {
      const tires = derouler(3, false, `sc003-${i}`)
      expect(tires.length).toBeGreaterThan(0)
      for (const id of tires) {
        expect(MODE_REGISTRY[id].minPlayers).toBeLessThanOrEqual(3)
      }
    }
  })

  it('SC-004 : sur 20 enchainements sans premium, aucun mode inaccessible', () => {
    for (let i = 0; i < 20; i++) {
      const tires = derouler(6, false, `sc004-${i}`)
      expect(tires.length).toBeGreaterThan(0)
      for (const id of tires) {
        const m = MODE_REGISTRY[id]
        // Accessible sans premium : soit des paquets gratuits, soit un contenu
        // embarque. Un mode a paquets exclusivement premium ne doit jamais sortir.
        expect(m.freePackIds.length > 0 || !m.hasPremiumPacks).toBe(true)
      }
    }
  })

  it('SC-002 : une soiree enchaine au moins 4 modes differents', () => {
    const tires = derouler(6, false, 'sc002', 4)
    expect(new Set(tires).size).toBe(4)
  })

  it('FR-011 : un mode a explications figure parmi les trois premiers', () => {
    for (let i = 0; i < 20; i++) {
      const tires = derouler(6, false, `fr011-${i}`, 3)
      expect(tires.some((id) => MODE_REGISTRY[id].demandeExplication)).toBe(true)
    }
  })
})

describe('sequenceur, determinisme', () => {
  it('rend le meme choix a graine et etat identiques', () => {
    const registre = [mode('quiz'), mode('picolo'), mode('roulette'), mode('tribunal')]
    const premier = choisirModeSuivant(soiree(), 4, registre, T0, seededRng('graine'))
    const second = choisirModeSuivant(soiree(), 4, registre, T0, seededRng('graine'))
    expect(premier).toEqual(second)
  })

  it('ne mute pas l etat de la soiree qu il recoit', () => {
    const registre = [mode('quiz'), mode('picolo')]
    const etat = soiree({ modesJoues: ['quiz'] })
    choisirModeSuivant(etat, 4, registre, T0, seededRng('x'))
    expect(etat.modesJoues).toEqual(['quiz'])
  })
})
