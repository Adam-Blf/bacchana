import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Neo-Tokyo Borderland button styles - neon-deep fond plein pour l'action
// principale, surface + bordure pour le secondaire, transparent pour le ghost.
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: cn(
    'bg-neon-deep text-white font-semibold',
    'shadow-[0_4px_0_#7f1d1d,0_6px_14px_rgba(0,0,0,0.5)]',
    'hover:bg-[#e33636] hover:shadow-[0_5px_0_#7f1d1d,0_10px_24px_rgba(0,0,0,0.5),0_0_24px_rgba(255,59,65,0.35)]',
    'active:translate-y-[2px] active:shadow-[0_2px_0_#7f1d1d,0_3px_8px_rgba(0,0,0,0.4)]'
  ),
  secondary: cn(
    'bg-surface border border-border-strong text-ink font-semibold',
    'hover:border-neon/50 hover:text-neon'
  ),
  ghost: cn(
    'bg-transparent text-ink-secondary font-medium',
    'hover:text-ink hover:bg-surface/60'
  ),
}

const sizeStyles = {
  sm: 'px-4 min-h-[44px] text-sm gap-1.5',
  md: 'px-5 min-h-[44px] text-base gap-2',
  lg: 'px-6 min-h-[52px] text-lg gap-2',
  xl: 'px-8 min-h-[56px] text-xl gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-sans rounded-control',
          'transition-colors duration-200',
          'focus-ring-neon',

          // Variant styles
          variantStyles[variant],

          // Size styles
          sizeStyles[size],

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',

          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
