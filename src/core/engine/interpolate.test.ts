import { describe, expect, it, vi, afterEach } from 'vitest'
import { interpolate } from './interpolate'
import { createPlayer } from '@/core/borderland'

describe('interpolate', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('replaces {player} with the current player name', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const result = interpolate('{player}, fais 10 pompes', [alice, bob], alice)
    expect(result).toBe('Alice, fais 10 pompes')
  })

  it('replaces every occurrence of {player}', () => {
    const alice = createPlayer('Alice')
    const result = interpolate('{player} regarde {player}', [alice], alice)
    expect(result).toBe('Alice regarde Alice')
  })

  it('replaces {player2} with a distinct active player', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const result = interpolate('{player} et {player2}', [alice, bob], alice)
    expect(result).toBe('Alice et Bob')
  })

  it('never picks the current player for {player2} when others exist', () => {
    const alice = createPlayer('Alice')
    const bob = createPlayer('Bob')
    const carol = createPlayer('Carol')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = interpolate('{player2}', [alice, bob, carol], alice)
    expect(result).not.toBe('Alice')
    expect(['Bob', 'Carol']).toContain(result)
  })

  it('ignores inactive players when picking {player2}', () => {
    const alice = createPlayer('Alice')
    const bob = { ...createPlayer('Bob'), active: false }
    const carol = createPlayer('Carol')
    const result = interpolate('{player2}', [alice, bob, carol], alice)
    expect(result).toBe('Carol')
  })

  it('falls back to the current player when nobody else is available', () => {
    const alice = createPlayer('Alice')
    const result = interpolate('{player2}', [alice], alice)
    expect(result).toBe('Alice')
  })

  it('leaves text without placeholders untouched', () => {
    const alice = createPlayer('Alice')
    expect(interpolate('Rafale générale, tout le monde applaudit', [alice], alice)).toBe(
      'Rafale générale, tout le monde applaudit'
    )
  })

  /**
   * Les marqueurs en crochets remplacent les accolades dans l'editeur. Les
   * tests ci-dessus, qui emploient tous l'ancienne forme, valent donc aussi
   * comme garde de RETROCOMPATIBILITE : les regles deja enregistrees sur les
   * telephones des joueurs continuent d'etre comprises. S'ils passent au rouge
   * un jour, c'est que quelqu'un aura retire ce repli, et des regles ecrites
   * avant aujourd'hui seront lues a table avec leurs accolades.
   */
  describe('marqueurs lisibles', () => {
    it('remplace [le joueur] par le joueur du tour', () => {
      const alice = createPlayer('Alice')
      const bob = createPlayer('Bob')
      expect(interpolate('[le joueur], fais 10 pompes', [alice, bob], alice)).toBe(
        'Alice, fais 10 pompes'
      )
    })

    it('remplace [un autre] par un autre joueur actif', () => {
      const alice = createPlayer('Alice')
      const bob = createPlayer('Bob')
      expect(interpolate('[le joueur] et [un autre]', [alice, bob], alice)).toBe('Alice et Bob')
    })

    it('remplace toutes les occurrences', () => {
      const alice = createPlayer('Alice')
      expect(interpolate('[le joueur] regarde [le joueur]', [alice], alice)).toBe(
        'Alice regarde Alice'
      )
    })

    it('accepte les deux formes dans une meme phrase, le temps de la transition', () => {
      const alice = createPlayer('Alice')
      const bob = createPlayer('Bob')
      expect(interpolate('[le joueur] defie {player2}', [alice, bob], alice)).toBe(
        'Alice defie Bob'
      )
    })

    it('laisse intact un crochet qui n est pas un marqueur', () => {
      const alice = createPlayer('Alice')
      expect(interpolate('Cite un film [pas une serie]', [alice], alice)).toBe(
        'Cite un film [pas une serie]'
      )
    })
  })
})
