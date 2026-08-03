import type { Player } from '@/types'
import type { Targets } from './types'

/** Injectable RNG so tests can pin the outcome. Defaults to `Math.random`. */
export type Rng = () => number

/** Targets this module knows how to resolve to concrete player(s). */
export const RESOLVABLE_TARGETS: readonly Targets[] = ['gender-m', 'gender-f', 'pair', 'single', 'couple']

/** True when a `targets` value is one this module resolves to a concrete player. */
export function isResolvableTarget(target: Targets | undefined): target is (typeof RESOLVABLE_TARGETS)[number] {
  return target !== undefined && RESOLVABLE_TARGETS.includes(target)
}

/** Tiny mulberry32 PRNG - deterministic, good enough for non-cryptographic UI randomness. */
function mulberry32(seed: number): Rng {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0
  }
  return hash
}

/**
 * Builds a deterministic rng from a string seed - used so a UI component can resolve the
 * same target for the same turn across re-renders without stashing state in a hook (e.g.
 * seed on `${item.id}-${turnNumber}`).
 */
export function seededRng(seed: string): Rng {
  const generator = mulberry32(hashString(seed))
  return () => generator()
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Resolves a content item's `targets` field to the concrete player(s) it points to.
 *
 * Genre et statut relationnel sont des attributs OPTIONNELS déclarés par les joueurs
 * (voir Player.gender / Player.relationship) : si personne à table ne correspond au
 * critère demandé (ex. personne n'a précisé son genre), on ne bloque JAMAIS la partie -
 * on retombe sur un joueur actif tiré au hasard. Ne considère que les joueurs actifs ;
 * si aucun n'est actif (ne devrait pas arriver en session), retombe sur le roster complet.
 */
export function resolveTarget(players: Player[], target: Targets, rng: Rng = Math.random): Player[] {
  const active = players.filter((p) => p.active)
  const pool = active.length > 0 ? active : players
  if (pool.length === 0) return []

  const randomOne = (): Player[] => shuffle(pool, rng).slice(0, 1)
  const matchOrFallback = (predicate: (p: Player) => boolean): Player[] => {
    const matches = pool.filter(predicate)
    return matches.length > 0 ? shuffle(matches, rng).slice(0, 1) : randomOne()
  }

  switch (target) {
    case 'gender-m':
      return matchOrFallback((p) => p.gender === 'm')
    case 'gender-f':
      return matchOrFallback((p) => p.gender === 'f')
    case 'single':
      return matchOrFallback((p) => p.relationship === 'single')
    case 'couple':
      return matchOrFallback((p) => p.relationship === 'couple')
    case 'pair':
      return shuffle(pool, rng).slice(0, 2)
    default:
      // 'self' / 'chosen' / 'all' ne sont pas gérés par ce module - fallback gracieux.
      return randomOne()
  }
}
