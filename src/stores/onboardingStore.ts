import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Premier lancement - un mini onboarding (3 panneaux) s'affiche une seule fois
 * avant l'écran d'accueil. `hasSeenIntro` persiste sur l'appareil (contrairement
 * à appStore qui repart de zéro à chaque ouverture) : on ne veut pas réafficher
 * l'intro à chaque nouvelle tablée.
 */
interface OnboardingState {
  hasSeenIntro: boolean
  /** Marque l'intro comme vue - skip ou fin des 3 panneaux, même effet. */
  complete: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenIntro: false,
      complete: () => set({ hasSeenIntro: true }),
    }),
    {
      name: 'bacchus-onboarding',
      partialize: (state) => ({ hasSeenIntro: state.hasSeenIntro }),
    }
  )
)
