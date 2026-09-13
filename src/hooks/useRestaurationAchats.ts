import { useState } from 'react'
import { useEntitlementStore } from '@/stores'
import type { RestoreResult } from '@/stores/entitlementStore'

/**
 * Le flux « Restaurer mes achats », partage entre les Reglages et le paywall.
 *
 * POURQUOI CE HOOK EXISTE
 * -----------------------
 * La restauration doit apparaitre a DEUX endroits, et pour deux raisons distinctes.
 *
 * Dans les Reglages, parce que c'est la que l'on cherche a reparer quelque chose.
 * Dans le paywall, parce que c'est la que le relecteur du store la cherche : la
 * regle 3.1.1 de l'App Store impose un moyen de restaurer un achat non consommable,
 * et une tablee qui a deja paye ne doit jamais avoir l'impression qu'on lui redemande
 * de payer. Un ecran de vente sans porte de sortie pour celui qui a deja achete est
 * une cause classique de rejet.
 *
 * Deux emplacements, donc, mais un seul comportement : les libelles et la gestion de
 * l'etat vivent ici, pas recopies des deux cotes ou ils divergeraient au premier
 * changement de formulation.
 */

/**
 * Le message montre a la tablee pour chaque issue.
 *
 * Fonction pure et exportee pour etre testee sans rendu : c'est la partie qui compte,
 * puisqu'un mauvais libelle ici fait croire a un achat perdu.
 *
 * `unavailable` ne dit surtout pas « aucun achat trouve » : la facturation peut etre
 * simplement non configuree (mode invite, hors ligne). Annoncer une absence d'achat
 * dans ce cas serait un mensonge, et le pire possible pour quelqu'un qui a paye.
 */
export function libelleRestauration(resultat: RestoreResult): string {
  switch (resultat) {
    case 'restored-premium':
      return 'Premium restaure, bonne soiree.'
    case 'restored-no-premium':
      return "Aucun achat actif trouve pour cet appareil."
    case 'unavailable':
      return "La restauration n'est pas disponible pour l'instant. Reessaie plus tard."
  }
}

interface RestaurationAchats {
  /** Vrai pendant l'appel, pour desactiver le bouton et montrer l'attente. */
  enCours: boolean
  /** Message a afficher, nul tant que rien n'a ete tente. */
  message: string | null
  /** Lance la restauration. Ne leve jamais : toute issue passe par `message`. */
  restaurer: () => Promise<void>
}

export function useRestaurationAchats(): RestaurationAchats {
  const restore = useEntitlementStore((s) => s.restore)
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const restaurer = async () => {
    if (enCours) return
    setEnCours(true)
    setMessage(null)
    try {
      setMessage(libelleRestauration(await restore()))
    } finally {
      setEnCours(false)
    }
  }

  return { enCours, message, restaurer }
}
