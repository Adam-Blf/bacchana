import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper, WifiOff, Scale, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppStore, useOnboardingStore } from '@/stores'
import { cn } from '@/utils'

interface Panel {
  icon: typeof PartyPopper
  title: string
  text: string
  color: string
}

const PANELS: Panel[] = [
  {
    icon: PartyPopper,
    title: 'Les meilleurs jeux de soirée',
    text: 'Dans une seule app : cartes, quiz, gages, tribunal... de quoi tenir toute la tablée jusqu\'au bout de la nuit.',
    color: 'bg-pop-yellow',
  },
  {
    icon: WifiOff,
    title: 'Zéro pub, fonctionne hors ligne',
    text: 'Pas de connexion, pas de pop-up : la taverne joue même sans réseau, du sous-sol au fond du jardin.',
    color: 'bg-pop-blue',
  },
  {
    icon: Scale,
    title: 'Votre table décide',
    text: "L'app distribue des pénalités, votre table décide de leur nature : jouable avec ou sans alcool.",
    color: 'bg-pop-lime',
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
  const Icon = panel.icon

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe pb-safe bg-bg">
      <div className="flex justify-end pt-4">
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
              'w-full rounded-card p-8 text-center text-tile-ink',
              panel.color,
              'border-2 border-ink shadow-brutal-lg'
            )}
          >
            <Icon className="w-12 h-12 mx-auto mb-5 text-tile-ink" aria-hidden="true" />
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
          {isLast ? 'Entrer dans la taverne' : 'Suivant'}
          <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
        </Button>
      </footer>
    </div>
  )
}
