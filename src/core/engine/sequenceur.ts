import type { Rng } from './targeting'
import type { GameMode, ModeDefinition } from './types'

/**
 * Sequenceur de « Lance la soiree ».
 *
 * Choisit le mode suivant a partir de faits observables : la tablee, le temps
 * ecoule, et ce qui a deja ete joue. Il ne rejoue aucune logique de mode, il
 * orchestre.
 *
 * Fonction PURE. `maintenant` et `rng` sont des parametres, pas des appels au
 * systeme. Sans cela, les vingt enchainements simules que demandent les criteres
 * de succes seraient non deterministes, echoueraient au hasard, et finiraient
 * desactives au bout de deux semaines. Le depot utilise deja ce motif dans
 * `targeting.ts`.
 *
 * Ne mute jamais l'etat recu. Marquer un mode comme joue est le travail du
 * store : une fonction qui choisit ET qui mute ne peut pas etre appelee deux
 * fois pour comparer.
 */

/** Ou en est la soiree, ce qui pese sur le tirage. */
export type PhaseSoiree = 'ouverture' | 'croisiere' | 'fin'

export type RaisonAucun = 'aucun-mode-eligible'

export type Choix =
  | { type: 'mode'; id: GameMode; phase: PhaseSoiree; secondTour: boolean }
  | { type: 'aucun'; raison: RaisonAucun }

/** Ce que le sequenceur a besoin de savoir d'une soiree. Le store en porte davantage. */
export interface EtatSoiree {
  /** Horodatage du debut, base du calcul de phase. */
  demarreeLe: number
  /** Modes deja joues dans cette soiree, pour eviter les repetitions. */
  modesJoues: GameMode[]
}

/**
 * Au dela de ce delai, la soiree est consideree comme avancee et les modes
 * courts sont privilegies.
 *
 * Une heure est un POINT DE DEPART raisonnable, pas une valeur mesuree. Elle
 * demande a etre calee en soiree reelle, ce qui est la raison pour laquelle elle
 * est une constante nommee et non un nombre perdu dans une condition.
 */
export const SEUIL_FIN_DE_SOIREE_MS = 60 * 60 * 1000

/** Nombre de modes pendant lesquels la soiree est encore en ouverture. */
const MODES_D_OUVERTURE = 3

/**
 * Un mode est accessible si son contenu l'est. Trois cas : la tablee a le
 * premium, le mode embarque des paquets gratuits, ou le mode n'a pas de paquet
 * du tout parce que son contenu est integre.
 */
function estAccessible(mode: ModeDefinition, premium: boolean): boolean {
  if (premium) return true
  if (mode.freePackIds.length > 0) return true
  return !mode.hasPremiumPacks
}

/**
 * Phase courante, derivee du temps ecoule et du nombre de modes deja joues.
 *
 * La fin de soiree PRIME sur l'ouverture, et cet ordre n'est pas neutre. Une
 * tablee qui joue depuis deux heures n'a pas besoin qu'on lui pose les regles
 * d'un mode long, meme si elle vient de rouvrir l'application. Les deux regles ne
 * se contredisent qu'a la marge, mais il fallait choisir, et le confort de fin de
 * soiree l'emporte sur la pedagogie d'ouverture.
 */
export function phaseDeSoiree(soiree: EtatSoiree, maintenant: number): PhaseSoiree {
  if (maintenant - soiree.demarreeLe >= SEUIL_FIN_DE_SOIREE_MS) return 'fin'
  if (soiree.modesJoues.length < MODES_D_OUVERTURE) return 'ouverture'
  return 'croisiere'
}

/**
 * Applique une preference de rythme si elle peut etre satisfaite, sinon rend la
 * liste inchangee.
 *
 * Le repli n'est pas un detail : sans lui, une regle de rythme pourrait vider le
 * tirage et arreter la soiree, ce qui est exactement le contraire du but.
 */
function preferer(
  candidats: ModeDefinition[],
  critere: (mode: ModeDefinition) => boolean,
): ModeDefinition[] {
  const retenus = candidats.filter(critere)
  return retenus.length > 0 ? retenus : candidats
}

export function choisirModeSuivant(
  soiree: EtatSoiree,
  effectifTablee: number,
  registre: readonly ModeDefinition[],
  maintenant: number,
  rng: Rng = Math.random,
  premium = false,
): Choix {
  const jouables = registre.filter(
    (mode) => mode.minPlayers <= effectifTablee && estAccessible(mode, premium),
  )

  if (jouables.length === 0) return { type: 'aucun', raison: 'aucun-mode-eligible' }

  // Second tour : quand tout ce qui est jouable a deja ete joue, on repart pour
  // un cycle en le DISANT. Vider la liste en silence passerait pour un bug, et
  // s'arreter mettrait fin a la soiree au pire moment.
  const inedits = jouables.filter((mode) => !soiree.modesJoues.includes(mode.id))
  const secondTour = inedits.length === 0
  let candidats = secondTour ? jouables : inedits

  const phase = phaseDeSoiree(soiree, maintenant)

  if (phase === 'ouverture') {
    // Une tablee qui commence a besoin qu'on lui pose des regles une fois, pas
    // qu'on enchaine cinq modes eclair sans jamais expliquer le jeu.
    const dejaExplique = registre.some(
      (mode) => mode.demandeExplication && soiree.modesJoues.includes(mode.id),
    )
    if (!dejaExplique) candidats = preferer(candidats, (mode) => mode.demandeExplication)
  } else if (phase === 'fin') {
    candidats = preferer(candidats, (mode) => mode.dureeIndicative === 'court')
  }

  const tire = candidats[Math.floor(rng() * candidats.length)] ?? candidats[0]
  return { type: 'mode', id: tire.id, phase, secondTour }
}
