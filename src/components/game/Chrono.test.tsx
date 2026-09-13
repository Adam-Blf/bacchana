import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Chrono } from './Chrono'

describe('Chrono', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('attend un geste avant de partir', () => {
    render(<Chrono secondes={7} />)
    expect(screen.getByRole('button', { name: /lancer les 7 secondes/i })).toBeInTheDocument()
  })

  // La lecture de la carte ne doit pas manger la manche : un chrono qui part au
  // montage a deja brule deux secondes quand le joueur comprend ce qu'on lui
  // demande.
  it('decompte a partir du geste, puis annonce la fin', () => {
    vi.useFakeTimers()
    render(<Chrono secondes={7} />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /lancer les 7 secondes/i }))
    })
    expect(screen.getByText('7')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByText('4')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByText(/temps écoulé/i)).toBeInTheDocument()
  })

  // Une carte suivante REMONTE le chrono - c'est l'appelant qui lui donne une
  // `key` liee a la carte. Sans ce remontage, la carte suivante heriterait du
  // chrono epuise de la precedente et afficherait « temps ecoule » avant meme
  // qu'on l'ait lue.
  it('repart a l arret quand il est remonte', () => {
    vi.useFakeTimers()
    render(<Chrono key="carte-1" secondes={7} />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /lancer les 7 secondes/i }))
    })
    act(() => { vi.advanceTimersByTime(7000) })
    expect(screen.getByText(/temps écoulé/i)).toBeInTheDocument()

    // `rerender` ne remonte pas : on nettoie et on rend a neuf, ce que React
    // fait quand la `key` change.
    cleanup()
    render(<Chrono key="carte-2" secondes={7} />)
    expect(screen.getByRole('button', { name: /lancer les 7 secondes/i })).toBeInTheDocument()
  })
})
