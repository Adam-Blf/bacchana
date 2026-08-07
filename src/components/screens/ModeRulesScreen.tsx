import { motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAppStore } from '@/stores'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { cn } from '@/utils'

/**
 * Règles génériques d'un mode - accessible depuis chaque tuile du hub (bouton
 * "?") et depuis l'écran de jeu en cours (ModeRulesButton). Lit `rulesMode`
 * (posé par showModeRules), avec repli sur `activeMode` si on arrive depuis
 * une partie déjà lancée. Borderland garde son écran dédié (RulesScreen) :
 * cet écran sert les 12 autres modes du registre.
 */
export function ModeRulesScreen() {
  const { goBack, rulesMode, activeMode } = useAppStore()
  const mode = rulesMode ?? activeMode

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-bg">
        <p className="text-ink-secondary font-sans">Aucune règle à afficher pour le moment.</p>
        <Button variant="primary" onClick={goBack}>
          Retour
        </Button>
      </div>
    )
  }

  const { rules } = getModeDefinition(mode)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen bg-bg"
    >
      <header className="sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-3" aria-label="Retour">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">
            Règles - {rules.title}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-safe">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-2"
        >
          <Icon name="regles" className="w-8 h-8 mx-auto mb-3 text-neon" aria-hidden="true" />
        </motion.div>

        <ol className="space-y-3">
          {rules.steps.map((step, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08, type: 'spring', damping: 20 }}
              className={cn(
                'rounded-card p-4 bg-surface border border-border-strong',
                'flex items-start gap-3'
              )}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-bg-raised border border-border flex items-center justify-center font-hud text-xs font-bold tabular-nums text-ink-secondary">
                {index + 1}
              </span>
              <p className="text-ink-secondary font-sans leading-relaxed">{step}</p>
            </motion.li>
          ))}
        </ol>
      </main>
    </motion.div>
  )
}
