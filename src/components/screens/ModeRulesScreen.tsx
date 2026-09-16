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
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center bg-bg">
        <p className="text-ink-secondary font-sans">Aucune règle à afficher pour le moment.</p>
        <Button variant="primary" onClick={goBack}>
          Retour
        </Button>
      </div>
    )
  }

  const { rules } = getModeDefinition(mode)

  return (
    // Pas d'animation de sortie : le cadre de transition d'`App.tsx` en porte
    // deja une, et `AnimatePresence` en mode `wait` attend la fin des DEUX.
    // Ce doublon coutait 470 ms au retour vers le hub. Voir HubScreen.tsx.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="min-h-dvh bg-bg"
    >
      <header className="sticky top-0 pt-safe z-30 bg-bg border-b border-ink/25">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
          <Button variant="ghost" onClick={goBack} className="mr-2" aria-label="Retour">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-ink-secondary">
            Les règles
          </span>
        </div>
      </header>

      {/* LA RÈGLE DU JEU, imprimée au dos du carton.
          Ce qu'elle remplace : une icône de livre posée seule au centre, qui ne
          disait rien que le titre ne disait déjà, puis un carton par étape,
          tous de la même taille, entrant chacun par la droite. Les cartons
          faisaient de quatre phrases une grille ; l'entrée décalée les montrait
          en vol, à des places différentes, pendant une demi-seconde.
          À la place : le titre en tête d'affiche, et les étapes numérotées au
          pion, séparées par le filet d'un carton. */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-safe">
        <h1 className="font-display text-[44px] sm:text-[56px] uppercase leading-[0.85] text-ink text-balance">
          {rules.title}
        </h1>

        <ol className="mt-5 border-t border-ink">
          {rules.steps.map((step, index) => (
            <li
              key={index}
              className={cn('flex items-start gap-3 py-4 border-b border-ink/25')}
            >
              <span className="jeton flex-shrink-0 w-8 h-8 text-base">{index + 1}</span>
              <p className="text-ink font-sans leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </main>
    </motion.div>
  )
}
