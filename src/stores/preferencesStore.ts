import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LONGUEUR_MANCHE_DEFAUT } from '@/core/engine/fraicheur'

/**
 * Les préférences de table - ce que la tablée règle une fois et qui vaut pour
 * tous les modes.
 *
 * `longueurManche` répond à un défaut concret : la pioche valait le paquet
 * entier, donc « Quitte ou Double » enchaînait ses 81 questions avant
 * d'afficher l'addition. Personne ne joue jusque-là, si bien que la manche ne
 * se terminait jamais autrement qu'en abandon et que l'écran de fin - donc
 * l'ardoise, donc la revanche - restait hors de portée.
 *
 * Zéro signifie « tout le paquet », et c'est un choix qui reste offert : une
 * longueur imposée serait le défaut inverse.
 */
interface PreferencesState {
  longueurManche: number
  setLongueurManche: (longueur: number) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      longueurManche: LONGUEUR_MANCHE_DEFAUT,
      setLongueurManche: (longueur) => set({ longueurManche: Math.max(0, Math.floor(longueur)) }),
    }),
    { name: 'bacchana-preferences' },
  ),
)
