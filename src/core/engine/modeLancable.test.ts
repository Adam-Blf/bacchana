import { describe, expect, it } from 'vitest'
import { GAME_MODES } from './types'
import { MODE_REGISTRY, PREMIUM_CATALOG } from './modeRegistry'
import { FREE_PACKS } from '@/content'

/**
 * Tout mode déclaré doit être LANÇABLE depuis le hub.
 *
 * Ce test naît d'un défaut réel du 2026-08-30 : `handleTileClick` énumérait à
 * la main les six modes embarqués (`mode === 'tribunal' || mode === 'roulette'
 * || ...`). Le Faux Frère, ajouté ce jour-là, n'y figurait pas, tombait donc
 * dans le chemin des packs, n'en trouvait aucun, et le clic ne faisait RIEN.
 * Pas d'erreur, pas de message, pas de navigation : la tuile ne répondait
 * simplement pas, et rien dans la chaîne - typecheck, tests, build, six gardes
 * - ne l'a signalé.
 *
 * La condition dérive maintenant du registre. Ce test verrouille la propriété
 * pour que le prochain mode ajouté ne repasse pas par la même porte.
 */
describe('tout mode déclaré est lançable', () => {
  it('a soit un pack jouable, soit une logique embarquée - jamais ni l\'un ni l\'autre', () => {
    const orphelins: string[] = []
    for (const mode of GAME_MODES) {
      const def = MODE_REGISTRY[mode]
      const packsLibres = FREE_PACKS.filter((p) => p.pack.mode === mode)
      const packsPremium = PREMIUM_CATALOG.filter((p) => p.mode === mode)
      // Un mode embarqué se reconnaît à l'absence de pack : c'est exactement la
      // règle que le hub applique pour décider s'il lance directement.
      const estEmbarque = def.freePackIds.length === 0 && !def.hasPremiumPacks
      const aDuContenu = packsLibres.length > 0 || packsPremium.length > 0
      if (!estEmbarque && !aDuContenu) orphelins.push(mode)
    }
    expect(orphelins).toEqual([])
  })

  it('déclare un composant d\'écran pour chaque mode', () => {
    for (const mode of GAME_MODES) {
      expect(typeof MODE_REGISTRY[mode].component).toBe('function')
    }
  })

  it('exige un nombre de joueurs atteignable - la tablée plafonne à huit', () => {
    for (const mode of GAME_MODES) {
      const def = MODE_REGISTRY[mode]
      expect(def.minPlayers).toBeGreaterThanOrEqual(2)
      expect(def.minPlayers).toBeLessThanOrEqual(8)
    }
  })
})
