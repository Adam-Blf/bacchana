import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Bacchana - direction « Loto ». Un bouton est un carton découpé posé sur la
// table : coins arrondis, ombre courte qui le décolle du fond.
//
// Presser un bouton, c'est POSER un jeton : le carton descend de deux points
// et son ombre se couche sous lui. L'ombre ne disparaît pas d'un coup, elle
// suit le mouvement, c'est ce qui rend l'appui physique.
//
// Le rouge jeton (`neon`) est réservé à ce qui se presse ou qui est choisi.
// Son encre est TOUJOURS `sur-surimpression`, qui bascule avec lui : blanc sur
// le rouge profond du thème clair, encre de nuit sur le rouge vif du sombre.
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: cn(
    'bg-neon text-sur-surimpression font-bold',
    'shadow-gravure hover:bg-neon-soft',
    'active:translate-y-0.5 active:shadow-none'
  ),
  secondary: cn(
    'bg-surface text-ink font-bold',
    'border border-ink shadow-gravure',
    // Le survol passe sur un carton FIXE (aplat-1, jaune poussin) : la, c'est
    // bien tile-ink qu'il faut, jamais l'encre themable, qui virerait au clair
    // en sombre. Le cerne suit le texte.
    'hover:bg-aplat-1 hover:text-tile-ink hover:border-tile-ink',
    'active:translate-y-0.5 active:shadow-none'
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
  xl: 'px-8 min-h-[60px] text-xl gap-3',
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
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center',
          'font-sans rounded-control',
          'transition-[background-color,box-shadow,translate] duration-100 ease-out',
          'focus-ring-neon',
          variantStyles[variant],
          sizeStyles[size],
          // L'etat desactive change de FORME, pas d'intensite : contour seul,
          // encre sourde, plus d'aplat ni d'ombre. Un carton qu'on ne peut pas
          // prendre ne se decolle pas de la table.
          disabled &&
            'bg-transparent text-ink-muted border border-border-strong shadow-none cursor-not-allowed pointer-events-none',
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
