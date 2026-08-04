import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Scale, RotateCcw, Users, DoorOpen } from 'lucide-react'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton } from '@/components/ui'
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
 * égalité parfaite ou vote unanime, personne ne trinque. Fin de partie (pioche
 * épuisée ou bouton « Terminer la partie ») : même addition SessionRecap que
 * les autres modes, l'ardoise de la soirée en tient compte.
 */
export function WouldYouRatherScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()

  const [session, setSession] = useState<WouldYouRatherSessionState>(() =>
    createWouldYouRatherSession(WOULD_YOU_RATHER_QUESTIONS, players)
  )
  // Bouton "Terminer" discret : permet de clore la partie avant que la pioche ne
  // soit épuisée, sur le même modèle que les autres modes (Criée, Roulette).
  const [endedEarly, setEndedEarly] = useState(false)

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
    setEndedEarly(false)
    setSession(createWouldYouRatherSession(WOULD_YOU_RATHER_QUESTIONS, players))
  }

  // Fin de session (pioche épuisée ou "Terminer" discret) : même addition que les
  // autres modes, alimente l'ardoise de la soirée via SessionRecap.
  if (session.phase === 'finished' || endedEarly) {
    return (
      <SessionRecap
        players={session.players}
        penaltyCounts={session.penaltyCounts}
        mode="wouldYouRather"
        turns={session.roundNumber - 1}
        onReplay={handleReplay}
        onQuit={goToHub}
      />
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
      <ModeRulesButton mode="wouldYouRather" />

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
                    'font-sans font-bold text-lg text-tile-ink transition-transform focus-ring-neon',
                    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  )}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-tile-ink/60 mb-1">
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
                    'font-sans font-bold text-lg text-tile-ink transition-transform focus-ring-neon',
                    'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
                  )}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-tile-ink/60 mb-1">
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
              className="w-full rounded-card p-6 bg-card-face text-card-ink border-2 border-ink shadow-card-elevated text-center"
              aria-live="polite"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-card-ink/70 mb-3">
                Le verdict de la table
              </p>

              {/* card-face est un fond fixe (blanc dans les 2 themes, objet physique
                  comme les cartes) : les aplats card-red et pop (a 20-60 pourcent
                  d'opacite) se blendent toujours vers du clair par-dessus, donc le
                  texte reste card-ink (fixe), jamais ink/ink-muted (themable) qui
                  deviendrait illisible en sombre - meme bug que le texte pose sur
                  un pop plein. */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={cn(
                    'rounded-control border-2 border-ink px-3 py-4',
                    minority === 'A' ? 'bg-card-red/20' : 'bg-pop-blue/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-card-ink">{A}</p>
                  <p className="font-sans text-xs text-card-ink/70 mt-1">{question.optionA}</p>
                </div>
                <div
                  className={cn(
                    'rounded-control border-2 border-ink px-3 py-4',
                    minority === 'B' ? 'bg-card-red/20' : 'bg-pop-pink/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-card-ink">{B}</p>
                  <p className="font-sans text-xs text-card-ink/70 mt-1">{question.optionB}</p>
                </div>
              </div>

              <p className="font-sans text-base text-card-ink">
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
                          className="px-3 py-1 rounded-pill bg-card-red/20 text-card-ink border border-ink font-mono text-xs font-bold"
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

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
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
        <button
          onClick={() => { haptic('light'); setEndedEarly(true) }}
          className="min-h-[44px] font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-orange-ink transition-colors focus-ring-neon inline-flex items-center justify-center gap-1.5"
        >
          <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Terminer la partie
        </button>
      </footer>
    </motion.div>
  )
}
