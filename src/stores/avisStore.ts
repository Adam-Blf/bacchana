import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Quand, et surtout a quelles conditions, Bacchana demande une note sur le store.
 *
 * DEUX REGLES DE STORE SONT ENCODEES ICI, PAS SEULEMENT DOCUMENTEES
 * -----------------------------------------------------------------
 * 1. On ne harcele pas. Apple plafonne lui-meme ses fenetres de notation a trois par
 *    an et par appareil, Google recommande la meme sobriete. Les compteurs ci-dessous
 *    tiennent cette limite cote application, pour que le comportement soit le meme
 *    sur le web, ou aucune API systeme ne la fait respecter a notre place.
 *
 * 2. On ne trie pas les avis. Le schema repandu « as-tu aime ? oui vers le store, non
 *    vers un formulaire prive » est un filtrage d'avis, interdit par Google Play comme
 *    par Apple. C'est aussi une malhonnetete : la note publique cesse de refleter ce
 *    que les gens pensent. La demande est donc UNE question, sans branche selon
 *    l'humeur, et le lien vers le store est le meme pour tout le monde. Voir
 *    `DemandeAvis.tsx`, qui n'a volontairement aucun etat de sentiment.
 *
 * QUAND DEMANDER
 * --------------
 * Jamais pendant une partie, jamais a la premiere ouverture. Une note se demande a
 * quelqu'un qui a vecu le produit, pas a un inconnu : d'ou le seuil de soirees
 * terminees. Le moment retenu est la fin d'une soiree, quand la tablee repose le
 * telephone - le seul instant ou l'interruption ne coute rien a personne.
 */
interface AvisState {
  /** Soirees menees jusqu'a leur terme. Base du seuil d'anciennete. */
  soireesTerminees: number
  /** Nombre de fois ou la question a ete posee. Plafonne par MAX_DEMANDES. */
  demandesFaites: number
  /** Horodatage de la derniere question posee, nul tant qu'aucune ne l'a ete. */
  derniereDemandeLe: number | null
  /**
   * Vrai des que la tablee a repondu « ne plus me demander », ou a note. Dans les
   * deux cas on ne redemande plus jamais : l'un est un refus explicite, l'autre
   * n'a plus d'objet.
   */
  clos: boolean

  /** A appeler quand une soiree se termine. */
  soireeTerminee: () => void
  /** A appeler au moment ou la question est affichee. */
  demandeAffichee: (maintenant: number) => void
  /** Ferme definitivement le sujet (refus explicite, ou note deposee). */
  clore: () => void
  reset: () => void
}

/**
 * Trois soirees avant la premiere question. Assez pour que la tablee sache ce
 * qu'elle note, assez peu pour ne pas rater ceux qui se lassent.
 */
export const SEUIL_SOIREES = 3

/** Plafond volontaire, aligne sur la limite qu'Apple applique de son cote. */
export const MAX_DEMANDES = 3

/** Trois mois entre deux questions. En dessous, poser la question redevient du harcelement. */
export const DELAI_ENTRE_DEMANDES_MS = 90 * 24 * 60 * 60 * 1000

/**
 * La decision, en fonction pure.
 *
 * Hors du store pour recevoir `maintenant` en parametre et se tester sans avancer
 * une horloge reelle, comme `estReprenable` dans soireeStore.
 *
 * Remarquer ce qui N'EST PAS un parametre : rien qui ressemble a une satisfaction,
 * un score ou une humeur. La condition ne peut pas devenir un filtre d'avis, parce
 * qu'il n'y a aucune entree sur laquelle filtrer.
 */
export function doitDemanderAvis(
  etat: Pick<AvisState, 'soireesTerminees' | 'demandesFaites' | 'derniereDemandeLe' | 'clos'>,
  maintenant: number,
): boolean {
  if (etat.clos) return false
  if (etat.demandesFaites >= MAX_DEMANDES) return false
  if (etat.soireesTerminees < SEUIL_SOIREES) return false
  if (etat.derniereDemandeLe === null) return true
  return maintenant - etat.derniereDemandeLe >= DELAI_ENTRE_DEMANDES_MS
}

export const useAvisStore = create<AvisState>()(
  persist(
    (set) => ({
      soireesTerminees: 0,
      demandesFaites: 0,
      derniereDemandeLe: null,
      clos: false,

      soireeTerminee: () => set((etat) => ({ soireesTerminees: etat.soireesTerminees + 1 })),

      demandeAffichee: (maintenant) =>
        set((etat) => ({
          demandesFaites: etat.demandesFaites + 1,
          derniereDemandeLe: maintenant,
        })),

      clore: () => set({ clos: true }),

      reset: () =>
        set({ soireesTerminees: 0, demandesFaites: 0, derniereDemandeLe: null, clos: false }),
    }),
    {
      // Cle nouvelle, ajoutee a cote des existantes : aucune version anterieure ne
      // portait cet etat, il n'y a donc rien a migrer.
      name: 'bacchana-avis',
    },
  ),
)
