import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Icon, type IconName } from '@/components/ui'
import { useAppStore, useOnboardingStore } from '@/stores'
import { cn } from '@/utils'

interface Panel {
  icon: IconName
  title: string
  text: string
  color: string
}

const PANELS: Panel[] = [
  {
    icon: 'fete',
    title: 'Les meilleurs jeux de soirée',
    // Le panneau mentionne le lancement en un geste depuis que « Lance la soirée »
    // existe : c'est la promesse principale de l'app, elle ne peut pas rester
    // absente du seul écran que tout le monde voit. Le tunnel reste à 3 panneaux,
    // la mention tient dans le texte existant plutôt que d'en ajouter un quatrième.
    text: 'Cartes, quiz, gages, tribunal... Un seul geste lance la soirée, l\'app enchaîne les jeux toute la nuit.',
    color: 'bg-aplat-1',
  },
  {
    icon: 'hors-ligne',
    title: 'Zéro pub, fonctionne hors ligne',
    text: 'Pas de connexion, pas de pop-up : Bacchana joue même sans réseau, du sous-sol au fond du jardin.',
    color: 'bg-aplat-3',
  },
  {
    icon: 'balance',
    title: 'Votre table décide',
    text: "L'app distribue des pénalités, votre table décide de leur nature : jouable avec ou sans alcool.",
    color: 'bg-aplat-4',
  },
]

/**
 * Onboarding premier lancement - 3 panneaux max, skippable, affiché une seule
 * fois avant l'écran d'accueil. `hasSeenIntro` persiste sur l'appareil.
 */
export function OnboardingScreen() {
  const { navigateTo } = useAppStore()
  const complete = useOnboardingStore((s) => s.complete)
  const [index, setIndex] = useState(0)

  const finish = () => {
    complete()
    navigateTo('welcome', { replace: true })
  }

  const isLast = index === PANELS.length - 1
  const panel = PANELS[index]

  const premier = index === 0

  return (
    <div className="h-dvh flex flex-col px-6 pt-safe pb-safe bg-bg overflow-hidden">
      <div className="flex items-center justify-between pt-4">
        {/* `invisible` et non un rendu conditionnel : le bouton garde sa place
            au premier panneau. Le faire apparaitre au second decalait tout ce
            qui suit, et c'est exactement le defaut signale - des boutons qui
            changent de place d'un ecran a l'autre. */}
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          aria-label="Revenir au panneau precedent"
          className={cn(
            'min-h-[44px] px-3 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest',
            'text-ink-muted hover:text-orange-ink transition-colors focus-ring-neon',
            premier && 'invisible pointer-events-none'
          )}
          tabIndex={premier ? -1 : 0}
        >
          <Icon name="retour" className="w-4 h-4" aria-hidden="true" />
          Retour
        </button>
        <button
          onClick={finish}
          className="min-h-[44px] px-3 font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-orange-ink transition-colors focus-ring-neon"
        >
          Passer
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className={cn(
              'w-full min-h-[20rem] flex flex-col justify-center rounded-card p-8 text-center text-tile-ink',
              // panel.color est un aplat pop, clair dans les deux themes : cerne et
              // ombre fixes. Fond passe par variable, donc invisible a la garde.
              panel.color,
              'border border-tile-ink shadow-gravure-forte'
            )}
          >
            <Icon name={panel.icon} className="w-12 h-12 mx-auto mb-5 text-tile-ink" aria-hidden="true" />
            <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-tile-ink leading-tight">
              {panel.title}
            </h1>
            <p className="font-sans text-tile-ink/80 mt-4 leading-relaxed">{panel.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-8" role="tablist" aria-label="Étapes de l'introduction">
          {PANELS.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === index}
              className={cn(
                'h-2 rounded-pill transition-all',
                i === index ? 'w-6 bg-neon' : 'w-2 bg-border-strong'
              )}
            />
          ))}
        </div>
      </main>

      <footer className="max-w-md mx-auto w-full pb-4">
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          {isLast ? 'Entrer chez Bacchana' : 'Suivant'}
          <Icon name="suivant" className="w-5 h-5 ml-2" aria-hidden="true" />
        </Button>
      </footer>
    </div>
  )
}
