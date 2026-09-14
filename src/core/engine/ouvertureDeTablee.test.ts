/**
 * Le seuil qui ouvre tout se CALCULE. Un texte d'accueil qui recopie « quatre »
 * en dur ment le jour ou un seizieme mode en demande cinq, et personne ne le
 * verra : l'accueil continuera d'annoncer un catalogue complet qui ne l'est plus.
 */
import { describe, it, expect } from 'vitest'
import { PLAYABLE_MODES, ouvertureDeTablee } from './modeRegistry'

describe('ouverture de la tablee', () => {
  it('le seuil complet est le plus haut minPlayers du registre', () => {
    const attendu = Math.max(...PLAYABLE_MODES.map((m) => m.minPlayers))
    expect(ouvertureDeTablee(2).seuilComplet).toBe(attendu)
  })

  it('a ce seuil, tous les modes sont ouverts et il ne manque personne', () => {
    const { seuilComplet } = ouvertureDeTablee(0)
    const au = ouvertureDeTablee(seuilComplet)
    expect(au.ouverts).toBe(au.total)
    expect(au.manquants).toBe(0)
  })

  it('un joueur de moins que le seuil laisse au moins un mode ferme', () => {
    const { seuilComplet } = ouvertureDeTablee(0)
    const juste = ouvertureDeTablee(seuilComplet - 1)
    expect(juste.ouverts).toBeLessThan(juste.total)
    expect(juste.manquants).toBe(1)
  })

  it('le compte ne decroit jamais quand la tablee grandit', () => {
    let precedent = 0
    for (let n = 0; n <= 10; n++) {
      const { ouverts } = ouvertureDeTablee(n)
      expect(ouverts).toBeGreaterThanOrEqual(precedent)
      precedent = ouverts
    }
  })

  it('au-dela du seuil, rien ne se referme', () => {
    const { seuilComplet, total } = ouvertureDeTablee(0)
    expect(ouvertureDeTablee(seuilComplet + 4).ouverts).toBe(total)
  })
})
