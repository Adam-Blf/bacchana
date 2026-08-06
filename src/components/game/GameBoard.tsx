import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Spade, Heart, Club, Diamond } from 'lucide-react'
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
  onStartContest: () => void
  onNextTurn: () => void
  gamePhase: GamePhase
  hasCurrentCard: boolean
  cardRevealed: boolean
  canContest: boolean
}

function ActionButtons({ onStartContest, onNextTurn, gamePhase, hasCurrentCard, cardRevealed, canContest }: ActionButtonsProps) {
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
    // Le geste de pioche vit sur le paquet lui-meme (bouton accessible au
    // clavier dans la zone centrale) : pas de doublon dans la thumb zone.
    return null
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
    players,
  } = useGameStore()

  const currentPlayer = getCurrentPlayer()
  const cardsRemaining = getCardsRemaining()
  // Taille réelle du paquet (1 à 3 paquets, jokers compris) - plus jamais un 52 codé en dur.
  const totalCards = cardsRemaining + discardPile.length + (currentCard ? 1 : 0)

  // Joueurs éligibles à contester la carte du joueur courant - jamais lui-même,
  // sans quoi la contestation opposait un joueur à lui-même ("Adam VS Adam").
  const contestCandidates = players.filter((p) => p.active && p.id !== currentPlayer?.id)

  const [showContestModal, setShowContestModal] = useState(false)
  const [contestPickerOpen, setContestPickerOpen] = useState(false)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [lastCardId, setLastCardId] = useState<string | null>(null)

  // Seul le TREFLE arrive face cachee, parce que sa regle - « Le Guess » - est
  // la seule qui exige une phase cachee : il faut faire deviner la valeur AVANT
  // de retourner. Les trois autres enseignes donnent leur consigne une fois la
  // carte visible, les cacher n'apportait rien.
  //
  // L'ancien code cachait TOUT, au motif qu'« une carte cachee qui ne pouvait
  // etre qu'un trefle trahissait le trefle ». Deux raisons de ne pas garder ce
  // raisonnement. D'abord la table DOIT savoir qu'un tour de Guess commence,
  // sinon personne ne peut deviner. Ensuite on devine la VALEUR, pas
  // l'enseigne : savoir que c'est un trefle ne dit rien du Roi ou du 7.
  // Consequence de l'ancien comportement : la consigne « fais deviner avant de
  // retourner » s'affichait sur chaque carte, et seulement APRES le
  // retournement, donc au moment ou elle etait devenue impossible a suivre.
  const besoinDeviner = currentCard?.suit === 'clubs' && currentCard.rank !== 'JOKER'
  if (currentCard && currentCard.id !== lastCardId) {
    setLastCardId(currentCard.id)
    setCardRevealed(!besoinDeviner)
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

  // "Contester" ouvre d'abord le choix du contestataire (jamais le joueur courant) -
  // avec un seul candidat, on saute l'étape pour ne pas ajouter de friction inutile.
  const handleStartContest = useCallback(() => {
    if (contestCandidates.length === 0) return
    if (contestCandidates.length === 1) {
      startContest(contestCandidates[0])
      setShowContestModal(true)
      return
    }
    setContestPickerOpen(true)
  }, [contestCandidates, startContest])

  const handlePickContestant = useCallback(
    (contestant: Player) => {
      startContest(contestant)
      setContestPickerOpen(false)
      setShowContestModal(true)
    },
    [startContest]
  )

  const handleEscalate = useCallback(() => {
    const contestant = contestState.challenger ?? currentPlayer
    if (contestant) {
      escalateContest(contestant)
    }
  }, [contestState.challenger, currentPlayer, escalateContest])

  // Le perdant reel de la contestation est choisi explicitement (challenger ou defie) -
  // plus jamais attribue par defaut au joueur courant.
  const handleAcceptPenalty = useCallback(
    (loser: Player) => {
      resolveContest(loser)
      setShowContestModal(false)
      cancelContest()
    },
    [resolveContest, cancelContest]
  )

  const handleCloseModal = useCallback(() => {
    setShowContestModal(false)
    setContestPickerOpen(false)
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
      {/* Texture de fond a bords nets derriere la zone de carte. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-hatch" />
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

        {/* Invite au Guess. Elle ne s'affiche que sur un trefle, la seule enseigne
            a phase cachee, et elle nomme donc la regle sans detour. */}
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
                Trèfle - Le Guess
              </p>
              <p className="text-ink-secondary font-sans text-sm mb-3">
                Fais deviner sa valeur exacte à la table avant de la retourner
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
                      {/* Sur bg-surface-elevated (conteneur parent), ink-muted (3.80:1)
                          repasse sous l'AA texte : ink-secondary tient 4.52:1 minimum. */}
                      <span className="text-ink-secondary font-sans text-xs uppercase tracking-wider">
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

        {/* Empty State - le paquet EST le bouton de pioche : on tape la pile
            pour tirer, comme a une vraie table (demande du 2026-08-02). */}
        {!currentCard && gamePhase === 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.button
              type="button"
              onClick={handleDrawCard}
              aria-label="Tirer une carte du paquet"
              className="relative w-36 h-52 mx-auto mb-6 block cursor-pointer focus-ring-neon rounded-card"
              /* Les trois dos portent border-tile-ink et shadow-tile : leur fond est
                 l'image card-back.svg, creme fixe dans les deux themes. Le cerne ne
                 peut donc pas suivre --color-ink. La garde check_tile_ink ne voit
                 pas ce cas, faute de classe de fond a lire. */
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileTap={{ scale: 0.95, y: 2 }}
            >
              <div className="absolute inset-0 rounded-card overflow-hidden border-2 border-tile-ink shadow-tile transform rotate-[-7deg] translate-x-2 translate-y-1">
                <img src="/card-back.svg" alt="" className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="absolute inset-0 rounded-card overflow-hidden border-2 border-tile-ink shadow-tile transform rotate-[-3deg]">
                <img src="/card-back.svg" alt="" className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="absolute inset-0 rounded-card overflow-hidden border-2 border-tile-ink shadow-tile-lg">
                <img src="/card-back.svg" alt="" className="w-full h-full object-cover" draggable={false} />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-pill bg-card-face border-2 border-tile-ink text-card-ink font-mono tabular-nums text-xs font-bold">
                  {getCardsRemaining()}
                </span>
              </div>
            </motion.button>

            <p className="text-ink font-display text-xl uppercase tracking-tight mb-2">
              Touche le paquet pour tirer
            </p>
            <p className="text-ink-secondary font-sans text-sm">
              {getCurrentPlayer()?.name ?? 'A toi'}, la table t&apos;attend
            </p>
          </motion.div>
        )}
      </main>

      {/* Action Zone - Bottom (thumb zone) */}
      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10">
        <ActionButtons
          onStartContest={handleStartContest}
          onNextTurn={handleNextTurn}
          gamePhase={gamePhase}
          hasCurrentCard={!!currentCard}
          cardRevealed={cardRevealed}
          canContest={!isJoker}
        />
      </footer>

      {/* Choix du contestataire - jamais le joueur courant lui-même */}
      <AnimatePresence>
        {contestPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-scrim/80 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Qui conteste ?"
            onClick={() => setContestPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-surface-elevated rounded-card border-2 border-neon p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-center text-xl font-display uppercase tracking-tight text-ink mb-4">
                Qui conteste ?
              </h2>
              <div className="flex flex-col gap-2">
                {contestCandidates.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePickContestant(p)}
                    className="min-h-[52px] rounded-control border-2 border-ink bg-surface shadow-brutal-sm px-4 font-sans font-bold text-ink focus-ring-neon active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
