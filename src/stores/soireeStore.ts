import { create } from 'zustand'
import type { GameMode } from '@/core/engine/types'

/**
 * L'etat de l'enchainement automatique, « Lance la soiree ».
 *
 * Ce store ne porte QUE ce qui est propre a l'enchainement. Les modes deja joues
 * vivent dans `nightStore.modesPlayed`, qui les suit deja pour l'ardoise. Les
 * dupliquer ici creerait deux verites qui divergeraient au premier oubli.
 *
 * NON PERSISTE, volontairement, comme `nightStore`. La regle produit existante
 * veut que la session reparte de zero a chaque lancement. Une reprise apres
 * fermeture, prevue par la user story 4 de la specification, contredirait cette
 * regle : elle reste donc a trancher avant d'etre implementee, et n'est pas
 * ajoutee en douce ici.
 */
interface SoireeState {
  /** Horodatage du debut, base du calcul de phase. Nul quand aucune soiree n'est lancee. */
  demarreeLe: number | null
  /** Le mode en cours de jeu, tire par l'enchainement. */
  modeCourant: GameMode | null
  /** Faux quand la tablee est repassee en choix manuel, sans perdre la soiree. */
  enchainementActif: boolean

  /**
   * Demarre une soiree. Un second appel alors qu'une soiree est deja active ne
   * l'ecrase pas : deux appuis sur le bouton ne doivent pas remettre la soiree a
   * zero au milieu d'une partie. Exigence FR-017.
   */
  demarrer: (maintenant: number) => void
  /** Passe au mode tire par le sequenceur. */
  allerVers: (id: GameMode) => void
  /**
   * Arrete l'enchainement et rend la main au choix manuel. La soiree n'est PAS
   * effacee : la tablee, les scores et l'ardoise survivent. Exigence FR-008.
   */
  arreter: () => void
  /** Reprend l'enchainement apres un mode choisi manuellement. Exigence FR-009. */
  reprendre: () => void
  /** Termine la soiree et repart a neuf. */
  reset: () => void
}

export const useSoireeStore = create<SoireeState>()((set, get) => ({
  demarreeLe: null,
  modeCourant: null,
  enchainementActif: false,

  demarrer: (maintenant) => {
    if (get().demarreeLe !== null) {
      // Soiree deja en cours : on se contente de reactiver l'enchainement s'il
      // avait ete arrete, sans toucher a l'horodatage ni au mode courant.
      set({ enchainementActif: true })
      return
    }
    set({ demarreeLe: maintenant, enchainementActif: true, modeCourant: null })
  },

  allerVers: (id) => set({ modeCourant: id }),

  arreter: () => set({ enchainementActif: false }),

  reprendre: () => {
    if (get().demarreeLe === null) return
    set({ enchainementActif: true })
  },

  reset: () => set({ demarreeLe: null, modeCourant: null, enchainementActif: false }),
}))
