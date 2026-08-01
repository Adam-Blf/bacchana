import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Crown, Sparkles, Spade, Heart, Club, Diamond } from 'lucide-react'
import { useGameStore } from '@/stores'
import { SUIT_RULES, SUIT_SYMBOLS } from '@/types'
import type { Player, GamePhase, Suit } from '@/types'
import { Button } from '@/components/ui'
import { PlayingCard } from './PlayingCard'
import { ContestModal } from './ContestModal'
import { cn } from '@/utils'
import { calculatePenalty } from '@/stores/gameStore'

// Suit icon component for elegant display
const SuitIcon = ({ suit, className }: { suit: Suit; className?: string }) => {
  const iconProps = { className: cn('w-5 h-5', className) }
  switch (suit) {
    case 'hearts': return <Heart {...iconProps} fill="currentColor" />
    case 'diamonds': return <Diamond {...iconProps} fill="currentColor" />
    case 'clubs': return <Club {...iconProps} fill="currentColor" />
    case 'spades': return <Spade {...iconProps} fill="currentColor" />
  }
}

// Suit color mapping for rule display
const suitStyleMap: Record<Suit, { icon: string; text: string; bg: string }> = {
  hearts: { icon: 'text-poker-red-light', text: 'text-poker-red-light', bg: 'bg-poker-red/10' },
  diamonds: { icon: 'text-poker-red-light', text: 'text-poker-red-light', bg: 'bg-poker-red/10' },
  clubs: { icon: 'text-gold', text: 'text-gold', bg: 'bg-gold/10' },
  spades: { icon: 'text-gold', text: 'text-gold', bg: 'bg-gold/10' },
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
}

function StatusBar({ currentPlayer, cardsRemaining, totalCards }: StatusBarProps) {
  const progress = ((totalCards - cardsRemaining) / totalCards) * 100

  return (
    <motion.div className="space-y-5" variants={statusVariants}>
      {/* VIP Player Zone - Centered elegant design */}
      <div className="text-center relative">
        {/* Decorative flourish */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex-1 max-w-16 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-b from-gold/20 to-gold/5 border-2 border-gold/50 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 20px rgba(212,175,55,0.2)', '0 0 30px rgba(212,175,55,0.4)', '0 0 20px rgba(212,175,55,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-6 h-6 text-gold" />
          </motion.div>
          <div className="flex-1 max-w-16 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* Player name - Serif typography */}
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-gold text-glow-gold-subtle tracking-wide">
          {currentPlayer?.name ?? 'Joueur'}
        </h2>

        {/* Elegant subtitle */}
        <p className="text-text-secondary font-montserrat text-sm mt-1 italic">
          C'est à votre tour de distribuer
        </p>
      </div>

      {/* Progress & Cards - Compact elegant bar */}
      <div className="flex items-center gap-4">
        {/* Progress bar - Gold style */}
        <div className="flex-1 relative h-2 rounded-full bg-velvet-deep overflow-hidden border border-gold/20">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/80 via-gold to-gold-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </div>

        {/* Cards remaining - Compact chip style */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-velvet border border-gold/30">
          <Sparkles className="w-3.5 h-3.5 text-gold/70" />
          <span className="text-ivory font-cinzel font-bold text-sm">
            {cardsRemaining}
          </span>
          <span className="text-text-muted font-montserrat text-xs">/{totalCards}</span>
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
}

function ActionButtons({ onDrawCard, onStartContest, onNextTurn, gamePhase, hasCurrentCard }: ActionButtonsProps) {
  if (gamePhase === 'setup') {
    return (
      <p className="text-center text-text-muted font-montserrat">
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
        <p className="font-cinzel text-3xl font-bold text-gold text-glow-gold mb-2">
          GAME OVER
        </p>
        <p className="text-text-muted font-montserrat text-sm">
          Toutes les cartes ont été jouées
        </p>
      </motion.div>
    )
  }

  if (gamePhase === 'playing' && !hasCurrentCard) {
    return (
      <Button
        variant="chip"
        color="gold"
        size="xl"
        className="w-full animate-glow-pulse"
        onClick={onDrawCard}
      >
        <Sparkles className="w-6 h-6 mr-3" />
        <span className="text-xl tracking-wide">TIRER UNE CARTE</span>
      </Button>
    )
  }

  if ((gamePhase === 'playing' || gamePhase === 'resolution') && hasCurrentCard) {
    return (
      <div className="flex flex-col gap-4">
        {/* Contest button - Red chip */}
        <Button
          variant="chip"
          color="red"
          size="lg"
          className="w-full"
          onClick={onStartContest}
        >
          <span className="text-lg tracking-wide">CONTESTER</span>
        </Button>

        {/* Next turn button */}
        <Button
          variant="outline"
          color="gold"
          size="lg"
          className="w-full"
          onClick={onNextTurn}
        >
          TOUR SUIVANT
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
  } = useGameStore()

  const currentPlayer = getCurrentPlayer()
  const cardsRemaining = getCardsRemaining()
  const totalCards = 52

  const [showContestModal, setShowContestModal] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [lastCardId, setLastCardId] = useState<string | null>(null)

  // Reset reveal state when a new card is drawn (state adjusted during render,
  // see react.dev "adjusting state when a prop changes").
  // Only clubs stay hidden: "Le Guess" requires guessing the card first.
  if (currentCard && currentCard.id !== lastCardId) {
    setLastCardId(currentCard.id)
    setCardRevealed(currentCard.suit !== 'clubs')
  }

  const handleRevealCard = useCallback(() => {
    if (!cardRevealed) {
      setCardRevealed(true)
    }
  }, [cardRevealed])

  const currentRule = currentCard ? SUIT_RULES[currentCard.suit] : null

  const penalty = contestState.active && contestState.baseCard
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
        'p-4 pb-safe',
        'relative overflow-hidden',
        // Felt table background with texture
        'bg-gradient-to-b from-casino-green-light via-casino-green to-casino-green-dark',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Felt texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative casino elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Corner flourishes - Poker table style */}
        <div className="absolute top-3 left-3 w-20 h-20 border-t-2 border-l-2 border-gold/25 rounded-tl-3xl" />
        <div className="absolute top-3 right-3 w-20 h-20 border-t-2 border-r-2 border-gold/25 rounded-tr-3xl" />
        <div className="absolute bottom-3 left-3 w-20 h-20 border-b-2 border-l-2 border-gold/25 rounded-bl-3xl" />
        <div className="absolute bottom-3 right-3 w-20 h-20 border-b-2 border-r-2 border-gold/25 rounded-br-3xl" />

        {/* Inner corner diamonds */}
        <div className="absolute top-6 left-6 text-gold/20 text-lg">◆</div>
        <div className="absolute top-6 right-6 text-gold/20 text-lg">◆</div>
        <div className="absolute bottom-6 left-6 text-gold/20 text-lg">◆</div>
        <div className="absolute bottom-6 right-6 text-gold/20 text-lg">◆</div>

        {/* Central table spotlight glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold/[0.03] rounded-full blur-[80px]" />

        {/* Ambient card area glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[350px] bg-gold/[0.05] rounded-3xl blur-[60px]" />
      </div>

      {/* Home Button - Casino style */}
      {onQuit && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onQuit}
          className={cn(
            'fixed top-4 left-4 z-40',
            'w-12 h-12 rounded-full',
            'bg-velvet border-2 border-gold/40',
            'flex items-center justify-center',
            'text-gold/70 hover:text-gold',
            'hover:border-gold/60',
            'hover:shadow-gold-glow',
            'transition-all duration-300'
          )}
        >
          <Home className="w-5 h-5" />
        </motion.button>
      )}

      {/* Status Zone - Top */}
      <header className="flex-shrink-0 mb-6 mt-2 relative z-10">
        <StatusBar
          currentPlayer={currentPlayer}
          cardsRemaining={cardsRemaining}
          totalCards={totalCards}
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

        {/* Tap to Reveal Indicator - Only for Clubs (Le Guess rule) */}
        <AnimatePresence>
          {currentCard && currentCard.suit === 'clubs' && !cardRevealed && (
            <motion.div
              key="reveal-hint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-center"
            >
              <p className="text-gold font-cinzel text-lg mb-2">
                🎯 Le Guess
              </p>
              <p className="text-text-secondary font-montserrat text-sm mb-3">
                Demande à un joueur de deviner la valeur
              </p>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-gold"
                />
                <p className="text-gold font-montserrat text-sm uppercase tracking-wider">
                  Toucher pour révéler
                </p>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-gold"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rule Display - Elegant Cartouche Style */}
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
              <div className="rule-cartouche p-6 relative">
                {/* Suit watermark in background */}
                <div className={cn(
                  'suit-watermark',
                  suitStyleMap[currentCard.suit].icon
                )}>
                  {SUIT_SYMBOLS[currentCard.suit]}
                </div>

                <div className="relative z-10">
                  {/* Suit icon header */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={cn(
                      'p-2 rounded-full',
                      suitStyleMap[currentCard.suit].bg,
                      'border border-current/20'
                    )}>
                      <SuitIcon
                        suit={currentCard.suit}
                        className={cn('w-5 h-5', suitStyleMap[currentCard.suit].icon)}
                      />
                    </div>
                  </div>

                  {/* Rule title */}
                  <h3 className={cn(
                    'font-cinzel text-2xl font-bold text-center',
                    suitStyleMap[currentCard.suit].text,
                    'text-glow-gold-subtle'
                  )}>
                    {currentRule.title}
                  </h3>

                  {/* Gold divider */}
                  <div className="gold-divider my-4" />

                  {/* Rule description - Improved readability */}
                  <p className="text-ivory/90 font-montserrat text-center leading-relaxed text-sm sm:text-base">
                    {currentRule.description}
                  </p>

                  {/* Card value indicator */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="text-text-muted font-montserrat text-xs uppercase tracking-wider">
                      Valeur
                    </span>
                    <span className={cn(
                      'font-cinzel font-bold text-lg',
                      suitStyleMap[currentCard.suit].text
                    )}>
                      {currentCard.rank} {SUIT_SYMBOLS[currentCard.suit]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State - Elegant Poker Table Style */}
        {!currentCard && gamePhase === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Card placeholder - Stylized deck position */}
            <motion.div
              className="relative w-28 h-40 mx-auto mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Stacked cards effect */}
              <div className="absolute inset-0 rounded-xl bg-velvet-deep border-2 border-gold/20 transform rotate-[-6deg] translate-x-1" />
              <div className="absolute inset-0 rounded-xl bg-velvet border-2 border-gold/30 transform rotate-[-3deg]" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-velvet via-obsidian to-black border-2 border-dashed border-gold/40 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-10 h-10 text-gold/40 mx-auto mb-2" />
                  <span className="text-gold/60 font-cinzel text-xs uppercase tracking-wider">Piochez</span>
                </div>
              </div>
            </motion.div>

            <p className="text-gold/80 font-cinzel text-xl mb-2 tracking-wide">
              La Table Vous Attend
            </p>
            <p className="text-text-secondary font-montserrat text-sm italic">
              Tirez votre première carte pour commencer la partie
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
