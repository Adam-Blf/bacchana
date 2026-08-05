import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ContestState, Player, PenaltyResult, ContestLevel } from '@/types'
import { CONTEST_MULTIPLIERS } from '@/types'
import { Button } from '@/components/ui'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import { cn } from '@/utils'

export interface ContestModalProps {
  isOpen: boolean
  contestState: ContestState
  challengedPlayer: Player | null
  penalty: PenaltyResult | null
  onEscalate?: () => void
  /** Attribue la pénalité au perdant réel de la contestation (attaquant ou défié). */
  onAccept?: (loser: Player) => void
  onClose?: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const levelVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0, transition: { type: 'spring' as const, damping: 15 } },
}

interface PlayerBadgeProps {
  player: Player | null
  label: string
}

function PlayerBadge({ player, label }: PlayerBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Sur bg-surface-elevated (voir le conteneur parent), ink-muted ne passe plus
          l'AA texte (3.80:1) : ink-secondary reste lisible partout (4.52:1 minimum). */}
      <span className="text-xs text-ink-secondary uppercase tracking-wider">{label}</span>
      <div className="px-4 py-2 rounded-control border border-border-strong bg-surface-elevated text-ink">
        <span className="font-semibold">{player?.name ?? '???'}</span>
      </div>
    </div>
  )
}

export function ContestModal({
  isOpen,
  contestState,
  challengedPlayer,
  penalty,
  onEscalate,
  onAccept,
  onClose,
}: ContestModalProps) {
  const { level, challenger } = contestState
  const canEscalate = level < 3
  const nextMultiplier = canEscalate ? CONTEST_MULTIPLIERS[(level + 1) as ContestLevel] : null

  const handleClose = () => onClose?.()
  useBackClose(isOpen, handleClose, 'contest-modal')
  useKeyboard({ Escape: handleClose }, isOpen)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contest-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Contestation en cours"
          className={cn(
            'fixed inset-0 z-modal',
            'bg-scrim/80',
            'flex items-center justify-center',
            'p-4'
          )}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            key="contest-modal"
            className={cn(
              'relative w-full max-w-sm',
              'bg-surface-elevated rounded-card',
              'border-2 border-neon',
              'p-6',
              'shadow-neon-glow'
            )}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - annule la contestation */}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Annuler la contestation"
                className="absolute top-2 right-2 w-11 h-11 rounded-pill flex items-center justify-center text-ink-muted hover:text-ink focus-ring-neon"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            {/* Contest Level Badge */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              variants={levelVariants}
              initial="initial"
              animate="animate"
            >
              <div className="px-4 py-1 rounded-pill bg-neon text-tile-ink text-sm font-bold uppercase tracking-wider font-mono tabular-nums">
                Niveau {level}/3
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-center text-2xl font-display uppercase tracking-tight text-neon text-glow-neon mt-4 mb-6">
              Contestation
            </h2>

            {/* Player VS Player */}
            <div className="flex justify-between items-center mb-8">
              <PlayerBadge player={challenger} label="Attaquant" />
              <span className="text-ink-muted text-2xl font-display">VS</span>
              <PlayerBadge player={challengedPlayer} label="Défié" />
            </div>

            {/* Giant Penalty Display */}
            {penalty && (
              <motion.div
                className="text-6xl sm:text-7xl font-display text-neon text-glow-neon text-center py-4 font-mono tabular-nums"
                variants={pulseVariants}
                animate="pulse"
              >
                {penalty.displayText}
              </motion.div>
            )}

            {/* Multiplier Info */}
            <p className="text-center text-ink-secondary text-sm mb-6 font-sans">
              Multiplicateur actuel : <span className="text-premium font-mono tabular-nums font-bold">x{CONTEST_MULTIPLIERS[level]}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {canEscalate && onEscalate && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onEscalate}
                  className="w-full py-4 text-lg"
                >
                  Escalader (x{nextMultiplier})
                </Button>
              )}
              {onAccept && (
                <>
                  <p className="text-center text-ink-secondary font-mono text-xs uppercase tracking-widest">
                    Qui perd la contestation ?
                  </p>
                  {challenger && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => onAccept(challenger)}
                      className="w-full py-3"
                    >
                      {challenger.name} prend la pénalité
                    </Button>
                  )}
                  {challengedPlayer && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => onAccept(challengedPlayer)}
                      className="w-full py-3"
                    >
                      {challengedPlayer.name} prend la pénalité
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
