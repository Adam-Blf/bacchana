import type { Player } from '@/types'
import { DUOS_DE_MOTS, type DuoDeMots } from '@/content/fauxFrere'
import { seededRng, type Rng } from './targeting'

/**
 * Le Faux Frère - moteur de manche.
 *
 * Toute la logique de tirage, de vote et de verdict vit ICI, hors de React :
 * c'est ce qui la rend testable sans monter d'écran, et c'est la seule façon
 * d'être sûr que le faux frère est vraiment tiré au hasard et que le verdict
 * ne se trompe pas de camp. L'écran ne fait qu'afficher cet état et appeler
 * ces transitions.
 */

/** Les cinq temps d'une manche, dans l'ordre. L'écran s'y adosse. */
export type PhaseFauxFrere =
  | 'distribution' // le téléphone tourne, chacun découvre son mot
  | 'tour' // chacun dit UN mot à voix haute
  | 'vote' // la tablée désigne
  | 'revelation' // le verdict tombe

export interface EtatFauxFrere {
  phase: PhaseFauxFrere
  duo: DuoDeMots
  /** Identifiant du joueur qui a reçu le mot différent. */
  fauxFrereId: string
  /** Index du joueur à qui le téléphone doit être passé pendant la distribution. */
  indexDistribution: number
  /** Vrai quand le joueur courant a déjà regardé son mot et l'a masqué. */
  motVu: boolean
  /** Voix reçues, par identifiant de joueur. */
  votes: Record<string, number>
  /** Renseigné à la révélation : qui la tablée a désigné. */
  accuseId: string | null
  joueurs: Player[]
}

/** Deux joueurs suffisent à distribuer, mais un vote à deux n'a aucun sens. */
export const MIN_JOUEURS_FAUX_FRERE = 4

export function motDuJoueur(etat: EtatFauxFrere, joueurId: string): string {
  return joueurId === etat.fauxFrereId ? etat.duo.imposteur : etat.duo.commun
}

export function estFauxFrere(etat: EtatFauxFrere, joueurId: string): boolean {
  return joueurId === etat.fauxFrereId
}

/**
 * Démarre une manche. `graine` rend le tirage reproductible : les tests
 * l'utilisent pour épingler le faux frère, et l'écran passe un identifiant de
 * manche pour que deux rendus successifs ne redistribuent pas les rôles.
 */
export function demarrerManche(
  joueurs: Player[],
  graine: string,
  duosExclus: string[] = []
): EtatFauxFrere {
  const rng: Rng = seededRng(graine)
  // On évite de retomber sur un duo déjà joué DANS LA MÊME SOIRÉE. Si tous ont
  // été vus, on repart du paquet complet plutôt que de refuser de jouer : une
  // partie qui s'arrête faute de contenu est pire qu'une répétition.
  const disponibles = DUOS_DE_MOTS.filter((d) => !duosExclus.includes(d.id))
  const paquet = disponibles.length > 0 ? disponibles : DUOS_DE_MOTS
  const duo = paquet[Math.floor(rng() * paquet.length)]
  const fauxFrere = joueurs[Math.floor(rng() * joueurs.length)]

  return {
    phase: 'distribution',
    duo,
    fauxFrereId: fauxFrere.id,
    indexDistribution: 0,
    motVu: false,
    votes: {},
    accuseId: null,
    joueurs,
  }
}

/** Le joueur courant a regardé son mot : on l'autorise à passer le téléphone. */
export function marquerMotVu(etat: EtatFauxFrere): EtatFauxFrere {
  return { ...etat, motVu: true }
}

/**
 * Passe le téléphone au joueur suivant. Quand le dernier a vu son mot, la
 * manche bascule au tour de parole.
 */
export function joueurSuivant(etat: EtatFauxFrere): EtatFauxFrere {
  const prochain = etat.indexDistribution + 1
  if (prochain >= etat.joueurs.length) {
    return { ...etat, phase: 'tour', indexDistribution: 0, motVu: false }
  }
  return { ...etat, indexDistribution: prochain, motVu: false }
}

/** Fin du tour de parole : la tablée passe au vote. */
export function ouvrirLeVote(etat: EtatFauxFrere): EtatFauxFrere {
  return { ...etat, phase: 'vote', votes: {} }
}

/** Une voix de plus pour ce joueur. Le même joueur peut en recevoir plusieurs. */
export function voter(etat: EtatFauxFrere, joueurId: string): EtatFauxFrere {
  return { ...etat, votes: { ...etat.votes, [joueurId]: (etat.votes[joueurId] ?? 0) + 1 } }
}

/** Retire une voix, sans jamais descendre sous zéro. */
export function retirerUneVoix(etat: EtatFauxFrere, joueurId: string): EtatFauxFrere {
  const actuel = etat.votes[joueurId] ?? 0
  if (actuel <= 0) return etat
  return { ...etat, votes: { ...etat.votes, [joueurId]: actuel - 1 } }
}

export function totalDesVoix(etat: EtatFauxFrere): number {
  return Object.values(etat.votes).reduce((somme, n) => somme + n, 0)
}

/**
 * Le ou les joueurs les plus désignés. Rend un TABLEAU, parce que l'égalité
 * est un vrai cas de partie : à quatre joueurs elle arrive souvent, et un
 * moteur qui trancherait tout seul volerait la décision à la table.
 */
export function plusDesignes(etat: EtatFauxFrere): string[] {
  const max = Math.max(0, ...Object.values(etat.votes))
  if (max === 0) return []
  return Object.entries(etat.votes)
    .filter(([, n]) => n === max)
    .map(([id]) => id)
}

/** Vrai quand le vote ne départage pas - l'écran doit alors le dire, pas choisir. */
export function voteIndecis(etat: EtatFauxFrere): boolean {
  return plusDesignes(etat).length > 1
}

/**
 * Clôt le vote sur un accusé. L'écran ne doit l'appeler qu'avec un identifiant
 * issu de `plusDesignes` : en cas d'égalité c'est la tablée qui départage, pas
 * le code.
 */
export function revelation(etat: EtatFauxFrere, accuseId: string): EtatFauxFrere {
  return { ...etat, phase: 'revelation', accuseId }
}

/** La tablée avait raison : l'accusé était bien le faux frère. */
export function tableeGagne(etat: EtatFauxFrere): boolean {
  return etat.accuseId !== null && etat.accuseId === etat.fauxFrereId
}

/**
 * Les pénalités de fin de manche.
 *
 * Le faux frère démasqué paie seul ; s'il passe au travers, c'est toute la
 * tablée qui paie SAUF lui. Ce déséquilibre est voulu : il fait que personne
 * ne peut se contenter d'observer, et c'est exactement ce qui manquait aux
 * treize autres modes.
 */
export function penalitesDeManche(etat: EtatFauxFrere): Record<string, number> {
  const out: Record<string, number> = {}
  if (etat.accuseId === null) return out
  if (tableeGagne(etat)) {
    out[etat.fauxFrereId] = 3
    return out
  }
  for (const j of etat.joueurs) {
    if (j.id !== etat.fauxFrereId) out[j.id] = 1
  }
  return out
}
