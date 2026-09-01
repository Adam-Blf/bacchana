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
/**
 * Ce que l'enchainement PROPOSE, et qui ne bouge plus tant que la tablee n'a
 * pas repondu.
 *
 * `id` nul signifie « aucun mode eligible » : la distinction compte, parce que
 * « pas encore calcule » et « rien a proposer » demandent deux ecrans
 * differents et que confondre les deux affichait le hub a l'identique.
 */
export interface Proposition {
  id: GameMode | null
  /** Vrai quand tous les modes eligibles ont deja ete joues et qu'un cycle recommence. */
  secondTour: boolean
}

interface SoireeState {
  /** Horodatage du debut, base du calcul de phase. Nul quand aucune soiree n'est lancee. */
  demarreeLe: number | null
  /** Le mode en cours de jeu, tire par l'enchainement. */
  modeCourant: GameMode | null
  /**
   * La proposition affichee. ETAT, et non valeur derivee du rendu.
   *
   * Elle etait calculee dans un `useMemo` du hub, a partir de la soiree,
   * de l'effectif et de l'abonnement. N'importe quel changement de l'un de ces
   * faits - y compris ceux que produit le lancement lui-meme - redonnait un
   * AUTRE mode, et l'ecran d'annonce se rendait a nouveau avec ce nouveau mode
   * au moment meme ou l'on touchait « On y va ». La tablee lisait un jeu et en
   * lancait un autre : c'est le defaut signale sous « ca passe au jeu suivant
   * alors que ce n'est pas le jeu selectionne », et sous « il considere les
   * jeux comme une liste » - l'enchainement avancait tout seul.
   *
   * Une proposition ecrite ne peut pas changer sous les doigts : elle ne bouge
   * que sur `demarrerMode` ou `passerMode`, deux gestes explicites.
   */
  proposition: Proposition | null
  /**
   * Les modes lances RECEMMENT, dans l'ordre et avec les repetitions. Distinct
   * de `modesJoues`, qui est un ensemble sans ordre : la fenetre anti-repetition
   * du sequenceur a besoin de savoir ce qui vient de passer, pas de ce qui a
   * ete vu une fois dans la nuit.
   */
  derniersModes: GameMode[]
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
  /** Ecrit la proposition a afficher. Ne lance rien. */
  proposer: (proposition: Proposition, maintenant: number) => void
  /**
   * Le mode propose vient d'etre LANCE. A n'appeler qu'apres un lancement
   * reussi : appele avant, un lancement qui echoue laissait la soiree avancer
   * sans que rien ne demarre.
   */
  demarrerMode: (id: GameMode, maintenant: number) => void
  /** La tablee refuse le mode propose : il est retenu comme vu, et on retire. */
  passerMode: (id: GameMode, maintenant: number) => void
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
      proposition: null,
      derniersModes: [],
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
          proposition: null,
          derniersModes: [],
        })
      },

      proposer: (proposition, maintenant) =>
        set({ proposition, derniereActiviteLe: maintenant }),

      demarrerMode: (id, maintenant) =>
        set((etat) => ({
          modeCourant: id,
          proposition: null,
          derniereActiviteLe: maintenant,
          // Un mode redistribue au second tour ne doit pas etre compte deux fois,
          // sinon la liste enfle et le cycle suivant se declenche trop tot.
          modesJoues: etat.modesJoues.includes(id) ? etat.modesJoues : [...etat.modesJoues, id],
          // Bornee : seule la fin compte pour la fenetre anti-repetition, et une
          // liste sans borne finirait par peser dans le stockage local.
          derniersModes: [...etat.derniersModes, id].slice(-8),
        })),

      passerMode: (id, maintenant) =>
        set((etat) => ({
          proposition: null,
          derniereActiviteLe: maintenant,
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
          proposition: null,
          derniersModes: [],
          enchainementActif: false,
          derniereActiviteLe: null,
        }),
    }),
    {
      // Nouvelle cle, ajoutee a cote des existantes. La chaine de migration
      // historique n'est pas touchee : aucune version anterieure n'avait cet
      // etat, il n'y a donc rien a migrer.
      name: 'bacchana-soiree',
      version: 1,
      // Une soiree ecrite par la version precedente n'a ni proposition ni
      // historique borne : on les pose vides plutot que de laisser `undefined`
      // filer jusqu'au sequenceur, ou `.slice` sur `undefined` leverait.
      migrate: (etat) => ({
        ...(etat as SoireeState),
        proposition: (etat as Partial<SoireeState>).proposition ?? null,
        derniersModes: (etat as Partial<SoireeState>).derniersModes ?? [],
      }),
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
