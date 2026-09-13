import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { BarometreScreen } from './BarometreScreen'
import { useGameStore } from '@/stores'
import { usePartieStore } from '@/stores/partieStore'
import { useVuStore } from '@/stores/vuStore'
import { ECART_PLEIN_CENTRE } from '@/core/engine/barometreSession'

/**
 * Ce que le MOTEUR ne peut pas prouver.
 *
 * `barometreSession` est pur et testé, mais le défaut du 2026-08-31 sur Le Faux
 * Frère est né exactement là : les tests du moteur passaient, le typecheck
 * passait, le build passait, et l'écran donnait quand même n'importe quoi au
 * moteur. Ce corpus-ci ne reteste donc pas les pénalités - il vérifie le
 * CÂBLAGE : que la cible reste cachée tant que le téléphone n'est pas revenu,
 * que le curseur remonte bien jusqu'au moteur, et qu'une manche finie mène à
 * l'addition plutôt qu'à un écran mort.
 *
 * Tout y est ASYNCHRONE, et ce n'est pas de la prudence : l'écran fait sortir
 * une phase avant d'entrer la suivante (`AnimatePresence mode="wait"`), donc le
 * rendu qui suit immédiatement un clic montre encore la phase précédente. Un
 * test écrit en synchrone échouerait en décrivant un défaut qui n'existe pas.
 */

const TABLE = [
  { id: 'p1', name: 'Alice', active: true },
  { id: 'p2', name: 'Bob', active: true },
  { id: 'p3', name: 'Chloé', active: true },
]

/** L'écran repart d'une manche neuve : sinon l'instantané d'un test précédent est repris. */
function monter() {
  usePartieStore.getState().toutEffacer()
  useVuStore.getState().oublierTout()
  useGameStore.setState({ players: TABLE })
  return render(<BarometreScreen />)
}

/** Clique un bouton et attend que la phase suivante soit réellement à l'écran. */
async function avancer(bouton: RegExp, attendu: RegExp) {
  fireEvent.click(screen.getByRole('button', { name: bouton }))
  await screen.findByText(attendu)
}

/** Amène l'écran jusqu'à la visée et rend le curseur. */
async function allerJusquALaVisee(): Promise<HTMLInputElement> {
  await avancer(/j'ai le téléphone/i, /cible secrète/i)
  await avancer(/mon mot est lâché/i, /cible verrouillée/i)
  fireEvent.click(screen.getByRole('button', { name: /le téléphone est au centre/i }))
  return (await screen.findByRole('slider')) as HTMLInputElement
}

describe('BarometreScreen', () => {
  afterEach(cleanup)

  it('ouvre sur le passage du téléphone au premier aiguilleur', () => {
    monter()
    expect(screen.getByText(/passe le téléphone à alice/i)).toBeInTheDocument()
  })

  it('ne montre la cible qu\'à l\'aiguilleur, jamais à la tablée qui vise', async () => {
    monter()
    await allerJusquALaVisee()
    // La phase de visée n'annonce la cible nulle part : c'est tout le jeu.
    expect(screen.queryByText(/cible secrète/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/cible à \d+/i)).not.toBeInTheDocument()
  })

  it('fait remonter le curseur jusqu\'au moteur, et le verdict jusqu\'à l\'écran', async () => {
    monter()
    const curseur = await allerJusquALaVisee()
    fireEvent.change(curseur, { target: { value: '73' } })
    expect(curseur.value).toBe('73')

    // Le verdict affiche les deux positions : sans le câblage du curseur,
    // l'aiguille serait restée à son point de départ.
    await avancer(/verrouiller l'aiguille/i, /aiguille à 73/i)
  })

  it('offre la manche suivante une fois le verdict tombé', async () => {
    monter()
    const curseur = await allerJusquALaVisee()
    fireEvent.change(curseur, { target: { value: '50' } })
    await avancer(/verrouiller l'aiguille/i, /aiguille à 50/i)

    // Le rôle tourne : c'est Bob qui prend le téléphone.
    await avancer(/manche suivante/i, /passe le téléphone à bob/i)
    expect(screen.getByText(/manche 2/i)).toBeInTheDocument()
  })

  it('passe par l\'addition quand la tablée quitte en cours de partie', async () => {
    monter()
    fireEvent.click(screen.getByRole('button', { name: /quitter le baromètre/i }))
    await waitFor(() => expect(screen.getByText(/merci de votre visite/i)).toBeInTheDocument())
  })

  it('garde la zone de plein centre à la largeur promise par le moteur', async () => {
    // La zone peinte pour l'aiguilleur EST la règle du jeu : si elle ne
    // correspond pas à la tolérance du moteur, le mot est visé sur une
    // promesse fausse. On lit donc la largeur réellement rendue.
    const { container } = monter()
    await avancer(/j'ai le téléphone/i, /cible secrète/i)
    const zone = container.querySelector('.bg-aplat-1') as HTMLElement
    expect(zone).toBeTruthy()
    expect(parseFloat(zone.style.width)).toBe(2 * ECART_PLEIN_CENTRE)
  })
})
