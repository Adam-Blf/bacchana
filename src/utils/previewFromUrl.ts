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
 *   /?screen=game&mode=coupeGorge&players=Adam,Nawel,Emilien
 *
 * Sans parametre `screen`, rien ne s'execute.
 */
import type { AppScreen } from '@/types'

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
