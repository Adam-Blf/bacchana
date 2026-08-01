import { useEffect, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
const HubScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.HubScreen })))
const RulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.RulesScreen })))
const WelcomeScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.WelcomeScreen })))
const BorderlandScreen = lazy(() =>
  import('@/components/screens/BorderlandScreen').then((m) => ({ default: m.BorderlandScreen }))
)

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center text-ink-muted font-mono text-sm">chargement...</div>
)
import { useGameStore, useAppStore } from '@/stores'
import { getModeDefinition } from '@/core/engine/modeRegistry'

// Screen transition variants
const screenVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

function App() {
  const { gamePhase, initGame, hasPlayers } = useGameStore()
  const { currentScreen, activeMode, navigateTo } = useAppStore()

  // The registry-driven mode currently selected. Le Borderland keeps its dedicated
  // gamePhase-based flow (deck, contests) via BorderlandScreen; every other mode routes
  // through its own lazy screen component.
  const isBorderlandFlow = activeMode === null || activeMode === 'borderland'

  const ActiveModeScreen = useMemo(() => {
    if (isBorderlandFlow || !activeMode) return null
    return lazy(() => getModeDefinition(activeMode).component())
  }, [isBorderlandFlow, activeMode])

  // 'setup' phase on the game screen means Borderland's players were lost - go back to
  // welcome. Only relevant to the Borderland flow: other modes never touch gamePhase.
  useEffect(() => {
    if (currentScreen === 'game' && isBorderlandFlow && gamePhase === 'setup') {
      navigateTo('welcome')
    }
  }, [currentScreen, isBorderlandFlow, gamePhase, navigateTo])

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

      case 'game': {
        if (isBorderlandFlow) {
          // 'setup' phase is handled by the redirect effect above - render nothing meanwhile.
          if (gamePhase === 'setup') return null
          return (
            <motion.div key="borderland" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BorderlandScreen />
            </motion.div>
          )
        }

        if (!ActiveModeScreen) return null

        return (
          <motion.div key={`mode-${activeMode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ActiveModeScreen />
          </motion.div>
        )
      }
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
