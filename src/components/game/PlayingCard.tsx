import { forwardRef, type KeyboardEvent } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import type { Card, Suit } from '@/types'
import { SUIT_SYMBOLS } from '@/types'
import { cn } from '@/utils'

export interface PlayingCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  card: Card
  isRevealed?: boolean
  onReveal?: () => void
  size?: 'sm' | 'md' | 'lg'
  isHighlighted?: boolean
  onFlipComplete?: () => void
}

// Neo-Tokyo Borderland: coeur + carreau en rouge (card-red), pique + trefle en encre noire (card-ink)
const suitColorMap: Record<Suit, { text: string }> = {
  hearts: { text: 'text-card-red' },
  diamonds: { text: 'text-card-red' },
  clubs: { text: 'text-card-ink' },
  spades: { text: 'text-card-ink' },
}

const sizeStyles = {
  sm: { container: 'w-20 h-28', rank: 'text-lg', symbol: 'text-3xl', corner: 'text-xs', logo: 'w-8 h-8 text-sm' },
  md: { container: 'w-28 h-40', rank: 'text-2xl', symbol: 'text-5xl', corner: 'text-sm', logo: 'w-10 h-10 text-base' },
  lg: { container: 'w-36 h-52', rank: 'text-4xl', symbol: 'text-7xl', corner: 'text-base', logo: 'w-14 h-14 text-xl' },
}

const flipTransition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1] as const,
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
        aria-label={!isRevealed ? 'Retourner la carte' : `${rank} de ${suit}`}
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
            the face must never flash before the player flips it (Le Guess rule). */}
        <motion.div
          className="w-full h-full relative preserve-3d"
          initial={false}
          animate={{ rotateY: isRevealed ? 0 : 180 }}
          transition={flipTransition}
          onAnimationComplete={onFlipComplete}
        >
          {/* Front Face - carte blanc casse, seule surface claire de l'ecran */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-card',
              'bg-card-face',
              'border border-black/5',
              'flex flex-col justify-between p-3',
              'shadow-[0_12px_32px_rgba(0,0,0,0.5)]',
              colors.text,
              isHighlighted && 'shadow-neon-glow ring-2 ring-neon'
            )}
          >
            {/* Top Left Corner */}
            <div className="flex flex-col items-start leading-none z-10">
              <span className={cn('font-mono font-bold', sizeStyle.corner)}>
                {rank}
              </span>
              <span className={cn(sizeStyle.corner, 'mt-0.5')}>{symbol}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center z-10">
              <span className={cn(sizeStyle.symbol, 'drop-shadow-sm')}>
                {symbol}
              </span>
            </div>

            {/* Bottom Right Corner (rotated) */}
            <div className="flex flex-col items-end leading-none rotate-180 z-10">
              <span className={cn('font-mono font-bold', sizeStyle.corner)}>
                {rank}
              </span>
              <span className={cn(sizeStyle.corner, 'mt-0.5')}>{symbol}</span>
            </div>
          </div>

          {/* Back Face - surface sombre, motif minimal, liseret neon */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-card rotate-y-180',
              'card-back-borderland',
              'border border-neon/50',
              'overflow-hidden'
            )}
          >
            {/* Inner border frame */}
            <div className="absolute inset-2 rounded-control border border-ink/10" />

            {/* Center logo - "B" dans un cercle neon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  'rounded-full border-2 border-neon',
                  'flex items-center justify-center',
                  'bg-bg/60 backdrop-blur-sm',
                  sizeStyle.logo
                )}
              >
                <span className="text-neon font-display">B</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }
)

PlayingCard.displayName = 'PlayingCard'
