import { z } from 'zod'
import type { RouletteSegment } from '@/content/roulette'
import { GameModeSchema, PenaltySchema, type PackItem } from './types'

// ============================================
// RÈGLES PERSONNALISÉES ("Mes règles")
// Créées par l'utilisateur, stockées uniquement sur son appareil (localStorage),
// injectées dans les modes à prompts et/ou dans la roulette.
// ============================================

export const CustomRuleKindSchema = z.enum(['prompt', 'roulette'])
export type CustomRuleKind = z.infer<typeof CustomRuleKindSchema>

export const CustomRuleSchema = z
  .object({
    id: z.string().min(1),
    kind: CustomRuleKindSchema,
    /** Texte de la règle. Supporte les jetons d'interpolation ({player}, {random}, ...). */
    text: z.string().trim().min(1).max(280),
    /** Modes à prompts ciblés. Absent = tous les modes à prompts. Ignoré pour la roulette. */
    modes: z.array(GameModeSchema).optional(),
    penalty: PenaltySchema.optional(),
    enabled: z.boolean(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .strict()

export type CustomRule = z.infer<typeof CustomRuleSchema>

/** Convertit une règle perso en item de pack, prêt à être mélangé au deck d'un mode. */
export function customRuleToPackItem(rule: CustomRule): PackItem {
  return {
    id: `custom-${rule.id}`.toLowerCase(),
    text: rule.text,
    ...(rule.penalty ? { penalty: rule.penalty } : {}),
    tags: ['custom'],
  }
}

/** Convertit une règle perso en segment de roulette supplémentaire. */
export function customRuleToRouletteSegment(rule: CustomRule): RouletteSegment {
  const label = rule.text.length > 18 ? `${rule.text.slice(0, 17)}…` : rule.text
  return {
    id: `custom-${rule.id}`,
    label,
    detail: rule.text,
  }
}
