import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  Play, Book, Users, ArrowLeft, Pencil, Layers, Infinity as InfinityIcon, Sparkles,
  SlidersHorizontal,
  Sun, Moon,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { PremiumPaywallModal } from '@/components/premium'
import { useAppStore, useConsentStore, useEntitlementStore, useGameStore, usePromptStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { WaxSeal } from '@/components/ui/WaxSeal'
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
import { FREE_PACKS } from '@/content'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { cn } from '@/utils'
import { haptic } from '@/utils/haptic'

// Les glyphes des modes sont des images vendorisees dans public/icons/modes,
// pas des icones filaires generiques : voir scripts/fetch-mode-icons.mjs.
const modeIconSrc = (glyph: string) => `/icons/modes/${glyph.toLowerCase()}.png`

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
  glyph: string
  locked?: boolean
  /** Aplat de couleur néobrutaliste de la tuile (classe bg-*). */
  color?: string
  onClick: () => void
}

// Rotation d'aplats vifs sur la grille de modes - chaque tuile a sa couleur.
const TILE_COLORS = ['bg-pop-yellow', 'bg-pop-pink', 'bg-pop-blue', 'bg-pop-lime']

function ModeTile({ title, subtitle, glyph, locked, color = 'bg-surface', onClick }: ModeTileProps) {
  return (
    <motion.button
      variants={tileVariants}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-card text-left w-full',
        color,
        'border-2 border-ink shadow-brutal',
        'p-5 min-h-[132px] flex flex-col justify-between',
        'transition-transform focus-ring-neon',
        'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
      )}
    >
      <div className="relative z-10 flex items-start justify-between">
        <img src={modeIconSrc(glyph)} alt="" aria-hidden="true" className="w-8 h-8" />
        {locked && (
          <span className="inline-flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-pill bg-card-face border border-tile-ink text-tile-ink text-[10px] font-mono uppercase tracking-widest">
            <WaxSeal size={16} />
            Premium
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-xl uppercase tracking-tight text-tile-ink leading-tight">
          {title}
        </h3>
        <p className="text-tile-ink/70 font-sans text-xs mt-1 font-medium">{subtitle}</p>
      </div>
    </motion.button>
  )
}

export function HubScreen() {
  const { navigateTo, setActiveMode } = useAppStore()
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

  const startPromptMode = (mode: GameMode, packId: string) => {
    const pack = FREE_PACKS.find((p) => p.pack.id === packId)
    if (!pack) return
    haptic('light')
    track({ name: 'mode_started', props: { mode, pack: packId } })
    // Les règles perso actives pour ce mode se mélangent au deck du pack.
    const customItems = useCustomRulesStore.getState().getPromptItemsFor(mode)
    startSession(mode, pack, players, customItems)
    setActiveMode(mode)
    setPickerMode(null)
    navigateTo('game')
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

    if (
      mode === 'tribunal' ||
      mode === 'roulette' ||
      mode === 'quiz' ||
      mode === 'ranking' ||
      mode === 'auction'
    ) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen flex flex-col relative overflow-hidden bg-bg"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon/[0.05] rounded-full blur-[120px]" />
      </div>

      <header className="pt-safe-12 sm:pt-safe-16 pb-6 text-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-5xl sm:text-6xl uppercase tracking-tight text-ink"
        >
          La <span className="text-neon text-glow-neon">Taverne</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-secondary font-sans text-sm mt-2"
        >
          Au menu ce soir : 13 jeux, servis sans modération de mauvaise foi.
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
              className="text-sm border-2 border-ink bg-surface shadow-brutal-sm"
            >
              <Users className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="font-mono tabular-nums">
                {players.length} joueur{players.length !== 1 ? 's' : ''}
              </span>
              <span className="mx-2 text-ink-muted">-</span>
              <span className="text-neon font-bold">Modifier</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigateTo('custom-rules')}
              className="text-sm border-2 border-ink bg-surface shadow-brutal-sm"
            >
              <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
              Mes règles
            </Button>
            <Button
              variant="ghost"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className="text-sm border-2 border-ink bg-surface shadow-brutal-sm px-3"
            >
              {isDark ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
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
        className="flex-1 px-4 sm:px-6 pb-8 max-w-lg mx-auto w-full relative z-10"
      >
        <motion.div variants={tileVariants} className="mb-4">
          <button
            onClick={() => handleTileClick('borderland')}
            className={cn(
              'relative overflow-hidden rounded-card text-left w-full',
              'bg-neon border-2 border-ink shadow-brutal-lg',
              'p-6 sm:p-7 transition-transform focus-ring-neon',
              'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
            )}
          >
            <div className="relative z-10">
              <span className="text-5xl text-tile-ink block mb-2" aria-hidden="true">♠</span>
              <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-tile-ink">
                Le Coupe-Gorge
              </h2>
              <p className="text-tile-ink/80 font-mono text-sm mt-2 tabular-nums font-bold">
                52 cartes - 4 règles - 0 pitié.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-tile-ink text-card-face font-semibold text-sm uppercase tracking-wide">
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                Jouer
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); navigateTo('rules') }}
                className="ml-2 text-tile-ink hover:bg-tile-ink/10"
              >
                <Book className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Règles
              </Button>
            </div>
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {openModes.map((mode, index) => (
            <ModeTile
              key={mode.id}
              title={mode.title}
              subtitle={mode.subtitle}
              glyph={mode.icon}
              locked={false}
              color={TILE_COLORS[index % TILE_COLORS.length]}
              onClick={() => handleTileClick(mode.id)}
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
          Jouez responsable : la taverne veille sur sa tablée.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-muted">
          <button onClick={() => navigateTo('mentions-legales')} className="min-h-[44px] px-2 inline-flex items-center hover:text-neon transition-colors focus-ring-neon">
            Mentions légales
          </button>
          <button onClick={() => navigateTo('confidentialite')} className="min-h-[44px] px-2 inline-flex items-center hover:text-neon transition-colors focus-ring-neon">
            Confidentialité
          </button>
          <button onClick={() => navigateTo('cgu')} className="min-h-[44px] px-2 inline-flex items-center hover:text-neon transition-colors focus-ring-neon">
            CGU / CGV
          </button>
          <button onClick={openCookiePanel} className="min-h-[44px] px-2 inline-flex items-center hover:text-neon transition-colors focus-ring-neon">
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
            className="fixed inset-0 z-overlay bg-bg/95 backdrop-blur-lg flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Choix du pack pour ${pickerDef.title}`}
          >
            <header className="pt-safe-6 px-6 pb-4 flex items-center gap-3 border-b border-border">
              <Button variant="ghost" onClick={() => setPickerMode(null)} aria-label="Retour au hub">
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
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
                  className="w-full text-left rounded-card p-5 bg-bg-raised border border-border opacity-70 relative overflow-hidden focus-ring-neon"
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
                      <WaxSeal size={15} />
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
              className="w-full sm:max-w-md bg-bg border-t-2 sm:border-2 border-ink sm:rounded-card sm:shadow-brutal-lg p-5 pb-safe-6"
            >
              <h2 className="font-display text-lg uppercase tracking-tight text-ink mb-4">
                Le Coupe-Gorge - options
              </h2>

              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" aria-hidden="true" />
                Nombre de paquets
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {([1, 2, 3] as const).map((count) => (
                  <button
                    key={count}
                    onClick={() => setDraftOptions({ ...draftOptions, deckCount: count })}
                    aria-pressed={draftOptions.deckCount === count}
                    className={cn(
                      'min-h-[48px] rounded-control border-2 border-ink font-mono font-bold tabular-nums transition-colors focus-ring-neon',
                      draftOptions.deckCount === count ? 'bg-pop-yellow shadow-brutal-sm' : 'bg-surface'
                    )}
                  >
                    {count} <span className="font-sans font-medium text-xs">({count * 52} cartes)</span>
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-between rounded-control bg-surface border-2 border-ink px-4 py-3 mb-3 cursor-pointer min-h-[52px]">
                <span className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
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
                  'w-full flex items-center justify-between rounded-control border-2 border-ink px-4 py-3 mb-4 min-h-[52px] focus-ring-neon transition-colors',
                  draftOptions.infinite && isPremium ? 'bg-pop-lime shadow-brutal-sm' : 'bg-surface'
                )}
              >
                <span className="font-sans font-bold text-sm text-ink flex items-center gap-2 text-left">
                  <InfinityIcon className="w-4 h-4" aria-hidden="true" />
                  Cartes aléatoires à l'infini
                </span>
                {isPremium ? (
                  <span className="font-mono text-xs uppercase">{draftOptions.infinite ? 'Activé' : 'Off'}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-ink text-ink text-[10px] font-mono uppercase tracking-widest">
                    <WaxSeal size={15} />
                    Premium
                  </span>
                )}
              </button>

              {/* Composition du paquet : retirer des couleurs (et leur règle) ou des valeurs */}
              <p className="text-ink font-sans font-bold text-sm mb-2 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
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
                        excluded ? 'bg-surface opacity-45 line-through' : 'bg-surface shadow-brutal-sm'
                      )}
                    >
                      <span className={cn('text-xl leading-none', red ? 'text-card-red' : 'text-ink')} aria-hidden="true">
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
                        'min-w-[40px] min-h-[40px] px-2 rounded-control border-2 border-ink font-mono font-bold text-sm tabular-nums transition-colors focus-ring-neon',
                        excluded ? 'bg-surface opacity-45 line-through' : 'bg-pop-yellow shadow-brutal-sm'
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
                <Play className="w-5 h-5 mr-2 fill-current" aria-hidden="true" />
                C'est parti !
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumPaywallModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </motion.div>
  )
}
