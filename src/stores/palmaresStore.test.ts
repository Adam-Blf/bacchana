import { describe, it, expect, beforeEach } from 'vitest'
import {
  usePalmaresStore,
  classementPalmares,
  cleDuNom,
  meneursExAequo,
  rangsPalmares,
} from './palmaresStore'

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

/**
 * Vue rouge avant le 2026-09-01 : le palmares numerotait 1, 2, 3 sans jamais
 * regarder si deux lignes etaient a egalite. Le tri departageait sur le prenom,
 * donc a penalites ET parties identiques la premiere place revenait a l'ordre
 * alphabetique - un critere que personne autour de la table ne connait, et qui
 * n'a rien a voir avec ce qui s'est passe pendant la soiree.
 *
 * Un classement qui invente un vainqueur ment plus qu'il n'informe. A egalite
 * parfaite, il faut le DIRE.
 */
describe('rangs du palmares', () => {
  beforeEach(() => {
    usePalmaresStore.getState().effacer()
  })

  const poser = (entrees: { nom: string; penalites: number; parties?: number }[]) => {
    for (const e of entrees) {
      for (let i = 0; i < (e.parties ?? 1); i++) {
        usePalmaresStore
          .getState()
          .enregistrer('quiz', [
            { nom: e.nom, penalites: i === 0 ? e.penalites : 0, palme: false },
          ])
      }
    }
    return rangsPalmares(classementPalmares(usePalmaresStore.getState().lignes))
  }

  it('partage le rang quand penalites et parties sont identiques', () => {
    const rangs = poser([
      { nom: 'Zoé', penalites: 7 },
      { nom: 'Alice', penalites: 7 },
      { nom: 'Bruno', penalites: 2 },
    ])
    expect(rangs.map((r) => r.rang)).toEqual([1, 1, 3])
    expect(rangs.map((r) => r.exAequo)).toEqual([true, true, false])
  })

  it('ne declare pas une egalite quand le nombre de parties differe', () => {
    const rangs = poser([
      { nom: 'Alice', penalites: 6, parties: 3 },
      { nom: 'Bruno', penalites: 6, parties: 1 },
    ])
    expect(rangs.map((r) => r.rang)).toEqual([1, 2])
    expect(rangs.every((r) => !r.exAequo)).toBe(true)
  })

  it('saute les rangs consommes par un groupe a egalite', () => {
    const rangs = poser([
      { nom: 'Alice', penalites: 9 },
      { nom: 'Bruno', penalites: 5 },
      { nom: 'Chloé', penalites: 5 },
      { nom: 'Dora', penalites: 5 },
      { nom: 'Elio', penalites: 1 },
    ])
    expect(rangs.map((r) => r.rang)).toEqual([1, 2, 2, 2, 5])
  })

  it('rend une liste vide sans lever', () => {
    expect(rangsPalmares([])).toEqual([])
  })

  it('nomme les personnes a egalite en tete, et elles seules', () => {
    const rangs = poser([
      { nom: 'Alice', penalites: 7 },
      { nom: 'Zoé', penalites: 7 },
      { nom: 'Bruno', penalites: 3 },
    ])
    expect(meneursExAequo(rangs).map((l) => l.nom)).toEqual(['Alice', 'Zoé'])
  })

  // A penalites egales, le classement place le plus ASSIDU devant : c'est une
  // regle de tri anterieure, et elle suffit a rompre l'egalite. Le cas merite
  // son test parce qu'il ressemble a une egalite sans en etre une, et qu'un
  // futur correctif pourrait le confondre avec le defaut qu'on repare ici.
  it('laisse la tete a une seule personne quand elle a joue plus de parties', () => {
    const rangs = poser([
      { nom: 'Alice', penalites: 7 },
      { nom: 'Zoé', penalites: 7 },
      { nom: 'Bruno', penalites: 7, parties: 2 },
    ])
    expect(rangs[0].ligne.nom).toBe('Bruno')
    expect(rangs.map((r) => r.rang)).toEqual([1, 2, 2])
    expect(meneursExAequo(rangs)).toEqual([])
  })

  it('ne nomme personne quand la tete est seule', () => {
    const rangs = poser([
      { nom: 'Alice', penalites: 9 },
      { nom: 'Bruno', penalites: 4 },
    ])
    expect(meneursExAequo(rangs)).toEqual([])
  })
})
