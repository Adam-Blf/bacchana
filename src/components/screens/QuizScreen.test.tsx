import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useGameStore } from '@/stores'
import { usePartieStore } from '@/stores/partieStore'
import { useVuStore } from '@/stores/vuStore'
import { QuizScreen } from './QuizScreen'

const TABLE = [
  { id: 'p1', name: 'Alice', active: true },
  { id: 'p2', name: 'Bob', active: true },
]

/**
 * Le défaut, signalé par Adam le 2026-10-09 : après « Je distribue », le bouton
 * « Bonne réponse » du joueur suivant apparaissait sous le même doigt, et un
 * double tap créditait sa cagnotte sans qu'il ait vu sa question.
 */
describe('QuizScreen - on ne juge pas une réponse avant de l\'avoir vue', () => {
  afterEach(cleanup)

  it('verrouille Raté et Bonne réponse tant que la réponse est cachée', () => {
    usePartieStore.getState().toutEffacer()
    useVuStore.getState().oublierTout()
    useGameStore.setState({ players: TABLE })

    render(<QuizScreen />)
    const bonne = screen.getByRole('button', { name: /bonne réponse/i })
    expect(bonne).toBeDisabled()
    expect(screen.getByRole('button', { name: /raté/i })).toBeDisabled()

    fireEvent.click(bonne)
    expect(screen.getByText(/cagnotte : 0/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /voir la réponse/i }))
    expect(screen.getByRole('button', { name: /bonne réponse/i })).toBeEnabled()
  })
})
