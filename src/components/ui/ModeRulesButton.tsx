import { motion } from 'framer-motion'
import { useAppStore } from '@/stores'
import type { GameMode } from '@/core/engine/types'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'
import { Icon } from './Icon'

interface ModeRulesButtonProps {
  mode: GameMode
  className?: string
}

/**
 * Bouton "?" fixe, en face du QuitButton (top-right) sur chaque écran de jeu -
 * ouvre ModeRulesScreen pour rappeler les règles du mode en cours sans quitter
 * la partie.
 */
export function ModeRulesButton({ mode, className }: ModeRulesButtonProps) {
  const showModeRules = useAppStore((s) => s.showModeRules)
  const title = getModeDefinition(mode).rules.title

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => { haptic('light'); showModeRules(mode) }}
      aria-label={`Voir les règles de ${title}`}
      className={cn(
        'fixed top-safe right-4 z-controls',
        'w-11 h-11 rounded-pill',
        'bg-surface border border-border-strong',
        'flex items-center justify-center',
        'text-ink-secondary hover:text-neon hover:border-neon/50',
        'transition-colors duration-200',
        'focus-ring-neon',
        className
      )}
    >
      <Icon name="aide" className="w-5 h-5" aria-hidden="true" />
    </motion.button>
  )
}
