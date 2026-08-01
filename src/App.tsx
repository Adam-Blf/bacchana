import { useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
const GameBoard = lazy(() => import('@/components/game').then(m => ({ default: m.GameBoard })))
const SessionRecap = lazy(() => import('@/components/game').then(m => ({ default: m.SessionRecap })))
const HubScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.HubScreen })))
const RulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.RulesScreen })))
const WelcomeScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.WelcomeScreen })))

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center text-ink-muted font-mono text-sm">chargement...</div>
)
import { useGameStore, useAppStore } from '@/stores'
import { cn } from '@/utils'

// Screen transition variants
const screenVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

function App() {
  const { gamePhase, players, initGame, resetGame, hasPlayers } = useGameStore()
  const { currentScreen, navigateTo, goToHub } = useAppStore()

  // 'setup' phase on the game screen means players were lost - go back to welcome.
  // Navigation is a side effect, never triggered during render.
  useEffect(() => {
    if (currentScreen === 'game' && gamePhase === 'setup') {
      navigateTo('welcome')
    }
  }, [currentScreen, gamePhase, navigateTo])

  // Auto-redirect to welcome if no players configured
  useEffect(() => {
    if (currentScreen !== 'welcome' && !hasPlayers()) {
      navigateTo('welcome')
    }
  }, [currentScreen, hasPlayers, navigateTo])

  const handlePlayGame = () => {
    if (hasPlayers()) {
      initGame()
      navigateTo('game')
    }
  }

  const handleReset = () => {
    resetGame()
  }

  const handleQuitToHub = () => {
    resetGame()
    goToHub()
  }

  // Render the appropriate screen based on navigation state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <motion.div
            key="welcome"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <WelcomeScreen />
          </motion.div>
        )

      case 'hub':
        return (
          <motion.div
            key="hub"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <HubScreen onPlayGame={handlePlayGame} />
          </motion.div>
        )

      case 'rules':
        return (
          <motion.div
            key="rules"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <RulesScreen />
          </motion.div>
        )

      case 'game':
        if (gamePhase === 'ended') {
          return (
            <motion.div key="recap" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ type: 'spring', damping: 25 }}>
              <SessionRecap players={players} onReplay={handleReset} onQuit={handleQuitToHub} />
            </motion.div>
          )
        }
        // 'setup' phase is handled by the redirect effect above - render nothing meanwhile.
        if (gamePhase === 'setup') {
          return null
        }

        return (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameBoard onQuit={handleQuitToHub} />

            {/* Reset Button */}
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
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <AnimatePresence mode="wait">
          <Suspense fallback={<Loader />}>
            {renderScreen()}
          </Suspense>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

export default App
