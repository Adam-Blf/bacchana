import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { ModeDefinition } from '@/core/engine/types'

/**
 * L'ecran d'annonce entre deux modes de « Lance la soiree ».
 *
 * Concu pour le principe III de la constitution : un telephone pose au centre
 * d'une table, lu a bout de bras, dans une piece mal eclairee et bruyante. D'ou
 * le nom du mode en tres grand, un seul geste possible, et aucune information
 * critique en petit.
 *
 * Il ne DECIDE rien. Le mode a jouer lui est donne, il l'annonce. La decision
 * appartient au sequenceur, qui est teste sans rendu.
 */
interface Props {
  /** Le mode qui arrive. */
  mode: ModeDefinition
  /** Vrai quand tous les modes eligibles ont deja ete joues et qu'un cycle recommence. */
  secondTour: boolean
  /** Rang du mode dans la soiree, a partir de 1. */
  rang: number
  onDemarrer: () => void
  onPasser: () => void
  onArreter: () => void
}

export function TransitionSoiree({ mode, secondTour, rang, onDemarrer, onPasser, onArreter }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="min-h-dvh flex flex-col justify-between px-5 py-8 bg-surface"
    >
      <div className="flex flex-col items-center gap-2 pt-6">
        <span className="font-mono text-xs uppercase tracking-widest text-ink/60 tabular-nums">
          {secondTour ? 'On repart pour un tour' : `Jeu numéro ${rang}`}
        </span>
      </div>

      <div className="flex flex-col items-center gap-5 text-center">
        <span className="font-mono text-sm uppercase tracking-widest text-ink/70">Au tour de</span>

        {/* Le nom occupe l'ecran : c'est la seule chose qu'on doit pouvoir lire
            de l'autre bout de la table. */}
        <h1 className="font-display uppercase leading-[0.95] text-ink text-[clamp(2.75rem,14vw,5rem)]">
          {mode.title}
        </h1>

        <p className="text-ink/75 text-lg max-w-[22rem] text-balance">{mode.subtitle}</p>

        {mode.demandeExplication && (
          <span
            className={cn(
              'font-mono text-xs uppercase tracking-widest',
              'border border-ink rounded-control px-3 py-1.5 text-ink',
            )}
          >
            Le taulier explique la règle
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {/* Un seul geste evident. Les deux autres existent parce qu'un
            enchainement dont on ne peut pas sortir est vecu comme une contrainte,
            exactement le defaut qu'il pretend corriger. */}
        <button
          type="button"
          onClick={onDemarrer}
          className="w-full min-h-[64px] rounded-control border-2 border-tile-ink bg-aplat-1 text-tile-ink font-display uppercase text-2xl shadow-gravure focus-ring-neon"
        >
          On y va
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPasser}
            className="flex-1 min-h-[52px] rounded-control border-2 border-ink bg-surface text-ink font-bold focus-ring-neon"
          >
            Un autre
          </button>
          <button
            type="button"
            onClick={onArreter}
            className="flex-1 min-h-[52px] rounded-control border-2 border-ink bg-surface text-ink font-bold focus-ring-neon"
          >
            Choisir nous-mêmes
          </button>
        </div>
      </div>
    </motion.div>
  )
}
