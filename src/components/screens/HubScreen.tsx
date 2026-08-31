import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import { Button, Icon, type IconName } from '@/components/ui'
import { PremiumPaywallModal } from '@/components/premium'
import { useAppStore, useConsentStore, useEntitlementStore, useGameStore, usePromptStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { useThemeStore, resolveTheme } from '@/stores/themeStore'
import {
  DEFAULT_BORDERLAND_OPTIONS,
  SUIT_FRENCH_NAMES,
  SUIT_RULES,
  SUIT_SYMBOLS,
  type BorderlandOptions,
} from '@/types'
import { RANKS, SUITS } from '@/core/borderland'
import { PLAYABLE_MODES, PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { choisirModeSuivant } from '@/core/engine/sequenceur'
import { seededRng } from '@/core/engine/targeting'
import { useSoireeStore } from '@/stores/soireeStore'
import { useAvisStore, doitDemanderAvis } from '@/stores/avisStore'
import { TransitionSoiree } from '@/components/soiree/TransitionSoiree'
import { SoireeSansMode } from '@/components/soiree/SoireeSansMode'
import { DemandeAvis } from '@/components/avis'
import { FREE_PACKS } from '@/content'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { cn } from '@/utils'
import { haptic } from '@/utils/haptic'

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const tileVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 160 },
  },
}

interface ModeTileProps {
  title: string
  subtitle: string
  glyph: IconName
  locked?: boolean
  /** Aplat de couleur néobrutaliste de la tuile (classe bg-*). */
  color?: string
  onClick: () => void
  /** Ouvre les règles du mode sans lancer la partie. */
  onRules: () => void
}

// Rotation d'aplats vifs sur la grille de modes - chaque tuile a sa couleur.

function ModeTile({ title, subtitle, glyph, locked, color = 'bg-surface', onClick, onRules }: ModeTileProps) {
  // Le bouton de regles est un FRERE de la tuile, pas un enfant. Il etait
  // auparavant un `span[role=button]` pose a l'interieur du bouton de tuile :
  // un controle interactif dans un controle interactif, invalide en HTML comme
  // en ARIA, et un piege au clavier. Le positionnement absolu rend la meme
  // disposition sans l'imbrication.
  //
  // `h-full` sur l'enveloppe ET sur le bouton, avec `auto-rows-fr` sur la
  // grille : les tuiles avaient une hauteur MINIMALE, donc chaque rangee se
  // calait sur son sous-titre le plus long et les rangees ne faisaient pas la
  // meme hauteur. Un `min-h` ne rend pas des tuiles egales, il rend des tuiles
  // au moins aussi hautes que ca.
  return (
    <motion.div variants={tileVariants} className="relative h-full">
      <button
        onClick={onClick}
        className={cn(
          'relative overflow-hidden rounded-card text-left w-full h-full',
          color,
          // border-tile-ink et shadow-gravure, pas border-ink : l'aplat pop reste
          // clair dans les deux themes, son cerne et son ombre doivent donc
          // rester noirs. Voir tokens.css, meme logique que --color-tile-ink.
          'border border-tile-ink shadow-gravure',
          'p-4 pb-12 min-h-[148px] flex flex-col justify-between',
          'transition-transform focus-ring-neon',
          ' active:shadow-[inset_0_0_0_2px_currentColor]'
        )}
      >
        <div className="relative z-10 flex items-start justify-between gap-2">
          <Icon name={glyph} className="w-8 h-8 text-tile-ink" aria-hidden="true" />
          {locked && (
            <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-pill bg-card-face border border-tile-ink text-tile-ink text-[10px] font-mono uppercase tracking-widest">
              <Icon name="cadenas" className="w-3 h-3" aria-hidden="true" />
              Premium
            </span>
          )}
        </div>

        <div className="relative z-10">
          <h3 className="font-display text-xl uppercase tracking-tight text-tile-ink leading-tight">
            {title}
          </h3>
          {/* /70 ne tenait pas l'AA normal (4.5:1) sur aplat-2 (4.37) ni aplat-3
              (4.19) en thème clair (mesuré, audit visuel 2026-08-05) - /80 passe
              sur les 4 aplats pop dans les deux thèmes, voir scripts/check_contrast.mjs. */}
          <p className="text-tile-ink/80 font-sans text-xs mt-1 font-medium">{subtitle}</p>
        </div>
      </button>

      {/* Il portait un « ? » nu. Rien ne disait ce qu'il ouvrait, et il se
          lisait comme une decoration de la tuile : c'est le defaut signale
          sous « le bouton de regles n'est pas intuitif » et « le bouton aide
          n'aide pas ». Il porte desormais son nom. */}
      <button
        onClick={onRules}
        aria-label={`Voir les règles de ${title}`}
        className="absolute bottom-2 right-2 min-h-[36px] pl-2 pr-3 inline-flex items-center gap-1.5 rounded-pill bg-card-face border border-tile-ink text-tile-ink font-sans font-bold text-[11px] uppercase tracking-wide focus-ring-neon"
      >
        <Icon name="livre" className="w-3.5 h-3.5" aria-hidden="true" />
        Règles
      </button>
    </motion.div>
  )
}

export function HubScreen() {
  const { navigateTo, setActiveMode, showModeRules } = useAppStore()
  const { players, gameOptions, setGameOptions, initGame } = useGameStore()
  const isPremium = useEntitlementStore((s) => s.isPremium)
  const { startSession } = usePromptStore()
  const openCookiePanel = useConsentStore((s) => s.openPanel)
  const consentDecided = useConsentStore((s) => s.hasValidConsent())

  const [pickerMode, setPickerMode] = useState<GameMode | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [borderlandOptionsOpen, setBorderlandOptionsOpen] = useState(false)
  const [draftOptions, setDraftOptions] = useState<BorderlandOptions>({
    ...DEFAULT_BORDERLAND_OPTIONS,
    ...gameOptions,
  })

  // The pack picker overlay closes on hardware back / Escape before leaving the hub.
  useBackClose(pickerMode !== null, () => setPickerMode(null), 'pack-picker')
  useKeyboard({ Escape: () => setPickerMode(null) }, pickerMode !== null)
  useBackClose(borderlandOptionsOpen, () => setBorderlandOptionsOpen(false), 'borderland-options')
  useKeyboard({ Escape: () => setBorderlandOptionsOpen(false) }, borderlandOptionsOpen)

  const pickerDef = pickerMode ? PLAYABLE_MODES.find((m) => m.id === pickerMode) : null
  const pickerFreePacks = pickerMode ? FREE_PACKS.filter((p) => p.pack.mode === pickerMode) : []
  const pickerPremiumEntries = pickerMode
    ? PREMIUM_CATALOG.filter((p) => p.mode === pickerMode)
    : []

  const handlePlayBorderland = () => {
    // Le spread des defaults absorbe les options persistées par d'anciennes versions.
    setDraftOptions({ ...DEFAULT_BORDERLAND_OPTIONS, ...gameOptions })
    setBorderlandOptionsOpen(true)
  }

  // Taille du paquet résultant des options en cours d'édition (0 = combinaison invalide).
  const draftDeckSize =
    (SUITS.length - draftOptions.excludedSuits.length) *
      (RANKS.length - draftOptions.excludedRanks.length) *
      draftOptions.deckCount +
    (draftOptions.jokers ? 2 * draftOptions.deckCount : 0)

  const launchBorderland = () => {
    haptic('medium')
    track({ name: 'mode_started', props: { mode: 'borderland' } })
    setGameOptions(draftOptions)
    setBorderlandOptionsOpen(false)
    // setGameOptions et initGame sont synchrones sur le même store : initGame lit
    // les options fraîches via get().
    initGame()
    navigateTo('game')
  }

  /** Rend vrai quand la partie a REELLEMENT demarre. Voir `lancerSansChoix`. */
  const startPromptMode = (mode: GameMode, packId: string): boolean => {
    const pack = FREE_PACKS.find((p) => p.pack.id === packId)
    if (!pack) return false
    haptic('light')
    track({ name: 'mode_started', props: { mode, pack: packId } })
    // Les règles perso actives pour ce mode se mélangent au deck du pack.
    const customItems = useCustomRulesStore.getState().getPromptItemsFor(mode)
    startSession(mode, pack, players, customItems)
    setActiveMode(mode)
    setPickerMode(null)
    navigateTo('game')
    return true
  }

  // Un jeu qui ne peut pas se lancer avec la tablee actuelle n'est pas affiche du
  // tout : proposer une tuile qui refuse de demarrer est une fausse promesse.
  const tileModes = PLAYABLE_MODES.filter((m) => m.id !== 'borderland')
  const openModes = tileModes.filter((m) => players.length >= m.minPlayers)
  const lockedByPlayers = tileModes.filter((m) => players.length < m.minPlayers)
  const nextUnlockAt = lockedByPlayers.length
    ? Math.min(...lockedByPlayers.map((m) => m.minPlayers))
    : 0

  const handleTileClick = (mode: GameMode) => {
    const def = PLAYABLE_MODES.find((m) => m.id === mode)
    if (!def) return

    if (players.length < def.minPlayers) {
      setWarning(`Il faut au moins ${def.minPlayers} joueurs pour lancer ${def.title}.`)
      return
    }
    setWarning(null)

    if (mode === 'borderland') {
      handlePlayBorderland()
      return
    }

    // Un mode EMBARQUE porte sa logique dans son ecran et n'a aucun pack a
    // choisir : il se lance directement. On le DEDUIT du registre au lieu de
    // l'enumerer - cette condition listait six modes a la main, et Le Faux
    // Frere, ajoute le 2026-08-30, tombait donc dans le chemin des packs,
    // n'en trouvait aucun, et le clic ne faisait RIEN. Pas d'erreur, pas de
    // message : la tuile ne repondait simplement pas.
    const estEmbarque = def.freePackIds.length === 0 && !def.hasPremiumPacks
    if (estEmbarque) {
      haptic('light')
      track({ name: 'mode_started', props: { mode } })
      setActiveMode(mode)
      navigateTo('game')
      return
    }

    const freePacks = FREE_PACKS.filter((p) => p.pack.mode === mode)
    const premiumEntries = PREMIUM_CATALOG.filter((p) => p.mode === mode)

    if (freePacks.length === 1 && premiumEntries.length === 0) {
      startPromptMode(mode, freePacks[0].pack.id)
      return
    }

    setPickerMode(mode)
  }

  const themePreference = useThemeStore((s) => s.preference)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const isDark = resolveTheme(themePreference) === 'dark'

  // ---------------------------------------------------------------- soiree
  const soiree = useSoireeStore()
  const [demandeAvisOuverte, setDemandeAvisOuverte] = useState(false)

  /**
   * Arrete l'enchainement, et c'est le seul endroit ou l'on sait qu'une soiree
   * vient de se terminer.
   *
   * Le seuil de deux modes evite de compter comme « soiree » un enchainement lance
   * puis abandonne aussitot - on ne demande pas une note a quelqu'un qui vient
   * d'ouvrir l'application.
   *
   * PLACE PROVISOIRE. « Choisir nous-memes » est aujourd'hui la seule sortie de
   * l'enchainement, faute d'ecran de fin de soiree : celui-ci arrive avec US2
   * (taches T018 a T021), et le declencheur devra y demenager. Les conditions
   * d'eligibilite, elles, vivent deja dans avisStore et ne bougeront pas.
   */
  const arreterSoiree = () => {
    soiree.arreter()
    if (soiree.modesJoues.length < 2) return

    const avis = useAvisStore.getState()
    avis.soireeTerminee()
    const maintenant = Date.now()
    if (!doitDemanderAvis(useAvisStore.getState(), maintenant)) return
    useAvisStore.getState().demandeAffichee(maintenant)
    setDemandeAvisOuverte(true)
  }

  /**
   * Lance un mode SANS jamais demander de choix. C'est la difference avec
   * `handleTileClick` : quand un mode a plusieurs paquets gratuits, le hub ouvre
   * un selecteur. Au milieu d'un enchainement, ce selecteur serait exactement le
   * frottement que la fonctionnalite supprime, donc on prend le premier paquet
   * accessible.
   */
  const lancerSansChoix = (mode: GameMode): boolean => {
    if (mode === 'borderland') {
      launchBorderland()
      return true
    }
    const paquets = FREE_PACKS.filter((p) => p.pack.mode === mode)
    if (paquets.length > 0) {
      return startPromptMode(mode, paquets[0].pack.id)
    }
    haptic('light')
    track({ name: 'mode_started', props: { mode } })
    setActiveMode(mode)
    navigateTo('game')
    return true
  }

  /**
   * La proposition de l'enchainement est ECRITE dans le magasin, jamais
   * derivee du rendu.
   *
   * Elle vivait dans un `useMemo` dependant de la soiree, de l'effectif et de
   * l'abonnement. Le probleme n'etait pas la memoisation, c'est que ces faits
   * changent PENDANT le lancement : marquer le mode comme joue suffisait a
   * redonner un autre mode, et l'ecran se rendait avec ce nouveau mode a
   * l'instant ou le doigt touchait « On y va ». La tablee lisait un jeu, un
   * autre partait.
   *
   * Cet effet ne calcule que lorsqu'il n'y a RIEN a afficher. Une fois ecrite,
   * la proposition ne bouge que sur un geste explicite.
   */
  useEffect(() => {
    if (!soiree.enchainementActif || soiree.demarreeLe === null) return
    if (soiree.proposition !== null) return

    const choix = choisirModeSuivant(
      {
        demarreeLe: soiree.demarreeLe,
        modesJoues: soiree.modesJoues,
        derniersModes: soiree.derniersModes,
      },
      players.length,
      PLAYABLE_MODES,
      Date.now(),
      // La graine derive de l'avancement reel de la soiree : deux tirages au
      // meme point rendent le meme mode, ce qui rend la sequence rejouable en
      // test sans la rendre previsible d'une soiree a l'autre.
      seededRng(`${soiree.demarreeLe}-${soiree.derniersModes.length}-${soiree.modesJoues.length}`),
      isPremium,
    )

    soiree.proposer(
      choix.type === 'mode'
        ? { id: choix.id, secondTour: choix.secondTour }
        : { id: null, secondTour: false },
      Date.now(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    soiree.enchainementActif,
    soiree.demarreeLe,
    soiree.proposition,
    soiree.modesJoues,
    soiree.derniersModes,
    players.length,
    isPremium,
  ])

  const proposition = soiree.enchainementActif ? soiree.proposition : null
  const modePropose = proposition?.id
    ? PLAYABLE_MODES.find((m) => m.id === proposition.id) ?? null
    : null

  if (proposition && modePropose) {
    return (
      <TransitionSoiree
        mode={modePropose}
        secondTour={proposition.secondTour}
        rang={soiree.modesJoues.length + 1}
        onDemarrer={() => {
          // On LANCE d'abord, on enregistre ensuite. L'ordre inverse faisait
          // avancer la soiree meme quand le lancement echouait en silence, et
          // l'ecran suivant annoncait alors un autre jeu - sans que le premier
          // ait jamais demarre.
          if (!lancerSansChoix(modePropose.id)) return
          soiree.demarrerMode(modePropose.id, Date.now())
        }}
        onPasser={() => soiree.passerMode(modePropose.id, Date.now())}
        onArreter={arreterSoiree}
      />
    )
  }

  // Aucun mode a proposer, typiquement une tablee d'une personne. Sans cette
  // branche l'enchainement restait actif et le hub se reaffichait a l'identique :
  // le bouton semblait casse. Exigence T016.
  if (proposition && proposition.id === null) {
    return (
      <SoireeSansMode
        effectif={players.length}
        onAjouterJoueurs={() => {
          soiree.arreter()
          navigateTo('welcome')
        }}
        onChoisirSoiMeme={arreterSoiree}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-dvh flex flex-col relative overflow-hidden bg-bg"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grain" />
      </div>

      <header className="pt-safe-12 sm:pt-safe-16 pb-6 text-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-5xl sm:text-6xl uppercase tracking-tight text-neon text-glow-neon"
        >
          Bacchana
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-secondary font-sans text-sm mt-2"
        >
          {/* Le compte suit les tuiles REELLEMENT affichees : le Borderland,
              toujours en tete d'affiche, plus les modes ouverts a cette tablee.
              Annoncer la taille du catalogue promettait des jeux que l'ecran ne
              montrait pas. */}
          Au menu ce soir : {openModes.length + 1} jeu{openModes.length > 0 ? 'x' : ''}, servis
          sans modération de mauvaise foi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5"
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => navigateTo('welcome')}
              className="text-sm border border-ink bg-surface shadow-gravure"
            >
              <Icon name="joueurs" className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="font-mono tabular-nums">
                {/* En francais zero est un singulier : « 0 joueur », pas « 0 joueurs ».
                    Le pluriel commence a 2, d'ou `> 1` et non `!== 1`. */}
                {players.length} joueur{players.length > 1 ? 's' : ''}
              </span>
              <span className="mx-2 text-ink-muted">-</span>
              <span className="text-orange-ink font-bold">Modifier</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigateTo('custom-rules')}
              className="text-sm border border-ink bg-surface shadow-gravure"
            >
              <Icon name="editer" className="w-4 h-4 mr-2" aria-hidden="true" />
              Mes règles
            </Button>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="text-sm border border-ink bg-surface shadow-gravure px-3"
            >
              {isDark ? (
                <Icon name="soleil" className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Icon name="lune" className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigateTo('settings')}
              aria-label="Réglages"
              className="text-sm border border-ink bg-surface shadow-gravure px-3"
            >
              <Icon name="reglages" className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </motion.div>

        {warning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-warning font-mono text-xs mt-3 uppercase tracking-wide"
          >
            {warning}
          </motion.p>
        )}
      </header>

      <motion.main
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-8 max-w-lg mx-auto w-full relative z-10"
      >
        <motion.div variants={tileVariants} className="mb-4">
          <button
            onClick={() => handleTileClick('borderland')}
            className={cn(
              'relative overflow-hidden rounded-card text-left w-full',
              'bg-neon border border-sur-surimpression shadow-gravure-forte',
              'p-6 sm:p-7 transition-transform focus-ring-neon',
              ' active:shadow-[inset_0_0_0_2px_currentColor]'
            )}
          >
            <div className="relative z-10">
              {/* Le pique venait du caractere ♠ : rendu par la police, donc
                  different sur chaque plateforme et impossible a accorder au
                  reste du jeu d'icones. */}
              <Icon name="pique" className="w-12 h-12 text-tile-ink block mb-2" aria-hidden="true" />
              <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-tile-ink">
                Borderland
              </h2>
              {/* /80 sur bg-neon ne laissait que 4.50:1 en thème clair (pile au
                  seuil AA, marge nulle - audit visuel 2026-08-05) - /90 remonte
                  à 5.21:1 avec une vraie marge. */}
              <p className="text-tile-ink/90 font-mono text-sm mt-2 tabular-nums font-bold">
                52 cartes - 4 règles - 0 pitié.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-tile-ink text-card-face font-semibold text-sm uppercase tracking-wide">
                <Icon name="jouer" className="w-4 h-4" aria-hidden="true" />
                Jouer
              </div>
            </div>
          </button>

          {/* Le bouton de regles etait DANS le bouton de tuile. React le
              signalait a chaque rendu : « <button> cannot be a descendant of
              <button> ». C'est du HTML invalide, et le `stopPropagation` qui
              tenait l'ensemble ne repare ni le parseur ni le lecteur d'ecran.
              Il est desormais frere de la tuile. */}
          <button
            onClick={() => navigateTo('rules')}
            className="mt-2 min-h-[44px] px-3 inline-flex items-center gap-1.5 text-ink-secondary hover:text-orange-ink font-sans text-sm rounded-control focus-ring-neon transition-colors"
          >
            <Icon name="livre" className="w-4 h-4" aria-hidden="true" />
            Règles du Borderland
          </button>
        </motion.div>

        {/* Un seul geste, avant les treize tuiles. A vingt-trois heures, choisir
            parmi treize n'est pas une liberte, c'est un frottement : une tablee
            qui hesite trois minutes devant un menu passe a autre chose. */}
        {openModes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              haptic('medium')
              track({ name: 'soiree_lancee' })
              soiree.demarrer(Date.now())
            }}
            className="w-full min-h-[72px] mb-4 rounded-control border-2 border-tile-ink bg-aplat-1 text-tile-ink font-display uppercase text-3xl shadow-gravure focus-ring-neon"
          >
            Lance la soiree
          </button>
        )}

        <div className="grid grid-cols-2 auto-rows-fr gap-3 mb-4">
          {openModes.map((mode) => (
            <ModeTile
              key={mode.id}
              title={mode.title}
              subtitle={mode.subtitle}
              glyph={mode.icon}
              locked={false}
              color={mode.tileColor}
              onClick={() => handleTileClick(mode.id)}
              onRules={() => { haptic('light'); showModeRules(mode.id) }}
            />
          ))}
        </div>

        {/* Les jeux hors de portee de la tablee ne sont pas affiches : on annonce
            juste combien s'ouvrent, et a partir de combien de joueurs. */}
        {lockedByPlayers.length > 0 && (
          <button
            onClick={() => { haptic('light'); navigateTo('welcome') }}
            className="w-full mb-4 rounded-card border-2 border-dashed border-border-strong/40 px-4 py-3 text-center focus-ring-neon hover:border-neon transition-colors"
          >
            <span className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted">
              {lockedByPlayers.length} jeu{lockedByPlayers.length > 1 ? 'x' : ''} de plus
            </span>
            <span className="block font-sans text-sm text-ink mt-0.5">
              à partir de {nextUnlockAt} joueurs - ajouter du monde à la tablée
            </span>
          </button>
        )}

      </motion.main>

      <footer
        className={cn(
          'py-6 pb-safe text-center relative z-10 px-6',
          // While the cookie banner is on screen, keep the footer links reachable above it.
          !consentDecided && 'pb-64'
        )}
      >
        <p className="text-ink-muted text-xs font-sans mb-3">
          Jouez responsable : Bacchana veille sur sa tablée.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-muted">
          <button onClick={() => navigateTo('mentions-legales')} className="min-h-[44px] px-2 inline-flex items-center hover:text-orange-ink transition-colors focus-ring-neon">
            Mentions légales
          </button>
          <button onClick={() => navigateTo('confidentialite')} className="min-h-[44px] px-2 inline-flex items-center hover:text-orange-ink transition-colors focus-ring-neon">
            Confidentialité
          </button>
          <button onClick={() => navigateTo('cgu')} className="min-h-[44px] px-2 inline-flex items-center hover:text-orange-ink transition-colors focus-ring-neon">
            CGU / CGV
          </button>
          <button onClick={openCookiePanel} className="min-h-[44px] px-2 inline-flex items-center hover:text-orange-ink transition-colors focus-ring-neon">
            Cookies
          </button>
        </nav>
      </footer>

      {/* Pack picker overlay */}
      <AnimatePresence>
        {pickerMode && pickerDef && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-overlay bg-bg flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Choix du pack pour ${pickerDef.title}`}
          >
            <header className="pt-safe-6 px-6 pb-4 flex items-center gap-3 border-b border-border">
              <Button variant="ghost" onClick={() => setPickerMode(null)} aria-label="Retour au hub">
                <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
              </Button>
              <h2 className="font-display text-2xl uppercase tracking-tight text-ink">
                {pickerDef.title}
              </h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 max-w-lg mx-auto w-full">
              {pickerFreePacks.map((pack) => (
                <button
                  key={pack.pack.id}
                  onClick={() => startPromptMode(pickerDef.id, pack.pack.id)}
                  className="w-full text-left rounded-card p-5 bg-surface border border-border-strong hover:border-neon/40 transition-colors focus-ring-neon"
                >
                  <h3 className="font-display text-lg uppercase tracking-tight text-ink">
                    {pack.pack.title}
                  </h3>
                  <p className="text-ink-secondary font-sans text-sm mt-1">{pack.pack.subtitle}</p>
                  <p className="text-ink-muted font-mono text-xs mt-2 tabular-nums">
                    {pack.items.length} carte{pack.items.length > 1 ? 's' : ''}
                  </p>
                </button>
              ))}

              {pickerPremiumEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setShowPremiumModal(true)}
                  // opacity-70 sur tout le conteneur assombrissait le TEXTE en même
                  // temps que le fond (dimme les deux vers l'arrière-plan de la
                  // même façon) : ink-secondary tombait à 3.95:1, ink-muted à
                  // 2.76:1, le badge premium à 2.83:1 - tous sous l'AA (audit
                  // visuel 2026-08-05). Le statut "verrouillé" reste lisible sans
                  // opacité : bg-bg-raised (déjà plus sourd que bg-surface des
                  // packs gratuits) + le badge "Premium" suffisent, et le texte
                  // reste à pleine opacité (paires déjà vérifiées, marge réelle).
                  className="w-full text-left rounded-card p-5 bg-bg-raised border border-border relative overflow-hidden focus-ring-neon"
                  aria-label={`${entry.title} - contenu premium verrouillé`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg uppercase tracking-tight text-ink-secondary">
                        {entry.title}
                      </h3>
                      <p className="text-ink-muted font-sans text-sm mt-1">{entry.subtitle}</p>
                      <p className="text-ink-muted font-mono text-xs mt-2 tabular-nums">
                        {entry.itemCount} carte{entry.itemCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-premium/10 border border-premium/40 text-premium text-[10px] font-mono uppercase tracking-widest">
                      <Icon name="cadenas" className="w-3 h-3" aria-hidden="true" />
                      Premium
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options du Borderland : paquets, jokers, mode aléatoire infini (premium) */}
      <AnimatePresence>
        {borderlandOptionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-overlay bg-black/60 flex items-end sm:items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Options du Borderland"
            onClick={() => setBorderlandOptionsOpen(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-bg border-t-2 sm:border border-ink sm:rounded-card sm:shadow-gravure-forte p-5 pb-safe-6"
            >
              <h2 className="font-display text-lg uppercase tracking-tight text-ink mb-4">
                Borderland - options
              </h2>

              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="paquets" className="w-4 h-4" aria-hidden="true" />
                Nombre de paquets
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([1, 2, 3] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setDraftOptions({ ...draftOptions, deckCount: count })}
                    aria-pressed={draftOptions.deckCount === count}
                    className={cn(
                      // Le cerne suit le fond, branche par branche : aucun jeton unique
                      // ne tient les deux etats, l'encre disparait sur le jaune en
                      // theme sombre et l'encre de tuile disparait sur la surface.
                      'min-h-[48px] rounded-control border-2 font-mono font-bold tabular-nums transition-colors focus-ring-neon',
                      draftOptions.deckCount === count
                        ? 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                        : 'bg-surface text-ink border-ink'
                    )}
                  >
                    {count} <span className="font-sans font-medium text-xs">({count * 52} cartes)</span>
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-between rounded-control bg-surface border border-ink px-4 py-3 mb-3 cursor-pointer min-h-[52px]">
                <span className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                  <Icon name="etincelles" className="w-4 h-4" aria-hidden="true" />
                  Jokers (2 par paquet)
                </span>
                <input
                  type="checkbox"
                  checked={draftOptions.jokers}
                  onChange={(e) => setDraftOptions({ ...draftOptions, jokers: e.target.checked })}
                  className="w-5 h-5 accent-neon"
                  aria-label="Inclure les jokers"
                />
              </label>

              <button
                onClick={() => {
                  if (!isPremium) {
                    setShowPremiumModal(true)
                    return
                  }
                  setDraftOptions({ ...draftOptions, infinite: !draftOptions.infinite })
                }}
                aria-pressed={draftOptions.infinite}
                className={cn(
                  'w-full flex items-center justify-between rounded-control border-2 px-4 py-3 mb-4 min-h-[52px] focus-ring-neon transition-colors',
                  draftOptions.infinite && isPremium
                    ? 'bg-aplat-4 text-tile-ink border-tile-ink shadow-gravure'
                    : 'bg-surface text-ink border-ink'
                )}
              >
                <span className="font-sans font-bold text-sm flex items-center gap-2 text-left">
                  <Icon name="infini" className="w-4 h-4" aria-hidden="true" />
                  Cartes aléatoires à l'infini
                </span>
                {isPremium ? (
                  <span className="font-mono text-xs uppercase">{draftOptions.infinite ? 'Activé' : 'Off'}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-ink text-ink text-[10px] font-mono uppercase tracking-widest">
                    <Icon name="cadenas" className="w-3 h-3" aria-hidden="true" />
                    Premium
                  </span>
                )}
              </button>

              {/* Composition du paquet : retirer des couleurs (et leur règle) ou des valeurs */}
              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <Icon name="curseurs" className="w-4 h-4" aria-hidden="true" />
                Composition du paquet
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {SUITS.map((suit) => {
                  const excluded = draftOptions.excludedSuits.includes(suit)
                  const red = suit === 'hearts' || suit === 'diamonds'
                  return (
                    <button
                      key={suit}
                      onClick={() =>
                        setDraftOptions({
                          ...draftOptions,
                          excludedSuits: excluded
                            ? draftOptions.excludedSuits.filter((s) => s !== suit)
                            : [...draftOptions.excludedSuits, suit],
                        })
                      }
                      aria-pressed={!excluded}
                      aria-label={`${excluded ? 'Réintégrer' : 'Retirer'} les ${SUIT_FRENCH_NAMES[suit]}s (règle ${SUIT_RULES[suit].title})`}
                      className={cn(
                        'min-h-[48px] rounded-control border-2 border-ink px-3 flex items-center gap-2 font-sans font-bold text-sm transition-colors focus-ring-neon',
                        excluded ? 'bg-surface opacity-45 line-through' : 'bg-surface shadow-gravure'
                      )}
                    >
                      {/* danger et non card-red : card-red est le pip fixe d'une carte
                          a jouer, juste sur bg-card-face blanc mais a environ 2.5:1
                          sur bg-surface en theme sombre. danger est le rouge
                          semantique theme-aware, identique en clair. */}
                      <span className={cn('text-xl leading-none', red ? 'text-danger' : 'text-ink')} aria-hidden="true">
                        {SUIT_SYMBOLS[suit]}
                      </span>
                      <span className="truncate">{SUIT_RULES[suit].title}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {RANKS.map((rank) => {
                  const excluded = draftOptions.excludedRanks.includes(rank)
                  return (
                    <button
                      key={rank}
                      onClick={() =>
                        setDraftOptions({
                          ...draftOptions,
                          excludedRanks: excluded
                            ? draftOptions.excludedRanks.filter((r) => r !== rank)
                            : [...draftOptions.excludedRanks, rank],
                        })
                      }
                      aria-pressed={!excluded}
                      aria-label={`${excluded ? 'Réintégrer' : 'Retirer'} les ${rank === 'A' ? 'As' : rank}`}
                      className={cn(
                        'min-w-[40px] min-h-[40px] px-2 rounded-control border-2 font-mono font-bold text-sm tabular-nums transition-colors focus-ring-neon',
                        excluded
                          ? 'bg-surface text-ink border-ink opacity-45 line-through'
                          : 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                      )}
                    >
                      {rank}
                    </button>
                  )
                })}
              </div>
              <p className="font-mono text-xs text-ink-muted tabular-nums mb-5" aria-live="polite">
                {draftDeckSize > 0
                  ? `${draftDeckSize} cartes dans le paquet`
                  : 'Paquet vide - réintègre au moins une couleur et une valeur.'}
              </p>

              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={launchBorderland}
                disabled={draftDeckSize === 0}
              >
                <Icon name="jouer" className="w-5 h-5 mr-2 fill-current" aria-hidden="true" />
                C'est parti !
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumPaywallModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      {/* Demandee seulement a la fin d'une vraie soiree, jamais pendant un mode.
          Ne s'affiche pas du tout tant qu'aucune fiche store n'est configuree. */}
      <DemandeAvis open={demandeAvisOuverte} onFermer={() => setDemandeAvisOuverte(false)} />
    </motion.div>
  )
}
