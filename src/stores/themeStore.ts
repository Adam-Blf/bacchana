import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Thème de Bacchana. « system » suit prefers-color-scheme et réagit en direct
 * au changement d'OS ; le choix explicite est persisté sur l'appareil.
 * L'application se fait via [data-theme] sur <html>, consommé par tokens.css.
 *
 * `daltonien` est le troisième mode de la collection Figma. Il existait dans
 * tokens.css depuis le 2026-08-30 mais AUCUN chemin ne pouvait le poser :
 * un thème présent dans la feuille de style et absent du type est un thème
 * mort, et il se relit comme une fonctionnalité livrée.
 */
export type ThemePreference = 'system' | 'light' | 'dark' | 'daltonien'
export type ThemeResolved = 'light' | 'dark' | 'daltonien'

/**
 * Repli, et repli SEULEMENT.
 *
 * La valeur qui fait foi est le `--color-bg` réellement calculé sur <html> :
 * la barre système d'Android peint cette couleur, et une table figée ici
 * diverge à la première retouche de tokens.css. C'est exactement ce qui s'est
 * produit - la table annonçait #141216 pour le thème sombre alors que le fond
 * vaut le pourpre #5B2C87 depuis le passage à « Tirage de nuit », ce qui
 * dessinait une barre presque noire au-dessus et au-dessous d'une application
 * pourpre. Cette table ne sert donc plus qu'aux environnements sans mise en
 * page (tests jsdom), où rien n'est calculé.
 */
const REPLI_COULEUR: Record<ThemeResolved, string> = {
  light: '#fff9f0',
  dark: '#5b2c87',
  daltonien: '#3d1c5c',
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(preference: ThemePreference): ThemeResolved {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

/**
 * La couleur de fond RÉELLE du thème posé, lue sur l'élément qui la porte.
 * Rend le repli quand la feuille de style n'est pas calculée (jsdom).
 */
export function couleurDeFond(resolved: ThemeResolved): string {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return REPLI_COULEUR[resolved]
  }
  const calculee = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  return calculee.length > 0 ? calculee : REPLI_COULEUR[resolved]
}

function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(preference)
  document.documentElement.dataset.theme = resolved
  // Lue APRÈS avoir posé data-theme : c'est le nouveau thème qu'on mesure.
  const fond = couleurDeFond(resolved)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', fond)
  // La barre système d'Android en mode plein cadre peint le fond de <html>,
  // pas celui de <body> : sans cette ligne, les zones mortes au-dessus et
  // au-dessous de l'application gardent le blanc par défaut du navigateur.
  document.documentElement.style.backgroundColor = fond
}

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  /** Bascule simple clair/sombre depuis le thème effectif courant. */
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (preference) => {
        applyTheme(preference)
        set({ preference })
      },
      toggle: () => {
        // Le daltonien n'est pas un cran de la bascule clair/sombre : il se
        // choisit dans les réglages et se quitte par le même chemin. Une
        // bascule qui l'écraserait le rendrait impossible à garder.
        const next = resolveTheme(get().preference) === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ preference: next })
      },
    }),
    {
      name: 'bacchana-theme',
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.preference ?? 'system')
      },
    }
  )
)

// Premier rendu avant réhydratation, et suivi du thème OS en mode « system ».
if (typeof window !== 'undefined') {
  applyTheme(useThemeStore.getState().preference)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { preference } = useThemeStore.getState()
    if (preference === 'system') applyTheme(preference)
  })
}
