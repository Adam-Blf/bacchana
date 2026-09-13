import { describe, it, expect, beforeEach } from 'vitest'
import { usePalmaresStore, classementPalmares, cleDuNom } from './palmaresStore'

describe('palmaresStore', () => {
  beforeEach(() => {
    usePalmaresStore.getState().effacer()
  })

  it('cumule les parties d une soiree a l autre', () => {
    const magasin = () => usePalmaresStore.getState()
    magasin().enregistrer('quiz', [
      { nom: 'Léa', penalites: 4, palme: true },
      { nom: 'Marco', penalites: 1, palme: false },
    ])
    magasin().enregistrer('roulette', [
      { nom: 'Léa', penalites: 2, palme: false },
      { nom: 'Marco', penalites: 6, palme: true },
    ])

    const classement = classementPalmares(magasin().lignes)
    expect(classement.map((l) => l.nom)).toEqual(['Marco', 'Léa'])
    expect(classement[0].penalites).toBe(7)
    expect(classement[0].parties).toBe(2)
    expect(classement[0].palmes).toBe(1)
    expect(classement[0].modes).toEqual(['quiz', 'roulette'])
  })

  // La cle est le PRENOM, pas l'identifiant du joueur : les identifiants sont
  // regeneres a chaque tablee, donc s'en servir remettrait le palmares a zero
  // toutes les soirees - exactement le contraire du but.
  it('reconnait le meme prenom malgre la casse et les espaces', () => {
    usePalmaresStore.getState().enregistrer('quiz', [{ nom: 'Léa', penalites: 3, palme: false }])
    usePalmaresStore.getState().enregistrer('quiz', [{ nom: '  léa ', penalites: 2, palme: false }])

    const classement = classementPalmares(usePalmaresStore.getState().lignes)
    expect(classement).toHaveLength(1)
    expect(classement[0].penalites).toBe(5)
    // Le prenom le plus recent gagne : corriger sa majuscule ne cree pas une
    // seconde ligne.
    expect(classement[0].nom).toBe('  léa ')
  })

  it('ignore un prenom vide plutot que de creer une ligne fantome', () => {
    usePalmaresStore.getState().enregistrer('quiz', [{ nom: '   ', penalites: 3, palme: false }])
    expect(classementPalmares(usePalmaresStore.getState().lignes)).toHaveLength(0)
  })

  it('normalise la cle', () => {
    expect(cleDuNom('  Léa   Marie ')).toBe('léa marie')
  })
})
