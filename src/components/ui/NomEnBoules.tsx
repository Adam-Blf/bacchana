import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

// Le nom de l'application, tiré boule par boule comme au loto.
//
// Chaque lettre est une boule dont l'anneau prend, dans l'ordre, la couleur
// des quatre cartons. Le titre reste UN titre pour les lecteurs d'écran : les
// boules sont décoratives, le nom est porté par `aria-label`.
//
// Le tirage est le seul moment de mouvement de l'écran d'accueil : chaque boule
// tombe de quelques points avec un rebond court, à 45 ms de la précédente.
// Sous `prefers-reduced-motion`, le MotionConfig de l'application coupe le
// déplacement et ne garde que l'apparition.

const NOM = 'BACCHANA'

// L'anneau est une ombre, il ne prend pas de place dans la mise en page : il
// déborde de 0,18 em plus deux points de chaque côté. L'écart entre boules est
// donc choisi pour que deux anneaux voisins ne se touchent pas. Sur 390 points
// moins les marges de l'accueil (342 points), huit boules de 30 points tiennent
// en 334 points anneaux compris.
const tailles = {
  grand: { boule: 'w-[30px] h-[30px] text-lg sm:w-12 sm:h-12 sm:text-3xl', ecart: 'gap-3 sm:gap-5' },
  petit: { boule: 'w-7 h-7 text-base sm:w-9 sm:h-9 sm:text-xl', ecart: 'gap-2.5 sm:gap-3' },
}

interface NomEnBoulesProps {
  taille?: keyof typeof tailles
  className?: string
  /** Délai avant la première boule, en secondes. */
  delai?: number
}

export function NomEnBoules({ taille = 'grand', className, delai = 0 }: NomEnBoulesProps) {
  return (
    <h1
      aria-label="Bacchana"
      className={cn('flex justify-center', tailles[taille].ecart, className)}
    >
      {NOM.split('').map((lettre, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.3, delay: delai + i * 0.045 }}
          className={cn('boule', tailles[taille].boule)}
          style={{ '--boule': `var(--color-aplat-${(i % 4) + 1})` } as CSSProperties}
        >
          {lettre}
        </motion.span>
      ))}
    </h1>
  )
}
