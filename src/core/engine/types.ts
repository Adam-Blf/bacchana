import { z } from 'zod'
import type { ComponentType } from 'react'
import type { IconName } from '@/components/ui/icon-names'

// ============================================
// GAME MODES
// ============================================

/** Every mode the multi-mode engine knows about. Mirrors bacchana-content schema `pack.mode`. */
export type GameMode =
  | 'borderland'
  | 'quiz'
  | 'ranking'
  | 'auction'
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
  'quiz',
  'ranking',
  'auction',
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
export type PromptMode = Exclude<
  GameMode,
  'borderland' | 'tribunal' | 'roulette' | 'quiz' | 'ranking' | 'auction'
>

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
// CONTENT PACK SCHEMA (aligned on bacchana-content/schema/content.schema.json)
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

export const TargetsSchema = z.enum([
  'self',
  'chosen',
  'all',
  'gender-m',
  'gender-f',
  'pair',
  'single',
  'couple',
])

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
  'quiz',
  'ranking',
  'auction',
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

export type Targets = z.infer<typeof TargetsSchema>
export type PackItem = z.infer<typeof PackItemSchema>
export type Intensity = z.infer<typeof IntensitySchema>
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

/** Règles courtes affichées par ModeRulesScreen, ton comptoir de taverne. */
export interface ModeRules {
  /** Titre affiché en tête de l'écran de règles. */
  title: string
  /** 3 à 5 étapes courtes, dans l'ordre de jeu. */
  steps: string[]
}

export interface ModeDefinition {
  id: GameMode
  title: string
  subtitle: string
  /**
   * Nom d'icone du jeu partage (`IconName`), rendu tel quel par `<Icon>`.
   *
   * Ce champ portait un nom de composant lucide (`Spade`, `Disc3`) que le hub
   * transformait en chemin de PNG. C'etait le troisieme systeme d'icones de
   * l'app, et une faute de frappe ne se voyait qu'a l'ecran. Le type le refuse
   * desormais a la compilation.
   */
  icon: IconName
  /** Classe d'aplat de la tuile du hub, par FAMILLE de jeu et non par position.
   *  Attribuee par index, la couleur se decalait des qu'un mode devenait
   *  disponible ou indisponible selon le nombre de joueurs, et n'apprenait rien
   *  au joueur. Ici le bleu interroge, le rose expose, le jaune presse, le lime
   *  arbitre. Voir MODE_REGISTRY et le test qui verrouille la totalite. */
  tileColor: string
  minPlayers: number
  /** Lazy-loaded screen component for this mode. */
  component: () => Promise<{ default: ComponentType }>
  /** Ids of free packs bundled for this mode (empty for borderland/tribunal/roulette). */
  freePackIds: string[]
  /** Whether this mode has premium packs available (locked until entitlement). */
  hasPremiumPacks: boolean
  /** Règles courtes du mode, affichées via ModeRulesScreen depuis le hub et l'écran de jeu. */
  rules: ModeRules
}
