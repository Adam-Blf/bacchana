import { describe, it, expect } from 'vitest'
import { DUOS_DE_MOTS } from '@/content/fauxFrere'
import type { Player } from '@/types'
import {
  demarrerManche,
  joueurSuivant,
  marquerMotVu,
  motDuJoueur,
  ouvrirLeVote,
  penalitesDeManche,
  plusDesignes,
  retirerUneVoix,
  revelation,
  tableeGagne,
  totalDesVoix,
  voteIndecis,
  voter,
} from './fauxFrereSession'

const joueurs = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `Joueur ${i + 1}`, active: true }))

describe('Le Faux Frère - distribution', () => {
  it('donne le mot commun à tout le monde sauf un', () => {
    const etat = demarrerManche(joueurs(5), 'graine-a')
    const mots = etat.joueurs.map((j) => motDuJoueur(etat, j.id))
    const differents = mots.filter((m) => m === etat.duo.imposteur)
    expect(differents).toHaveLength(1)
    expect(mots.filter((m) => m === etat.duo.commun)).toHaveLength(4)
  })

  it('tire un duo du catalogue, jamais un mot inventé', () => {
    const etat = demarrerManche(joueurs(4), 'graine-b')
    expect(DUOS_DE_MOTS.map((d) => d.id)).toContain(etat.duo.id)
  })

  it('rend la même manche pour la même graine - sinon un rendu React redistribuerait les rôles', () => {
    const a = demarrerManche(joueurs(6), 'manche-7')
    const b = demarrerManche(joueurs(6), 'manche-7')
    expect(b.fauxFrereId).toBe(a.fauxFrereId)
    expect(b.duo.id).toBe(a.duo.id)
  })

  it('évite un duo déjà joué dans la soirée', () => {
    const premier = demarrerManche(joueurs(4), 'g1')
    const second = demarrerManche(joueurs(4), 'g1', [premier.duo.id])
    expect(second.duo.id).not.toBe(premier.duo.id)
  })

  it("repart du paquet complet quand tout a été vu, plutôt que de refuser de jouer", () => {
    const tous = DUOS_DE_MOTS.map((d) => d.id)
    const etat = demarrerManche(joueurs(4), 'g2', tous)
    expect(tous).toContain(etat.duo.id)
  })

  it('passe au tour de parole une fois le dernier joueur servi', () => {
    let etat = demarrerManche(joueurs(4), 'g3')
    expect(etat.phase).toBe('distribution')
    for (let i = 0; i < 3; i++) {
      etat = joueurSuivant(marquerMotVu(etat))
      expect(etat.phase).toBe('distribution')
      expect(etat.motVu).toBe(false)
    }
    etat = joueurSuivant(marquerMotVu(etat))
    expect(etat.phase).toBe('tour')
  })
})

describe('Le Faux Frère - vote', () => {
  it('compte les voix et désigne le plus visé', () => {
    let etat = ouvrirLeVote(demarrerManche(joueurs(4), 'g4'))
    etat = voter(etat, 'p2')
    etat = voter(etat, 'p2')
    etat = voter(etat, 'p3')
    expect(totalDesVoix(etat)).toBe(3)
    expect(plusDesignes(etat)).toEqual(['p2'])
    expect(voteIndecis(etat)).toBe(false)
  })

  it("rend TOUS les ex aequo plutôt que d'en choisir un - c'est à la tablée de départager", () => {
    let etat = ouvrirLeVote(demarrerManche(joueurs(4), 'g5'))
    etat = voter(etat, 'p1')
    etat = voter(etat, 'p2')
    expect(plusDesignes(etat).sort()).toEqual(['p1', 'p2'])
    expect(voteIndecis(etat)).toBe(true)
  })

  it('ne descend jamais sous zéro voix', () => {
    let etat = ouvrirLeVote(demarrerManche(joueurs(4), 'g6'))
    etat = retirerUneVoix(etat, 'p1')
    expect(totalDesVoix(etat)).toBe(0)
    etat = voter(etat, 'p1')
    etat = retirerUneVoix(etat, 'p1')
    expect(etat.votes['p1']).toBe(0)
  })

  it("ne désigne personne quand aucune voix n'a été donnée", () => {
    const etat = ouvrirLeVote(demarrerManche(joueurs(4), 'g7'))
    expect(plusDesignes(etat)).toEqual([])
  })
})

describe('Le Faux Frère - verdict et pénalités', () => {
  it('le faux frère démasqué paie seul', () => {
    const base = demarrerManche(joueurs(5), 'g8')
    const etat = revelation(ouvrirLeVote(base), base.fauxFrereId)
    expect(tableeGagne(etat)).toBe(true)
    const pen = penalitesDeManche(etat)
    expect(pen[base.fauxFrereId]).toBe(3)
    expect(Object.keys(pen)).toHaveLength(1)
  })

  it("toute la tablée paie SAUF lui quand il passe au travers", () => {
    const base = demarrerManche(joueurs(5), 'g9')
    const innocent = base.joueurs.find((j) => j.id !== base.fauxFrereId)!
    const etat = revelation(ouvrirLeVote(base), innocent.id)
    expect(tableeGagne(etat)).toBe(false)
    const pen = penalitesDeManche(etat)
    expect(pen[base.fauxFrereId]).toBeUndefined()
    expect(Object.keys(pen)).toHaveLength(4)
    expect(Object.values(pen).every((n) => n === 1)).toBe(true)
  })

  it("ne distribue aucune pénalité tant que le verdict n'est pas tombé", () => {
    const etat = ouvrirLeVote(demarrerManche(joueurs(4), 'g10'))
    expect(penalitesDeManche(etat)).toEqual({})
  })
})

describe('Le Faux Frère - le catalogue de duos', () => {
  it('a des identifiants uniques', () => {
    const ids = DUOS_DE_MOTS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ne fait jamais deux fois le même mot dans un duo - sinon le faux frère est indétectable', () => {
    for (const d of DUOS_DE_MOTS) {
      expect(d.commun.toLowerCase()).not.toBe(d.imposteur.toLowerCase())
    }
  })

  it('reste dans le périmètre : aucun lexique alcool dans les mots', () => {
    const interdits = /verre|shot|gorgée|bière|vin|alcool|vodka|whisky|apéro/i
    for (const d of DUOS_DE_MOTS) {
      expect(interdits.test(d.commun + ' ' + d.imposteur)).toBe(false)
    }
  })
})
