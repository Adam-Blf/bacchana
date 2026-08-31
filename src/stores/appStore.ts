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
