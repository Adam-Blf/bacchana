import { forwardRef, type KeyboardEvent } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Crown, Gem, Sparkles, Sword } from 'lucide-react'
import type { Card, Rank, Suit } from '@/types'
import { SUIT_FRENCH_NAMES, SUIT_SYMBOLS } from '@/types'
import { cn } from '@/utils'

export interface PlayingCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  card: Card
  isRevealed?: boolean
  onReveal?: () => void
  size?: 'sm' | 'md' | 'lg'
  isHighlighted?: boolean
  onFlipComplete?: () => void
}

// Cœur + carreau en rouge (card-red), pique + trèfle en encre noire (card-ink)
const suitColorMap: Record<Suit, { text: string }> = {
  hearts: { text: 'text-card-red' },
  diamonds: { text: 'text-card-red' },
  clubs: { text: 'text-card-ink' },
  spades: { text: 'text-card-ink' },
}

const sizeStyles = {
  sm: { container: 'w-20 h-28', symbol: 'text-3xl', corner: 'text-xs', pip: 'text-[10px]', face: 'w-5 h-5', faceLetter: 'text-lg' },
  md: { container: 'w-28 h-40', symbol: 'text-5xl', corner: 'text-sm', pip: 'text-sm', face: 'w-8 h-8', faceLetter: 'text-2xl' },
  lg: { container: 'w-36 h-52', symbol: 'text-7xl', corner: 'text-base', pip: 'text-lg', face: 'w-10 h-10', faceLetter: 'text-3xl' },
}

const flipTransition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1] as const,
}

// Disposition classique des symboles (pips) pour les cartes 2 à 10, en pourcentage
// de la zone centrale. Les pips de la moitié basse sont retournés, comme sur un
// vrai jeu de cartes - chaque carte a ainsi sa silhouette propre.
type PipPos = { x: number; y: number }
const PIP_LAYOUTS: Record<Exclude<Rank, 'A' | 'J' | 'Q' | 'K' | 'JOKER'>, PipPos[]> = {
  '2': [{ x: 50, y: 12 }, { x: 50, y: 88 }],
  '3': [{ x: 50, y: 12 }, { x: 50, y: 50 }, { x: 50, y: 88 }],
  '4': [{ x: 28, y: 12 }, { x: 72, y: 12 }, { x: 28, y: 88 }, { x: 72, y: 88 }],
  '5': [{ x: 28, y: 12 }, { x: 72, y: 12 }, { x: 50, y: 50 }, { x: 28, y: 88 }, { x: 72, y: 88 }],
  '6': [{ x: 28, y: 12 }, { x: 72, y: 12 }, { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 28, y: 88 }, { x: 72, y: 88 }],
  '7': [
    { x: 28, y: 12 }, { x: 72, y: 12 }, { x: 50, y: 31 },
    { x: 28, y: 50 }, { x: 72, y: 50 },
    { x: 28, y: 88 }, { x: 72, y: 88 },
  ],
  '8': [
    { x: 28, y: 12 }, { x: 72, y: 12 }, { x: 50, y: 31 },
    { x: 28, y: 50 }, { x: 72, y: 50 }, { x: 50, y: 69 },
    { x: 28, y: 88 }, { x: 72, y: 88 },
  ],
  '9': [
    { x: 28, y: 10 }, { x: 72, y: 10 }, { x: 28, y: 37 }, { x: 72, y: 37 },
    { x: 50, y: 50 },
    { x: 28, y: 63 }, { x: 72, y: 63 }, { x: 28, y: 90 }, { x: 72, y: 90 },
  ],
  '10': [
    { x: 28, y: 10 }, { x: 72, y: 10 }, { x: 50, y: 23 }, { x: 28, y: 37 }, { x: 72, y: 37 },
    { x: 28, y: 63 }, { x: 72, y: 63 }, { x: 50, y: 77 }, { x: 28, y: 90 }, { x: 72, y: 90 },
  ],
}

// Figures : chaque tête a son emblème - valet à l'épée, dame au joyau, roi couronné.
const FACE_ICONS = { J: Sword, Q: Gem, K: Crown } as const

interface CardCenterProps {
  rank: Rank
  suit: Suit
  size: keyof typeof sizeStyles
}

function CardCenter({ rank, suit, size }: CardCenterProps) {
  const symbol = SUIT_SYMBOLS[suit]
  const sizeStyle = sizeStyles[size]

  // As : grand symbole unique au centre, dans un cadre discret.
  if (rank === 'A') {
    return (
      <div className="flex-1 flex items-center justify-center z-10">
        <span className={cn(sizeStyle.symbol)}>{symbol}</span>
      </div>
    )
  }

  // Joker : étoile éclatante et lettrage, la carte hors norme du paquet.
  if (rank === 'JOKER') {
    return (
      <div className="flex-1 min-h-0 relative z-10">
        <div
          className={cn(
            'absolute inset-x-1 inset-y-0 rounded-control border-2 border-dashed border-current',
            'flex flex-col items-center justify-center gap-1 overflow-hidden'
          )}
        >
          <Sparkles className={cn(sizeStyle.face, 'relative shrink-0')} aria-hidden="true" />
          <span className={cn('font-display relative leading-none tracking-widest', size === 'sm' ? 'text-[10px]' : 'text-sm')}>
            JOKER
          </span>
        </div>
      </div>
    )
  }

  // Figures : cadre en miroir, comme sur une vraie carte de cour - emblème en
  // haut, emblème inversé en bas, lettre au centre sur la diagonale.
  if (rank === 'J' || rank === 'Q' || rank === 'K') {
    const FaceIcon = FACE_ICONS[rank]
    return (
      <div className="flex-1 min-h-0 relative z-10">
        <div className="absolute inset-x-1 inset-y-0 rounded-control border-2 border-current overflow-hidden">
          {/* Diagonale de séparation, signature des cartes de cour */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to top right, transparent calc(50% - 1px), currentColor calc(50% - 1px), currentColor calc(50% + 1px), transparent calc(50% + 1px))',
            }}
            aria-hidden="true"
          />
          {/* Emblème haut (droit) et bas (miroir) */}
          <FaceIcon
            className={cn(sizeStyle.face, 'absolute top-1 left-1.5 shrink-0')}
            aria-hidden="true"
          />
          <FaceIcon
            className={cn(sizeStyle.face, 'absolute bottom-1 right-1.5 rotate-180 shrink-0')}
            aria-hidden="true"
          />
          {/* Lettre centrale sur pastille */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                'font-display leading-none px-1.5 py-0.5 rounded-control border-2 border-current bg-card-face',
                sizeStyle.faceLetter
              )}
            >
              {rank}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Cartes chiffrées : vraie disposition de pips, moitié basse retournée.
  const pips = PIP_LAYOUTS[rank]
  return (
    <div className="flex-1 min-h-0 relative z-10 mx-1 my-1">
      {pips.map((pip, i) => (
        <span
          key={i}
          className={cn('absolute leading-none', sizeStyle.pip)}
          style={{ left: `${pip.x}%`, top: `${pip.y}%`, transform: `translate(-50%, -50%)${pip.y > 50 ? ' rotate(180deg)' : ''}` }}
          aria-hidden="true"
        >
          {symbol}
        </span>
      ))}
    </div>
  )
}

export const PlayingCard = forwardRef<HTMLDivElement, PlayingCardProps>(
  ({ card, isRevealed = true, onReveal, size = 'md', isHighlighted, onFlipComplete, className, ...props }, ref) => {
    const { suit, rank } = card
    const symbol = SUIT_SYMBOLS[suit]
    const colors = suitColorMap[suit]
    const sizeStyle = sizeStyles[size]

    const handleClick = () => {
      if (!isRevealed && onReveal) {
        onReveal()
      }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isRevealed && onReveal && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        onReveal()
      }
    }

    return (
      <motion.div
        ref={ref}
        role={!isRevealed ? 'button' : undefined}
        tabIndex={!isRevealed ? 0 : undefined}
        aria-label={
          !isRevealed
            ? 'Carte face cachée - retourner la carte'
            : rank === 'JOKER'
              ? 'Joker'
              : `${rank} de ${SUIT_FRENCH_NAMES[suit]}`
        }
        className={cn(
          'perspective-1000 cursor-pointer select-none',
          'focus-ring-neon rounded-card',
          sizeStyle.container,
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        whileTap={!isRevealed ? { scale: 0.98 } : undefined}
        {...props}
      >
        {/* Card Inner - handles the 3D rotation.
            initial={false}: a card that mounts hidden starts back-side up immediately,
            the face must never flash before the player flips it. */}
        <motion.div
          className="w-full h-full relative preserve-3d"
          initial={false}
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={flipTransition}
          onAnimationComplete={onFlipComplete}
        >
          {/* Front Face - carte blanche, bordure encre, ombre dure */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-card',
              'bg-card-face',
              'border-2 border-ink',
              'flex flex-col justify-between p-3',
              'shadow-brutal-lg',
              colors.text,
              isHighlighted && 'ring-2 ring-neon'
            )}
          >
            {/* Top Left Corner */}
            <div className="flex flex-col items-start z-10">
              <span className={cn('font-mono font-bold leading-none', sizeStyle.corner)}>
                {rank === 'JOKER' ? '★' : rank}
              </span>
              <span className={cn(sizeStyle.corner, 'leading-none mt-0.5')}>
                {rank === 'JOKER' ? '★' : symbol}
              </span>
            </div>

            {/* Center - unique par rang : as, pips 2-10, figures V/D/R */}
            <CardCenter rank={rank} suit={suit} size={size} />

            {/* Bottom Right Corner (rotated) */}
            <div className="flex flex-col items-end rotate-180 z-10">
              <span className={cn('font-mono font-bold leading-none', sizeStyle.corner)}>
                {rank === 'JOKER' ? '★' : rank}
              </span>
              <span className={cn(sizeStyle.corner, 'leading-none mt-0.5')}>
                {rank === 'JOKER' ? '★' : symbol}
              </span>
            </div>
          </div>

          {/* Back Face - asset signature La Tournée */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-card rotate-y-180',
              'overflow-hidden border-2 border-ink shadow-brutal-lg'
            )}
          >
            <img
              src="/card-back.svg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </motion.div>
      </motion.div>
    )
  }
)

PlayingCard.displayName = 'PlayingCard'
