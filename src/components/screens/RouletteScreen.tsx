import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Disc3, DoorOpen } from 'lucide-react'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { ROULETTE_SEGMENTS } from '@/content/roulette'
import { customRuleToRouletteSegment } from '@/core/engine/customRules'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

// Aplat orange / jaune alternés, texte encre - palette néobrutaliste.
const WHEEL_COLORS = ['#FF8A3D', '#FFD029']

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-neon/[0.07] rounded-full blur-[90px]" />
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
          {/* Pointer, fixed - does not rotate */}
          <div
            className="absolute left-1/2 -top-2 -translate-x-1/2 z-20 w-0 h-0"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '18px solid #111111',
            }}
            aria-hidden="true"
          />

          <motion.div
            className="absolute inset-0 rounded-full border-4 border-ink shadow-brutal-lg"
            style={{
              background: `conic-gradient(${segments.map(
                (_, i) =>
                  `${WHEEL_COLORS[i % 2]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
              ).join(', ')})`,
            }}
            animate={{ rotate: rotation }}
            transition={{ duration: 3.2, ease: [0.17, 0.67, 0.12, 0.99] }}
            onAnimationComplete={handleAnimationComplete}
            role="img"
            aria-label={`Roue de la fortune, ${segments.length} segments`}
          >
            {segments.map((segment, i) => {
              const angle = i * segmentAngle + segmentAngle / 2
              return (
                <div
                  key={segment.id}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span
                    className="mt-4 text-[9px] sm:text-[10px] font-mono uppercase tracking-tight text-ink text-center w-16 leading-tight"
                    style={{ transform: `rotate(0deg)` }}
                  >
                    {segment.label}
                  </span>
                </div>
              )
            })}
          </motion.div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-surface border-2 border-ink flex items-center justify-center shadow-brutal-sm">
              <Disc3 className="w-6 h-6 text-neon" aria-hidden="true" />
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
              'border-2 border-ink shadow-card-elevated'
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
          <Disc3 className={cn('w-6 h-6 mr-3', spinning && 'animate-spin')} aria-hidden="true" />
          <span className="text-xl uppercase tracking-wide">
            {spinning ? 'Ça tourne…' : 'Lancer la roue'}
          </span>
        </Button>
        {spinsPlayed > 0 && (
          <Button variant="ghost" className="w-full" onClick={finishSession}>
            <DoorOpen className="w-5 h-5 mr-2" aria-hidden="true" />
            Terminer la partie
          </Button>
        )}
      </footer>
    </motion.div>
  )
}
