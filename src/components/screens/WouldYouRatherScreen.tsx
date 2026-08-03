import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Scale, RotateCcw, Home, Users } from 'lucide-react'
import { Button, QuitButton } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import {
  allVoted,
  castVote,
  createWouldYouRatherSession,
  getMinoritySide,
  getNextVoter,
  nextRound,
  revealVotes,
  countVotes,
  type WouldYouRatherSessionState,
  type WouldYouRatherSide,
} from '@/core/engine/wouldYouRatherSession'
import { WOULD_YOU_RATHER_QUESTIONS } from '@/content/wouldYouRather'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

/**
 * Tu préfères - dilemme A/B à vote. Le téléphone tourne, chaque joueur actif
 * tape son camp en secret de tour en tour. Au reveal, la minorité trinque -
 * égalité parfaite ou vote unanime, personne ne trinque. Récap local en fin
 * de file (pas le ticket partagé SessionRecap : ce mode ne s'ajoute pas à
 * l'ardoise de la soirée, seulement à son propre décompte de manche).
 */
export function WouldYouRatherScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()

  const [session, setSession] = useState<WouldYouRatherSessionState>(() =>
    createWouldYouRatherSession(WOULD_YOU_RATHER_QUESTIONS, players)
  )

  const nextVoter = getNextVoter(session)
  const votesCast = Object.keys(session.votes).length
  const everyoneVoted = allVoted(session)

  const handleVote = (side: WouldYouRatherSide) => {
    if (!nextVoter) return
    haptic('light')
    setSession(castVote(session, nextVoter.id, side))
  }

  const handleReveal = () => {
    haptic('medium')
    setSession(revealVotes(session))
  }

  const handleNextRound = () => {
    haptic('light')
    setSession(nextRound(session))
  }

  const handleReplay = () => {
    setSession(createWouldYouRatherSession(WOULD_YOU_RATHER_QUESTIONS, players))
  }

  if (session.phase === 'finished') {
    const ranked = [...session.players].sort(
      (a, b) => (session.penaltyCounts[b.id] ?? 0) - (session.penaltyCounts[a.id] ?? 0)
    )
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen w-full flex flex-col items-center justify-center px-6 pt-safe pb-safe bg-bg text-center"
      >
        <Scale className="w-10 h-10 text-neon mb-4" aria-hidden="true" />
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink">
          C'est la fin des dilemmes
        </h1>
        <p className="text-ink-secondary font-sans text-sm mt-2">
          Récap de la manche - {session.roundNumber - 1} dilemme
          {session.roundNumber - 1 > 1 ? 's' : ''} tranché
          {session.roundNumber - 1 > 1 ? 's' : ''}.
        </p>

        <ul className="w-full max-w-sm mt-6 space-y-2">
          {ranked.map((p) => {
            const count = session.penaltyCounts[p.id] ?? 0
            return (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-control border-2 border-ink bg-surface px-4 py-3"
              >
                <span className="font-sans font-bold text-ink">{p.name}</span>
                <span className="font-mono text-sm tabular-nums px-2 py-0.5 rounded-pill bg-pop-yellow border border-ink">
                  {count} pénalité{count > 1 ? 's' : ''}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap justify-center gap-3 w-full max-w-sm mt-8">
          <Button variant="primary" size="lg" className="flex-1 min-w-[140px]" onClick={handleReplay}>
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            Revanche
          </Button>
          <Button variant="ghost" size="lg" className="flex-1 min-w-[140px]" onClick={goToHub}>
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Accueil
          </Button>
        </div>
      </motion.div>
    )
  }

  const question = session.currentQuestion
  const total = session.roundNumber + session.queue.length
  const { A, B } = countVotes(session)
  const minority = session.phase === 'reveal' ? getMinoritySide(session) : null

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <QuitButton aria-label="Quitter Tu préfères et revenir à l'accueil" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Tu préfères - manche {session.roundNumber}/{total}
        </p>
        {session.phase === 'voting' && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface border-2 border-ink font-mono text-xs font-bold">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              {votesCast}/{session.players.length}
            </span>
            votes
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {session.phase === 'voting' && question && nextVoter && (
            <motion.div
              key={`voting-${question.id}-${votesCast}`}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 160 }}
              className="w-full"
            >
              <p className="text-ink-secondary font-sans text-sm text-center mb-4">
                Au tour de <strong className="text-ink">{nextVoter.name}</strong> : passe le
                téléphone, choisis ton camp en secret.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleVote('A')}
                  className={cn(
                    'w-full min-h-[96px] rounded-card p-5 text-left',
                    'bg-pop-blue border-2 border-ink shadow-brutal',
                    'font-sans font-bold text-lg text-ink transition-transform focus-ring-neon',
                    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  )}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-1">
                    Option A
                  </span>
                  {question.optionA}
                </button>

                <div className="text-center font-display text-sm uppercase tracking-widest text-ink-muted">
                  ou
                </div>

                <button
                  onClick={() => handleVote('B')}
                  className={cn(
                    'w-full min-h-[96px] rounded-card p-5 text-left',
                    'bg-pop-pink border-2 border-ink shadow-brutal',
                    'font-sans font-bold text-lg text-ink transition-transform focus-ring-neon',
                    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  )}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-ink/60 mb-1">
                    Option B
                  </span>
                  {question.optionB}
                </button>
              </div>
            </motion.div>
          )}

          {session.phase === 'reveal' && question && (
            <motion.div
              key={`reveal-${question.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="w-full rounded-card p-6 bg-card-face border-2 border-ink shadow-card-elevated text-center"
              aria-live="polite"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3">
                Le verdict de la table
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={cn(
                    'rounded-control border-2 border-ink px-3 py-4',
                    minority === 'A' ? 'bg-card-red/20' : 'bg-pop-blue/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-ink">{A}</p>
                  <p className="font-sans text-xs text-ink/70 mt-1">{question.optionA}</p>
                </div>
                <div
                  className={cn(
                    'rounded-control border-2 border-ink px-3 py-4',
                    minority === 'B' ? 'bg-card-red/20' : 'bg-pop-pink/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-ink">{B}</p>
                  <p className="font-sans text-xs text-ink/70 mt-1">{question.optionB}</p>
                </div>
              </div>

              <p className="font-sans text-base text-ink">
                {minority === null
                  ? 'Personne ne trinque : égalité ou unanimité.'
                  : `Le camp minoritaire trinque !`}
              </p>

              {minority && (
                <ul className="mt-3 flex flex-wrap justify-center gap-2">
                  {Object.entries(session.votes)
                    .filter(([, side]) => side === minority)
                    .map(([playerId]) => {
                      const p = session.players.find((pl) => pl.id === playerId)
                      return (
                        <li
                          key={playerId}
                          className="px-3 py-1 rounded-pill bg-card-red/20 border border-ink font-mono text-xs font-bold"
                        >
                          {p?.name ?? '?'}
                        </li>
                      )
                    })}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10">
        {session.phase === 'voting' && everyoneVoted && (
          <Button variant="primary" size="xl" className="w-full" onClick={handleReveal}>
            <Scale className="w-5 h-5 mr-2" aria-hidden="true" />
            Révéler le verdict
          </Button>
        )}
        {session.phase === 'reveal' && (
          <Button variant="primary" size="xl" className="w-full" onClick={handleNextRound}>
            <RotateCcw className="w-5 h-5 mr-2" aria-hidden="true" />
            Dilemme suivant
          </Button>
        )}
      </footer>
    </motion.div>
  )
}
