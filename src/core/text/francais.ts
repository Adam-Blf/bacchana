/**
 * Les regles de francais que l'application applique a des prenoms saisis par
 * la tablee.
 *
 * Pourquoi un module et non deux lignes recopiees : « Au tour de Alice » est la
 * chaine la plus VUE de toute l'application - elle s'affiche a chaque tour de
 * chaque jeu - et elle etait fausse pour tous les prenoms commencant par une
 * voyelle. Alice, Ines, Emile, Oscar, Anais. Une faute affichee mille fois par
 * soiree ne se corrige pas a un endroit.
 */

/** Les voyelles francaises, accentuees comprises. */
const VOYELLES = /^[aeiouyàâäéèêëîïôöùûü]/i

/**
 * Le `h` MUET, celui devant lequel on elide.
 *
 * Il n'existe aucune regle pour distinguer un `h` muet d'un `h` aspire : c'est
 * un fait de vocabulaire, pas de graphie. « Hugo » prend l'elision, « Hugo » et
 * « Henri » aussi, mais « Hugo » et « Hongrois » divergent. On ne devine donc
 * pas : la liste ci-dessous couvre les prenoms courants a `h` muet, et tout ce
 * qui n'y figure pas garde la forme pleine.
 *
 * Se tromper dans ce sens est le bon sens : « de Hugo » se lit maladroitement,
 * « d'Hongrie » se lit faux.
 */
const H_MUET = new Set([
  'hugo', 'henri', 'henry', 'helene', 'hélène', 'heloise', 'héloïse',
  'hector', 'hippolyte', 'honore', 'honoré', 'hortense', 'hubert',
  'hyacinthe', 'hermine', 'hilaire', 'homere', 'homère',
])

/** Vrai quand le mot demande une elision (« d'Alice » plutot que « de Alice »). */
export function demandeElision(mot: string): boolean {
  const propre = mot.trim()
  if (propre.length === 0) return false
  if (VOYELLES.test(propre)) return true
  if (/^h/i.test(propre)) return H_MUET.has(propre.toLowerCase())
  return false
}

/**
 * « de » ou « d' », selon le mot qui suit.
 *
 * Rend la particule ET le nom, colles ou espaces selon le cas, pour qu'aucun
 * appelant n'ait a se souvenir qu'il ne faut pas d'espace apres l'apostrophe.
 */
export function de(nom: string): string {
  return demandeElision(nom) ? `d'${nom}` : `de ${nom}`
}

/** « a » devient « a » quoi qu'il arrive : garde pour les appelants symetriques. */
export function a(nom: string): string {
  return `à ${nom}`
}

/**
 * Rend une liste lisible : « Alice », « Alice et Bo », « Alice, Bo et Cyr ».
 *
 * Un `join(' et ')` rendait « Alice et Bo et Cyr ».
 */
export function enumerer(noms: readonly string[]): string {
  if (noms.length === 0) return ''
  if (noms.length === 1) return noms[0]
  return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`
}
