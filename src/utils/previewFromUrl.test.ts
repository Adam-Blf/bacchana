import { describe, expect, it } from 'vitest'
import { lireApercu, TABLEE_PAR_DEFAUT } from './previewFromUrl'

describe('lireApercu', () => {
  it('ne fait rien sans parametre', () => {
    expect(lireApercu('')).toBeNull()
    expect(lireApercu('?cards')).toBeNull()
  })

  it('ouvre un ecran connu', () => {
    expect(lireApercu('?screen=settings')?.ecran).toBe('settings')
    expect(lireApercu('?screen=custom-rules')?.ecran).toBe('custom-rules')
  })

  it('ignore un ecran inconnu au lieu de le propager', () => {
    // Pousser une valeur inconnue dans le magasin donnerait un ecran blanc :
    // l'application n'a aucun moyen de rendre un nom qu'elle ne connait pas.
    expect(lireApercu('?screen=nimporte-quoi')).toBeNull()
    expect(lireApercu('?screen=%3Cscript%3E')).toBeNull()
  })

  it('sert une tablee complete par defaut', () => {
    // Sans joueurs, la plupart des ecrans se figent sur « ajoutez des joueurs »,
    // qui est justement l'etat qu'on ne veut pas montrer par defaut.
    expect(lireApercu('?screen=hub')?.joueurs).toEqual(TABLEE_PAR_DEFAUT)
  })

  it('accepte une tablee explicite et nettoie les blancs', () => {
    expect(lireApercu('?screen=hub&players=Adam,%20Nawel%20,,Zoe')?.joueurs)
      .toEqual(['Adam', 'Nawel', 'Zoe'])
  })

  it('transmet le mode quand il est demande', () => {
    expect(lireApercu('?screen=game&mode=quiz')?.mode).toBe('quiz')
    expect(lireApercu('?screen=hub')?.mode).toBeNull()
  })
})
