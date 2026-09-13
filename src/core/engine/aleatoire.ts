/**
 * Le tirage au sort, ecrit une fois.
 *
 * Le meme melange de Fisher-Yates existait en SEPT exemplaires : dans les cinq
 * moteurs de session, dans le ciblage, et dans le jeu de cartes. Six d'entre eux
 * etaient identiques au caractere pres ; le septieme, celui des cartes a prompt,
 * appelait `Math.random` en dur et n'acceptait donc aucune graine - ce qui rend
 * une session a prompts impossible a rejouer dans un test, et invisible au
 * mecanisme de sequence rejouable de « Lance la soiree ».
 *
 * C'est la divergence qui compte ici, pas les lignes economisees. Sept copies
 * d'un algorithme, c'est sept endroits ou corriger un biais de tirage, et une
 * quasi-certitude d'en oublier au moins un.
 *
 * `rng` est un PARAMETRE et non un appel a `Math.random` a l'interieur : les
 * moteurs sont des fonctions pures et leurs tests exigent d'etre deterministes.
 * Le defaut reste `Math.random` pour les appelants qui n'ont rien a rejouer.
 */

/** Une source d'aleatoire : rend un nombre dans [0, 1[. */
export type Rng = () => number

/**
 * Melange de Fisher-Yates. Rend un NOUVEAU tableau, n'ecrit jamais dans l'entree.
 *
 * Le parcours va de la fin vers le debut et tire `j` dans [0, i] inclus. Un `j`
 * tire dans [0, i[ - l'erreur classique - exclut la position courante et rend un
 * melange biaise, ou aucun element ne peut rester a sa place.
 */
export function melanger<T>(liste: readonly T[], rng: Rng = Math.random): T[] {
  const sortie = [...liste]
  for (let i = sortie.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[sortie[i], sortie[j]] = [sortie[j], sortie[i]]
  }
  return sortie
}
