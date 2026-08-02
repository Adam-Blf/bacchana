import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { SessionRecap } from './SessionRecap'
import { useNightStore } from '@/stores/nightStore'
import type { Player } from '@/types'

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}))

const players: Player[] = [
  { id: 'p1', name: 'Léa', drinksGorgees: 0, drinksShots: 0 },
  { id: 'p2', name: 'Marco', drinksGorgees: 0, drinksShots: 0 },
]

describe('SessionRecap - ardoise de la soirée', () => {
  beforeEach(() => {
    // Pas de fichier de setup global : le cleanup entre tests est manuel,
    // sinon le DOM du test précédent produit des matchs multiples.
    cleanup()
    useNightStore.getState().reset()
  })

  it('hides the night ledger on the first finished game', () => {
    render(
      <SessionRecap
        players={players}
        penaltyCounts={{ p1: 3, p2: 1 }}
        mode="picolo"
        onReplay={() => {}}
        onQuit={() => {}}
      />
    )
    // Le mount vient d'enregistrer la 1re partie : pas encore de cumul affiché.
    expect(useNightStore.getState().gamesPlayed).toBe(1)
    expect(screen.queryByText(/Ardoise de la soirée/i)).toBeNull()
  })

  it('shows the cross-game ledger from the second game on', () => {
    // Une partie précédente (autre jeu) est déjà sur l'ardoise.
    useNightStore.getState().record('borderland', { Léa: 4, Marco: 2 })

    render(
      <SessionRecap
        players={players}
        penaltyCounts={{ p1: 3, p2: 1 }}
        mode="picolo"
        onReplay={() => {}}
        onQuit={() => {}}
      />
    )

    expect(useNightStore.getState().gamesPlayed).toBe(2)
    expect(useNightStore.getState().ledger['Léa'].total).toBe(7)
    expect(screen.getAllByText(/Ardoise de la soirée/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/parties - 2 jeu/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Léa mène l'ardoise de la soirée \(7\)/i)).toBeTruthy()
  })
})
