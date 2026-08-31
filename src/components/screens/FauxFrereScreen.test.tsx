import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { FauxFrereScreen } from './FauxFrereScreen'
import { useGameStore } from '@/stores'
import { DUOS_DE_MOTS } from '@/content/fauxFrere'

/**
 * Les trois defauts de cet ecran, releves le 2026-08-31 dans du code livre la
 * veille. Aucun n'etait visible du moteur, et c'est tout le sujet : les 16 tests
 * de `fauxFrereSession` passaient, le typecheck passait, le build passait, les
 * cinq gardes passaient. Ce qui etait faux, c'est ce que l'ECRAN donnait au
 * moteur, et ce qu'il faisait de sa reponse.
 *
 * 1. La graine etait `faux-frere-${numero de manche}` : rien n'y variait d'une
 *    soiree a l'autre, donc la manche 1 tirait toujours le meme duo et toujours
 *    le meme siege. Le mode mourait au deuxieme soir.
 * 2. `setPenalites` etait appele DANS l'updater de `setEtat`. Un updater doit
 *    etre pur, `StrictMode` les double-invoque, et l'addition comptait double.
 * 3. `onPointerLeave` marquait le mot vu sans qu'on ait appuye : un doigt qui
 *    effleure la carte en reprenant le telephone activait « Passer a X », et
 *    quelqu'un decouvrait au vote qu'il n'avait jamais eu son mot.
 */

const TABLE = [
  { id: 'p1', name: 'Alice', active: true },
  { id: 'p2', name: 'Bob', active: true },
  { id: 'p3', name: 'Chloe', active: true },
  { id: 'p4', name: 'David', active: true },
  { id: 'p5', name: 'Emma', active: true },
]

/** Le mot affiche pour le premier joueur, apres un appui MAINTENU reel. */
function motDuPremierJoueur(): string {
  const carte = screen.getByRole('button', { name: /appuyer et garder pour lire le mot/i })
  act(() => {
    carte.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
  })
  const mots = DUOS_DE_MOTS.flatMap((d) => [d.commun, d.imposteur])
  const affiche = mots.find((m) => screen.queryByText(m))
  if (!affiche) throw new Error('aucun mot du catalogue affiche apres appui')
  return affiche
}

describe('FauxFrereScreen', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('ne rejoue pas la meme partie a chaque soiree', () => {
    useGameStore.setState({ players: TABLE })

    // Vingt soirees, chacune un montage neuf - exactement ce que fait un joueur
    // qui rouvre l'application. Avant correction, les vingt rendaient le meme
    // mot, parce que la graine ne dependait que du numero de manche.
    const vus = new Set<string>()
    for (let i = 0; i < 20; i++) {
      render(<FauxFrereScreen />)
      vus.add(motDuPremierJoueur())
      cleanup()
    }

    expect(vus.size).toBeGreaterThan(1)
  })

  it('affiche le mot seulement apres un appui reel, jamais sur un simple survol', () => {
    useGameStore.setState({ players: TABLE })
    render(<FauxFrereScreen />)

    const carte = screen.getByRole('button', { name: /appuyer et garder pour lire le mot/i })

    // Un doigt qui traverse la zone pendant un defilement, ou une souris qui
    // survole : une sortie de pointeur SANS appui prealable.
    //
    // On passe par `pointerOut` avec un `relatedTarget` exterieur, et non par un
    // `pointerleave` fabrique a la main : `pointerleave` ne remonte pas, React
    // attache ses ecouteurs a la racine, et il SYNTHETISE `onPointerLeave` a
    // partir de `pointerout`. Un `pointerleave` disperse directement n'atteint
    // donc jamais le gestionnaire - le premier essai de ce test passait pour
    // cette raison, c'est-a-dire sans rien prouver.
    fireEvent.pointerOut(carte, { relatedTarget: document.body })

    // Le bouton existe toujours dans l'arbre, il est DESACTIVE tant que le mot
    // n'a pas ete vu. C'est cette desactivation qu'un effleurement levait a tort.
    expect(screen.getByRole('button', { name: /passer à|passer a/i })).toBeDisabled()
  })

  it('ouvre le passage au joueur suivant apres un appui puis un relachement', () => {
    useGameStore.setState({ players: TABLE })
    render(<FauxFrereScreen />)

    const carte = screen.getByRole('button', { name: /appuyer et garder pour lire le mot/i })
    act(() => {
      carte.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      carte.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    })

    expect(screen.getByRole('button', { name: /passer à|passer a/i })).toBeEnabled()
  })
})
