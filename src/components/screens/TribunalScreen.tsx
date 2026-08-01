import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Gavel, ThumbsDown, ThumbsUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import { useGameStore, useAppStore } from '@/stores'
import { interpolate } from '@/core/engine/interpolate'
import { calculatePenalty } from '@/core/borderland'
import { TRIBUNAL_CHARGES, type TribunalCharge } from '@/content/tribunal'
import type { Player } from '@/types'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickAccused(players: Player[], excludeId: string | null): Player {
  const pool = players.filter((p) => p.active && p.id !== excludeId)
  const candidates = pool.length > 0 ? pool : players.filter((p) => p.active)
  return pickRandom(candidates)
}

/**
 * Le Tribunal - mode embarqué, sans pack de contenu. Chaque manche désigne un accusé au
 * hasard, la table vote coupable/innocent à main levée (deux compteurs), et la majorité
 * décide de la peine. Volontairement simple : pas de session persistée, pas de recap final,
 * juste des procès qui s'enchaînent tant que le groupe veut jouer.
 */
export function TribunalScreen() {
  const { players } = useGameStore()
  const { goToHub } = useAppStore()

  const activePlayers = useMemo(() => players.filter((p) => p.active), [players])

  const [accused, setAccused] = useState<Player>(() => pickAccused(activePlayers, null))
  const [charge, setCharge] = useState<TribunalCharge>(() => pickRandom(TRIBUNAL_CHARGES))
  const [votesGuilty, setVotesGuilty] = useState(0)
  const [votesInnocent, setVotesInnocent] = useState(0)
  const [verdict, setVerdict] = useState<'guilty' | 'innocent' | null>(null)
  const [penaltyCounts, setPenaltyCounts] = useState<Record<string, number>>({})

  const handleQuit = () => {
    goToHub()
  }

  const handleVerdict = useCallback(() => {
    haptic('medium')
    const guilty = votesGuilty > votesInnocent
    setVerdict(guilty ? 'guilty' : 'innocent')
    if (guilty) {
      const penalty = calculatePenalty(1, 0, 'gorgees')
      setPenaltyCounts((prev) => ({
        ...prev,
        [accused.id]: (prev[accused.id] ?? 0) + penalty.amount,
      }))
    }
  }, [votesGuilty, votesInnocent, accused.id])

  const handleNewTrial = useCallback(() => {
    haptic('light')
    setAccused((prev) => pickAccused(activePlayers, prev.id))
    setCharge(pickRandom(TRIBUNAL_CHARGES))
    setVotesGuilty(0)
    setVotesInnocent(0)
    setVerdict(null)
  }, [activePlayers])

  const chargeText = interpolate(charge.text, activePlayers, accused)

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

      <button
        onClick={handleQuit}
        aria-label="Quitter le tribunal et retourner au hub"
        className={cn(
          'fixed top-4 left-4 z-40 w-11 h-11 rounded-pill',
          'bg-surface border border-border-strong',
          'flex items-center justify-center',
          'text-ink-secondary hover:text-neon hover:border-neon/50',
          'transition-colors duration-200 focus-ring-neon'
        )}
      >
        <Home className="w-5 h-5" aria-hidden="true" />
      </button>

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Le Tribunal
        </p>
        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink mt-1">
          {accused.name}
        </h2>
        <p className="text-ink-secondary font-sans text-sm mt-1">
          comparaît devant la cour
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={charge.id + accused.id}
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 160 }}
            className={cn(
              'w-full max-w-md rounded-card p-8 sm:p-10',
              'bg-card-face text-card-ink',
              'shadow-card-elevated border border-black/5',
              'text-center'
            )}
          >
            <Gavel className="w-8 h-8 mx-auto mb-4 text-card-red" aria-hidden="true" />
            <p className="font-sans text-lg sm:text-xl leading-relaxed">{chargeText}</p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-md mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={() => { haptic('light'); setVotesGuilty((v) => v + 1) }}
            disabled={verdict !== null}
            className="min-h-[64px] rounded-card bg-surface border border-border-strong flex flex-col items-center justify-center gap-1 hover:border-neon/50 transition-colors focus-ring-neon disabled:opacity-40"
          >
            <ThumbsDown className="w-5 h-5 text-neon" aria-hidden="true" />
            <span className="font-mono tabular-nums text-lg font-bold text-ink">{votesGuilty}</span>
            <span className="text-[10px] font-mono text-ink-muted uppercase">Coupable</span>
          </button>
          <button
            onClick={() => { haptic('light'); setVotesInnocent((v) => v + 1) }}
            disabled={verdict !== null}
            className="min-h-[64px] rounded-card bg-surface border border-border-strong flex flex-col items-center justify-center gap-1 hover:border-success/50 transition-colors focus-ring-neon disabled:opacity-40"
          >
            <ThumbsUp className="w-5 h-5 text-success" aria-hidden="true" />
            <span className="font-mono tabular-nums text-lg font-bold text-ink">{votesInnocent}</span>
            <span className="text-[10px] font-mono text-ink-muted uppercase">Innocent</span>
          </button>
        </div>

        {verdict && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-6 font-display text-2xl uppercase tracking-tight text-center',
              verdict === 'guilty' ? 'text-neon' : 'text-success'
            )}
          >
            {verdict === 'guilty' ? 'Coupable - 1 pénalité' : 'Innocent - libéré'}
          </motion.p>
        )}
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
        {verdict === null ? (
          <Button variant="primary" size="xl" className="w-full" onClick={handleVerdict}>
            <Gavel className="w-6 h-6 mr-3" aria-hidden="true" />
            <span className="text-xl uppercase tracking-wide">Verdict</span>
          </Button>
        ) : (
          <Button variant="primary" size="xl" className="w-full" onClick={handleNewTrial}>
            <RotateCcw className="w-6 h-6 mr-3" aria-hidden="true" />
            <span className="text-xl uppercase tracking-wide">Nouveau procès</span>
          </Button>
        )}

        {Object.keys(penaltyCounts).length > 0 && (
          <p className="text-center text-ink-muted font-mono text-xs uppercase tracking-wider">
            {activePlayers
              .filter((p) => penaltyCounts[p.id])
              .map((p) => `${p.name} : ${penaltyCounts[p.id]}`)
              .join(' - ')}
          </p>
        )}
      </footer>
    </motion.div>
  )
}
