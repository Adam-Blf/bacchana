import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { CatalogueScreen } from './CatalogueScreen'
import { useGameStore } from '@/stores'
import { PLAYABLE_MODES, ouvertureDeTablee } from '@/core/engine/modeRegistry'

/**
 * Le trou que cet ecran bouche : le hub n'affiche pas un mode que la tablee ne
 * peut pas lancer, donc a deux joueurs six jeux n'existaient NULLE PART - ni
 * grises, ni annonces, absents. Ces tests exigent qu'ils soient tous la, y
 * compris fermes, et que la condition soit ecrite.
 */
describe('le catalogue des jeux', () => {
  beforeEach(() => useGameStore.setState({ players: [] }))
  afterEach(cleanup)

  const tablee = (n: number) =>
    useGameStore.setState({
      players: Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `J${i}`, penalties: 0, active: true })),
    })

  it('montre TOUS les jeux, meme ceux que la tablee ne peut pas lancer', () => {
    tablee(2)
    render(<CatalogueScreen />)
    for (const mode of PLAYABLE_MODES) {
      expect(screen.getByText(mode.title)).toBeInTheDocument()
    }
  })

  it('marque comme ferme exactement ce que la tablee ne peut pas lancer', () => {
    tablee(2)
    render(<CatalogueScreen />)
    const { ouverts, total } = ouvertureDeTablee(2)
    expect(screen.getAllByText(/^Fermé -/).length).toBe(total - ouverts)
    expect(screen.getAllByText(/^Ouvert -/).length).toBe(ouverts)
  })

  it('a la tablee complete, plus rien n est ferme', () => {
    const { seuilComplet, total } = ouvertureDeTablee(0)
    tablee(seuilComplet)
    render(<CatalogueScreen />)
    expect(screen.queryByText(/^Fermé -/)).toBeNull()
    expect(screen.getAllByText(/^Ouvert -/).length).toBe(total)
  })

  // Un jeu ferme doit rester ATTEIGNABLE : c'est precisement celui dont on veut
  // lire les regles pour decider s'il vaut le coup d'appeler quelqu'un.
  it('laisse ouvrir les regles d un jeu ferme', () => {
    tablee(2)
    render(<CatalogueScreen />)
    const fermes = PLAYABLE_MODES.filter((m) => m.minPlayers > 2)
    expect(fermes.length).toBeGreaterThan(0)
    for (const mode of fermes) {
      expect(
        screen.getByRole('button', { name: new RegExp(`Règles de ${mode.title}`, 'i') }),
      ).toBeEnabled()
    }
  })

  it('annonce le seuil qui ouvre tout', () => {
    tablee(2)
    render(<CatalogueScreen />)
    const { seuilComplet } = ouvertureDeTablee(2)
    expect(screen.getByText(new RegExp(`il en faut ${seuilComplet} pour tout ouvrir`, 'i'))).toBeInTheDocument()
  })
})
