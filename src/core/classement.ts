/**
 * Le classement d'une tablee, et ses egalites dites plutot qu'effacees.
 *
 * POURQUOI CE MODULE EXISTE. Le calcul des rangs vivait dans `palmaresStore`,
 * ou il ne pouvait servir qu'au palmares. L'ecran des scores en montre
 * desormais DEUX - l'ardoise de la soiree en cours et le palmares de toujours -
 * et la seconde liste serait repartie sur `index + 1`, c'est-a-dire sur le
 * defaut que le palmares avait justement corrige : un vainqueur invente, et
 * une premiere place attribuee par ordre alphabetique a pénalités égales.
 *
 * Le rang est PARTAGE, a la maniere d'un classement sportif : deux premiers ex
 * aequo, puis un troisieme. Le rang saute n'est pas une coquille, c'est
 * l'information - il dit qu'ils sont deux devant.
 *
 * CE QUE CE MODULE NE DECIDE PAS. L'ordre d'AFFICHAGE. Il classe ce qu'on lui
 * donne, dans l'ordre ou on le lui donne : c'est a l'appelant de trier avant,
 * parce que le critere de tri n'est pas le meme d'un registre a l'autre.
 */

/** Le minimum pour etre classe : une charge, et le nombre de parties qui l'a portee. */
export interface Classable {
  penalites: number
  parties: number
}

export interface Rang<T extends Classable> {
  ligne: T
  /** Rang partage : deux ex aequo portent le meme, et le suivant saute d'autant. */
  rang: number
  /** Vrai si au moins une autre ligne partage ce rang. */
  exAequo: boolean
}

/**
 * Deux lignes sont a egalite PARFAITE : meme charge, et autant de parties pour
 * la porter.
 *
 * Le nombre de parties compte parce que deux ardoises egales ne disent pas la
 * meme chose - dix penalites en deux parties n'est pas dix penalites en huit.
 * C'est aussi ce qui explique deux « 19 » cote a cote a des rangs differents :
 * l'ecran doit donc AFFICHER le nombre de parties, sans quoi l'ecart de rang
 * passe pour un bogue.
 */
function memeRang(a: Classable, b: Classable): boolean {
  return a.penalites === b.penalites && a.parties === b.parties
}

/** Les rangs d'une liste DEJA TRIEE. */
export function rangsDuClassement<T extends Classable>(classement: T[]): Rang<T>[] {
  const rangs: Rang<T>[] = []
  for (const [i, ligne] of classement.entries()) {
    const precedent = rangs[i - 1]
    rangs.push({
      ligne,
      rang: precedent && memeRang(classement[i - 1], ligne) ? precedent.rang : i + 1,
      exAequo: false,
    })
  }
  // L'ex aequo ne se voit qu'une fois le groupe entier connu : la premiere
  // ligne d'une egalite ne peut pas savoir qu'une seconde la suit.
  const parRang = new Map<number, number>()
  for (const r of rangs) parRang.set(r.rang, (parRang.get(r.rang) ?? 0) + 1)
  return rangs.map((r) => ({ ...r, exAequo: (parRang.get(r.rang) ?? 1) > 1 }))
}

/** Les lignes qui se partagent la premiere place, ou rien si la tete est seule. */
export function meneurs<T extends Classable>(rangs: Rang<T>[]): T[] {
  const tete = rangs.filter((r) => r.rang === 1)
  return tete.length > 1 ? tete.map((r) => r.ligne) : []
}

/** La marque affichee devant un nom. Le signe egal est la convention sportive. */
export function marqueDeRang(rang: number, exAequo: boolean): string {
  return exAequo ? `=${rang}` : `${rang}`
}
