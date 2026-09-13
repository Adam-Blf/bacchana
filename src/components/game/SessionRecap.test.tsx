import { describe, expect, it, vi, beforeEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { SessionRecap } from './SessionRecap'
import { useNightStore } from '@/stores/nightStore'
import { usePartieStore } from '@/stores/partieStore'
import type { Player } from '@/types'

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}))

const players: Player[] = [
  { id: 'p1', name: 'Léa', drinksGorgees: 0, drinksShots: 0, active: true },
  { id: 'p2', name: 'Marco', drinksGorgees: 0, drinksShots: 0, active: true },
]

describe('SessionRecap - ardoise de la soirée', () => {
  beforeEach(() => {
    // Pas de fichier de setup global : le cleanup entre tests est manuel,
    // sinon le DOM du test précédent produit des matchs multiples.
    cleanup()
    useNightStore.getState().reset()
    // L'ardoise retient desormais QUE la partie a deja ete comptee, et ce
    // marqueur vit avec la manche : sans cette remise a zero, le second test
    // heriterait du marqueur pose par le premier et ne compterait rien.
    usePartieStore.getState().toutEffacer()
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
    useNightStore.getState().record('borderland', [
      { id: 'p1', name: 'Léa', total: 4 },
      { id: 'p2', name: 'Marco', total: 2 },
    ])

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
    expect(useNightStore.getState().ledger['p1'].total).toBe(7)
    expect(screen.getAllByText(/Ardoise de la soirée/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/parties - 2 jeu/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Léa mène l'ardoise de la soirée \(7\)/i)).toBeTruthy()
  })

  // Vue rouge avant le 2026-08-31 : l'ardoise etant desormais ecrite sur
  // l'appareil, recharger la page sur l'ecran d'addition remontait le meme
  // recap et ajoutait une SECONDE fois les memes penalites au cumul.
  it('ne compte la partie qu une fois, meme apres un rechargement', () => {
    const recap = (
      <SessionRecap
        players={players}
        penaltyCounts={{ p1: 3, p2: 1 }}
        mode="picolo"
        onReplay={() => {}}
        onQuit={() => {}}
      />
    )

    render(recap)
    expect(useNightStore.getState().gamesPlayed).toBe(1)

    // Le rechargement : meme ecran remonte, memes joueurs, meme mode.
    cleanup()
    render(recap)

    expect(useNightStore.getState().gamesPlayed).toBe(1)
    expect(useNightStore.getState().ledger['p1'].total).toBe(3)
  })

  // Vue rouge avant le 2026-08-31 : La Roue du Destin ne designe personne
  // nommement, elle passe des penalites vides. L'addition sortait une colonne
  // de zeros, un total a zero, et sacrait « champion de la tablee » le premier
  // de la liste - c'est-a-dire n'importe qui.
  it('se tait sur le score quand le mode ne compte rien', () => {
    render(
      <SessionRecap
        players={players}
        penaltyCounts={{}}
        mode="roulette"
        turns={5}
        onReplay={() => {}}
        onQuit={() => {}}
      />
    )

    expect(screen.queryByText(/palme de la tablée/i)).toBeNull()
    expect(screen.getByText(/aucune pénalité distribuée/i)).toBeTruthy()
    expect(screen.getByText(/tablée irréprochable/i)).toBeTruthy()
  })

  // Vue rouge avant le 2026-08-31 : rien ne gerait l'ex aequo, donc le titre
  // revenait au premier de la liste - c'est-a-dire a l'ordre de saisie des
  // prenoms. Et « est elu champion » etait fige au masculin, alors que
  // l'application demande le genre de chaque joueur au setup.
  it('annonce tous les ex aequo, sans accord de genre', () => {
    render(
      <SessionRecap
        players={players}
        penaltyCounts={{ p1: 4, p2: 4 }}
        mode="picolo"
        onReplay={() => {}}
        onQuit={() => {}}
      />
    )

    expect(screen.getByText(/raflent la palme de la tablée/i)).toBeTruthy()
    expect(screen.getByText(/Léa et Marco/)).toBeTruthy()
  })
})
