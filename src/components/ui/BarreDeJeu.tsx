import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { GameMode } from '@/core/engine/types'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { useAppStore } from '@/stores'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'
import { Icon } from './Icon'
import { ReglesModeOverlay } from './ReglesModeOverlay'

interface Props {
  /** Le mode en cours, pour le rappel des règles. */
  mode: GameMode
  /** Sortie personnalisée (nettoyage + navigation). Par défaut, retour au hub. */
  onQuit?: () => void
  quitLabel?: string
  /** Contrôle propre au mode, posé entre la sortie et les règles (ex. « recommencer »). */
  extra?: ReactNode
}

/**
 * La barre haute, identique sur les quatorze modes.
 *
 * Elle existe parce que chaque écran plaçait ses propres boutons flottants, et
 * pas deux au même endroit : « recommencer » occupait à droite la place que
 * les autres modes donnaient aux règles, l'aide était tantôt une pastille
 * ronde tantôt rien du tout, et les tailles variaient. D'un jeu à l'autre, les
 * mêmes gestes tombaient à des endroits différents - c'est le défaut signalé
 * sous « les boutons passent leur temps à changer de place ».
 *
 * Une seule rangée, trois emplacements fixes : sortir à gauche, le contrôle
 * propre au mode au centre-droit, les règles à droite. Un mode qui n'a pas de
 * contrôle propre laisse simplement son emplacement vide, il ne décale rien.
 */
export function BarreDeJeu({ mode, onQuit, quitLabel, extra }: Props) {
  const goToHub = useAppStore((s) => s.goToHub)
  const [reglesOuvertes, setReglesOuvertes] = useState(false)
  const title = getModeDefinition(mode).rules.title

  return (
    <>
      <div className="fixed top-safe left-0 right-0 z-controls px-4 flex items-center gap-2 pointer-events-none">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (onQuit ? onQuit() : goToHub())}
          aria-label={quitLabel ?? "Quitter la partie et revenir à l'accueil"}
          className={cn(
            'pointer-events-auto w-11 h-11 rounded-pill shrink-0',
            'bg-surface border border-border-strong',
            'flex items-center justify-center',
            'text-ink hover:text-neon hover:border-neon/50',
            'transition-colors duration-200 focus-ring-neon'
          )}
        >
          <Icon name="accueil" className="w-5 h-5" aria-hidden="true" />
        </motion.button>

        <div className="flex-1" />

        {extra && <div className="pointer-events-auto shrink-0">{extra}</div>}

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { haptic('light'); setReglesOuvertes(true) }}
          aria-label={`Voir les règles de ${title}`}
          className={cn(
            'pointer-events-auto min-h-[44px] pl-3 pr-4 rounded-pill shrink-0',
            'bg-surface border border-border-strong',
            'inline-flex items-center gap-1.5',
            'text-ink font-sans font-bold text-sm',
            'hover:text-neon hover:border-neon/50',
            'transition-colors duration-200 focus-ring-neon'
          )}
        >
          <Icon name="livre" className="w-4 h-4" aria-hidden="true" />
          Règles
        </motion.button>
      </div>

      <ReglesModeOverlay mode={mode} open={reglesOuvertes} onClose={() => setReglesOuvertes(false)} />
    </>
  )
}
