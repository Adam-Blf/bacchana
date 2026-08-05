import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Disc3, DoorOpen } from '@/components/ui/icons'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { useCustomRulesStore } from '@/stores/customRulesStore'
import { ROULETTE_SEGMENTS } from '@/content/roulette'
import { customRuleToRouletteSegment } from '@/core/engine/customRules'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

// Aplat orange / jaune alternes, separes par un trait d'encre - palette neobrutaliste.
// Ces aplats ne portent plus AUCUN texte : avec 40 segments (9 degres chacun), les
// libelles poses sur la roue se superposaient en un anneau illisible (constat visuel
// du 2026-08-05). La roue est redevenue un objet purement graphique, le libelle du
// seul segment gagnant s'affiche en grand dans la scene de resultat sous la roue.
const WHEEL_COLORS = ['#FF8A3D', '#FFD029']

/** Largeur du trait d'encre entre deux segments, en degres. */
const SEPARATOR_DEG = 1.2

/**
 * La Roulette - mode embarque, sans pack de contenu. Roue de gages/penalites animee
 * en rotation avec un easing "casino", resultat annonce en grand sous la roue.
 * `MotionConfig` (App.tsx) degrade deja l'animation pour prefers-reduced-motion.
 */
export function RouletteScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()
  // On selectionne `rules` (reference stable) et on derive les segments en memo -
  // un selecteur qui fabriquerait un tableau neuf a chaque rendu ferait boucler
  // useSyncExternalStore.
  const customRules = useCustomRulesStore((s) => s.rules)

  // Segments embarques + regles perso actives ; l'angle se derive du total.
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

  // Soleil conic-gradient : chaque segment garde son aplat, borde d'un trait
  // var(--color-ink) qui suit le theme (encre claire en sombre).
  const wheelBackground = useMemo(() => {
    const stops = segments.map((_, i) => {
      const from = i * segmentAngle
      const to = (i + 1) * segmentAngle
      const color = WHEEL_COLORS[i % 2]
      return `var(--color-ink) ${from}deg ${from + SEPARATOR_DEG}deg, ${color} ${from + SEPARATOR_DEG}deg ${to}deg`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [segments, segmentAngle])

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

      <main className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
        <div className="relative w-60 h-60 sm:w-72 sm:h-72">
          {/* Pointeur fixe, ne tourne pas. Suit border-ink (themable) comme le cadre
              de la roue : un pointeur fige en #111111 devenait quasi invisible sur le
              fond quasi noir du theme sombre. */}
          <div
            className="absolute left-1/2 -top-2 -translate-x-1/2 z-20 w-0 h-0"
            style={{
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '22px solid var(--color-ink)',
            }}
            aria-hidden="true"
          />

          <motion.div
            className="absolute inset-0 rounded-full border-4 border-ink shadow-brutal-lg"
            style={{ background: wheelBackground }}
            animate={{ rotate: rotation }}
            transition={{ duration: 3.2, ease: [0.17, 0.67, 0.12, 0.99] }}
            onAnimationComplete={handleAnimationComplete}
            role="img"
            aria-label={`Roue de la fortune, ${segments.length} segments`}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-ink flex items-center justify-center shadow-brutal-sm">
              <Disc3 className={cn('w-7 h-7 text-neon', spinning && 'animate-spin')} aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Scene de resultat - toujours montee pour eviter les sauts de mise en page.
            C'est ELLE qui rend le sort lisible : libelle du segment gagnant en
            font-display 4xl, pas quarante etiquettes de 11px sur la roue. */}
        <div
          className={cn(
            'w-full max-w-sm min-h-[9.5rem] rounded-card p-6',
            'bg-card-face text-card-ink text-center',
            'border-2 border-ink shadow-card-elevated',
            'flex flex-col items-center justify-center'
          )}
          aria-live="polite"
        >
          {result ? (
            <motion.div
              key={`${resultIndex}-${spinsPlayed}`}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-card-ink/70">
                Le sort a parlé
              </p>
              <p className="font-display text-4xl leading-none uppercase tracking-tight text-card-red mt-2 break-words">
                {result.label}
              </p>
              <p className="font-sans text-sm mt-3 text-card-ink/70">{result.detail}</p>
            </motion.div>
          ) : spinning ? (
            <motion.p
              className="font-display text-2xl uppercase tracking-tight"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              Le sort hésite…
            </motion.p>
          ) : (
            <>
              <p className="font-display text-2xl uppercase tracking-tight">Tente le sort</p>
              <p className="font-sans text-sm mt-2 text-card-ink/70">
                {segments.length} sorts possibles, un seul tombera.
              </p>
            </>
          )}
        </div>
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
