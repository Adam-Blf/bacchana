import type { Player } from '@/types'
import type { AxeBarometre } from '@/content/barometre'
import { melanger, type Rng } from './aleatoire'
import { constituerPioche, type OptionsManche } from './fraicheur'

// ============================================
// LE BAROMÈTRE - moteur pur (testé)
//
// Un axe entre deux extrêmes, une cible cachée posée dessus, et un aiguilleur
// qui n'a qu'UN mot pour l'indiquer. La tablée déplace l'aiguille ensemble ;
// l'écart entre l'aiguille et la cible décide qui prend les pénalités.
//
// Mécanique adaptée de « GetMe - Guess your friends ». Deux différences qui ne
// sont pas cosmétiques :
//
//   - Là où l'original COMPTE DES POINTS de manche en manche, l'application ne
//     connaît qu'une monnaie, la pénalité, et une seule addition de fin de
//     partie (`SessionRecap`). Un second système de score vivrait à côté du
//     premier, n'apparaîtrait ni sur l'ardoise de la soirée ni au palmarès, et
//     donnerait deux classements contradictoires sur le même écran.
//   - Le tir parfait ne rapporte donc RIEN : il évite. C'est la même grammaire
//     que Le Pilori (non coupable : libéré) et Le Tableau d'Honneur, et elle
//     n'a pas besoin d'être expliquée à une tablée qui a déjà joué un mode.
// ============================================

export type BarometrePhase =
  /** Le téléphone doit rejoindre l'aiguilleur, personne d'autre ne regarde. */
  | 'passage'
  /** L'aiguilleur voit la cible et cherche son mot. */
  | 'cadrage'
  /** Le téléphone repart au centre de la table, cible masquée. */
  | 'retour'
  /** La tablée déplace l'aiguille. */
  | 'visee'
  /** L'écart est connu, les pénalités sont tombées. */
  | 'verdict'
  | 'finished'

/**
 * Les deux seuils du cadran, et le raisonnement derrière les chiffres.
 *
 * Ils sont exprimés en points de cadran (0 à 100), donc directement lisibles à
 * l'écran, et volontairement ASYMÉTRIQUES autour de la cible : le plein centre
 * vaut 12 points de large au total (± 6), ce qui laisse une chance réelle à un
 * mot bien choisi sans rendre le tir gratuit. Valeurs de DÉPART, à recaler en
 * soirée réelle - comme les durées indicatives du registre, elles sont nommées
 * ici et pas noyées dans une condition pour qu'on puisse les bouger d'un
 * endroit.
 */
export const ECART_PLEIN_CENTRE = 6
export const ECART_ACCEPTABLE = 18

/** Ce que prend l'aiguilleur quand son mot n'a pas porté. */
export const PENALITE_AIGUILLEUR = 1
/** Ce que prend chaque devineur quand personne ne s'est compris. */
export const PENALITE_DEVINEUR = 1

/**
 * La cible ne tombe jamais dans les huit derniers points d'un bord.
 *
 * Une cible à 2 se devine sans réfléchir - il suffit de pousser l'aiguille au
 * bout - et une cible à 0 rend le plein centre plus large d'un côté que de
 * l'autre, puisque la moitié de sa zone tombe hors du cadran. Les deux défauts
 * viennent du même endroit et se corrigent au même endroit.
 */
export const MARGE_BORD = 8

/** Où l'aiguille se trouve quand la tablée n'y a pas encore touché. */
export const AIGUILLE_DEPART = 50

export interface BarometreManche {
  axe: AxeBarometre
  /** Position cachée à deviner, de 0 (gauche) à 100 (droite). */
  cible: number
}

export interface BarometreSessionState {
  players: Player[]
  queue: AxeBarometre[]
  /** Index de l'aiguilleur dans `players` ; le rôle tourne à chaque manche. */
  aiguilleurIndex: number
  mancheNumero: number
  manche: BarometreManche | null
  /** Position de l'aiguille posée par la tablée. */
  aiguille: number
  /** Écart mesuré au verdict, `null` avant. */
  ecart: number | null
  phase: BarometrePhase
  penaltyCounts: Record<string, number>
}


/**
 * La cible de la manche, tirée hors des marges de bord.
 *
 * Le résultat est BORNÉ et pas seulement calculé : `Math.random` rend [0, 1[,
 * mais un générateur à graine - celui de « Lance la soirée », ou celui d'un
 * test - peut rendre 1 tout rond et poussait alors la cible un point au-delà
 * de la marge. Un moteur ne doit pas dépendre de la politesse de son tirage.
 */
export function tirerCible(rng: Rng): number {
  const haut = 100 - MARGE_BORD
  const amplitude = haut - MARGE_BORD
  return Math.min(haut, MARGE_BORD + Math.floor(rng() * (amplitude + 1)))
}

export function getAiguilleur(state: BarometreSessionState): Player | null {
  return state.players[state.aiguilleurIndex] ?? null
}

export function getDevineurs(state: BarometreSessionState): Player[] {
  const aiguilleur = getAiguilleur(state)
  return state.players.filter((p) => p.id !== aiguilleur?.id)
}

/** Le verdict d'un écart, indépendamment de toute session - c'est ce que l'écran affiche. */
export type VerdictBarometre = 'plein-centre' | 'dans-le-mille-large' | 'a-cote'

export function verdictDe(ecart: number): VerdictBarometre {
  if (ecart <= ECART_PLEIN_CENTRE) return 'plein-centre'
  if (ecart <= ECART_ACCEPTABLE) return 'dans-le-mille-large'
  return 'a-cote'
}

export function createBarometreSession(
  axes: AxeBarometre[],
  players: Player[],
  rng: Rng = Math.random,
  options: OptionsManche = {},
): BarometreSessionState {
  const queue = constituerPioche(axes, (liste) => melanger(liste, rng), options)
  const premier = queue.shift() ?? null
  return {
    players: players.filter((p) => p.active),
    queue,
    aiguilleurIndex: 0,
    mancheNumero: 1,
    manche: premier ? { axe: premier, cible: tirerCible(rng) } : null,
    aiguille: AIGUILLE_DEPART,
    ecart: null,
    phase: premier ? 'passage' : 'finished',
    penaltyCounts: {},
  }
}

/** L'aiguilleur a le téléphone en main : la cible se découvre. */
export function commencerCadrage(state: BarometreSessionState): BarometreSessionState {
  if (state.phase !== 'passage') return state
  return { ...state, phase: 'cadrage' }
}

/** Le mot est lâché : l'aiguilleur rend le téléphone, cible masquée. */
export function rendreLeTelephone(state: BarometreSessionState): BarometreSessionState {
  if (state.phase !== 'cadrage') return state
  return { ...state, phase: 'retour' }
}

/** Le téléphone est au centre : la tablée peut viser. */
export function commencerVisee(state: BarometreSessionState): BarometreSessionState {
  if (state.phase !== 'retour') return state
  return { ...state, phase: 'visee' }
}

/**
 * Déplace l'aiguille. Bornée à [0, 100] ici et non dans l'écran : un curseur
 * n'est pas la seule façon de viser, et un moteur qui accepte 137 laisserait
 * passer un écart négatif au verdict.
 */
export function deplacerAiguille(
  state: BarometreSessionState,
  position: number,
): BarometreSessionState {
  if (state.phase !== 'visee') return state
  const borne = Math.max(0, Math.min(100, Math.round(position)))
  return { ...state, aiguille: borne }
}

/**
 * Verrouille la visée : l'écart se mesure, les pénalités tombent.
 *
 * Trois issues, une seule règle à retenir par la tablée : c'est l'aiguilleur
 * qui a choisi le mot, donc c'est lui qui paie d'abord. Personne ne paie quand
 * le mot a porté ; tout le monde paie quand plus personne ne se comprenait.
 */
export function verrouillerVisee(state: BarometreSessionState): BarometreSessionState {
  if (state.phase !== 'visee' || !state.manche) return state
  const ecart = Math.abs(state.aiguille - state.manche.cible)
  const verdict = verdictDe(ecart)
  const penaltyCounts = { ...state.penaltyCounts }
  const aiguilleur = getAiguilleur(state)

  if (verdict !== 'plein-centre' && aiguilleur) {
    penaltyCounts[aiguilleur.id] = (penaltyCounts[aiguilleur.id] ?? 0) + PENALITE_AIGUILLEUR
  }
  if (verdict === 'a-cote') {
    for (const devineur of getDevineurs(state)) {
      penaltyCounts[devineur.id] = (penaltyCounts[devineur.id] ?? 0) + PENALITE_DEVINEUR
    }
  }

  return { ...state, ecart, penaltyCounts, phase: 'verdict' }
}

/** Manche suivante : le rôle d'aiguilleur tourne, nouvel axe, nouvelle cible. */
export function mancheSuivante(
  state: BarometreSessionState,
  rng: Rng = Math.random,
): BarometreSessionState {
  if (state.phase !== 'verdict') return state
  const queue = [...state.queue]
  const suivant = queue.shift() ?? null
  return {
    ...state,
    queue,
    aiguilleurIndex: (state.aiguilleurIndex + 1) % state.players.length,
    mancheNumero: state.mancheNumero + 1,
    manche: suivant ? { axe: suivant, cible: tirerCible(rng) } : null,
    aiguille: AIGUILLE_DEPART,
    ecart: null,
    phase: suivant ? 'passage' : 'finished',
  }
}
