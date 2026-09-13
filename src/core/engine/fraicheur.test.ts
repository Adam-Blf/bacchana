import { describe, it, expect } from 'vitest'
import { constituerPioche } from './fraicheur'

const carte = (id: string) => ({ id })
const sansMelange = <T,>(liste: T[]) => liste

describe('constituerPioche', () => {
  it('rend le paquet entier quand rien n a ete vu', () => {
    const pioche = constituerPioche([carte('a'), carte('b'), carte('c')], sansMelange)
    expect(pioche.map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  // Vue rouge avant le 2026-08-31 : chaque moteur melangeait son paquet sans
  // aucune memoire d'une manche a l'autre, donc relancer le meme mode dans la
  // soiree redonnait les memes cartes.
  it('repousse en fin de pioche ce qui a deja ete servi ce soir', () => {
    const pioche = constituerPioche(
      [carte('a'), carte('b'), carte('c'), carte('d')],
      sansMelange,
      { dejaVus: new Set(['a', 'c']) },
    )
    expect(pioche.map((c) => c.id)).toEqual(['b', 'd', 'a', 'c'])
  })

  // Repousser et non RETIRER : un paquet vide serait pire qu'une repetition, et
  // une tablee qui joue longtemps finit forcement par reboucler.
  it('ne vide jamais la pioche, meme si tout a ete vu', () => {
    const pioche = constituerPioche([carte('a'), carte('b')], sansMelange, {
      dejaVus: new Set(['a', 'b']),
    })
    expect(pioche.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('coupe a la longueur demandee', () => {
    const pioche = constituerPioche(
      [carte('a'), carte('b'), carte('c'), carte('d')],
      sansMelange,
      { longueur: 2 },
    )
    expect(pioche.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('sert les inedits en priorite quand la manche est courte', () => {
    const pioche = constituerPioche(
      [carte('a'), carte('b'), carte('c'), carte('d')],
      sansMelange,
      { dejaVus: new Set(['a', 'b']), longueur: 2 },
    )
    expect(pioche.map((c) => c.id)).toEqual(['c', 'd'])
  })

  it('zero signifie tout le paquet', () => {
    const pioche = constituerPioche([carte('a'), carte('b')], sansMelange, { longueur: 0 })
    expect(pioche).toHaveLength(2)
  })
})
