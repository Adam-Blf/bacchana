/**
 * Detection des echecs de chargement de module dus a une version perimee.
 *
 * Le probleme. L'application charge l'ecran de chaque mode en `import()`
 * paresseux, vers un fichier au nom hache. Quand un deploiement remplace
 * `dist/`, les onglets deja ouverts continuent de demander l'ancien hachage,
 * qui n'existe plus : le prochain `import()` echoue en 404.
 *
 * Ce n'est pas un bug de code, c'est une condition de version. Mais l'ecran
 * d'erreur global le presente au joueur comme un plantage, et comme la tablee
 * n'est deliberement pas persistee (voir appStore), il doit ressaisir tous les
 * prenoms. Un deploiement en pleine soiree coute donc la partie.
 *
 * La bonne reponse est de recharger, ce que le joueur ne peut pas deviner. On
 * le fait pour lui, une seule fois.
 */

/**
 * Les navigateurs ne normalisent pas ce message. Chaque moteur a le sien, et il
 * n'existe pas de type d'erreur dedie a intercepter - d'ou la comparaison sur
 * le texte, faute de mieux.
 */
const SIGNATURES = [
  'failed to fetch dynamically imported module', // Chrome, Edge
  'error loading dynamically imported module', // Firefox
  'importing a module script failed', // Safari
  'failed to load module script', // Safari, variante
  'dynamically imported module', // filet de securite
  'chunkloaderror',
]

/**
 * Vrai si l'erreur est un chargement de module echoue, donc probablement une
 * version perimee plutot qu'un defaut applicatif.
 *
 * Volontairement tolerant : un faux positif provoque un rechargement, ce que
 * l'ecran d'erreur proposait de toute facon. Un faux negatif laisse le joueur
 * ressaisir sa tablee. Les deux couts ne sont pas comparables.
 */
export function isStaleChunkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'string'
        ? error
        : ''
  if (!message) return false
  const bas = message.toLowerCase()
  return SIGNATURES.some((s) => bas.includes(s))
}

/** Cle de garde. Portee session : un nouvel onglet repart avec son credit. */
export const RELOAD_GUARD_KEY = 'bacchana-stale-chunk-reload'

/**
 * Consomme le droit de recharger automatiquement, et dit s'il etait disponible.
 *
 * Un seul rechargement par session. Sans ce plafond, un fichier reellement
 * introuvable - purge de CDN, deploiement casse - ferait boucler l'application
 * indefiniment entre l'echec et le rechargement, ce qui est pire que l'ecran
 * d'erreur : le joueur ne verrait meme plus de quoi se plaindre.
 *
 * Au deuxieme echec on rend donc la main a l'ecran d'erreur, qui porte un
 * bouton fonctionnel.
 */
export function consumeReloadAllowance(storage: Pick<Storage, 'getItem' | 'setItem'>): boolean {
  try {
    if (storage.getItem(RELOAD_GUARD_KEY)) return false
    storage.setItem(RELOAD_GUARD_KEY, '1')
    return true
  } catch {
    // Stockage indisponible (navigation privee stricte, quota). Sans moyen de
    // compter les tentatives, on refuse le rechargement automatique : une
    // boucle infinie est un degat pire qu'une ressaisie.
    return false
  }
}
