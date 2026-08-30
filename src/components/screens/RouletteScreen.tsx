import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { ROULETTE_SEGMENTS } from '@/content/roulette'
import { customRuleToRouletteSegment } from '@/core/engine/customRules'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

// Aplat orange / jaune alternés, texte encre - palette néobrutaliste.
// Quatre aplats pop, figes hors theme comme une piece de jeu physique. Le
// nombre de secteurs (8) est un multiple de 4, donc deux secteurs voisins ne
// portent jamais la meme couleur, premier et dernier compris.
// Les secteurs passent par les jetons de tuile, qui sont FIXES dans les trois
// themes pour la meme raison que --color-tile-ink : l'encre posee dessus ne
// suit pas le theme, donc le fond ne le peut pas non plus. Avant le
// 2026-08-30 ces quatre valeurs etaient figees en dur, hors de tout jeton :
// la roue ne suivait ni le theme sombre ni le mode daltonien.
const WHEEL_COLORS = [
  'var(--color-aplat-1)',
  'var(--color-aplat-2)',
  'var(--color-aplat-3)',
  'var(--color-aplat-4)',
]

/**
 * La Roulette - mode embarqué, sans pack de contenu. Roue à 8 segments de gages/pénalités,
 * animée en rotation avec un easing "casino" puis un résultat annoncé. `MotionConfig` (App.tsx)
 * dégrade déjà l'animation pour prefers-reduced-motion.
 */
export function RouletteScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()
  // On sélectionne `rules` (référence stable) et on dérive les segments en mémo -
  // un sélecteur qui fabriquerait un tableau neuf à chaque rendu ferait boucler
  // useSyncExternalStore.
  const customRules = useCustomRulesStore((s) => s.rules)

  // Segments embarqués + règles perso actives ; l'angle se dérive du total.
  const segments = useMemo(
    () => [
      ...ROULETTE_SEGMENTS,
      ...customRules
        .filter((r) => r.enabled && r.kind === 'roulette')
        .map(customRuleToRouletteSegment),
    ],
    [customRules]
  )
  const segmentAngle = 360 / segments.length

  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const [resultIndex, setResultIndex] = useState<number | null>(null)
  // La roue ne designe pas nommement le joueur puni, donc pas d'addition chiffree :
  // on compte les tours pour cloturer la session au lieu de la laisser ouverte.
  const [spinsPlayed, setSpinsPlayed] = useState(0)
  const [finished, setFinished] = useState(false)

  // La roue debouche sur l'addition comme les autres modes une fois qu'on a joue
  // au moins un tour : SessionRecap se charge de l'evenement analytics et de
  // l'ardoise de la soiree.
  const finishSession = () => {
    haptic('medium')
    setFinished(true)
  }

  const handleReplay = () => {
    setFinished(false)
    setSpinsPlayed(0)
    setResultIndex(null)
    setPendingIndex(null)
  }

  const handleSpin = useCallback(() => {
    if (spinning) return
    haptic('medium')

    const index = Math.floor(Math.random() * segments.length)
    const targetCenter = index * segmentAngle + segmentAngle / 2
    const base = Math.ceil((rotation + 1) / 360) * 360
    const nextRotation = base + 5 * 360 + (360 - targetCenter)

    setPendingIndex(index)
    setResultIndex(null)
    setSpinning(true)
    setRotation(nextRotation)
  }, [rotation, spinning, segments.length, segmentAngle])

  const handleAnimationComplete = useCallback(() => {
    setSpinning(false)
    setResultIndex(pendingIndex)
    if (pendingIndex !== null) {
      haptic('heavy')
      setSpinsPlayed((n) => n + 1)
    }
  }, [pendingIndex])

  const result = resultIndex !== null ? segments[resultIndex] : null

  if (finished) {
    return (
      <SessionRecap
        players={players}
        penaltyCounts={{}}
        mode="roulette"
        turns={spinsPlayed}
        onReplay={handleReplay}
        onQuit={goToHub}
      />
    )
  }

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grain" />
      </div>

      <QuitButton aria-label="Quitter la roulette et revenir à l'accueil" />
      <ModeRulesButton mode="roulette" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          La Roue du Destin
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {/* Pointeur fixe, il ne tourne pas. Il suit border-ink (thématique) comme
              le cadre de la roue, et c'est VOLONTAIRE malgré la règle des aplats
              clairs : ce qui décide n'est pas la couleur de l'objet mais ce que le
              cerne borde. Le cerne d'une tuile borde la tuile, donc il est fixe.
              Le cerne de la roue borde la PAGE, qui s'inverse, donc il est
              thématique. Mesuré en thème sombre - crème contre la page 16.26:1,
              noir contre la page 1.01:1 : figer ce cerne en #111111 ferait
              disparaître le contour de la roue et le pointeur avec.
              Ne pas "corriger" en border-tile-ink. */}
          <div
            className="absolute left-1/2 -top-2 -translate-x-1/2 z-20 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '18px solid var(--color-ink)',
            }}
            aria-hidden="true"
          />

          <motion.div
            className="absolute inset-0 rounded-full border-4 border-ink shadow-gravure-forte"
            style={{
              background: `conic-gradient(${segments.map(
                (_, i) =>
                  `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
              ).join(', ')})`,
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 3.2, ease: [0.17, 0.67, 0.12, 0.99] }}
            onAnimationComplete={handleAnimationComplete}
            role="img"
            aria-label={`Roue de la fortune, ${segments.length} segments`}
          >
            {/* Séparateurs de secteurs, sans libellé.
                Les libellés vivaient ici, dans un bloc de 80 px posé à distance fixe
                du centre : à huit secteurs, la corde disponible est bien plus étroite,
                donc ils débordaient sur les voisins et se chevauchaient. Le résultat
                est de toute façon annoncé en clair sous la roue, avec aria-live, donc
                les retirer n'ôte aucune information - une roue ne se lit pas pendant
                qu'elle tourne, elle se lit quand elle s'arrête. */}
            {segments.map((segment, i) => (
              <div
                key={segment.id}
                className="absolute inset-0 flex justify-center pointer-events-none"
                style={{ transform: `rotate(${i * segmentAngle}deg)` }}
                aria-hidden="true"
              >
                <span className="block w-[3px] h-1/2 origin-bottom bg-tile-ink" />
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-surface border border-ink flex items-center justify-center shadow-gravure">
              <Icon name="roue" className="w-6 h-6 text-neon" aria-hidden="true" />
            </div>
          </div>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              'mt-8 w-full max-w-sm rounded-card p-6',
              'bg-card-face text-card-ink text-center',
              'border border-tile-ink shadow-card-elevated'
            )}
            aria-live="polite"
          >
            <p className="font-display text-2xl uppercase tracking-tight text-card-red">
              {result.label}
            </p>
            <p className="font-sans text-sm mt-2 text-card-ink/70">{result.detail}</p>
          </motion.div>
        )}
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
        <Button
          variant="primary"
          size="xl"
          className={cn('w-full', spinning && 'opacity-70 pointer-events-none')}
          onClick={handleSpin}
          disabled={spinning}
        >
          <Icon name="roue" className={cn('w-6 h-6 mr-3', spinning && 'animate-spin')} aria-hidden="true" />
          <span className="text-xl uppercase tracking-wide">
            {spinning ? 'Ça tourne…' : 'Lancer la roue'}
          </span>
        </Button>
        {spinsPlayed > 0 && (
          <Button variant="ghost" className="w-full" onClick={finishSession}>
            <Icon name="quitter" className="w-5 h-5 mr-2" aria-hidden="true" />
            Terminer la partie
          </Button>
        )}
      </footer>
    </motion.div>
  )
}
