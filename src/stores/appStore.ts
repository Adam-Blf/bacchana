import { create } from 'zustand'
import type { AppScreen } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { bindNavigation, navBack, navHome, navPush, navReplace } from '@/core/navigation/history'
import { useSoireeStore } from '@/stores/soireeStore'
import { usePromptStore } from '@/stores/promptStore'

interface AppState {
  // Navigation
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen, opts?: { replace?: boolean }) => void
  goBack: () => void
  goToHub: () => void

  // Active mode - which entry of the mode registry is currently being played.
  // null while on welcome/hub/rules, or for the legacy default (Le Borderland).
  activeMode: GameMode | null
  setActiveMode: (mode: GameMode | null) => void

  // Mode dont les règles sont affichées par ModeRulesScreen - distinct de activeMode
  // car consultable depuis le hub avant même de lancer une partie.
  rulesMode: GameMode | null
  showModeRules: (mode: GameMode) => void

}

/**
 * Rien en cours, donc le geste de retour peut réellement fermer l'application.
 *
 * Sert la trappe de sortie de `history.ts`. Trois faits suffisent : on n'est
 * pas sur un écran de jeu, aucune soirée ne court, aucune session à prompts
 * n'est ouverte. Le premier couvre à lui seul les modes dont la session vit en
 * état local de composant - ils sont tous rendus sous l'écran `game`.
 */
export function peutQuitterApplication(): boolean {
  if (useAppStore.getState().currentScreen === 'game') return false
  if (useSoireeStore.getState().demarreeLe !== null) return false
  if (usePromptStore.getState().session !== null) return false
  return true
}

// Rien n'est persiste ici : chaque lancement demarre sur la saisie des joueurs, donc
// le middleware persist n'ecrivait qu'une cle localStorage vide a chaque navigation.
export const useAppStore = create<AppState>()(
  (set) => ({
      // Navigation - chaque lancement demarre sur la saisie des joueurs :
      // une ouverture d'app est une nouvelle tablee (decision 2026-08-02).
      currentScreen: 'welcome',
      navigateTo: (screen, opts) => (opts?.replace ? navReplace(screen) : navPush(screen)),
      goBack: () => navBack(),
      goToHub: () => navHome(),

      activeMode: null,
      setActiveMode: (mode) => set({ activeMode: mode }),

      rulesMode: null,
      showModeRules: (mode) => {
        set({ rulesMode: mode })
        navPush('mode-rules')
      },
  })
)

/**
 * Ou en etait l'application, pour y revenir apres un rechargement.
 *
 * Le reste de l'etat sait deja se reprendre - la tablee, la manche, la soiree,
 * l'ardoise. Il manquait l'ECRAN : au rechargement on repartait sur la saisie
 * des joueurs, avec une partie intacte en memoire que plus rien n'affichait.
 * L'utilisateur voyait donc exactement ce qu'il voyait avant qu'on ecrive quoi
 * que ce soit.
 *
 * Volontairement en localStorage direct, sans le middleware de persistance :
 * ce magasin n'est pas persiste, et lui ajouter le middleware pour deux champs
 * ferait aussi revivre l'ecran courant a la reouverture du lendemain - ce que
 * la regle du 2026-08-02 refuse.
 */
const CLE_REPRISE = 'bacchana-reprise'
const SEUIL_REPRISE_MS = 4 * 60 * 60 * 1000

interface Reprise {
  ecran: AppScreen
  mode: GameMode | null
  majLe: number
}

function ecrireReprise(): void {
  if (typeof localStorage === 'undefined') return
  const { currentScreen, activeMode } = useAppStore.getState()
  try {
    localStorage.setItem(
      CLE_REPRISE,
      JSON.stringify({ ecran: currentScreen, mode: activeMode, majLe: Date.now() }),
    )
  } catch {
    // Stockage refuse (navigation privee, quota) : la reprise est un confort,
    // jamais une garantie. On ne casse pas une soiree pour ca.
  }
}

/** L'ecran a reprendre, ou null s'il n'y a rien de frais a reprendre. */
export function lireReprise(maintenant: number = Date.now()): Reprise | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const brut = localStorage.getItem(CLE_REPRISE)
    if (!brut) return null
    const reprise = JSON.parse(brut) as Partial<Reprise>
    if (typeof reprise.ecran !== 'string' || typeof reprise.majLe !== 'number') return null
    if (maintenant - reprise.majLe >= SEUIL_REPRISE_MS) return null
    return { ecran: reprise.ecran, mode: reprise.mode ?? null, majLe: reprise.majLe }
  } catch {
    return null
  }
}

useAppStore.subscribe(ecrireReprise)

// All screen changes flow through the history layer, so the hardware back button
// and in-app navigation stay in sync.
bindNavigation({
  applyScreen: (screen) =>
    useAppStore.setState(
      screen === 'hub'
        ? { currentScreen: 'hub', activeMode: null }
        : { currentScreen: screen }
    ),
  getScreen: () => useAppStore.getState()?.currentScreen ?? 'hub',
  peutQuitter: () => peutQuitterApplication(),
})
