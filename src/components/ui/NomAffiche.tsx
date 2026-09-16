import { motion } from 'framer-motion'
import { cn } from '@/utils'

// Le nom de l'application, composé comme le « SUPER LOTO » d'une affiche de
// salle des fêtes : une grotesque condensée, en capitales, calée à gauche.
//
// Le rouge est imprimé en second passage et tombe à côté du noir, d'un ou deux
// points, comme sur une affiche tirée en deux couleurs. C'est le SEUL endroit
// de l'application où ce décalage existe : répété partout, il deviendrait un
// filtre ; posé une fois, il dit « imprimé ».
//
// Le titre reste UN titre pour les lecteurs d'écran : la copie rouge est
// décorative et masquée, le nom est porté par `aria-label`.

// Le corps du nom est FLUIDE, et c'est un correctif, pas un raffinement : à
// 76 points fixes, « BACCHANA » mesurait 318 points de large et débordait de
// tout écran sous 360 - mesuré à 320 et à 340 par le balayage continu. Le
// `clamp` garde la taille d'affiche dès qu'il y a la place, et la rend au
// cadre quand il n'y en a pas. La borne haute est inchangée.
const tailles = {
  grand: 'text-[clamp(52px,19vw,76px)] sm:text-[120px]',
  petit: 'text-[clamp(28px,9vw,40px)] sm:text-[52px]',
}

interface NomAfficheProps {
  taille?: keyof typeof tailles
  className?: string
}

export function NomAffiche({ taille = 'grand', className }: NomAfficheProps) {
  const lettrage = cn(
    'font-display font-black uppercase leading-[0.8] tracking-[-0.01em]',
    tailles[taille]
  )
  return (
    <h1 aria-label="Bacchana" className={cn('relative inline-block select-none', className)}>
      {/* Le passage rouge. Il arrive calé sur le noir puis glisse de deux
          points : le registre qui se décale, une seule fois, à l'ouverture. */}
      <motion.span
        aria-hidden="true"
        // Le décalage suit le corps : 3 points sous le grand titre, un peu plus
        // d'un point et demi sous le petit. Un décalage fixe doublait la lettre.
        initial={{ transform: 'translate(0em, 0em)' }}
        animate={{ transform: 'translate(0.04em, 0.04em)' }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
        className={cn(lettrage, 'nom-affiche-passage absolute inset-0 text-orange-ink')}
      >
        Bacchana
      </motion.span>
      <span aria-hidden="true" className={cn(lettrage, 'relative block text-ink')}>
        Bacchana
      </span>
    </h1>
  )
}
