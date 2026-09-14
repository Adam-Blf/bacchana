import { lazy, useState, type ComponentType } from 'react'

/**
 * UN ECRAN DIFFERE QU'ON PEUT RENDRE PRET D'AVANCE.
 *
 * LE DEFAUT, mesure au chronometre dans la page. `lazy()` n'interroge sa
 * fabrique qu'au PREMIER RENDU. Que le morceau soit deja telecharge ET deja
 * evalue par un prechargement n'y change rien : la fabrique rend une promesse,
 * le composant suspend, le repli de `Suspense` est monte - et React bride
 * alors la livraison du vrai contenu de 300 ms (`FALLBACK_THROTTLE_MS`), pour
 * ne pas le faire clignoter. Premiere ouverture d'un ecran du menu : 505 ms.
 * Seconde : 209 ms. L'ecart est exactement cette bride, pour un ecran
 * entierement en memoire.
 *
 * LA CORRECTION. `differer()` garde le module resolu dans une variable de
 * module et rend le composant DIRECTEMENT quand il est la. Plus de promesse,
 * donc plus de suspension, donc plus de repli ni de bride.
 *
 * CE QU'IL NE FAIT PAS. Il ne remplace pas `Suspense` : si rien n'a ete
 * precharge - connexion econome, ecran ouvert par une URL directe, echec
 * reseau - on retombe sur le `lazy()` habituel. Le comportement d'avant,
 * jamais pire. `App.tsx` doit donc garder son `Suspense` englobant.
 */
type ModuleDEcran = { default: ComponentType }

/**
 * Un ecran differe, plus le moyen de le rendre pret d'avance.
 *
 * Le composant rendu est FIGE AU MONTAGE (`useState` avec initialiseur) : si
 * le prechargement se terminait entre deux rendus, changer de type de
 * composant en cours de route demonterait l'ecran et lui ferait perdre son
 * etat - son defilement, un champ en cours de saisie. Le choix est donc fait
 * une fois, a l'ouverture, et ne bouge plus.
 */
export function differer(charger: () => Promise<ModuleDEcran>) {
  let pret: ComponentType | null = null
  const Suspendu = lazy(charger)

  const precharger = (): Promise<void> =>
    charger().then(
      (m) => {
        pret = m.default
      },
      // Un echec de prechargement n'est PAS une panne : l'ecran se chargera a
      // l'ouverture, par `Suspendu`, comme avant. On avale donc le rejet
      // plutot que de laisser une promesse non traitee remonter jusqu'au
      // rapport d'erreurs.
      () => {}
    )

  function Ecran() {
    const [Rendu] = useState<ComponentType>(() => pret ?? Suspendu)
    return <Rendu />
  }
  Ecran.displayName = 'EcranDiffere'

  return [Ecran, precharger] as const
}
