import { describe, expect, it } from 'vitest'
import { consumeReloadAllowance, isStaleChunkError, RELOAD_GUARD_KEY } from './staleChunk'

/** Stockage minimal en memoire, suffisant pour le contrat consomme. */
function fauxStockage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => {
      data[k] = v
    },
    data,
  }
}

describe('isStaleChunkError', () => {
  it('reconnait le message de chaque moteur', () => {
    // Formulations reelles : elles ne sont normalisees par aucune specification,
    // donc chacune doit etre couverte explicitement.
    const messages = [
      'Failed to fetch dynamically imported module: https://x/assets/Quiz-a1b2c3.js',
      'error loading dynamically imported module',
      'Importing a module script failed.',
      'Failed to load module script: expected a JavaScript module',
    ]
    for (const m of messages) {
      expect(isStaleChunkError(new Error(m))).toBe(true)
    }
  })

  it('reconnait aussi une erreur nommee ChunkLoadError sans message parlant', () => {
    const e = new Error('Loading chunk 42 failed')
    e.name = 'ChunkLoadError'
    expect(isStaleChunkError(e)).toBe(true)
  })

  it('laisse passer un vrai defaut applicatif', () => {
    // Un bug de code doit atteindre l'ecran d'erreur, pas declencher un
    // rechargement qui le masquerait a chaque fois.
    expect(isStaleChunkError(new TypeError("Cannot read properties of undefined"))).toBe(false)
    expect(isStaleChunkError(new Error('players is not iterable'))).toBe(false)
  })

  it('ne casse pas sur une valeur qui n est pas une erreur', () => {
    expect(isStaleChunkError(null)).toBe(false)
    expect(isStaleChunkError(undefined)).toBe(false)
    expect(isStaleChunkError({ nope: true })).toBe(false)
  })
})

describe('consumeReloadAllowance', () => {
  it('accorde le rechargement une fois, puis le refuse', () => {
    const s = fauxStockage()
    expect(consumeReloadAllowance(s)).toBe(true)
    expect(consumeReloadAllowance(s)).toBe(false)
    expect(consumeReloadAllowance(s)).toBe(false)
  })

  it('marque la session pour que le rechargement ne boucle pas', () => {
    const s = fauxStockage()
    consumeReloadAllowance(s)
    expect(s.data[RELOAD_GUARD_KEY]).toBeTruthy()
  })

  it('refuse si le stockage est indisponible', () => {
    // Navigation privee stricte ou quota plein : sans moyen de compter les
    // tentatives, une boucle infinie serait pire qu une ressaisie.
    const casse = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }
    expect(consumeReloadAllowance(casse)).toBe(false)
  })
})
