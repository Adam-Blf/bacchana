import { motion } from 'framer-motion'
import { useAppStore } from '@/stores'
import { cn } from '@/utils'
import { Icon } from './Icon'

interface QuitButtonProps {
  /** Custom quit handler (cleanup + navigation). Defaults to going back to the hub. */
  onQuit?: () => void
  'aria-label'?: string
  className?: string
}

/**
 * Shared fixed quit button, top-left of every game screen. Positioned with `top-safe`
 * so it stays tappable below the notch/status bar in standalone PWA mode.
 */
export function QuitButton({ onQuit, className, 'aria-label': ariaLabel }: QuitButtonProps) {
  const goToHub = useAppStore((s) => s.goToHub)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => (onQuit ? onQuit() : goToHub())}
      aria-label={ariaLabel ?? "Quitter la partie et revenir à l'accueil"}
      className={cn(
        'fixed top-safe left-4 z-controls',
        'w-11 h-11 rounded-pill',
        'bg-surface border border-border-strong',
        'flex items-center justify-center',
        'text-ink-secondary hover:text-neon hover:border-neon/50',
        'transition-colors duration-200',
        'focus-ring-neon',
        className
      )}
    >
      <Icon name="accueil" className="w-5 h-5" aria-hidden="true" />
    </motion.button>
  )
}
