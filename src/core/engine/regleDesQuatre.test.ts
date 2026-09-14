/**
 * LA REGLE DE LA TABLEE, verifiee a chaque porte d'entree.
 *
 * « Il faut au moins quatre joueurs pour avoir acces a TOUS les jeux ; en
 * dessous, certains ne sont pas accessibles. » C'est une regle de produit, pas
 * un detail d'affichage, et elle a QUATRE portes d'entree qui peuvent diverger
 * sans que rien ne le dise :
 *
 *   1. le hub, qui n'affiche que ce qui est lancable ;
 *   2. le catalogue, qui montre tout et marque ce qui est ferme ;
 *   3. l'accueil, qui annonce combien de jeux la tablee ouvre ;
 *   4. le sequenceur de « Lance la soiree », qui tire un mode tout seul - et
 *      c'est la porte la plus dangereuse, parce qu'elle choisit SANS que
 *      personne ne regarde une liste.
 *
 * Un mode qui passerait par la quatrieme sans passer par les trois autres
 * lancerait une partie que la tablee ne peut pas jouer, au milieu d'une soiree.
 *
 * Le seuil n'est ecrit nulle part ici : il se DEDUIT du registre. Un seizieme
 * mode a cinq joueurs deplacerait la regle, et ce test suivrait.
 */
import { describe, it, expect } from 'vitest'
import { PLAYABLE_MODES, ouvertureDeTablee } from './modeRegistry'
import { choisirModeSuivant } from './sequenceur'
import type { EtatSoiree } from './sequenceur'
import { getModeDefinition } from './modeRegistry'

const TAILLES = [1, 2, 3, 4, 5, 6, 7, 8]

const soireeNeuve = (): EtatSoiree => ({ modesJoues: [], demarreeLe: Date.now(), derniersModes: [] })

describe('la regle de la tablee', () => {
  it('le seuil qui ouvre tout vaut quatre', () => {
    // Si ce test tombe, la regle produit a change : mettre a jour le texte de
    // l'accueil N'EST PAS suffisant, il faut le decider.
    expect(ouvertureDeTablee(0).seuilComplet).toBe(4)
  })

  it.each(TAILLES)('a %i joueurs, le compte annonce est celui du registre', (n) => {
    const attendu = PLAYABLE_MODES.filter((m) => n >= m.minPlayers).length
    expect(ouvertureDeTablee(n).ouverts).toBe(attendu)
  })

  it.each(TAILLES)(
    'a %i joueurs, le sequenceur ne tire jamais un mode que la tablee ne peut pas jouer',
    (n) => {
      // Cent tirages : le sequenceur est aleatoire, un seul tirage ne prouve rien.
      for (let i = 0; i < 100; i++) {
        const choix = choisirModeSuivant(soireeNeuve(), n, PLAYABLE_MODES, Date.now(), Math.random)
        if (choix.type !== 'mode') continue
        expect(getModeDefinition(choix.id).minPlayers).toBeLessThanOrEqual(n)
      }
    },
  )

  it('en dessous du seuil, le sequenceur trouve toujours quelque chose a jouer', () => {
    // Une soiree lancee a deux ne doit pas rendre « aucun mode eligible » : neuf
    // jeux restent ouverts, et annoncer le contraire fermerait la soiree.
    for (const n of [2, 3]) {
      const choix = choisirModeSuivant(soireeNeuve(), n, PLAYABLE_MODES, Date.now(), Math.random)
      expect(choix.type).toBe('mode')
    }
  })

  it('a un seul joueur, aucun mode n est ouvert nulle part', () => {
    expect(ouvertureDeTablee(1).ouverts).toBe(0)
    expect(choisirModeSuivant(soireeNeuve(), 1, PLAYABLE_MODES, Date.now(), Math.random).type).toBe(
      'aucun',
    )
  })

  it('chaque mode declare un minimum atteignable par une tablee reelle', () => {
    for (const mode of PLAYABLE_MODES) {
      expect(mode.minPlayers).toBeGreaterThanOrEqual(2)
      // Huit est le maximum que l'accueil accepte : un mode qui en demanderait
      // plus serait injouable pour tout le monde, sans que rien ne le dise.
      expect(mode.minPlayers).toBeLessThanOrEqual(8)
    }
  })
})
