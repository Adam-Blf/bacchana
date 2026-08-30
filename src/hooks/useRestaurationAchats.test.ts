import { describe, it, expect } from 'vitest'
import { libelleRestauration } from './useRestaurationAchats'

describe('libelleRestauration', () => {
  it('annonce la restauration reussie', () => {
    expect(libelleRestauration('restored-premium')).toMatch(/restaure/i)
  })

  it('dit qu aucun achat actif n a ete trouve', () => {
    expect(libelleRestauration('restored-no-premium')).toMatch(/aucun achat/i)
  })

  it('ne conclut JAMAIS a une absence d achat quand la facturation est indisponible', () => {
    // Le piege du libelle : « indisponible » et « aucun achat » sont deux choses
    // differentes. La facturation peut etre non configuree, ou l'appareil hors ligne.
    // Annoncer une absence d'achat dans ce cas fait croire a quelqu'un qui a paye que
    // son achat est perdu - c'est le pire message possible sur cet ecran.
    const message = libelleRestauration('unavailable')
    expect(message).not.toMatch(/aucun achat/i)
    expect(message).toMatch(/pas disponible/i)
  })

  it('ne laisse aucune issue sans message', () => {
    for (const resultat of ['restored-premium', 'restored-no-premium', 'unavailable'] as const) {
      expect(libelleRestauration(resultat).trim().length).toBeGreaterThan(0)
    }
  })
})
