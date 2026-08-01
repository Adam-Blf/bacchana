import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Home, RotateCcw, Trophy, Zap } from 'lucide-react'
import type { Player } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

interface SessionRecapProps {
  players: Player[]
  onReplay: () => void
  onQuit: () => void
  /**
   * Generic penalty counts keyed by player id, used by the prompt-based modes (picolo,
   * truth or dare, etc). When provided, overrides the Borderland-specific
   * drinksGorgees/drinksShots ranking so every mode can reuse this same recap screen.
   */
  penaltyCounts?: Record<string, number>
  /** Mode id for the session_completed analytics event. Defaults to 'borderland'. */
  mode?: GameMode
  /** Number of turns played this session, for the session_completed analytics event. */
  turns?: number
}

export function SessionRecap({
  players,
  onReplay,
  onQuit,
  penaltyCounts,
  mode = 'borderland',
  turns = 0,
}: SessionRecapProps) {
  // Fires once when the recap mounts (i.e. once per finished session), not on every render.
  useEffect(() => {
    track({ name: 'session_completed', props: { mode, turns } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ranked = [...players]
    .map((p) => ({
      ...p,
      total: penaltyCounts
        ? (penaltyCounts[p.id] ?? 0)
        : (p.drinksGorgees ?? 0) + (p.drinksShots ?? 0) * 5,
    }))
    .sort((a, b) => b.total - a.total)

  const champion = ranked[0]
  const totalGorgees = penaltyCounts
    ? players.reduce((s, p) => s + (penaltyCounts[p.id] ?? 0), 0)
    : players.reduce((s, p) => s + (p.drinksGorgees ?? 0), 0)
  const totalShots = players.reduce((s, p) => s + (p.drinksShots ?? 0), 0)

  const handleShare = async () => {
    haptic('light')
    // Le texte partagé reflète le même classement que l'écran, quel que soit le
    // mode (penaltyCounts pour les modes à prompts, gorgées/majeures au Borderland).
    const lines = ranked.map((p, i) =>
      penaltyCounts
        ? `${i + 1}. ${p.name} - ${penaltyCounts[p.id] ?? 0} pénalité${(penaltyCounts[p.id] ?? 0) > 1 ? 's' : ''}`
        : `${i + 1}. ${p.name} - ${p.drinksGorgees ?? 0} pénalités + ${p.drinksShots ?? 0} majeures`
    )
    const text = `La Tournée - fin de partie\n\n${lines.join('\n')}\n\nTotal : ${totalGorgees} pénalités${
      penaltyCounts ? '' : `, ${totalShots} majeures`
    } distribuées.\nlatournee.beloucif.com`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'La Tournée - Récap de partie', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Récap copié dans le presse-papiers')
      }
    } catch {
      // Share cancelled by the user - nothing to do.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 pt-safe pb-safe bg-bg text-ink"
    >
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto rounded-full bg-neon/10 border-2 border-neon flex items-center justify-center shadow-neon-glow mb-4"
        >
          <Trophy className="w-10 h-10 text-neon" aria-hidden="true" />
        </motion.div>
        <div className="font-mono text-xs tracking-widest text-ink-muted uppercase">Fin de partie</div>
        <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tight mt-2 text-ink">
          {champion?.name ?? '-'}
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          est le <strong className="text-neon">champion</strong> des pénalités
        </p>
      </div>

      <div className="w-full max-w-md space-y-2 mb-8">
        {ranked.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn(
              'flex items-center justify-between rounded-card px-4 py-3',
              i === 0
                ? 'bg-neon/10 border border-neon/30'
                : 'bg-surface border border-border'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums text-xs text-ink-muted w-5">#{i + 1}</span>
              <span className="font-semibold">{p.name}</span>
            </div>
            <div className="text-xs text-ink-secondary font-mono tabular-nums">
              {penaltyCounts ? (
                <>
                  <span className="text-neon">{penaltyCounts[p.id] ?? 0}</span> pénalités
                </>
              ) : (
                <>
                  <span className="text-neon">{p.drinksGorgees ?? 0}</span> pénalités
                  {' - '}
                  <span className="text-premium">{p.drinksShots ?? 0}</span> majeures
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className={cn('grid gap-3 mb-8 w-full max-w-md', penaltyCounts ? 'grid-cols-1' : 'grid-cols-2')}>
        <div className="bg-surface border border-border rounded-card p-3 text-center">
          <Zap className="w-4 h-4 mx-auto text-neon mb-1" aria-hidden="true" />
          <div className="font-mono tabular-nums font-bold text-xl">{totalGorgees}</div>
          <div className="text-[10px] font-mono text-ink-muted uppercase">pénalités</div>
        </div>
        {!penaltyCounts && (
          <div className="bg-surface border border-border rounded-card p-3 text-center">
            <div className="w-4 h-4 mx-auto text-premium mb-1 font-mono text-xs" aria-hidden="true">MAJ</div>
            <div className="font-mono tabular-nums font-bold text-xl">{totalShots}</div>
            <div className="text-[10px] font-mono text-ink-muted uppercase">majeures</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleShare}
          className="flex-1 min-w-[140px] min-h-[44px] bg-neon text-on-pop border-2 border-on-pop shadow-brutal-sm font-semibold px-5 py-3 rounded-pill transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" /> Partager
        </button>
        <button
          onClick={() => { haptic('light'); onReplay() }}
          className="flex-1 min-w-[140px] min-h-[44px] bg-surface border border-border-strong text-ink font-semibold px-5 py-3 rounded-pill hover:border-neon/50 hover:text-neon transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Revanche
        </button>
        <button
          onClick={() => { haptic('medium'); onQuit() }}
          className="w-full min-h-[44px] bg-transparent border border-border-strong text-ink-secondary px-5 py-3 rounded-pill hover:bg-surface/60 transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Home className="w-4 h-4" aria-hidden="true" /> Retour à l'accueil
        </button>
      </div>

      <p className="mt-8 text-xs font-mono text-ink-muted text-center">
        Buvez responsable, jouez encore plus responsable.
      </p>
    </motion.div>
  )
}
