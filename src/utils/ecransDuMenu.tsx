import { differer } from './ecranDiffere'

/**
 * LES CINQ ECRANS DU MENU : charges a la demande, mais prets AVANT le clic.
 *
 * ---------------------------------------------------------------------------
 * DEFAUT 1 - le reseau attendait l'animation au lieu de travailler pendant.
 * ---------------------------------------------------------------------------
 * `AnimatePresence` en mode `wait` ne monte pas l'ecran d'arrivee tant que la
 * sortie n'est pas finie. Or c'est le montage qui declenche l'`import()` d'un
 * ecran differe. Mesure au chronometre dans la page : le morceau de code
 * n'etait demande qu'a +1297 ms apres le clic, et la transition complete
 * prenait 1900 ms a froid contre 1340 ms a chaud. Ces 560 ms d'ecart etaient
 * du temps entierement evitable - le morceau aurait pu etre en cache depuis
 * l'arrivee sur le hub.
 *
 * Correction : `prechargerEcransDuMenu()`, appele au montage du hub, au repos
 * du navigateur.
 *
 * ---------------------------------------------------------------------------
 * DEFAUT 2 - React.lazy montrait quand meme l'ecran d'attente, 300 ms.
 * ---------------------------------------------------------------------------
 * Le prechargement seul n'a PAS suffi, et la mesure le dit sans ambiguite :
 * meme morceau deja telecharge et deja evalue, la premiere ouverture de chaque
 * ecran coutait encore 505 ms, la deuxieme 209 ms. L'ecart, 300 ms, est a la
 * milliseconde pres le `FALLBACK_THROTTLE_MS` de React : des qu'un repli de
 * `Suspense` est affiche, React retarde la livraison du vrai contenu pour ne
 * pas le faire clignoter.
 *
 * Et ce repli s'affichait forcement : `lazy()` n'interroge sa fabrique qu'au
 * PREMIER RENDU. Que le module soit deja en memoire ne change rien, la
 * fabrique rend une promesse, le composant suspend, le repli est monte. Le
 * prechargement remplissait le cache du navigateur sans jamais reveiller
 * `lazy()`.
 *
 * Correction : `differer()` garde le module resolu dans une variable de
 * module, et rend le composant DIRECTEMENT quand il est la. Plus de promesse,
 * donc plus de suspension, donc plus de repli ni de bride de 300 ms. Si rien
 * n'a ete precharge - connexion econome, ecran ouvert par une URL directe -
 * on retombe sur le `lazy()` habituel : le comportement d'avant, jamais pire.
 *
 * ---------------------------------------------------------------------------
 * CE QUE CE MODULE NE FAIT PAS
 * ---------------------------------------------------------------------------
 * Il ne precharge que les cinq ecrans atteignables en UN appui depuis le hub.
 * Pas les quinze ecrans de jeu : ils sont plus gros, une soiree n'en ouvre que
 * quelques-uns, et les tirer tous annulerait le benefice du decoupage. Pas les
 * pages legales non plus - on les ouvre une fois, et jamais dans l'urgence.
 *
 * Il ne precharge rien sur une connexion econome : `saveData` et les reseaux
 * lents sont respectes. Precharger cinq morceaux sur un forfait compte pour
 * gagner une demi-seconde est un mauvais echange, et l'application se vend sur
 * « fonctionne hors ligne », pas sur « consomme votre forfait ».
 *
 * Rien de tout ceci n'entre dans le morceau de demarrage : ce sont des
 * `import()`, et la garde `check_entree` verifie qu'aucun contenu de jeu ne
 * part avant le premier pixel.
 */

export const [PalmaresScreen, prechargerPalmares] = differer(() =>
  import('@/components/screens/PalmaresScreen').then((m) => ({ default: m.PalmaresScreen }))
)
export const [CatalogueScreen, prechargerCatalogue] = differer(() =>
  import('@/components/screens/CatalogueScreen').then((m) => ({ default: m.CatalogueScreen }))
)
export const [SettingsScreen, prechargerReglages] = differer(() =>
  import('@/components/screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen }))
)
export const [CustomRulesScreen, prechargerReglesPerso] = differer(() =>
  import('@/components/screens/CustomRulesScreen').then((m) => ({ default: m.CustomRulesScreen }))
)
export const [RulesScreen, prechargerRegles] = differer(() =>
  import('@/components/screens/RulesScreen').then((m) => ({ default: m.RulesScreen }))
)

/** L'ordre suit la probabilite d'ouverture depuis le hub. */
const A_PRECHARGER = [
  prechargerPalmares,
  prechargerCatalogue,
  prechargerReglages,
  prechargerReglesPerso,
  prechargerRegles,
]

let dejaFait = false

interface ConnexionAllegee {
  saveData?: boolean
  effectiveType?: string
}

/** Vrai quand le navigateur annonce une connexion qu'il ne faut pas charger. */
function connexionEconome(): boolean {
  const nav = navigator as Navigator & { connection?: ConnexionAllegee }
  const c = nav.connection
  if (!c) return false
  if (c.saveData) return true
  return c.effectiveType === 'slow-2g' || c.effectiveType === '2g'
}

export function prechargerEcransDuMenu(): void {
  if (dejaFait || typeof window === 'undefined') return
  dejaFait = true
  if (connexionEconome()) return

  const lancer = () => {
    for (const precharger of A_PRECHARGER) void precharger()
  }

  const auRepos = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
    .requestIdleCallback
  if (auRepos) auRepos(lancer, { timeout: 3000 })
  else setTimeout(lancer, 1200)
}
