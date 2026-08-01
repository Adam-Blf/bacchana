import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  Play, Book, Users, Lock, ArrowLeft,
  Spade, Crown, Flame, HandMetal, Scale, Heart, Timer, Gavel, Disc3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui'
import { PremiumPaywallModal } from '@/components/premium'
import { useAppStore, useConsentStore, useGameStore, usePromptStore } from '@/stores'
import { PLAYABLE_MODES, PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { FREE_PACKS } from '@/content'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { cn } from '@/utils'
import { haptic } from '@/utils/haptic'

const ICONS: Record<string, LucideIcon> = {
  Spade, Crown, Flame, HandMetal, Users, Scale, Heart, Timer, Gavel, Disc3,
}

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
  const Icon = ICONS[glyph]

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
        {Icon && <Icon className="w-6 h-6 text-ink" aria-hidden="true" />}
        {locked && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-surface border border-ink text-ink text-[10px] font-mono uppercase tracking-widest">
            <Lock className="w-3 h-3" aria-hidden="true" />
            Premium
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-xl uppercase tracking-tight text-ink leading-tight">
          {title}
        </h3>
        <p className="text-ink/70 font-sans text-xs mt-1 font-medium">{subtitle}</p>
      </div>
    </motion.button>
  )
}

interface HubScreenProps {
  onPlayGame?: () => void
}

export function HubScreen({ onPlayGame }: HubScreenProps) {
  const { navigateTo, setActiveMode } = useAppStore()
  const { players } = useGameStore()
  const { startSession } = usePromptStore()
  const openCookiePanel = useConsentStore((s) => s.openPanel)
  const consentDecided = useConsentStore((s) => s.hasValidConsent())

  const [pickerMode, setPickerMode] = useState<GameMode | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)

  // The pack picker overlay closes on hardware back / Escape before leaving the hub.
  useBackClose(pickerMode !== null, () => setPickerMode(null), 'pack-picker')
  useKeyboard({ Escape: () => setPickerMode(null) }, pickerMode !== null)

  const pickerDef = pickerMode ? PLAYABLE_MODES.find((m) => m.id === pickerMode) : null
  const pickerFreePacks = pickerMode ? FREE_PACKS.filter((p) => p.pack.mode === pickerMode) : []
  const pickerPremiumEntries = pickerMode
    ? PREMIUM_CATALOG.filter((p) => p.mode === pickerMode)
    : []

  const handlePlayBorderland = () => {
    track({ name: 'mode_started', props: { mode: 'borderland' } })
    if (onPlayGame) onPlayGame()
    else navigateTo('game')
  }

  const startPromptMode = (mode: GameMode, packId: string) => {
    const pack = FREE_PACKS.find((p) => p.pack.id === packId)
    if (!pack) return
    haptic('light')
    track({ name: 'mode_started', props: { mode, pack: packId } })
    startSession(mode, pack, players)
    setActiveMode(mode)
    setPickerMode(null)
    navigateTo('game')
  }

  const handleTileClick = (mode: GameMode) => {
    const def = PLAYABLE_MODES.find((m) => m.id === mode)
    if (!def) return

    if (players.length < def.minPlayers) {
      setWarning(`${def.title} demande au moins ${def.minPlayers} joueurs.`)
      return
    }
    setWarning(null)

    if (mode === 'borderland') {
      handlePlayBorderland()
      return
    }

    if (mode === 'tribunal' || mode === 'roulette') {
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
          La <span className="text-neon text-glow-neon">Tournée</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-secondary font-sans text-sm mt-2"
        >
          Collection de jeux de soirée
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5"
        >
          <Button
            variant="ghost"
            onClick={() => navigateTo('welcome')}
            className="text-sm border border-border hover:border-neon/40"
          >
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            <span className="font-mono tabular-nums">
              {players.length} joueur{players.length !== 1 ? 's' : ''}
            </span>
            <span className="mx-2 text-ink-muted">-</span>
            <span className="text-neon">Modifier</span>
          </Button>
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
              <span className="text-5xl text-ink block mb-2" aria-hidden="true">♠</span>
              <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-ink">
                Le Borderland
              </h2>
              <p className="text-ink/80 font-mono text-sm mt-2 tabular-nums font-bold">
                52 cartes - 4 règles - 0 pitié.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-ink text-bg font-semibold text-sm uppercase tracking-wide">
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                Jouer
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); navigateTo('rules') }}
                className="ml-2 text-ink hover:bg-ink/10"
              >
                <Book className="w-4 h-4 mr-1.5" aria-hidden="true" />
                Règles
              </Button>
            </div>
          </button>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {PLAYABLE_MODES.filter((m) => m.id !== 'borderland').map((mode, index) => (
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

      </motion.main>

      <footer
        className={cn(
          'py-6 pb-safe text-center relative z-10 px-6',
          // While the cookie banner is on screen, keep the footer links reachable above it.
          !consentDecided && 'pb-64'
        )}
      >
        <p className="text-ink-muted/60 text-xs font-sans mb-3">
          Jouez responsable.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] font-mono uppercase tracking-wide text-ink-muted">
          <button onClick={() => navigateTo('mentions-legales')} className="hover:text-neon transition-colors focus-ring-neon">
            Mentions légales
          </button>
          <button onClick={() => navigateTo('confidentialite')} className="hover:text-neon transition-colors focus-ring-neon">
            Confidentialité
          </button>
          <button onClick={() => navigateTo('cgu')} className="hover:text-neon transition-colors focus-ring-neon">
            CGU / CGV
          </button>
          <button onClick={openCookiePanel} className="hover:text-neon transition-colors focus-ring-neon">
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
                    {pack.items.length} cartes
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
                        {entry.itemCount} cartes
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-premium/10 border border-premium/40 text-premium text-[10px] font-mono uppercase tracking-widest">
                      <Lock className="w-3 h-3" aria-hidden="true" />
                      Premium
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumPaywallModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </motion.div>
  )
}
