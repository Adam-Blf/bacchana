import { FREE_PACKS } from '@/content'
import premiumCatalogRaw from '@/content/premium-catalog.json'
import { GAME_MODES, type GameMode, type ModeDefinition, type PremiumCatalogEntry } from './types'

export const PREMIUM_CATALOG = premiumCatalogRaw as PremiumCatalogEntry[]

function freePackIdsForMode(mode: GameMode): string[] {
  return FREE_PACKS.filter((p) => p.pack.mode === mode).map((p) => p.pack.id)
}

function hasPremiumPacks(mode: GameMode): boolean {
  return PREMIUM_CATALOG.some((p) => p.mode === mode)
}

/** Registry of every mode the multi-mode engine can run, with a lazy-loaded screen. */
export const MODE_REGISTRY: Record<GameMode, ModeDefinition> = {
  borderland: {
    id: 'borderland',
    title: 'Le Borderland',
    subtitle: '52 cartes - 4 règles - 0 pitié.',
    icon: 'Spade',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/BorderlandScreen').then((m) => ({ default: m.BorderlandScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
  },
  picolo: {
    id: 'picolo',
    title: 'Le Meneur',
    subtitle: 'Le meneur de jeu de ta soirée',
    icon: 'Crown',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('picolo'),
    hasPremiumPacks: hasPremiumPacks('picolo'),
  },
  truthOrDare: {
    id: 'truthOrDare',
    title: 'Action ou Vérité',
    subtitle: 'Choisis ton poison',
    icon: 'Flame',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('truthOrDare'),
    hasPremiumPacks: hasPremiumPacks('truthOrDare'),
  },
  neverHaveIEver: {
    id: 'neverHaveIEver',
    title: "Je n'ai jamais",
    subtitle: 'Prends si tu l\'as déjà fait',
    icon: 'HandMetal',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('neverHaveIEver'),
    hasPremiumPacks: hasPremiumPacks('neverHaveIEver'),
  },
  whoAmong: {
    id: 'whoAmong',
    title: 'Qui de nous',
    subtitle: 'Désigne le/la coupable',
    icon: 'Users',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('whoAmong'),
    hasPremiumPacks: hasPremiumPacks('whoAmong'),
  },
  wouldYouRather: {
    id: 'wouldYouRather',
    title: 'Tu préfères',
    subtitle: 'Fais ton choix impossible',
    icon: 'Scale',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('wouldYouRather'),
    hasPremiumPacks: hasPremiumPacks('wouldYouRather'),
  },
  itsA10But: {
    id: 'itsA10But',
    title: "C'est un 10 mais",
    subtitle: 'Le deal-breaker ultime',
    icon: 'Heart',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('itsA10But'),
    hasPremiumPacks: hasPremiumPacks('itsA10But'),
  },
  sevenSeconds: {
    id: 'sevenSeconds',
    title: '7 Secondes',
    subtitle: 'Réponds vite ou prends une pénalité',
    icon: 'Timer',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/PromptGameScreen').then((m) => ({ default: m.PromptGameScreen })),
    freePackIds: freePackIdsForMode('sevenSeconds'),
    hasPremiumPacks: hasPremiumPacks('sevenSeconds'),
  },
  tribunal: {
    id: 'tribunal',
    title: 'Le Tribunal',
    subtitle: 'Un accusé, un verdict, zéro pitié',
    icon: 'Gavel',
    minPlayers: 3,
    component: () =>
      import('@/components/screens/TribunalScreen').then((m) => ({ default: m.TribunalScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
  },
  roulette: {
    id: 'roulette',
    title: 'La Roulette',
    subtitle: 'Lance la roue, assume le sort',
    icon: 'Disc3',
    minPlayers: 2,
    component: () =>
      import('@/components/screens/RouletteScreen').then((m) => ({ default: m.RouletteScreen })),
    freePackIds: [],
    hasPremiumPacks: false,
  },
}

/** All mode definitions in canonical hub order. */
export const PLAYABLE_MODES: ModeDefinition[] = GAME_MODES.map((mode) => MODE_REGISTRY[mode])

export function getModeDefinition(mode: GameMode): ModeDefinition {
  return MODE_REGISTRY[mode]
}
