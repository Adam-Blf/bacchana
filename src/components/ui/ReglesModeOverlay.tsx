import { motion, AnimatePresence } from 'framer-motion'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import type { GameMode } from '@/core/engine/types'
import { Icon } from './Icon'

interface Props {
  mode: GameMode
  open: boolean
  onClose: () => void
}

/**
 * Les règles d'un mode, posées EN SURCOUCHE de la partie en cours.
 *
 * Pourquoi une surcouche et non un écran. Le bouton d'aide naviguait vers
 * l'écran `mode-rules`, et `AnimatePresence mode="wait"` démonte l'écran
 * sortant : or six modes sur quatorze portent leur session dans l'état local
 * du composant (`useState`). Consulter les règles détruisait donc la partie,
 * silencieusement, et la remontée en rejouait une neuve. Le symptôme signalé -
 * « si tu vas voir l'aide tu perds ta partie » - n'était pas une perte de
 * données, c'était un démontage.
 *
 * Une surcouche ne démonte rien. Elle s'inscrit dans l'historique via
 * `useBackClose`, donc le retour matériel la ferme avant de toucher à la
 * partie, exactement comme les autres sélecteurs de l'application.
 */
export function ReglesModeOverlay({ mode, open, onClose }: Props) {
  const { rules } = getModeDefinition(mode)

  useBackClose(open, onClose, `regles-${mode}`)
  useKeyboard({ Escape: onClose }, open)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-overlay bg-scrim/70 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Règles de ${rules.title}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[85dvh] flex flex-col bg-bg border-t-2 sm:border border-ink sm:rounded-card shadow-gravure-forte"
          >
            <header className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <Icon name="livre" className="w-5 h-5 text-neon" aria-hidden="true" />
              <h2 className="font-display text-xl uppercase tracking-tight text-ink flex-1">
                {rules.title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Fermer les règles et reprendre la partie"
                className="w-11 h-11 -mr-2 flex items-center justify-center text-ink rounded-control focus-ring-neon"
              >
                <Icon name="fermer" className="w-5 h-5" aria-hidden="true" />
              </button>
            </header>

            <ol className="overflow-y-auto px-5 py-4 space-y-3">
              {rules.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-bg-raised border border-border flex items-center justify-center font-mono text-xs font-bold tabular-nums text-ink-secondary">
                    {index + 1}
                  </span>
                  <p className="text-ink-secondary font-sans leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>

            <footer className="px-5 py-4 border-t border-border shrink-0 pb-safe-4">
              <button
                onClick={onClose}
                className="w-full min-h-[52px] rounded-control border-2 border-tile-ink bg-aplat-1 text-tile-ink font-display uppercase text-xl shadow-gravure focus-ring-neon"
              >
                On reprend
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
