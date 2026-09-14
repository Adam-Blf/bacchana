import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'
import { useGameStore } from '@/stores'
import { usePartieStore } from '@/stores/partieStore'
import { useVuStore } from '@/stores/vuStore'
import { QuizScreen } from '@/components/screens/QuizScreen'
import { RankingScreen } from '@/components/screens/RankingScreen'
import { AuctionScreen } from '@/components/screens/AuctionScreen'
import { TribunalScreen } from '@/components/screens/TribunalScreen'
import { RouletteScreen } from '@/components/screens/RouletteScreen'
import { WouldYouRatherScreen } from '@/components/screens/WouldYouRatherScreen'
import { BarometreScreen } from '@/components/screens/BarometreScreen'
import { FauxFrereScreen } from '@/components/screens/FauxFrereScreen'

/**
 * « Quitter en cours de partie passe par l'addition », vérifié sur TOUS les
 * modes, et pas sur ceux qui y ont pensé.
 *
 * Le défaut, mesuré le 2026-09-13 : la règle était appliquée par trois écrans
 * sur huit. Quitte ou Double, Le Tableau d'Honneur et Le Baromètre portaient
 * chacun leur propre état `quitting` ; Le Pilori, La Criée, La Roue, Tu
 * préfères et Le Faux Frère rendaient la main au hub directement. Leurs parties
 * ne touchaient donc ni l'ardoise de la soirée ni l'évènement
 * `session_completed` - elles disparaissaient sans laisser de trace, ce qui
 * fausse aussi le palmarès qui s'en nourrit.
 *
 * Rien dans la chaîne ne le signalait : le typecheck passait, les tests
 * passaient, les gardes passaient. Une règle sans garde tient tant que
 * quelqu'un s'en souvient.
 *
 * Le test est paramétré pour que le prochain mode ajouté au tableau soit
 * couvert sans rien écrire de plus.
 */

const TABLE = [
  { id: 'p1', name: 'Alice', active: true },
  { id: 'p2', name: 'Bob', active: true },
  { id: 'p3', name: 'Chloé', active: true },
  { id: 'p4', name: 'David', active: true },
  { id: 'p5', name: 'Emma', active: true },
]

/** Les écrans de mode à logique embarquée, avec le libellé de leur sortie. */
const ECRANS: [string, ComponentType, RegExp][] = [
  ['Quitte ou Double', QuizScreen, /quitter le quiz/i],
  ["Le Tableau d'Honneur", RankingScreen, /quitter le podium/i],
  ['La Criée', AuctionScreen, /quitter l'enchère/i],
  ['Le Pilori', TribunalScreen, /quitter le procès/i],
  ['La Roue du Destin', RouletteScreen, /quitter la roulette/i],
  ['Tu préfères', WouldYouRatherScreen, /quitter tu préfères/i],
  ['Le Baromètre', BarometreScreen, /quitter le baromètre/i],
  ['Le Faux Frère', FauxFrereScreen, /quitter le faux frère/i],
]

describe('EcranDeMode - quitter passe par l\'addition', () => {
  afterEach(cleanup)

  it.each(ECRANS)('%s', async (_titre, Ecran, sortie) => {
    // Manche neuve : un instantané laissé par un test précédent reprendrait une
    // partie déjà finie, et l'addition s'afficherait pour la mauvaise raison.
    usePartieStore.getState().toutEffacer()
    useVuStore.getState().oublierTout()
    useGameStore.setState({ players: TABLE })

    render(<Ecran />)
    fireEvent.click(screen.getByRole('button', { name: sortie }))

    await waitFor(() => expect(screen.getByText(/merci de votre visite/i)).toBeInTheDocument())
  })
})
