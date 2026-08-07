import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Bacchana - boutons néobrutalistes : aplat + bordure encre 2px + ombre dure.
// L'état pressé "écrase" l'ombre (translation vers le coin de l'ombre).
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: cn(
    // Encre fixe pour le texte ET pour le cerne et l'ombre : sur orange, l'encre
    // themable passe au creme en sombre et tombe a 2.2:1. Seul le texte avait ete
    // corrige, le cerne etait reste thematique malgre ce commentaire.
    'bg-neon text-tile-ink font-bold',
    'border-2 border-tile-ink shadow-tile',
    'hover:bg-neon-soft',
    'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
  ),
  secondary: cn(
    'bg-surface text-ink font-bold',
    'border-2 border-ink shadow-brutal',
    // Encre fixe au survol : le fond passe sur un aplat pop clair (jaune),
    // l'encre themable (creme en sombre) y tomberait a ~1.2:1. Le cerne suit,
    // pour la meme raison que le texte.
    'hover:bg-pop-yellow hover:text-tile-ink hover:border-tile-ink',
    'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
  ),
  ghost: cn(
    'bg-transparent text-ink-secondary font-medium',
    'hover:text-ink hover:bg-ink/5'
  ),
}

const sizeStyles = {
  sm: 'px-4 min-h-touch text-sm gap-1.5',
  md: 'px-5 min-h-touch text-base gap-2',
  lg: 'px-6 min-h-row text-lg gap-2',
  xl: 'px-8 min-h-[56px] text-xl gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-sans rounded-control',
          'transition-[background-color,transform,box-shadow] duration-100',
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
