import { describe, expect, it } from 'vitest'
import { melanger } from './aleatoire'

describe('melanger', () => {
  it('rend un nouveau tableau sans toucher a l\'entree', () => {
    const source = [1, 2, 3, 4, 5]
    const copie = [...source]
    const sortie = melanger(source, () => 0.5)
    expect(source).toEqual(copie)
    expect(sortie).not.toBe(source)
  })

  it('conserve exactement les memes elements', () => {
    const source = Array.from({ length: 40 }, (_, i) => i)
    const sortie = melanger(source, () => 0.42)
    expect([...sortie].sort((a, b) => a - b)).toEqual(source)
  })

  it('est deterministe a graine egale', () => {
    const graine = () => {
      let n = 7
      return () => ((n = (n * 1103515245 + 12345) % 2147483648) / 2147483648)
    }
    const source = Array.from({ length: 20 }, (_, i) => i)
    expect(melanger(source, graine())).toEqual(melanger(source, graine()))
  })

  it('peut laisser un element a sa place', () => {
    // Le biais classique vient d'un `j` tire dans [0, i[ au lieu de [0, i] :
    // aucun element ne peut alors rester ou il etait, ce qui n'est pas un
    // melange uniforme. Avec un rng qui rend toujours ~1, chaque i echange avec
    // lui-meme et la liste sort inchangee - impossible avec la version biaisee.
    const source = [1, 2, 3, 4, 5]
    expect(melanger(source, () => 0.999999)).toEqual(source)
  })

  it('accepte une liste vide ou a un seul element', () => {
    expect(melanger([], () => 0.5)).toEqual([])
    expect(melanger(['seul'], () => 0.5)).toEqual(['seul'])
  })
})
