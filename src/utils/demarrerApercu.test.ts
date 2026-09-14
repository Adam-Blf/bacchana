/**
 * Le pont d'apercu menait a l'accueil pour sept des quinze jeux, sans erreur ni
 * message : il posait le mode actif et poussait l'ecran de jeu, mais la partie
 * n'existait pas et l'ecran renvoyait d'ou il venait. Un audit visuel mene avec
 * ce pont validait donc l'accueil en croyant regarder un jeu.
 *
 * Ce test parcourt le REGISTRE, pas une liste : un seizieme mode ajoute demain
 * est couvert le jour ou il est declare, et c'est tout l'interet - le defaut
 * d'origine venait justement d'un chemin qui ne connaissait que trois modes.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { MODE_REGISTRY } from '@/core/engine/modeRegistry'
import type { GameMode } from '@/core/engine/types'
import { demarrerPourApercu, formeDeLancement } from './demarrerApercu'
import { useGameStore, usePromptStore } from '@/stores'

const TABLEE = ['Alice', 'Bob', 'Chloé', 'Dimitri']
const MODES = Object.keys(MODE_REGISTRY) as GameMode[]

describe('le pont d apercu demarre vraiment la partie', () => {
  beforeEach(() => {
    useGameStore.getState().setPlayers(TABLEE)
  })

  it('couvre tous les modes du registre', () => {
    expect(MODES.length).toBeGreaterThanOrEqual(15)
  })

  it.each(MODES)('%s : le lancement aboutit', async (mode) => {
    await expect(demarrerPourApercu(mode, useGameStore.getState().players)).resolves.toBe(true)
  })

  it.each(MODES.filter((m) => formeDeLancement(m) === 'paquet'))(
    '%s : une pioche de consignes existe apres le lancement',
    async (mode) => {
      await demarrerPourApercu(mode, useGameStore.getState().players)
      const { session, packTitle } = usePromptStore.getState()
      expect(session).not.toBeNull()
      expect(session?.mode).toBe(mode)
      expect(packTitle).toBeTruthy()
      // Sans consigne a l'ecran, le mode n'a rien a afficher et repart au hub :
      // c'est exactement l'etat qui rendait une capture propre du mauvais ecran.
      expect(session?.currentItem).toBeTruthy()
    },
  )

  it('borderland distribue un paquet de cartes', async () => {
    await demarrerPourApercu('borderland', useGameStore.getState().players)
    expect(useGameStore.getState().deck.length).toBeGreaterThan(0)
  })
})
