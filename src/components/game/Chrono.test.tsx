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
    render(<Chrono secondes={7} cle="carte-1" />)
    expect(screen.getByRole('button', { name: /lancer les 7 secondes/i })).toBeInTheDocument()
  })

  // La lecture de la carte ne doit pas manger la manche : un chrono qui part au
  // montage a deja brule deux secondes quand le joueur comprend ce qu'on lui
  // demande.
  it('decompte a partir du geste, puis annonce la fin', () => {
    vi.useFakeTimers()
    render(<Chrono secondes={7} cle="carte-1" />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /lancer les 7 secondes/i }))
    })
    expect(screen.getByText('7')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.getByText('4')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(4000) })
    expect(screen.getByText(/temps écoulé/i)).toBeInTheDocument()
  })

  // Vue rouge sans la remise a zero sur `cle` : la carte suivante heritait du
  // chrono epuise de la precedente et affichait « temps ecoule » avant meme
  // qu'on l'ait lue.
  it('repart a l arret sur une nouvelle carte', () => {
    vi.useFakeTimers()
    const { rerender } = render(<Chrono secondes={7} cle="carte-1" />)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /lancer les 7 secondes/i }))
    })
    act(() => { vi.advanceTimersByTime(7000) })
    expect(screen.getByText(/temps écoulé/i)).toBeInTheDocument()

    rerender(<Chrono secondes={7} cle="carte-2" />)
    expect(screen.getByRole('button', { name: /lancer les 7 secondes/i })).toBeInTheDocument()
  })
})
