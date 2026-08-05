import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw } from '@/components/ui/icons'
import { GameBoard, SessionRecap } from '@/components/game'
import { ConfirmDialog } from '@/components/ui'
import { useGameStore, useAppStore } from '@/stores'
import { setBackGuard } from '@/core/navigation/history'
import { cn } from '@/utils'

/**
 * Le Borderland screen - wraps the existing card-game board, contest system and recap.
 * Extracted from App.tsx so it plugs into the mode registry like every other mode, while
 * keeping its dedicated gameStore (deck, contests) untouched.
 */
export function BorderlandScreen() {
  const { gamePhase, players, discardPile, resetGame, initGame } = useGameStore()
  const { goToHub } = useAppStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const started = discardPile.length > 0
  const inProgress =
    gamePhase === 'playing' || gamePhase === 'contest' || gamePhase === 'resolution'

  // Hardware/browser back mid-game asks for confirmation instead of silently
  // dropping the run.
  useEffect(() => {
    if (!(inProgress && started)) return
    setBackGuard(() => {
      setShowQuitConfirm(true)
      return true
    })
    return () => setBackGuard(null)
  }, [inProgress, started])

  // Restart with the same players and a fresh shuffled deck - never eject to the
  // player-setup screen.
  const handleReplay = () => {
    setShowResetConfirm(false)
    initGame()
  }

  const handleQuitToHub = () => {
    setShowQuitConfirm(false)
    resetGame()
    goToHub()
  }

  if (gamePhase === 'ended') {
    return (
      <SessionRecap
        players={players}
        mode="borderland"
        turns={discardPile.length}
        onReplay={handleReplay}
        onQuit={handleQuitToHub}
      />
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GameBoard onQuit={() => (started ? setShowQuitConfirm(true) : handleQuitToHub())} />

      <button
        onClick={() => (started ? setShowResetConfirm(true) : handleReplay())}
        aria-label="Recommencer la partie"
        className={cn(
          'fixed top-safe right-4 z-controls',
          'w-11 h-11 rounded-pill',
          'bg-surface-elevated border border-border-strong',
          'flex items-center justify-center',
          'text-ink-muted hover:text-neon',
          'transition-colors',
          'focus-ring-neon'
        )}
      >
        <RotateCcw className="w-5 h-5" aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={showResetConfirm}
        id="borderland-reset"
        title="Recommencer ?"
        message="La partie en cours sera perdue et un nouveau paquet sera mélangé, avec les mêmes joueurs."
        confirmLabel="Oui, on remélange"
        onConfirm={handleReplay}
        onClose={() => setShowResetConfirm(false)}
      />

      <ConfirmDialog
        open={showQuitConfirm}
        id="borderland-quit"
        title="Quitter la partie ?"
        message="La partie en cours sera perdue. Vous pourrez en relancer une depuis l'accueil."
        confirmLabel="Quitter"
        onConfirm={handleQuitToHub}
        onClose={() => setShowQuitConfirm(false)}
      />
    </motion.div>
  )
}
