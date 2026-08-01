import { z } from 'zod'
import type { ComponentType } from 'react'

// ============================================
// GAME MODES
// ============================================

/** Every mode the multi-mode engine knows about. Mirrors blackout-content schema `pack.mode`. */
export type GameMode =
  | 'borderland'
  | 'picolo'
  | 'truthOrDare'
  | 'neverHaveIEver'
  | 'whoAmong'
  | 'wouldYouRather'
  | 'itsA10But'
  | 'sevenSeconds'
  | 'tribunal'
  | 'roulette'

export const GAME_MODES: GameMode[] = [
  'borderland',
  'picolo',
  'truthOrDare',
  'neverHaveIEver',
  'whoAmong',
  'wouldYouRather',
  'itsA10But',
  'sevenSeconds',
  'tribunal',
  'roulette',
]

/** Modes driven by the generic prompt session (pack-based, tour par tour). */
export type PromptMode = Exclude<GameMode, 'borderland' | 'tribunal' | 'roulette'>

export const PROMPT_MODES: PromptMode[] = [
  'picolo',
  'truthOrDare',
  'neverHaveIEver',
  'whoAmong',
  'wouldYouRather',
  'itsA10But',
  'sevenSeconds',
]

// ============================================
// CONTENT PACK SCHEMA (aligned on blackout-content/schema/content.schema.json)
// ============================================

export const PenaltySchema = z
  .object({
    sips: z.number().int().min(1).optional(),
    shots: z.number().int().min(1).optional(),
  })
  .strict()

export const RuleTypeSchema = z.enum(['instant', 'persistent', 'role'])

export const RuleSchema = z
  .object({
    type: RuleTypeSchema,
    durationTurns: z.number().int().min(1).optional(),
  })
  .strict()

export const TargetsSchema = z.enum(['self', 'chosen', 'all', 'gender-m', 'gender-f', 'pair'])

export const PackItemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    text: z.string().min(1),
    textAlt: z.string().min(1).optional(),
    penalty: PenaltySchema.optional(),
    rule: RuleSchema.optional(),
    targets: TargetsSchema.optional(),
    tags: z.array(z.string()).optional(),
    minPlayers: z.number().int().min(2).optional(),
  })
  .strict()

export const IntensitySchema = z.enum(['soft', 'medium', 'hot', 'chaos'])

export const GameModeSchema = z.enum([
  'borderland',
  'picolo',
  'truthOrDare',
  'neverHaveIEver',
  'whoAmong',
  'wouldYouRather',
  'itsA10But',
  'sevenSeconds',
  'tribunal',
  'roulette',
])

export const PackMetaSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    mode: GameModeSchema,
    lang: z.enum(['fr']),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    premium: z.boolean(),
    minPlayers: z.number().int().min(2).optional(),
    intensity: IntensitySchema.optional(),
  })
  .strict()

export const ContentPackSchema = z
  .object({
    schemaVersion: z.literal(1),
    pack: PackMetaSchema,
    items: z.array(PackItemSchema).min(1),
  })
  .strict()

export type Penalty = z.infer<typeof PenaltySchema>
export type Rule = z.infer<typeof RuleSchema>
export type Targets = z.infer<typeof TargetsSchema>
export type PackItem = z.infer<typeof PackItemSchema>
export type Intensity = z.infer<typeof IntensitySchema>
export type PackMeta = z.infer<typeof PackMetaSchema>
export type ContentPack = z.infer<typeof ContentPackSchema>

/** Validates a raw JSON value against the content pack schema. Throws a readable error on mismatch. */
export function parseContentPack(raw: unknown): ContentPack {
  return ContentPackSchema.parse(raw)
}

/** Metadata entry for a premium pack, shown as a locked tile before purchase. */
export interface PremiumCatalogEntry {
  id: string
  mode: GameMode
  title: string
  subtitle: string
  intensity: Intensity
  premium: true
  itemCount: number
}

// ============================================
// MODE DEFINITION (registry entry)
// ============================================

export interface ModeDefinition {
  id: GameMode
  title: string
  subtitle: string
  /** Lucide icon name, resolved by the hub. */
  icon: string
  minPlayers: number
  /** Lazy-loaded screen component for this mode. */
  component: () => Promise<{ default: ComponentType }>
  /** Ids of free packs bundled for this mode (empty for borderland/tribunal/roulette). */
  freePackIds: string[]
  /** Whether this mode has premium packs available (locked until entitlement). */
  hasPremiumPacks: boolean
}
