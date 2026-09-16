import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { PalmaresScreen } from './PalmaresScreen'
import { usePalmaresStore } from '@/stores/palmaresStore'
import { useNightStore } from '@/stores/nightStore'

/**
 * Les trois defauts que la refonte du 2026-09-14 corrige. Chacun a son test,
 * parce que chacun se reintroduit tout seul a la premiere simplification :
 *
 *  1. un gros chiffre SANS NOM, sous un titre qui dit « palmares » et a cote
 *     d'un rang « 1 » - impossible de savoir si la premiere place se gagne ou
 *     se subit ;
 *  2. le CRITERE de classement invisible, qui fait passer deux « 19 » a des
 *     rangs differents pour un bogue d'affichage ;
 *  3. la soiree en cours introuvable : l'ardoise existait dans le magasin et ne
 *     s'affichait que sur l'addition de fin de partie.
 */

const PALMARES = {
  alice: { nom: 'Alice', parties: 7, penalites: 23, palmes: 2, modes: ['quiz' as const], derniereFois: Date.now() },
  bob: { nom: 'Bob', parties: 6, penalites: 19, palmes: 1, modes: ['quiz' as const], derniereFois: Date.now() },
  chloe: { nom: 'Chloé', parties: 5, penalites: 19, palmes: 3, modes: ['quiz' as const], derniereFois: Date.now() },
}

describe('l ecran des scores', () => {
  beforeEach(() => {
    usePalmaresStore.setState({ lignes: {} })
    useNightStore.setState({ ledger: {}, gamesPlayed: 0, modesPlayed: [] })
  })
  afterEach(cleanup)

  it('ouvre sur la soiree en cours quand il y en a une', () => {
    useNightStore.setState({
      ledger: { p1: { name: 'Léa', total: 5, games: 2 }, p2: { name: 'Marco', total: 2, games: 2 } },
      gamesPlayed: 2,
      modesPlayed: ['quiz'],
    })
    render(<PalmaresScreen />)
    expect(screen.getByRole('button', { name: /ce soir/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Léa')).toBeInTheDocument()
  })

  it('ouvre sur le palmares quand aucune soiree n est en cours', () => {
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    expect(screen.getByRole('button', { name: /toujours/i })).toHaveAttribute('aria-pressed', 'true')
  })

  // Defaut 1. Un nombre nu ne dit pas ce qu'il compte.
  //
  // MIS A JOUR le 2026-09-16 avec la feuille de marque. Le defaut d'origine
  // reste couvert - chaque colonne de chiffres est nommee - mais le libelle
  // s'imprime desormais UNE fois, en tete de colonne, et non sous chacun des
  // nombres. C'etait la version precedente qui imprimait « ARDOISE » et
  // « PALMES » trois fois chacun sur trois lignes, soit six mots pour deux
  // informations.
  it('nomme chaque colonne de chiffres, une seule fois', () => {
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    fireEvent.click(screen.getByRole('button', { name: /toujours/i }))
    expect(screen.getByRole('columnheader', { name: /^ardoise$/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /^palmes$/i })).toBeInTheDocument()
    expect(screen.getAllByText(/^ardoise$/i)).toHaveLength(1)
    expect(screen.getAllByText(/^palmes$/i)).toHaveLength(1)
  })

  // Une feuille de marque sans total n'est pas une feuille de marque : les
  // memes penalites etaient comptees ligne par ligne sans etre additionnees
  // nulle part, alors que le ticket de l'addition, lui, a toujours eu sa ligne
  // de total.
  it('additionne la feuille en bas de colonne', () => {
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    fireEvent.click(screen.getByRole('button', { name: /toujours/i }))
    const report = screen.getByRole('row', { name: /report/i })
    // 23 + 19 + 19 d'ardoise, 7 + 6 + 5 parties, 2 + 1 + 3 palmes.
    expect(within(report).getByText('61')).toBeInTheDocument()
    expect(within(report).getByText('18')).toBeInTheDocument()
    expect(within(report).getByText('6')).toBeInTheDocument()
  })

  // Defaut 2. Le critere etait applique sans jamais etre dit.
  it('ecrit la regle du classement', () => {
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    fireEvent.click(screen.getByRole('button', { name: /toujours/i }))
    expect(screen.getByText(/classé à l'ardoise/i)).toBeInTheDocument()
    expect(screen.getByText(/nombre de parties qui départage/i)).toBeInTheDocument()
  })

  // Deux « 19 » a des rangs differents : c'est voulu, et ce qui le justifie -
  // le nombre de parties - doit etre a l'ecran, sinon l'ecart passe pour un bogue.
  it('affiche le nombre de parties, qui est ce qui departage', () => {
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    fireEvent.click(screen.getByRole('button', { name: /toujours/i }))
    // Le nombre de parties a sa COLONNE depuis la feuille de marque : il se
    // lisait « 6 parties » sous chaque prenom, ce qui repetait le mot autant de
    // fois qu'il y avait de lignes.
    expect(screen.getByRole('columnheader', { name: /part\./i })).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /bob/i })).getByText('6')).toBeInTheDocument()
    expect(within(screen.getByRole('row', { name: /chloé/i })).getByText('5')).toBeInTheDocument()
  })

  it('marque les ex aequo du signe egal', () => {
    useNightStore.setState({
      ledger: { a: { name: 'Léa', total: 4, games: 2 }, b: { name: 'Marco', total: 4, games: 2 } },
      gamesPlayed: 2,
      modesPlayed: ['quiz'],
    })
    render(<PalmaresScreen />)
    expect(screen.getAllByText('=1')).toHaveLength(2)
  })

  // Tout vide, l'ecran s'ouvre sur « toujours » : c'est le registre qui a une
  // chance d'avoir du contenu, l'ardoise du soir n'existe qu'en cours de soiree.
  it('chaque registre a son etat vide, et ils ne disent pas la meme chose', () => {
    render(<PalmaresScreen />)
    expect(screen.getByText(/le registre est vierge/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /ce soir/i }))
    expect(screen.getByText(/la soirée n'a pas commencé/i)).toBeInTheDocument()
  })

  // Une carte qui a l'air d'un bouton et ne repond a rien passe pour un ecran
  // casse : l'ardoise du soir n'a rien a deplier, elle ne doit donc pas etre
  // cliquable. Le palmares, lui, a un detail a montrer.
  it('ne rend cliquable que les lignes qui menent quelque part', () => {
    useNightStore.setState({
      ledger: { a: { name: 'Léa', total: 4, games: 2 } },
      gamesPlayed: 2,
      modesPlayed: ['quiz'],
    })
    usePalmaresStore.setState({ lignes: PALMARES })
    render(<PalmaresScreen />)
    expect(screen.queryByRole('button', { name: /Léa/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /toujours/i }))
    expect(screen.getByRole('button', { name: /Alice/ })).toBeInTheDocument()
  })
})
