import { useEffect, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CookieConsent } from '@/components/cookies'
// L'attente n'est PAS chargee a la demande : un ecran de chargement qui doit
// lui-meme etre telecharge arrive apres l'attente qu'il devait couvrir.
import { Chargement } from '@/components/ui/Chargement'
const HubScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.HubScreen })))
const RulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.RulesScreen })))
const ModeRulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.ModeRulesScreen })))
const CustomRulesScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.CustomRulesScreen })))
const SettingsScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.SettingsScreen })))
const PalmaresScreen = lazy(() => import('@/components/screens').then(m => ({ default: m.PalmaresScreen })))
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

/**
 * L'attente passe par `Chargement`, qui a son propre fichier et ses raisons.
 *
 * Ce composant etait une ligne de texte en `text-ink-muted` centree sur
 * l'aplat pourpre, soit environ 2:1 : l'ecran paraissait vide a chaque
 * lancement de partie, puisque les treize ecrans de jeu sont charges a la
 * demande. Le libelle change selon le moment, parce qu'« on prepare la table »
 * et « on sort le jeu » ne disent pas la meme chose a la tablee qui attend.
 */
const Loader = ({ libelle }: { libelle?: string }) => <Chargement libelle={libelle} />
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

  /**
   * Le statut premium se rafraichit QUAND LE NAVIGATEUR N'A PLUS RIEN A FAIRE.
   *
   * Le SDK de paiement est deja importe dynamiquement, mais cet effet le
   * reclamait au montage : 216 Ko compresses partaient donc dans le chemin
   * critique, juste derriere React, pour une fonctionnalite que la majorite des
   * soirees n'ouvriront jamais. Sur une application qui se vend comme « zero
   * pub, fonctionne hors ligne », c'etait le plus gros poste evitable du
   * chargement.
   *
   * Rien n'est perdu : la valeur mise en cache est persistee et sert
   * immediatement, le rafraichissement la corrige quelques centaines de
   * millisecondes plus tard, et le paywall force de toute facon une
   * verification quand il s'ouvre. `requestIdleCallback` avec un delai de
   * securite, parce que Safari ne le connait toujours pas.
   */
  useEffect(() => {
    void initMonitoring()

    // Le SDK de paiement ne se reveille QUE pour quelqu'un qui a paye.
    //
    // Le differer ne suffisait pas : mesure au navigateur, le morceau partait
    // encore avant le premier rendu, parce qu'un navigateur qui vient d'afficher
    // une page est immediatement inactif. Ce qu'il fallait, ce n'etait pas le
    // retarder, c'etait ne pas le demander.
    //
    // Un non-acheteur garde donc sa valeur en cache (fausse par defaut) et ne
    // telecharge rien. L'ouverture du paywall configure le SDK elle-meme, et
    // c'est le seul moment ou il sert. Un abonne, lui, a besoin qu'on verifie
    // que son abonnement court toujours : la verification garde tout son sens
    // la ou elle en a un.
    if (!useEntitlementStore.getState().isPremium) return

    const verifier = () => void initEntitlement().catch(() => {})
    const idle = (window as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    if (typeof idle === 'function') {
      idle(verifier, { timeout: 4000 })
      return
    }
    const minuteur = setTimeout(verifier, 2000)
    return () => clearTimeout(minuteur)
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
    const noPlayersScreens = ['mentions-legales', 'confidentialite', 'cgu', 'onboarding', 'palmares']
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

      case 'palmares':
        return (
          <motion.div
            key="palmares"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25 }}
          >
            <PalmaresScreen />
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
          if (gamePhase === 'setup') return <Loader key="loader-setup" libelle="ON DRESSE LA TABLE" />
          return (
            <motion.div key="borderland" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BorderlandScreen />
            </motion.div>
          )
        }

        if (!ActiveModeScreen) return <Loader key="loader-mode" libelle="ON SORT LE JEU" />

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
      <div className="relative overflow-x-clip">
        <Suspense fallback={<Loader libelle="ON SORT LE JEU" />}>
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>
        </Suspense>
        <CookieConsent />
      </div>
    </MotionConfig>
  )
}

export default App
