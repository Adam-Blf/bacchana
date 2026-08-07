import { describe, expect, it } from 'vitest'
import { lireApercu, lireCheminLegal, TABLEE_PAR_DEFAUT } from './previewFromUrl'

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

describe('lireCheminLegal', () => {
  // Ces quatre chemins sont ceux que les fiches App Store et Google Play
  // declarent aux boutiques. Avant ce pont, la reecriture SPA les servait avec
  // l'ecran d'accueil du jeu : un 200 sur le mauvais contenu, plus traitre
  // qu'un 404, et un refus mecanique cote Apple 5.1.1 comme cote Play.
  it('ouvre la politique sur les chemins declares aux boutiques', () => {
    expect(lireCheminLegal('/privacy')).toBe('confidentialite')
    expect(lireCheminLegal('/terms')).toBe('cgu')
    expect(lireCheminLegal('/legal')).toBe('mentions-legales')
    // `/support` porte l'adresse de contact de l'editeur, qui vit dans les
    // mentions legales.
    expect(lireCheminLegal('/support')).toBe('mentions-legales')
  })

  it('accepte aussi les chemins francais utilises en interne', () => {
    expect(lireCheminLegal('/confidentialite')).toBe('confidentialite')
    expect(lireCheminLegal('/cgu')).toBe('cgu')
    expect(lireCheminLegal('/mentions-legales')).toBe('mentions-legales')
  })

  it('tolere la casse et la barre oblique finale', () => {
    // Un examinateur qui recopie une URL a la main ne doit pas tomber sur le
    // jeu parce qu'il a laisse une majuscule ou un slash.
    expect(lireCheminLegal('/Privacy/')).toBe('confidentialite')
    expect(lireCheminLegal('/CGU')).toBe('cgu')
  })

  it('ignore tout chemin inconnu, y compris la racine', () => {
    // La racine doit rester le jeu : la router vers un ecran legal casserait
    // l'application entiere.
    expect(lireCheminLegal('/')).toBeNull()
    expect(lireCheminLegal('/hub')).toBeNull()
    expect(lireCheminLegal('/privacy-policy')).toBeNull()
  })
})
