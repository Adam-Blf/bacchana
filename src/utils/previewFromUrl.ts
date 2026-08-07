/**
 * Ouvre un ecran precis depuis l'URL, pour l'import Figma et la revue design.
 *
 * L'application choisit son ecran depuis l'etat du magasin, pas depuis l'URL.
 * Un outil externe qui lit une page - un plugin d'import Figma, un service de
 * capture, un test visuel - ne pouvait donc atteindre que l'accueil. Ce module
 * seme l'etat minimal pour qu'une URL mene a n'importe quel ecran, avec les
 * composants REELS plutot qu'une maquette qui divergerait du code.
 *
 * Exemples :
 *   /?screen=hub
 *   /?screen=settings
 *   /?screen=game&mode=quiz
 *   /?screen=game&mode=borderland&players=Adam,Nawel,Emilien
 *
 * Sans parametre `screen`, rien ne s'execute.
 */
import type { AppScreen } from '@/types'

/**
 * Chemins publics des ecrans legaux, et l'ecran qu'ils ouvrent.
 *
 * POURQUOI CE TABLEAU EXISTE. Les fiches App Store et Google Play declarent
 * `/privacy` et `/support`. L'application etant une SPA, `vercel.json` reecrit
 * TOUTE URL inconnue vers `index.html` : ces deux liens repondaient donc 200 en
 * affichant l'ecran d'accueil du jeu, pas la politique de confidentialite. Un
 * lien qui repond 200 sur le mauvais contenu est plus traitre qu'un 404, et
 * c'est un motif de refus mecanique - Apple 5.1.1 et la Google Play User Data
 * policy exigent une politique reellement atteignable.
 *
 * Les chemins anglais sont ceux qu'attendent les boutiques, les francais sont
 * ceux que l'application utilise en interne. `/support` ouvre les mentions
 * legales, qui portent l'adresse de contact de l'editeur.
 */
const CHEMINS_LEGAUX: Readonly<Record<string, AppScreen>> = {
  '/privacy': 'confidentialite',
  '/confidentialite': 'confidentialite',
  '/terms': 'cgu',
  '/cgu': 'cgu',
  '/legal': 'mentions-legales',
  '/mentions-legales': 'mentions-legales',
  '/support': 'mentions-legales',
}

/**
 * Rend l'ecran legal correspondant a un chemin public, ou null.
 *
 * Compare en minuscules et sans barre oblique finale, pour que `/Privacy/` et
 * `/privacy` menent au meme endroit : un reviewer qui recopie une URL a la main
 * ne doit pas tomber sur le jeu parce qu'il a laisse une majuscule.
 */
export function lireCheminLegal(chemin: string): AppScreen | null {
  const normalise = chemin.toLowerCase().replace(/\/+$/, '') || '/'
  return CHEMINS_LEGAUX[normalise] ?? null
}

/** Ecrans ouvrables par URL. Liste CLOSE : une valeur inconnue est ignoree. */
const ECRANS: readonly AppScreen[] = [
  'onboarding',
  'welcome',
  'hub',
  'game',
  'rules',
  'mode-rules',
  'custom-rules',
  'settings',
  'mentions-legales',
  'confidentialite',
  'cgu',
] as const

/** Tablee par defaut : quatre joueurs, assez pour deverrouiller tous les modes. */
export const TABLEE_PAR_DEFAUT = ['Adam', 'Nawel', 'Emilien', 'Amina']

export interface DemandeApercu {
  ecran: AppScreen
  mode: string | null
  joueurs: string[]
}

/**
 * Lit la demande d'apercu dans une chaine de recherche.
 *
 * Pur et sans effet de bord, donc testable sans monter l'application. Rend
 * `null` quand rien n'est demande, ou quand l'ecran demande n'existe pas : on
 * ignore silencieusement plutot que de pousser une valeur inconnue dans le
 * magasin, ou l'application n'aurait aucun moyen de la rendre.
 */
export function lireApercu(recherche: string): DemandeApercu | null {
  const p = new URLSearchParams(recherche)
  const brut = p.get('screen')
  if (!brut) return null

  const ecran = ECRANS.find((e) => e === brut)
  if (!ecran) return null

  const joueursBruts = (p.get('players') ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)

  return {
    ecran,
    mode: p.get('mode'),
    // Une tablee vide bloquerait la plupart des ecrans sur leur etat "ajoutez
    // des joueurs", ce qui est justement l'etat qu'on ne veut PAS montrer par
    // defaut. On sert donc une tablee complete, sauf demande explicite.
    joueurs: joueursBruts.length ? joueursBruts : TABLEE_PAR_DEFAUT,
  }
}
