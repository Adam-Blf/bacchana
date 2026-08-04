import { useEffect, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CookieConsent } from '@/components/cookies'
const HubScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.HubScreen })))
const RulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.RulesScreen })))
const ModeRulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.ModeRulesScreen })))
const CustomRulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.CustomRulesScreen })))
const SettingsScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.SettingsScreen })))
const WelcomeScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.WelcomeScreen })))
const OnboardingScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.OnboardingScreen })))
const BorderlandScreen = lazy(() =>
  import('@/components/screens/BorderlandScreen').then((m) => ({ default: m.BorderlandScreen }))
)
const MentionsLegalesScreen = lazy(() =>
  import('@/components/legal').then((m) => ({ default: m.MentionsLegalesScreen }))
)
const ConfidentialiteScreen = lazy(() =>
  import('@/components/legal').then((m) => ({ default: m.ConfidentialiteScreen }))
)
const CguScreen = lazy(() => import('@/components/legal').then((m) => ({ default: m.CguScreen })))

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center text-ink-muted font-mono text-sm">chargement…</div>
)
import { useGameStore, useAppStore, useEntitlementStore, useOnboardingStore } from '@/stores'
import { initMonitoring } from '@/lib/monitoring'
import { getModeDefinition } from '@/core/engine/modeRegistry'

// Screen transition variants
const screenVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

function App() {
  const { gamePhase, hasPlayers } = useGameStore()
  const { currentScreen, activeMode, navigateTo } = useAppStore()
  const initEntitlement = useEntitlementStore((s) => s.init)
  const hasSeenIntro = useOnboardingStore((s) => s.hasSeenIntro)

  // Best-effort premium status refresh at startup - never blocks rendering, keeps the
  // last cached value on failure (offline, no RevenueCat key, sandbox hiccup).
  useEffect(() => {
    void initEntitlement().catch(() => {})
    void initMonitoring()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  // Redirects use replace so the back button never bounces between screens.
  useEffect(() => {
    if (currentScreen === 'game' && isBorderlandFlow && gamePhase === 'setup') {
      navigateTo('welcome', { replace: true })
    }
  }, [currentScreen, isBorderlandFlow, gamePhase, navigateTo])

  // Auto-redirect to welcome if no players configured. Les ecrans legaux et
  // l'onboarding sont exclus : au premier lancement il n'y a jamais de joueurs, et le
  // bandeau cookies renvoie vers la politique de confidentialite - sans cette
  // exception, le lien rebondissait aussitot sur l'accueil et la politique etait
  // inatteignable (idem pour l'intro, qui doit s'afficher avant tout joueur saisi).
  useEffect(() => {
    const noPlayersScreens = ['mentions-legales', 'confidentialite', 'cgu', 'onboarding']
    if (currentScreen !== 'welcome' && !noPlayersScreens.includes(currentScreen) && !hasPlayers()) {
      navigateTo('welcome', { replace: true })
    }
  }, [currentScreen, hasPlayers, navigateTo])

  // Premier lancement uniquement : bascule vers l'intro avant l'ecran d'accueil.
  // Ne depend que du montage - currentScreen demarre toujours a 'welcome'.
  useEffect(() => {
    if (currentScreen === 'welcome' && !hasSeenIntro) {
      navigateTo('onboarding', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Render the appropriate screen based on navigation state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OnboardingScreen />
          </motion.div>
        )

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
            <HubScreen />
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

      case 'mode-rules':
        return (
          <motion.div
            key="mode-rules"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <ModeRulesScreen />
          </motion.div>
        )

      case 'custom-rules':
        return (
          <motion.div
            key="custom-rules"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <CustomRulesScreen />
          </motion.div>
        )

      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <SettingsScreen />
          </motion.div>
        )

      case 'mentions-legales':
        return (
          <motion.div key="mentions-legales" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MentionsLegalesScreen />
          </motion.div>
        )

      case 'confidentialite':
        return (
          <motion.div key="confidentialite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ConfidentialiteScreen />
          </motion.div>
        )

      case 'cgu':
        return (
          <motion.div key="cgu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CguScreen />
          </motion.div>
        )

      case 'game': {
        if (isBorderlandFlow) {
          // 'setup' phase is handled by the redirect effect above - never a black frame.
          if (gamePhase === 'setup') return <Loader key="loader-setup" />
          return (
            <motion.div key="borderland" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BorderlandScreen />
            </motion.div>
          )
        }

        if (!ActiveModeScreen) return <Loader key="loader-mode" />

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
        <Suspense fallback={<Loader />}>
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </Suspense>
        <CookieConsent />
        <ExitToast />
      </div>
    </MotionConfig>
  )
}

/** "Press back again to quit" toast, armed by the navigation exit trap. */
function ExitToast() {
  const visible = useAppStore((s) => s.exitToastVisible)
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          role="status"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-modal px-4 py-2.5 rounded-pill bg-surface-elevated border border-border-strong text-ink font-sans text-sm shadow-card-elevated whitespace-nowrap"
        >
          Appuie encore pour quitter
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
