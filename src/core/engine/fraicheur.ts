/**
 * Ce qui a deja ete vu ce soir passe en dernier, et une manche a une longueur.
 *
 * Deux defauts que les moteurs de session partageaient, et qui se corrigent au
 * meme endroit parce qu'ils portent tous les deux sur la constitution de la
 * pioche.
 *
 * 1. Chaque moteur melangeait SON paquet et n'avait aucune memoire d'une manche
 *    a l'autre. A l'interieur d'une manche, rien ne se repetait - la pioche est
 *    consommee carte par carte. Mais relancer le meme mode dix minutes plus
 *    tard rebattait tout, et la meme question retombait. Pour la tablee c'est
 *    la meme soiree, et c'est bien la meme question.
 *
 * 2. La pioche valait le paquet ENTIER. « Quitte ou Double » enchainait ses 81
 *    questions avant d'afficher l'addition, ce que personne ne joue jusqu'au
 *    bout : la manche ne se terminait jamais autrement qu'en abandon, et
 *    l'ecran de fin - donc l'ardoise, donc la revanche - restait hors de portee.
 */

/** Ce que tout moteur de session accepte pour constituer sa pioche. */
export interface OptionsManche {
  /**
   * Identifiants deja servis ce soir, tous modes confondus. Ils ne sont pas
   * RETIRES, ils passent derriere : un paquet vide serait pire qu'une
   * repetition, et une tablee qui joue longtemps finit forcement par reboucler.
   */
  dejaVus?: ReadonlySet<string>
  /**
   * Nombre de cartes de la manche. Absent ou nul, la pioche vaut le paquet
   * entier - c'est ce que veut la tablee qui a choisi « tout le paquet ».
   */
  longueur?: number
}

/**
 * La pioche : les inedits d'abord, les revus ensuite, chaque groupe melange, le
 * tout coupe a la longueur demandee.
 *
 * `melanger` est passe en parametre plutot qu'importe : chaque moteur a deja sa
 * fonction de melange branchee sur SON generateur, et un second melange local
 * casserait le determinisme que leurs tests exigent.
 */
export function constituerPioche<T extends { id: string }>(
  items: readonly T[],
  melanger: (liste: T[]) => T[],
  options: OptionsManche = {},
): T[] {
  const dejaVus = options.dejaVus
  const pioche = dejaVus
    ? [
        ...melanger(items.filter((item) => !dejaVus.has(item.id))),
        ...melanger(items.filter((item) => dejaVus.has(item.id))),
      ]
    : melanger([...items])

  const longueur = options.longueur
  return longueur && longueur > 0 ? pioche.slice(0, longueur) : pioche
}

/**
 * Les longueurs proposees a la tablee.
 *
 * Trois paliers et « tout le paquet ». Quinze est le defaut : c'est environ un
 * quart d'heure a une tablee de quatre, la duree au bout de laquelle une soiree
 * veut changer de jeu. Ce sont des points de depart a caler en usage reel, pas
 * des valeurs mesurees - ce qui est la raison pour laquelle ils sont nommes
 * ici plutot qu'ecrits dans un composant.
 */
export const LONGUEURS_MANCHE = [10, 15, 25, 0] as const
export const LONGUEUR_MANCHE_DEFAUT = 15
