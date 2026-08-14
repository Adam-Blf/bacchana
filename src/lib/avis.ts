/**
 * Ou envoyer quelqu'un qui accepte de noter Bacchana.
 *
 * POURQUOI CE N'EST PAS UNE CONSTANTE EN DUR
 * ------------------------------------------
 * Les fiches store n'existent pas encore : ni l'identifiant Play, ni l'identifiant
 * App Store ne sont attribues tant que l'application n'est pas soumise. Ecrire une
 * URL plausible maintenant produirait un bouton qui mene a une page d'erreur, ce qui
 * est pire que pas de bouton du tout - on aurait depense la seule demande de note
 * qu'on s'autorise a poser pour envoyer la tablee dans le vide.
 *
 * Les liens arrivent donc par la configuration. Tant qu'ils sont absents, la demande
 * ne s'affiche pas (voir `DemandeAvis`), et l'application se comporte normalement :
 * degradation gracieuse, jamais de crash ni de lien mort.
 *
 * Sur le web il n'y a pas de fiche a noter. `VITE_STORE_URL_WEB` reste donc
 * volontairement vide en general, et la demande n'apparait tout simplement pas.
 */

const LIEN_ANDROID = import.meta.env.VITE_STORE_URL_ANDROID as string | undefined
const LIEN_IOS = import.meta.env.VITE_STORE_URL_IOS as string | undefined
const LIEN_WEB = import.meta.env.VITE_STORE_URL_WEB as string | undefined

/** La famille de plateforme, deduite de l'agent utilisateur. */
export type Plateforme = 'ios' | 'android' | 'web'

/**
 * Fonction pure, `userAgent` en parametre pour se tester sans toucher a `navigator`.
 *
 * iPadOS se declare en « Macintosh » depuis iOS 13 : la presence d'un ecran tactile
 * est ce qui le distingue d'un vrai Mac, d'ou le second parametre. Un Mac renvoie
 * « web », ce qui est correct - la PWA y tourne dans un navigateur.
 */
export function detecterPlateforme(userAgent: string, tactile = false): Plateforme {
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  if (/macintosh/i.test(userAgent) && tactile) return 'ios'
  return 'web'
}

/** Le lien configure pour une plateforme, ou null s'il n'y en a pas. */
export function lienAvisPour(plateforme: Plateforme): string | null {
  const lien = plateforme === 'android' ? LIEN_ANDROID : plateforme === 'ios' ? LIEN_IOS : LIEN_WEB
  // Une variable d'environnement absente vaut la chaine vide apres substitution :
  // la traiter comme non configuree, sinon on ouvre un onglet vide.
  return lien && lien.trim().length > 0 ? lien : null
}

/** Le lien pour l'appareil courant, ou null. Sans lien, aucune demande n'est posee. */
export function lienAvis(): string | null {
  if (typeof navigator === 'undefined') return null
  return lienAvisPour(detecterPlateforme(navigator.userAgent, navigator.maxTouchPoints > 1))
}
