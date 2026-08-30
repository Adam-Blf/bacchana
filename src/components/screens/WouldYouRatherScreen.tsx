import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton, Icon } from '@/components/ui'
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
 * tape son camp en secret de tour en tour. Au reveal, la minorité prend la
 * pénalité - égalité parfaite ou vote unanime, personne n'est pénalisé. Fin de
 * partie (pioche épuisée ou bouton « Terminer la partie ») : même addition
 * SessionRecap que les autres modes, l'ardoise de la soirée en tient compte.
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
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-surface border border-ink font-mono text-xs font-bold">
            <Icon name="joueurs" className="w-3.5 h-3.5" aria-hidden="true" />
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
                    'bg-aplat-3 border border-tile-ink shadow-gravure',
                    'font-sans font-bold text-lg text-tile-ink transition-transform focus-ring-neon',
                    ' active:shadow-[inset_0_0_0_2px_currentColor]'
                  )}
                >
                  {/* /60 ne tenait pas l'AA normal sur aplat-3 (3.36:1) ni
                      aplat-2 (3.46:1), dans les deux thèmes (audit visuel
                      2026-08-05) - /80 passe partout avec marge. */}
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-tile-ink/80 mb-1">
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
                    'bg-aplat-2 border border-tile-ink shadow-gravure',
                    'font-sans font-bold text-lg text-tile-ink transition-transform focus-ring-neon',
                    ' active:shadow-[inset_0_0_0_2px_currentColor]'
                  )}
                >
                  <span className="block font-mono text-[11px] uppercase tracking-widest text-tile-ink/80 mb-1">
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
              className="w-full rounded-card p-6 bg-card-face text-card-ink border border-tile-ink shadow-card-elevated text-center"
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
                    'rounded-control border border-tile-ink px-3 py-4',
                    minority === 'A' ? 'bg-card-red/20' : 'bg-aplat-3/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-card-ink">{A}</p>
                  <p className="font-sans text-xs text-card-ink/70 mt-1">{question.optionA}</p>
                </div>
                <div
                  className={cn(
                    'rounded-control border border-tile-ink px-3 py-4',
                    minority === 'B' ? 'bg-card-red/20' : 'bg-aplat-2/60'
                  )}
                >
                  <p className="font-mono text-2xl font-bold tabular-nums text-card-ink">{B}</p>
                  <p className="font-sans text-xs text-card-ink/70 mt-1">{question.optionB}</p>
                </div>
              </div>

              <p className="font-sans text-base text-card-ink">
                {minority === null
                  ? 'Personne n\'est pénalisé : égalité ou unanimité.'
                  : `Le camp minoritaire prend la pénalité !`}
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
            <Icon name="balance" className="w-5 h-5 mr-2" aria-hidden="true" />
            Révéler le verdict
          </Button>
        )}
        {session.phase === 'reveal' && (
          <Button variant="primary" size="xl" className="w-full" onClick={handleNextRound}>
            <Icon name="recommencer" className="w-5 h-5 mr-2" aria-hidden="true" />
            Dilemme suivant
          </Button>
        )}
        <button
          onClick={() => { haptic('light'); setEndedEarly(true) }}
          className="min-h-[44px] font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-orange-ink transition-colors focus-ring-neon inline-flex items-center justify-center gap-1.5"
        >
          <Icon name="quitter" className="w-3.5 h-3.5" aria-hidden="true" />
          Terminer la partie
        </button>
      </footer>
    </motion.div>
  )
}
