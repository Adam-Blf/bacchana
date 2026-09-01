import { describe, it, expect } from 'vitest'
import { de, demandeElision, enumerer } from './francais'

describe('elision', () => {
  // Vue rouge avant le 2026-08-31 : « Au tour de » etait concatene au prenom
  // sans elision, sur la chaine la plus vue de l'application - un tour de
  // chaque jeu. Tous les prenoms a voyelle initiale produisaient une faute.
  it("elide devant une voyelle", () => {
    expect(de('Alice')).toBe("d'Alice")
    expect(de('Inès')).toBe("d'Inès")
    expect(de('Émile')).toBe("d'Émile")
    expect(de('Oscar')).toBe("d'Oscar")
    expect(de('Anaïs')).toBe("d'Anaïs")
  })

  it('garde la forme pleine devant une consonne', () => {
    expect(de('Marco')).toBe('de Marco')
    expect(de('Nawel')).toBe('de Nawel')
  })

  it('elide devant un h muet, jamais devant un h aspire inconnu', () => {
    expect(de('Hugo')).toBe("d'Hugo")
    expect(de('Hyacinthe')).toBe("d'Hyacinthe")
    // Aucune regle ne distingue le h muet du h aspire : ce qui n'est pas connu
    // garde la forme pleine, parce que « de Hank » se lit maladroitement quand
    // « d'Hank » se lit faux.
    expect(de('Hank')).toBe('de Hank')
  })

  it('ne se laisse pas surprendre par un nom vide', () => {
    expect(demandeElision('')).toBe(false)
    expect(demandeElision('   ')).toBe(false)
  })
})

describe('enumerer', () => {
  it('rend une liste lisible', () => {
    expect(enumerer([])).toBe('')
    expect(enumerer(['Alice'])).toBe('Alice')
    expect(enumerer(['Alice', 'Bo'])).toBe('Alice et Bo')
    expect(enumerer(['Alice', 'Bo', 'Cyr'])).toBe('Alice, Bo et Cyr')
  })
})
