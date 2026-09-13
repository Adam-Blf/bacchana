import { describe, it, expect } from 'vitest'
import { demarrerManche } from './fauxFrereSession'
import type { Player } from '@/types'

/**
 * Deux soirees ne doivent pas jouer la meme partie.
 *
 * Ce banc nait d'un defaut reel du 2026-08-31, dans du code livre la veille.
 * `FauxFrereScreen` passait `faux-frere-${numero de manche}` comme graine. Rien
 * dans cette chaine ne variait d'une soiree a l'autre, et `seededRng` est pure :
 * la manche 1 tirait donc TOUJOURS le meme duo de mots et TOUJOURS le meme
 * siege. Mesure avant correction : trois soirees de suite rendaient `ff-056` et
 * le quatrieme joueur saisi. Au troisieme soir la table comprend le motif, et le
 * mode est mort.
 *
 * Aucune garde ne pouvait le voir. Le typecheck passe, les 16 tests du moteur
 * passent - ils EPINGLENT la graine, c'est meme ce qui les rend deterministes -
 * le build passe, les gardes passent. Le defaut ne vivait pas dans le moteur
 * mais dans ce que l'ecran lui donnait a manger.
 *
 * D'ou la forme de ces tests : ils ne testent pas le hasard, ils testent la
 * PROPRIETE qui manquait, a savoir que des graines differentes divergent et que
 * la meme graine ne diverge pas. Le reste - qu'une graine de session soit bien
 * tiree une fois par soiree - est verrouille cote ecran.
 */

const joueurs = (n: number): Player[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `Joueur ${i + 1}`, active: true }))

describe('la graine doit varier d\'une soiree a l\'autre', () => {
  it('deux graines differentes ne donnent pas la meme partie', () => {
    const table = joueurs(5)
    // Cent soirees simulees : on n'exige pas que TOUTES divergent - deux tirages
    // au hasard peuvent coincider - mais qu'elles ne soient pas toutes egales,
    // ce qui est exactement ce que faisait l'ancienne graine.
    const parties = new Set(
      Array.from({ length: 100 }, (_, i) => {
        const e = demarrerManche(table, `soiree-${i}-manche-1`, [])
        return `${e.duo.id}/${e.fauxFrereId}`
      })
    )
    expect(parties.size).toBeGreaterThan(50)
  })

  it('la MEME graine redonne la meme partie - c\'est ce qui evite qu\'un rendu redistribue les roles', () => {
    const table = joueurs(5)
    const a = demarrerManche(table, 'graine-figee-1', [])
    const b = demarrerManche(table, 'graine-figee-1', [])
    expect(b.duo.id).toBe(a.duo.id)
    expect(b.fauxFrereId).toBe(a.fauxFrereId)
  })

  it('le siege du faux frere varie aussi, pas seulement les mots', () => {
    // La premiere version du defaut se lisait surtout sur les mots. Le siege
    // etait tout aussi fige, et c'est le pire des deux : une table qui repere
    // que c'est toujours le quatrieme prenom saisi n'a plus rien a deviner.
    const table = joueurs(6)
    const sieges = new Set(
      Array.from({ length: 100 }, (_, i) => demarrerManche(table, `soiree-${i}-manche-1`, []).fauxFrereId)
    )
    expect(sieges.size).toBe(6)
  })

  it('chaque siege peut etre tire, aucun n\'est structurellement exclu', () => {
    const table = joueurs(4)
    const compte: Record<string, number> = {}
    for (let i = 0; i < 400; i++) {
      const e = demarrerManche(table, `s${i}`, [])
      compte[e.fauxFrereId] = (compte[e.fauxFrereId] ?? 0) + 1
    }
    for (const j of table) expect(compte[j.id] ?? 0).toBeGreaterThan(0)
  })

  it('une manche suivante ne rejoue pas la precedente', () => {
    const table = joueurs(5)
    const m1 = demarrerManche(table, 'soiree-x-1', [])
    const m2 = demarrerManche(table, 'soiree-x-2', [m1.duo.id])
    expect(m2.duo.id).not.toBe(m1.duo.id)
  })
})
