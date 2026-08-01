import { forwardRef } from 'react'
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

// Casino Luxe color scheme - Black Card / Gold elegance
const suitColorMap: Record<Suit, { text: string; glow: string; glowClass: string; accent: string }> = {
  hearts: { text: 'text-poker-red-light', glow: 'text-glow-red', glowClass: 'glow-red-subtle', accent: 'border-poker-red/40' },
  diamonds: { text: 'text-poker-red-light', glow: 'text-glow-red', glowClass: 'glow-red-subtle', accent: 'border-poker-red/40' },
  clubs: { text: 'text-gold', glow: 'text-glow-gold-subtle', glowClass: 'glow-gold-subtle', accent: 'border-gold/40' },
  spades: { text: 'text-gold', glow: 'text-glow-gold-subtle', glowClass: 'glow-gold-subtle', accent: 'border-gold/40' },
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

    return (
      <motion.div
        ref={ref}
        className={cn(
          'perspective-1000 cursor-pointer select-none',
          sizeStyle.container,
          className
        )}
        onClick={handleClick}
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
          {/* Front Face - Black Card / Gold Style */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-xl',
              'bg-gradient-to-b from-velvet via-obsidian to-black',
              'border-2 border-gold/50',
              'flex flex-col justify-between p-3',
              'shadow-2xl shadow-black/60',
              colors.text,
              isHighlighted && [colors.glowClass, 'border-gold glow-gold']
            )}
          >
            {/* Subtle inner frame */}
            <div className="absolute inset-2 rounded-lg border border-gold/10 pointer-events-none" />

            {/* Corner gold accents */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gold/40 rounded-tl-sm" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gold/40 rounded-tr-sm" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gold/40 rounded-bl-sm" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gold/40 rounded-br-sm" />

            {/* Top Left Corner */}
            <div className="flex flex-col items-start leading-none z-10">
              <span className={cn('font-cinzel font-bold', sizeStyle.corner, colors.glow)}>
                {rank}
              </span>
              <span className={cn(sizeStyle.corner, 'mt-0.5')}>{symbol}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center z-10">
              <span className={cn(sizeStyle.symbol, colors.glow, 'drop-shadow-lg')}>
                {symbol}
              </span>
            </div>

            {/* Bottom Right Corner (rotated) */}
            <div className="flex flex-col items-end leading-none rotate-180 z-10">
              <span className={cn('font-cinzel font-bold', sizeStyle.corner, colors.glow)}>
                {rank}
              </span>
              <span className={cn(sizeStyle.corner, 'mt-0.5')}>{symbol}</span>
            </div>

            {/* Subtle shine overlay */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 40%, transparent 60%, rgba(212,175,55,0.03) 100%)',
              }}
            />
          </div>

          {/* Back Face - Obsidian & Gold Design */}
          <div
            className={cn(
              'absolute inset-0 backface-hidden rounded-xl rotate-y-180',
              'card-back-obsidian',
              'border-2 border-gold glow-gold',
              'overflow-hidden'
            )}
          >
            {/* Gold Geometric Pattern Overlay */}
            <div className="absolute inset-0 obsidian-pattern" />

            {/* Inner Border Frame */}
            <div className="absolute inset-2 rounded-lg border border-gold/30" />

            {/* Corner Accents */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold/60" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold/60" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold/60" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold/60" />

            {/* Center Logo - "B" in Gold Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  'rounded-full border-2 border-gold',
                  'flex items-center justify-center',
                  'bg-black/50 backdrop-blur-sm',
                  'glow-gold',
                  sizeStyle.logo
                )}
              >
                <span className="text-gold font-bold text-glow-gold">B</span>
              </div>
            </div>

            {/* Subtle Shine Effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 50%, transparent 100%)',
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    )
  }
)

PlayingCard.displayName = 'PlayingCard'
