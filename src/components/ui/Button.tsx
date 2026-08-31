import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Bacchana - « Tirage de nuit ». Aplat + filet gravé d'un point. Il n'y a plus
// d'ombre : le système l'interdit, au même titre que le flou.
//
// L'état pressé ne peut donc plus "écraser une ombre" par translation - il
// n'y a plus rien à écraser, et le bouton restait sans repère depuis la
// bascule du 2026-08-30. Il ENFONCE désormais le filet : le trait passe de un
// à deux points en intérieur, ce qui creuse visiblement la surface sans la
// déplacer. La translation est retirée avec l'ombre qu'elle accompagnait,
// et le léger retrait d'échelle (whileTap) reste le retour tactile.
//
// L'encre d'un aplat d'accent est TOUJOURS sur-surimpression, jamais tile-ink :
// depuis le passage au pourpre, `neon` vaut pourpre en thème clair, où
// l'encre fixe tombe à 1,6:1. tile-ink ne vaut que sur les aplats FIXES
// (aplat-1 à aplat-4, cartes à jouer), qui eux ne changent pas avec le thème.
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: cn(
    'bg-neon text-sur-surimpression font-bold',
    'border border-sur-surimpression',
    'hover:bg-neon-soft',
    'active:shadow-[inset_0_0_0_2px_rgb(var(--c-sur-surimpression))]'
  ),
  secondary: cn(
    'bg-surface text-ink font-bold',
    'border border-ink',
    // Le survol passe sur un aplat FIXE (aplat-1, ambre) : la, c'est bien
    // tile-ink qu'il faut, et jamais l'encre themable, qui virerait au creme
    // en sombre et tomberait a ~1,2:1. Le cerne suit le texte.
    'hover:bg-aplat-1 hover:text-tile-ink hover:border-tile-ink',
    'active:shadow-[inset_0_0_0_2px_rgb(var(--c-ink))]'
  ),
  ghost: cn(
    'bg-transparent text-ink-secondary font-medium',
    'hover:text-ink hover:bg-ink/5'
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
        // `type="button"` par defaut. Sans formulaire parent c'est sans effet
        // aujourd'hui - mais le jour ou un champ est enveloppe dans un <form>,
        // une recherche ou une regle personnalisee, tous ces boutons
        // declencheraient un envoi et un rechargement de page. Le defaut du HTML
        // est `submit`, et il est faux pour la quasi-totalite de nos boutons.
        // Surchargeable : `{...props}` passe apres.
        type="button"
        whileTap={disabled ? undefined : { scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-sans rounded-control',
          'transition-[background-color,box-shadow] duration-100',
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
