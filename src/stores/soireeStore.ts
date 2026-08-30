import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameMode } from '@/core/engine/types'

/**
 * L'etat de l'enchainement automatique, « Lance la soiree ».
 *
 * Ce store porte les modes deja enchaines, ce qui ressemble a une duplication de
 * `nightStore.modesPlayed` et n'en est pas une.
 *
 * Les deux repondent a des questions differentes et, depuis l'arbitrage du
 * 2026-08-14, n'ont plus la meme duree de vie. `nightStore` compte les parties de
 * l'ardoise et repart de zero a chaque lancement. Celui-ci retient ce que
 * l'enchainement a deja propose, et survit a une fermeture. Lire l'un pour l'autre
 * ferait redistribuer les memes modes juste apres une reprise, puisque l'ardoise
 * serait vide alors que la soiree, elle, continue.
 *
 * PERSISTE, contrairement a `nightStore`, et c'est un ecart assume.
 *
 * La regle produit historique veut que la session reparte de zero a chaque
 * lancement. Elle reste vraie pour l'ardoise : les scores ne survivent pas a une
 * fermeture. Mais un telephone qui se verrouille deux minutes ne devrait pas
 * renvoyer une tablee au menu des treize modes, ce qui est exactement le probleme
 * que cette fonctionnalite corrige.
 *
 * Le compromis retenu, arbitre le 2026-08-14 : l'enchainement reprend, l'ardoise
 * non. L'ecran de reprise DOIT le dire, sans quoi la tablee croira a un bug en
 * voyant ses scores disparaitre.
 */
interface SoireeState {
  /** Horodatage du debut, base du calcul de phase. Nul quand aucune soiree n'est lancee. */
  demarreeLe: number | null
  /** Le mode en cours de jeu, tire par l'enchainement. */
  modeCourant: GameMode | null
  /**
   * Modes deja proposes par l'enchainement dans cette soiree. Persiste avec elle,
   * a la difference de l'ardoise. Voir l'en-tete du fichier.
   */
  modesJoues: GameMode[]
  /** Faux quand la tablee est repassee en choix manuel, sans perdre la soiree. */
  enchainementActif: boolean
  /**
   * Derniere fois que la soiree a bouge. Base de l'expiration, et non
   * `demarreeLe` : une soiree de cinq heures reste valide tant qu'on y joue,
   * alors qu'une soiree d'une heure abandonnee depuis la veille ne l'est pas.
   */
  derniereActiviteLe: number | null

  /**
   * Demarre une soiree. Un second appel alors qu'une soiree est deja active ne
   * l'ecrase pas : deux appuis sur le bouton ne doivent pas remettre la soiree a
   * zero au milieu d'une partie. Exigence FR-017.
   */
  demarrer: (maintenant: number) => void
  /** Passe au mode tire par le sequenceur. */
  allerVers: (id: GameMode, maintenant: number) => void
  /**
   * Arrete l'enchainement et rend la main au choix manuel. La soiree n'est PAS
   * effacee : la tablee et l'ardoise en cours survivent. Exigence FR-008.
   */
  arreter: () => void
  /** Reprend l'enchainement apres un mode choisi manuellement. Exigence FR-009. */
  reprendre: (maintenant: number) => void
  /** Termine la soiree et repart a neuf. */
  reset: () => void
}

/**
 * Au dela de ce delai sans activite, une soiree n'est plus proposee a la reprise.
 *
 * Quatre heures couvre le telephone verrouille, la pause repas et le trajet, sans
 * proposer au reveil de reprendre la soiree de la veille. C'est un point de
 * depart a caler en usage reel, pas une valeur mesuree.
 */
export const SEUIL_REPRISE_MS = 4 * 60 * 60 * 1000

export const useSoireeStore = create<SoireeState>()(
  persist(
    (set, get) => ({
      demarreeLe: null,
      modeCourant: null,
      modesJoues: [],
      enchainementActif: false,
      derniereActiviteLe: null,

      demarrer: (maintenant) => {
        if (get().demarreeLe !== null) {
          // Soiree deja en cours : on reactive l'enchainement s'il avait ete
          // arrete, sans toucher a l'horodatage ni au mode courant.
          set({ enchainementActif: true, derniereActiviteLe: maintenant })
          return
        }
        set({
          demarreeLe: maintenant,
          derniereActiviteLe: maintenant,
          enchainementActif: true,
          modeCourant: null,
          modesJoues: [],
        })
      },

      allerVers: (id, maintenant) =>
        set((etat) => ({
          modeCourant: id,
          derniereActiviteLe: maintenant,
          // Un mode redistribue au second tour ne doit pas etre compte deux fois,
          // sinon la liste enfle et le cycle suivant se declenche trop tot.
          modesJoues: etat.modesJoues.includes(id) ? etat.modesJoues : [...etat.modesJoues, id],
        })),

      arreter: () => set({ enchainementActif: false }),

      reprendre: (maintenant) => {
        if (get().demarreeLe === null) return
        set({ enchainementActif: true, derniereActiviteLe: maintenant })
      },

      reset: () =>
        set({
          demarreeLe: null,
          modeCourant: null,
          modesJoues: [],
          enchainementActif: false,
          derniereActiviteLe: null,
        }),
    }),
    {
      // Nouvelle cle, ajoutee a cote des existantes. La chaine de migration
      // historique n'est pas touchee : aucune version anterieure n'avait cet
      // etat, il n'y a donc rien a migrer.
      name: 'bacchana-soiree',
    },
  ),
)

/**
 * Une soiree est reprenable si elle existe et si elle a bouge recemment.
 *
 * Fonction libre plutot que selecteur du store, pour recevoir `maintenant` en
 * parametre et rester testable sans avancer une horloge reelle.
 */
export function estReprenable(
  etat: Pick<SoireeState, 'demarreeLe' | 'derniereActiviteLe'>,
  maintenant: number,
): boolean {
  if (etat.demarreeLe === null || etat.derniereActiviteLe === null) return false
  return maintenant - etat.derniereActiviteLe < SEUIL_REPRISE_MS
}
