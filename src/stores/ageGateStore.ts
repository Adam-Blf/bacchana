import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Déclaration de majorité, demandée une fois au tout premier lancement.
 *
 * POURQUOI CE STORE EXISTE. Bacchana est réservé aux 18 ans et plus, et cette
 * restriction ne vivait jusqu'ici que dans le texte des CGU et de la politique de
 * confidentialité. Un utilisateur pouvait donc traverser toute l'application sans
 * jamais croiser la question. Deux conséquences concrètes :
 *
 * 1. La défense au regard de la loi Évin repose sur le fait que le service n'est
 *    pas destiné à la jeunesse (art. L3323-2 du code de la santé publique). Une
 *    mention enfouie dans les CGU n'établit rien ; un point de passage obligé,
 *    si.
 * 2. Apple (règle 1.4.3) et Google Play exigent la cohérence entre la
 *    classification d'âge déclarée et le parcours réel. Annoncer 18+ sans jamais
 *    le demander est le genre d'écart qui fait retirer une application.
 *
 * CE QUE CE STORE N'EST PAS. Ce n'est pas une vérification d'identité, et il ne
 * prétend pas en être une : une déclaration sur l'honneur reste déclarative. Elle
 * établit l'intention de l'éditeur et la conscience de l'utilisateur, pas son âge
 * réel. Aucune date de naissance n'est demandée ni stockée, ce qui serait une
 * donnée personnelle à justifier au titre de la minimisation (RGPD art. 5.1.c)
 * pour un gain de fiabilité nul.
 *
 * Le refus est mémorisé au même titre que l'acceptation : un mineur qui a répondu
 * non ne doit pas pouvoir contourner la porte en relançant l'application.
 */
export type ReponseAge = 'majeur' | 'mineur'

interface AgeGateState {
  /** null tant que la question n'a jamais été posée. */
  reponse: ReponseAge | null
  /** Horodatage de la déclaration, conservé comme trace en cas de contrôle. */
  declareLe: number | null
  declarer: (reponse: ReponseAge) => void
}

export const useAgeGateStore = create<AgeGateState>()(
  persist(
    (set) => ({
      reponse: null,
      declareLe: null,
      declarer: (reponse) => set({ reponse, declareLe: Date.now() }),
    }),
    {
      name: 'bacchana-age-gate',
      partialize: (state) => ({ reponse: state.reponse, declareLe: state.declareLe }),
    }
  )
)

/** Vrai seulement si la majorité a été déclarée. Un null bloque, un refus aussi. */
export function peutEntrer(reponse: ReponseAge | null): boolean {
  return reponse === 'majeur'
}
