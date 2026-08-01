import { motion, AnimatePresence } from 'framer-motion'
import type { ContestState, Player, PenaltyResult, ContestLevel } from '@/types'
import { CONTEST_MULTIPLIERS } from '@/types'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

export interface ContestModalProps {
  isOpen: boolean
  contestState: ContestState
  challengedPlayer: Player | null
  penalty: PenaltyResult | null
  onEscalate?: () => void
  onAccept?: () => void
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
      <span className="text-xs text-ink-muted uppercase tracking-wider">{label}</span>
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="contest-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Contestation en cours"
          className={cn(
            'fixed inset-0 z-50',
            'bg-bg/85 backdrop-blur-xl',
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
            {/* Contest Level Badge */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              variants={levelVariants}
              initial="initial"
              animate="animate"
            >
              <div className="px-4 py-1 rounded-pill bg-neon text-white text-sm font-bold uppercase tracking-wider font-mono tabular-nums">
                Niveau {level}/3
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-center text-2xl font-display uppercase tracking-tight text-neon text-glow-neon mt-4 mb-6">
              Contestation
            </h2>

            {/* Player VS Player */}
            <div className="flex justify-between items-center mb-8">
              <PlayerBadge player={challenger} label="Challenger" />
              <span className="text-ink-muted text-2xl font-display">VS</span>
              <PlayerBadge player={challengedPlayer} label="Defie" />
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
              Multiplicateur actuel: <span className="text-premium font-mono tabular-nums font-bold">x{CONTEST_MULTIPLIERS[level]}</span>
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
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onAccept}
                  className="w-full py-4 text-lg"
                >
                  Accepter la pénalité
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
