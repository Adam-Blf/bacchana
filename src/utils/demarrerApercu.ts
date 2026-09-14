/**
 * Demarre REELLEMENT la partie demandee par `?screen=game&mode=...`.
 *
 * LE DEFAUT. Le pont d'apercu posait le mode actif et poussait l'ecran de jeu,
 * et rien d'autre. Or trois modes sur quinze seulement se contentent de ca.
 * Les autres ont besoin qu'une session existe avant d'avoir quoi que ce soit a
 * afficher, et leur ecran, ne trouvant pas de partie, renvoyait sur l'accueil.
 *
 * Le pont menait donc a l'ACCUEIL pour `borderland` et pour les six modes a
 * consigne - Le Taulier, Action ou Verite, Je n'ai jamais, Qui de nous, C'est
 * un 10 mais, 7 Secondes - soit sept des quinze jeux. Sans message, sans
 * erreur de console : l'outil rendait une capture parfaitement propre du
 * mauvais ecran. Un audit visuel conduit avec ce pont validait l'accueil en
 * croyant regarder un jeu.
 *
 * TROIS FORMES DE LANCEMENT, DEDUITES DU REGISTRE et non enumerees. Une liste
 * ecrite a la main est exactement ce qui a casse le hub le 2026-08-30, quand
 * Le Faux Frere est tombe dans le chemin des paquets, n'en a trouve aucun, et
 * que la tuile a cesse de repondre sans rien dire.
 *
 * LES PAQUETS SONT CHARGES A LA DEMANDE, et c'est une contrainte, pas un gout.
 * Une premiere version importait `@/content/paquets` en tete de fichier ; comme
 * `main.tsx` importe ce module, les quatre-vingts cartes de chaque paquet
 * partaient dans le chunk de DEMARRAGE, c'est-a-dire avant le premier pixel, y
 * compris pour quelqu'un qui ouvre simplement l'application. La garde
 * `check_entree` l'a refuse en nommant la carte fautive. Le `import()` ne
 * s'execute que si un apercu de jeu est demande.
 *
 * CE QUE CE MODULE NE FAIT PAS. Ni retour haptique, ni mesure d'audience, ni
 * regles maison : c'est un pont d'outillage, pas le hub. Il produit l'ETAT
 * qu'un ecran de jeu attend, pas le parcours qui y mene.
 */
import type { Player } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { useGameStore, usePromptStore } from '@/stores'

/** Ce dont un mode a besoin avant que son ecran ait quelque chose a montrer. */
export type FormeDeLancement = 'paquet' | 'borderland' | 'embarque'

/**
 * La forme de lancement d'un mode, lue dans le registre.
 *
 * `borderland` est le seul a distribuer un jeu de 52 cartes plutot qu'une
 * pioche de consignes ; un mode qui declare des paquets a besoin qu'on lui en
 * ouvre un ; tous les autres portent leur logique dans leur ecran.
 */
export function formeDeLancement(mode: GameMode): FormeDeLancement {
  if (mode === 'borderland') return 'borderland'
  const def = getModeDefinition(mode)
  return def.freePackIds.length === 0 && !def.hasPremiumPacks ? 'embarque' : 'paquet'
}

/**
 * Pose l'etat qu'attend l'ecran du mode. Rend faux quand c'est impossible -
 * un mode a paquets dont aucun paquet gratuit n'est embarque, par exemple -
 * pour que l'appelant n'annonce pas un ecran de jeu qu'il n'obtiendra pas.
 */
export async function demarrerPourApercu(mode: GameMode, joueurs: Player[]): Promise<boolean> {
  switch (formeDeLancement(mode)) {
    case 'borderland':
      useGameStore.getState().initGame()
      return true

    case 'paquet': {
      const { FREE_PACKS } = await import('@/content/paquets')
      const def = getModeDefinition(mode)
      const paquet =
        FREE_PACKS.find((p) => def.freePackIds.includes(p.pack.id)) ??
        FREE_PACKS.find((p) => p.pack.mode === mode)
      if (!paquet) return false
      usePromptStore.getState().startSession(mode, paquet, joueurs)
      return true
    }

    case 'embarque':
      return true
  }
}
