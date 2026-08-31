import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { WelcomeScreen } from './WelcomeScreen'
import { useGameStore } from '@/stores'

describe('WelcomeScreen - chaises sans nom', () => {
  beforeEach(() => {
    useGameStore.setState({ players: [] })
  })
  afterEach(cleanup)

  // Vue rouge avant le 2026-08-31 : une case laissee vide etait silencieusement
  // jetee. On poussait la porte avec trois noms sur quatre chaises, et le
  // quatrieme joueur n'existait pas de la soiree - sans qu'un seul mot le dise,
  // alors que c'est bien plus souvent un oubli de frappe qu'un retrait voulu.
  it('avertit avant de partir avec une chaise vide', () => {
    render(<WelcomeScreen />)

    const champs = screen.getAllByRole('textbox')
    fireEvent.change(champs[0], { target: { value: 'Léa' } })
    fireEvent.change(champs[1], { target: { value: 'Marco' } })

    fireEvent.click(screen.getByRole('button', { name: /une chaise de plus/i }))
    fireEvent.click(screen.getByRole('button', { name: /pousser la porte/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/chaise est restée sans nom/i)
    // Rien n'est parti : le premier appui avertit, il ne valide pas.
    expect(useGameStore.getState().players).toHaveLength(0)
  })

  it('laisse passer au second appui, et le dit dans le libelle', () => {
    render(<WelcomeScreen />)

    const champs = screen.getAllByRole('textbox')
    fireEvent.change(champs[0], { target: { value: 'Léa' } })
    fireEvent.change(champs[1], { target: { value: 'Marco' } })
    fireEvent.click(screen.getByRole('button', { name: /une chaise de plus/i }))

    fireEvent.click(screen.getByRole('button', { name: /pousser la porte/i }))
    fireEvent.click(screen.getByRole('button', { name: /continuer sans eux/i }))

    expect(useGameStore.getState().players.map((p) => p.name)).toEqual(['Léa', 'Marco'])
  })

  it('retire les chaises vides sur demande', async () => {
    render(<WelcomeScreen />)

    const champs = screen.getAllByRole('textbox')
    fireEvent.change(champs[0], { target: { value: 'Léa' } })
    fireEvent.change(champs[1], { target: { value: 'Marco' } })
    fireEvent.click(screen.getByRole('button', { name: /une chaise de plus/i }))
    fireEvent.click(screen.getByRole('button', { name: /pousser la porte/i }))

    fireEvent.click(screen.getByRole('button', { name: /retirer cette chaise/i }))

    expect(screen.queryByRole('alert')).toBeNull()
    // `waitFor` et non une assertion seche : la ligne retiree reste dans le DOM
    // le temps de son animation de sortie (AnimatePresence), et l'assertion
    // synchrone la comptait encore.
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(2))
  })
})
