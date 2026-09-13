import type { Player } from '@/types'
import { seededRng } from './targeting'

/**
 * Marqueurs ecrits par la tablee dans ses regles personnalisees.
 *
 * Ils s'ecrivaient `{player}` et `{player2}`. L'editeur a bien recu des
 * libelles lisibles sur ses deux boutons, mais ce que ces boutons INSERENT n'a
 * pas change : la personne qui ecrit sa regle voit toujours des accolades au
 * milieu de sa phrase, les relit a chaque modification, et les retrouve dans la
 * liste de ses regles. Le libelle du bouton n'est vu qu'une fois, le texte est
 * vu tout le temps.
 *
 * Les crochets se lisent comme un blanc a remplir, dans un formulaire ou dans
 * un texte a trous, et la phrase reste comprehensible avant meme d'etre
 * interpolee : « [le joueur] imite un animal choisi par [un autre] ».
 *
 * Les deux anciennes formes restent reconnues, et ce n'est pas optionnel : les
 * regles deja enregistrees vivent sur les telephones des joueurs. Cesser de les
 * comprendre transformerait une regle ecrite il y a trois semaines en charabia
 * lu a voix haute a table.
 */
const MARQUEURS_JOUEUR = ['[le joueur]', '{player}'] as const
const MARQUEURS_AUTRE = ['[un autre]', '{player2}'] as const

/** Ce que l'editeur insere aujourd'hui, et ce que l'aide affiche. */
export const MARQUEUR_JOUEUR = MARQUEURS_JOUEUR[0]
export const MARQUEUR_AUTRE = MARQUEURS_AUTRE[0]

function remplacerTous(texte: string, marqueurs: readonly string[], valeur: string): string {
  return marqueurs.reduce((acc, marqueur) => acc.split(marqueur).join(valeur), texte)
}

/** Vrai si le texte reclame un second joueur, quelle que soit la forme du marqueur. */
function demandeUnAutreJoueur(texte: string): boolean {
  return MARQUEURS_AUTRE.some((marqueur) => texte.includes(marqueur))
}

/**
 * Interpolates a prompt template with the current player and, when the
 * template needs it, a second distinct player picked at random.
 *
 * `[le joueur]` (ou `{player}`) -> le joueur dont c'est le tour.
 * `[un autre]` (ou `{player2}`) -> un autre joueur actif, jamais le joueur
 * courant. On retombe sur le joueur courant seulement si personne d'autre n'est
 * disponible, pour qu'un apercu a une personne ne casse pas.
 *
 * `seed`, when provided (e.g. `${item.id}-${turnNumber}`), makes the second
 * pick deterministic for the turn - the same as `resolveTarget`'s seeding - so it
 * never changes across re-renders of the same turn. Without a seed, falls back to
 * `Math.random` (previous behaviour, still used by call sites with no stable turn key).
 */
export function interpolate(text: string, players: Player[], currentPlayer: Player, seed?: string): string {
  let result = remplacerTous(text, MARQUEURS_JOUEUR, currentPlayer.name)

  if (demandeUnAutreJoueur(result)) {
    const others = players.filter((p) => p.id !== currentPlayer.id && p.active)
    const rng = seed !== undefined ? seededRng(seed) : Math.random
    const pick = others.length > 0
      ? others[Math.floor(rng() * others.length)]
      : currentPlayer
    result = remplacerTous(result, MARQUEURS_AUTRE, pick.name)
  }

  return result
}
