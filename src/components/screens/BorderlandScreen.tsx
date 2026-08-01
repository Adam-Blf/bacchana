import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { GameBoard, SessionRecap } from '@/components/game'
import { useGameStore, useAppStore } from '@/stores'
import { cn } from '@/utils'

/**
 * Le Borderland screen - wraps the existing card-game board, contest system and recap.
 * Extracted from App.tsx so it plugs into the mode registry like every other mode, while
 * keeping its dedicated gameStore (deck, contests) untouched.
 */
export function BorderlandScreen() {
  const { gamePhase, players, discardPile, resetGame } = useGameStore()
  const { goToHub } = useAppStore()

  const handleReset = () => {
    resetGame()
  }

  const handleQuitToHub = () => {
    resetGame()
    goToHub()
  }

  if (gamePhase === 'ended') {
    return (
      <SessionRecap
        players={players}
        mode="borderland"
        turns={discardPile.length}
        onReplay={handleReset}
        onQuit={handleQuitToHub}
      />
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GameBoard onQuit={handleQuitToHub} />

      <button
        onClick={handleReset}
        aria-label="Réinitialiser la partie"
        className={cn(
          'fixed top-4 right-4 z-40',
          'p-3 rounded-pill',
          'bg-surface-elevated border border-border-strong',
          'text-ink-muted hover:text-neon',
          'transition-colors',
          'focus-ring-neon'
        )}
      >
        <RotateCcw className="w-5 h-5" aria-hidden="true" />
      </button>
    </motion.div>
  )
}
