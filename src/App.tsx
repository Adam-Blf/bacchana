import { useEffect, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CookieConsent } from '@/components/cookies'
// L'attente n'est PAS chargee a la demande : un ecran de chargement qui doit
// lui-meme etre telecharge arrive apres l'attente qu'il devait couvrir.
import { Chargement } from '@/components/ui/Chargement'
// Chaque ecran est importe par SON module, jamais par le baril du dossier.
//
// Le defaut, mesure au build du 2026-09-13 : `import('@/components/screens')`
// charge le baril, donc TOUS les ecrans qu'il reexporte. Les neuf appels a
// `lazy()` ci-dessous pointaient sur ce meme module, et Rollup en a fait ce
// qu'il devait en faire : un seul morceau, tire des l'entree. Le visiteur qui
// ouvrait l'application telechargeait l'ecran de reglages, le palmares,
// l'editeur de regles perso et les trois pages legales avant de voir la porte
// de la taverne - 107 Ko d'entree pour un premier ecran qui en vaut 12.
//
// Le baril reste utile a la LECTURE (`import { Button } from '@/components/ui'`)
// pour ce qui est charge de toute facon ; il est simplement interdit au bord
// d'un `lazy()`.
const HubScreen = lazy(() => import('@/components/screens/HubScreen').then((m) => ({ default: m.HubScreen })))
const ModeRulesScreen = lazy(() =>
  import('@/components/screens/ModeRulesScreen').then((m) => ({ default: m.ModeRulesScreen }))
)
// Les cinq ecrans a un appui du hub ne sont PAS declares ici : ils sont
// differes ET prechargeables, parce qu'un `lazy()` seul affiche son repli de
// `Suspense` meme quand le morceau est deja en memoire - et React bride alors
// la livraison du vrai contenu de 300 ms. Voir ecransDuMenu.tsx, qui porte la
// mesure.
import {
  CatalogueScreen,
  CustomRulesScreen,
  PalmaresScreen,
  RulesScreen,
  SettingsScreen,
} from '@/utils/ecransDuMenu'
// LE PREMIER ECRAN N'EST PAS CHARGE A LA DEMANDE, et c'est la correction du
// clignotement d'ouverture. Une application s'ouvre TOUJOURS sur l'accueil ou
// sur l'intro : les differer ne faisait economiser aucun octet - ils sont
// demandes dans la foulee, a chaque ouverture - mais inserait un ecran
// d'attente ENTRE l'amorce HTML et le premier vrai ecran.
import { WelcomeScreen } from '@/components/screens/WelcomeScreen'
import { OnboardingScreen } from '@/components/screens/OnboardingScreen'
const BorderlandScreen = lazy(() =>
  import('@/components/screens/BorderlandScreen').then((m) => ({ default: m.BorderlandScreen }))
)
const MentionsLegalesScreen = lazy(() =>
  import('@/components/legal/MentionsLegalesScreen').then((m) => ({ default: m.MentionsLegalesScreen }))
)
const ConfidentialiteScreen = lazy(() =>
  import('@/components/legal/ConfidentialiteScreen').then((m) => ({ default: m.ConfidentialiteScreen }))
)
const CguScreen = lazy(() => import('@/components/legal/CguScreen').then((m) => ({ default: m.CguScreen })))
// La porte d'age rejoint l'accueil et l'intro : elle est LE premier ecran tant
// que la majorite n'a pas ete declaree, et un premier ecran charge a la demande
// insere une attente entre l'amorce et lui. La garde `check_ouverture` l'a
// attrapee des le premier essai - trois etats au lieu de deux.
import { AgeGateScreen } from '@/components/screens/AgeGateScreen'

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
import { useGameStore, useAppStore, useEntitlementStore } from '@/stores'
import { peutEntrer, useAgeGateStore } from '@/stores/ageGateStore'
import { initMonitoring } from '@/lib/monitoring'
import { getModeDefinition } from '@/core/engine/modeRegistry'

// Screen transition variants
const screenVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

/**
 * LA TRANSITION D'ECRAN, ET POURQUOI ELLE N'EST PLUS UN RESSORT.
 *
 * Elle valait `{ type: 'spring', damping: 25 }`, sans raideur - donc la raideur
 * par defaut de framer-motion, 100. Un ressort si mou met plus d'une seconde a
 * se poser, et `AnimatePresence` en mode `wait` attend sa FIN avant de monter
 * l'ecran suivant. Mesure au chronometre, entre le clic et l'apparition du
 * nouveau titre : 1340 ms a chaud, sans une seule requete reseau. L'animation
 * etait la totalite du temps d'attente.
 *
 * Pire a froid : le morceau de code de l'ecran d'arrivee n'etait demande qu'a
 * +1297 ms, parce que `mode: 'wait'` ne monte rien - donc n'execute pas
 * l'`import()` - tant que la sortie n'est pas finie. Le reseau attendait
 * l'animation au lieu de travailler pendant.
 *
 * Un fondu-glissement de 180 ms dit la meme chose visuellement. Une duree
 * FIXE, pas un ressort : `mode: 'wait'` bloque sur la fin de l'animation, et
 * la fin d'un ressort est une propriete emergente qu'on ne lit pas dans le
 * code. Ici elle est ecrite.
 */
const TRANSITION_ECRAN = { duration: 0.18, ease: [0.22, 1, 0.36, 1] } as const

function App() {
  const { gamePhase, hasPlayers } = useGameStore()
  const { currentScreen, activeMode, navigateTo } = useAppStore()
  const initEntitlement = useEntitlementStore((s) => s.init)
  const reponseAge = useAgeGateStore((s) => s.reponse)

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

  // La bascule vers l'intro au premier lancement vivait ici, dans un effet. Elle
  // est remontee dans `main.tsx`, avant le premier rendu : un effet s'execute
  // APRES la peinture, donc l'accueil s'affichait puis disparaissait. Un seul
  // endroit decide desormais du premier ecran.

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
            transition={TRANSITION_ECRAN}
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
            transition={TRANSITION_ECRAN}
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
            transition={TRANSITION_ECRAN}
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
            transition={TRANSITION_ECRAN}
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
            transition={TRANSITION_ECRAN}
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
            transition={TRANSITION_ECRAN}
          >
            <SettingsScreen />
          </motion.div>
        )

      case 'catalogue':
        return (
          <motion.div
            key="catalogue"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION_ECRAN}
          >
            <CatalogueScreen />
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
            transition={TRANSITION_ECRAN}
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

  // LA PORTE D'AGE, avant tout le reste, y compris l'intro.
  //
  // Seule exception, les ecrans legaux : les mentions legales, la politique de
  // confidentialite et les CGU doivent rester atteignables sans condition. Apple
  // et Google exigent une URL de politique accessible, et la conditionner a une
  // declaration d'age la rendrait inaccessible au robot de revue comme a une
  // autorite de controle.
  const ECRANS_LEGAUX = ['mentions-legales', 'confidentialite', 'cgu']
  if (!peutEntrer(reponseAge) && !ECRANS_LEGAUX.includes(currentScreen)) {
    return (
      <MotionConfig reducedMotion="user">
        <AgeGateScreen />
      </MotionConfig>
    )
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
