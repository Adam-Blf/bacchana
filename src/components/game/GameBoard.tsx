import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Spade, Heart, Club, Diamond } from 'lucide-react'
import { useGameStore } from '@/stores'
import { JOKER_RULE, SUIT_RULES, SUIT_SYMBOLS } from '@/types'
import type { Player, GamePhase, Suit } from '@/types'
import { Button, QuitButton } from '@/components/ui'
import { PlayingCard } from './PlayingCard'
import { ContestModal } from './ContestModal'
import { cn } from '@/utils'
import { calculatePenalty } from '@/stores/gameStore'

// Suit icon component
const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  const iconProps = { className: cn('w-5 h-5', className) }
  switch (suit) {
    case 'hearts': return <Heart {...iconProps} fill="currentColor" />
    case 'diamonds': return <Diamond {...iconProps} fill="currentColor" />
    case 'clubs': return <Club {...iconProps} fill="currentColor" />
    case 'spades': return <Spade {...iconProps} fill="currentColor" />
  }
}

export interface GameBoardProps {
  className?: string
  onQuit?: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const statusVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}

const cardDrawVariants = {
  hidden: { y: -100, opacity: 0, rotateX: 45, scale: 0.8 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 20, stiffness: 150 },
  },
  exit: { y: 100, opacity: 0, scale: 0.8, rotateX: -20 },
}

const ruleVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.3, type: 'spring' as const, damping: 25 },
  },
}

interface StatusBarProps {
  currentPlayer: Player | null
  cardsRemaining: number
  totalCards: number
  infinite?: boolean
}

function StatusBar({ currentPlayer, cardsRemaining, totalCards, infinite }: StatusBarProps) {
  const progress = infinite ? 0 : ((totalCards - cardsRemaining) / totalCards) * 100

  return (
    <motion.div className="space-y-4" variants={statusVariants}>
      {/* Player zone */}
      <div className="text-center">
        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink">
          {currentPlayer?.name ?? 'Joueur'}
        </h2>
        <p className="text-ink-secondary font-sans text-sm mt-1">
          C&apos;est ton tour de distribuer
        </p>
      </div>

      {/* Progress & cards - HUD compact, mono, tabular-nums */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative h-1.5 rounded-pill bg-surface overflow-hidden border border-border">
          <motion.div
            className="absolute inset-y-0 left-0 bg-neon rounded-pill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface border border-border">
          {infinite ? (
            <span className="font-mono font-bold text-sm text-ink" aria-label="Paquet infini">∞</span>
          ) : (
            <>
              <span className="font-mono tabular-nums font-bold text-sm text-ink">
                {cardsRemaining}
              </span>
              <span className="font-mono tabular-nums text-xs text-ink-muted">/{totalCards}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface ActionButtonsProps {
  onDrawCard: () => void
  onStartContest: () => void
  onNextTurn: () => void
  gamePhase: GamePhase
  hasCurrentCard: boolean
  cardRevealed: boolean
  canContest: boolean
}

function ActionButtons({ onDrawCard, onStartContest, onNextTurn, gamePhase, hasCurrentCard, cardRevealed, canContest }: ActionButtonsProps) {
  if (gamePhase === 'setup') {
    return (
      <p className="text-center text-ink-muted font-sans">
        Ajoutez des joueurs pour commencer
      </p>
    )
  }

  if (gamePhase === 'ended') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <p className="font-display text-3xl uppercase tracking-tight text-neon text-glow-neon mb-2">
          Fin de partie
        </p>
        <p className="text-ink-muted font-sans text-sm">
          Toutes les cartes ont été jouées
        </p>
      </motion.div>
    )
  }

  if (gamePhase === 'playing' && !hasCurrentCard) {
    return (
      <Button
        variant="primary"
        size="xl"
        className="w-full animate-glow-pulse"
        onClick={onDrawCard}
      >
        <Sparkles className="w-6 h-6 mr-3" aria-hidden="true" />
        <span className="text-xl uppercase tracking-wide">Tirer une carte</span>
      </Button>
    )
  }

  // Carte encore face cachée : le seul geste possible est de la retourner -
  // contester ou passer sans avoir vu la carte n'aurait pas de sens (et
  // révélerait la mise du Guess).
  if (hasCurrentCard && !cardRevealed) {
    return null
  }

  if ((gamePhase === 'playing' || gamePhase === 'resolution') && hasCurrentCard) {
    return (
      <div className="flex flex-col gap-3">
        {canContest && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={onStartContest}
          >
            <span className="text-lg uppercase tracking-wide">Contester</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onNextTurn}
        >
          Tour suivant
        </Button>
      </div>
    )
  }

  return null
}

export function GameBoard({ className, onQuit }: GameBoardProps) {
  const {
    currentCard,
    gamePhase,
    contestState,
    drawCard,
    startContest,
    escalateContest,
    resolveContest,
    cancelContest,
    nextTurn,
    getCurrentPlayer,
    getCardsRemaining,
    discardPile,
    gameOptions,
  } = useGameStore()

  const currentPlayer = getCurrentPlayer()
  const cardsRemaining = getCardsRemaining()
  // Taille réelle du paquet (1 à 3 paquets, jokers compris) - plus jamais un 52 codé en dur.
  const totalCards = cardsRemaining + discardPile.length + (currentCard ? 1 : 0)

  const [showContestModal, setShowContestModal] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [lastCardId, setLastCardId] = useState<string | null>(null)

  // Reset reveal state when a new card is drawn (state adjusted during render,
  // see react.dev "adjusting state when a prop changes").
  // EVERY card arrives face down: the suit must never be deductible before the
  // flip (a hidden card that could only be a club gave the trèfle away).
  if (currentCard && currentCard.id !== lastCardId) {
    setLastCardId(currentCard.id)
    setCardRevealed(false)
  }

  const handleRevealCard = useCallback(() => {
    if (!cardRevealed) {
      setCardRevealed(true)
    }
  }, [cardRevealed])

  // Le Joker a sa règle spéciale (carte blanche, pas de valeur chiffrée).
  const isJoker = currentCard?.rank === 'JOKER'
  const currentRule = currentCard ? (isJoker ? JOKER_RULE : SUIT_RULES[currentCard.suit]) : null

  // La mise n'est calculée (et donc affichable) qu'une fois la carte révélée -
  // sinon contester une carte cachée imprimait sa valeur en géant.
  const penalty = contestState.active && contestState.baseCard && cardRevealed
    ? calculatePenalty(contestState.baseCard.value, contestState.level, contestState.baseCard.unit)
    : null

  const handleDrawCard = useCallback(() => {
    drawCard()
  }, [drawCard])

  const handleStartContest = useCallback(() => {
    if (currentPlayer) {
      startContest(currentPlayer)
      setShowContestModal(true)
    }
  }, [currentPlayer, startContest])

  const handleEscalate = useCallback(() => {
    if (currentPlayer) {
      escalateContest(currentPlayer)
    }
  }, [currentPlayer, escalateContest])

  const handleAcceptPenalty = useCallback(() => {
    if (currentPlayer) {
      resolveContest(currentPlayer)
      setShowContestModal(false)
      cancelContest()
    }
  }, [currentPlayer, resolveContest, cancelContest])

  const handleCloseModal = useCallback(() => {
    setShowContestModal(false)
    cancelContest()
  }, [cancelContest])

  const handleNextTurn = useCallback(() => {
    nextTurn()
  }, [nextTurn])

  return (
    <motion.div
      className={cn(
        'min-h-screen w-full',
        'flex flex-col',
        'px-6 pt-safe pb-safe',
        'relative overflow-hidden',
        'bg-bg',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient neon glow behind the card zone */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[380px] bg-neon/[0.08] rounded-full blur-[80px]" />
      </div>

      {/* Home Button */}
      {onQuit && <QuitButton onQuit={onQuit} />}

      {/* Status Zone - Top */}
      <header className="flex-shrink-0 mb-6 pt-16 relative z-10">
        <StatusBar
          currentPlayer={currentPlayer}
          cardsRemaining={cardsRemaining}
          totalCards={totalCards}
          infinite={gameOptions.infinite}
        />
      </header>

      {/* Card Zone - Center */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              variants={cardDrawVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PlayingCard
                card={currentCard}
                size="lg"
                isRevealed={cardRevealed}
                onReveal={handleRevealCard}
                isHighlighted={cardRevealed}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tap to Reveal Indicator - neutral, suit-agnostic: never leaks the suit */}
        <AnimatePresence>
          {currentCard && !cardRevealed && (
            <motion.div
              key="reveal-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center"
            >
              <p className="text-ink font-display uppercase tracking-tight text-lg mb-2">
                Carte face cachée
              </p>
              <p className="text-ink-secondary font-sans text-sm mb-3">
                Fais deviner sa valeur à la table avant de la retourner
              </p>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-surface border-2 border-ink shadow-brutal-sm"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="w-2 h-2 rounded-full bg-neon" aria-hidden="true" />
                <p className="text-ink font-sans text-sm uppercase tracking-wider font-bold">
                  Toucher pour révéler
                </p>
                <span className="w-2 h-2 rounded-full bg-neon" aria-hidden="true" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rule Display */}
        <AnimatePresence>
          {currentRule && currentCard && cardRevealed && (
            <motion.div
              key="rule"
              variants={ruleVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full max-w-sm mx-auto mt-8"
            >
              <div className="bg-surface-elevated border border-border-strong rounded-card p-6 relative overflow-hidden">
                {/* Suit watermark in background */}
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 text-ink pointer-events-none select-none">
                  {SUIT_SYMBOLS[currentCard.suit]}
                </div>

                <div className="relative z-10">
                  {/* Suit icon header - hearts and diamonds red, spades and clubs neutral */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div
                      className={cn(
                        'p-2 rounded-full border',
                        currentCard.suit === 'hearts' || currentCard.suit === 'diamonds'
                          ? 'bg-neon/10 border-neon/30 text-neon'
                          : 'bg-ink/5 border-border-strong text-ink'
                      )}
                    >
                      <SuitIcon suit={currentCard.suit} />
                    </div>
                  </div>

                  {/* Rule title */}
                  <h3 className="font-display text-2xl uppercase tracking-tight text-center text-ink">
                    {currentRule.title}
                  </h3>

                  <div className="h-px bg-border-strong my-4" />

                  {/* Rule description */}
                  <p className="text-ink-secondary font-sans text-center leading-relaxed text-sm sm:text-base">
                    {currentRule.description}
                  </p>

                  {/* Card value indicator (le Joker n'a pas de valeur) */}
                  {!isJoker && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <span className="text-ink-muted font-sans text-xs uppercase tracking-wider">
                        Valeur
                      </span>
                      <span className="font-mono tabular-nums font-bold text-lg text-neon">
                        {currentCard.rank} {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!currentCard && gamePhase === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              className="relative w-28 h-40 mx-auto mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-card bg-surface border-2 border-border transform rotate-[-6deg] translate-x-1" />
              <div className="absolute inset-0 rounded-card bg-surface-elevated border-2 border-border-strong transform rotate-[-3deg]" />
              <div className="absolute inset-0 rounded-card bg-surface-elevated border-2 border-dashed border-neon/40 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-10 h-10 text-neon/50 mx-auto mb-2" aria-hidden="true" />
                  <span className="text-neon/70 font-mono text-xs uppercase tracking-wider">Piochez</span>
                </div>
              </div>
            </motion.div>

            <p className="text-ink font-display text-xl uppercase tracking-tight mb-2">
              La table t&apos;attend
            </p>
            <p className="text-ink-secondary font-sans text-sm">
              Tire ta première carte pour commencer la partie
            </p>
          </motion.div>
        )}
      </main>

      {/* Action Zone - Bottom (thumb zone) */}
      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10">
        <ActionButtons
          onDrawCard={handleDrawCard}
          onStartContest={handleStartContest}
          onNextTurn={handleNextTurn}
          gamePhase={gamePhase}
          hasCurrentCard={!!currentCard}
          cardRevealed={cardRevealed}
          canContest={!isJoker}
        />
      </footer>

      {/* Contest Modal */}
      <ContestModal
        isOpen={showContestModal || gamePhase === 'contest'}
        contestState={contestState}
        challengedPlayer={currentPlayer}
        penalty={penalty}
        onEscalate={handleEscalate}
        onAccept={handleAcceptPenalty}
        onClose={handleCloseModal}
      />
    </motion.div>
  )
}
