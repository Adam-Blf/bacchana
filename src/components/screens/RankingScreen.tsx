import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import {
  confirmRanking,
  createRankingSession,
  getContestants,
  getJudge,
  guessQuestion,
  nextRound,
  startGuessing,
  startJudging,
  toggleRanked,
  JUDGE_PENALTY,
  GROUP_PENALTY,
  type RankingSessionState,
} from '@/core/engine/rankingSession'
import { RANKING_QUESTIONS } from '@/content/ranking'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

/**
 * Le Podium - le juge découvre une question secrète et classe les autres
 * joueurs. Le groupe voit le podium et doit retrouver la vraie question parmi
 * quatre propositions. Trouvé : le juge prend la pénalité. Raté : le groupe
 * prend la pénalité.
 */
export function RankingScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()

  const [session, setSession] = useState<RankingSessionState>(() =>
    createRankingSession(RANKING_QUESTIONS, players)
  )
  // Quitter en cours de partie doit quand même passer par l'addition - sans quoi ni
  // l'ardoise de la soirée ni l'évènement session_completed ne se déclenchaient.
  const [quitting, setQuitting] = useState(false)

  const judge = getJudge(session)
  const contestants = getContestants(session)

  if (session.phase === 'finished' || quitting) {
    return (
      <SessionRecap
        players={session.players}
        penaltyCounts={session.penaltyCounts}
        mode="ranking"
        turns={session.roundNumber}
        onReplay={() => {
          setSession(createRankingSession(RANKING_QUESTIONS, players))
          setQuitting(false)
        }}
        onQuit={goToHub}
      />
    )
  }

  const playerName = (id: string) => session.players.find((p) => p.id === id)?.name ?? '?'
  const groupGuessedRight = session.guessedId === session.round?.question.id

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <QuitButton aria-label="Quitter le Podium et revenir à l'accueil" onQuit={() => setQuitting(true)} />
      <ModeRulesButton mode="ranking" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Le Tableau d'Honneur - manche {session.roundNumber}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Passage du téléphone au juge */}
          {session.phase === 'handoff' && (
            <motion.div
              key="handoff"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-card p-8 bg-aplat-3 text-tile-ink border border-tile-ink shadow-card-elevated text-center"
            >
              <Icon name="oeil-barre" className="w-10 h-10 mx-auto mb-4 text-tile-ink" aria-hidden="true" />
              <p className="font-sans text-tile-ink/80">Personne d'autre ne regarde !</p>
              <p className="font-display text-3xl uppercase tracking-tight text-tile-ink mt-2">
                Passe le téléphone à {judge?.name}
              </p>
              {/* /70 sur bg-aplat-3 ne laissait que 4.20:1 en thème clair
                  (audit visuel 2026-08-05) - /80 passe dans les deux thèmes. */}
              <p className="font-sans text-sm text-tile-ink/80 mt-3">
                {judge?.name} est le juge de cette manche : une question secrète l'attend.
              </p>
            </motion.div>
          )}

          {/* Le juge classe en secret */}
          {session.phase === 'judging' && session.round && (
            <motion.div
              key="judging"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="rounded-card p-5 bg-card-face border border-tile-ink shadow-card-elevated text-center mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">
                  Question secrète - chut !
                </p>
                <p className="font-sans font-medium text-lg text-card-ink">
                  {session.round.question.text}
                </p>
              </div>

              <p className="text-ink-secondary font-sans text-sm text-center mb-3">
                Tape tes potes dans l'ordre, du haut du podium vers le bas :
              </p>

              <div className="space-y-2">
                {contestants.map((p) => {
                  const position = session.ranked.indexOf(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => { haptic('light'); setSession(toggleRanked(session, p.id)) }}
                      aria-pressed={position !== -1}
                      className={cn(
                        'w-full min-h-[52px] rounded-control border-2 px-4 flex items-center gap-3 font-sans font-bold transition-colors focus-ring-neon',
                        position !== -1
                          ? 'bg-aplat-1 text-tile-ink border-tile-ink shadow-gravure'
                          : 'bg-surface text-ink border-ink'
                      )}
                    >
                      <span
                        className={cn(
                          'w-8 h-8 rounded-full border border-ink flex items-center justify-center font-mono text-sm tabular-nums shrink-0',
                          position !== -1 ? 'bg-ink text-bg' : 'bg-surface text-ink-muted'
                        )}
                      >
                        {position !== -1 ? position + 1 : '-'}
                      </span>
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Retour du téléphone à la table */}
          {session.phase === 'return' && (
            <motion.div
              key="return"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-card p-8 bg-aplat-2 text-tile-ink border border-tile-ink shadow-card-elevated text-center"
            >
              <Icon name="oeil" className="w-10 h-10 mx-auto mb-4 text-tile-ink" aria-hidden="true" />
              <p className="font-display text-3xl uppercase tracking-tight text-tile-ink">
                Podium verrouillé !
              </p>
              <p className="font-sans text-sm text-tile-ink/80 mt-3">
                {judge?.name}, repose le téléphone au centre de la table.
              </p>
            </motion.div>
          )}

          {/* Le groupe devine la question */}
          {(session.phase === 'guessing' || session.phase === 'reveal') && session.round && (
            <motion.div
              key="guessing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              {/* Le podium du juge */}
              <div className="rounded-card p-4 bg-surface border border-ink shadow-gravure mb-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2 text-center">
                  Le podium de {judge?.name}
                </p>
                <ol className="space-y-1">
                  {session.ranked.map((id, i) => (
                    <li key={id} className="flex items-center gap-2 font-sans text-ink">
                      <Icon name="medaille"
                        className={cn(
                          'w-4 h-4 shrink-0',
                          i === 0 ? 'text-premium' : i === 1 ? 'text-ink-muted' : 'text-neon-soft'
                        )}
                        aria-hidden="true"
                      />
                      <span className="font-mono tabular-nums text-xs text-ink-muted w-4">{i + 1}.</span>
                      <span className="font-bold">{playerName(id)}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-ink-secondary font-sans text-sm text-center mb-3" aria-live="polite">
                {session.phase === 'guessing'
                  ? 'Quelle question secrète a produit ce classement ? Mettez-vous d\'accord :'
                  : groupGuessedRight
                    ? `Trouvé ! ${judge?.name} prend ${JUDGE_PENALTY} pénalités.`
                    : `Raté, c'était : « ${session.round.question.text} ». Tout le groupe prend ${GROUP_PENALTY} pénalité.`}
              </p>

              <div className="space-y-2">
                {session.round.choices.map((choice) => {
                  const isPicked = session.guessedId === choice.id
                  const isReal = session.round?.question.id === choice.id
                  return (
                    <button
                      key={choice.id}
                      disabled={session.phase === 'reveal'}
                      onClick={() => { haptic('medium'); setSession(guessQuestion(session, choice.id)) }}
                      className={cn(
                        'w-full min-h-[52px] rounded-control border-2 border-ink px-4 py-2 text-left font-sans text-sm font-medium transition-colors focus-ring-neon',
                        // card-red/20 et l'etat "surface opacity-50" restent sur le fond de
                        // page (theme), donc l'encre themable (text-ink) y reste correcte -
                        // seuls les aplats pop pleins (jaune au survol, lime au reveal) ont
                        // besoin de l'encre fixe tile-ink.
                        session.phase === 'guessing' &&
                          'bg-surface text-ink hover:bg-aplat-1 hover:text-tile-ink hover:border-tile-ink shadow-gravure',
                        session.phase === 'reveal' && isReal && 'bg-aplat-4 text-tile-ink',
                        session.phase === 'reveal' && isPicked && !isReal && 'bg-card-red/20 text-ink',
                        session.phase === 'reveal' && !isPicked && !isReal && 'bg-surface opacity-50 text-ink'
                      )}
                    >
                      {choice.text}
                      {session.phase === 'reveal' && isReal && (
                        <Icon name="valider" className="inline w-4 h-4 ml-2" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10">
        {session.phase === 'handoff' && (
          <Button variant="primary" size="xl" className="w-full" onClick={() => setSession(startJudging(session))}>
            Je suis {judge?.name}, j'ai le téléphone
          </Button>
        )}
        {session.phase === 'judging' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            disabled={session.ranked.length !== contestants.length}
            onClick={() => { haptic('medium'); setSession(confirmRanking(session)) }}
          >
            Valider mon podium
          </Button>
        )}
        {session.phase === 'return' && (
          <Button variant="primary" size="xl" className="w-full" onClick={() => setSession(startGuessing(session))}>
            Le téléphone est au centre
          </Button>
        )}
        {session.phase === 'reveal' && (
          <Button variant="primary" size="xl" className="w-full" onClick={() => setSession(nextRound(session))}>
            <Icon name="recommencer" className="w-5 h-5 mr-2" aria-hidden="true" />
            Manche suivante
          </Button>
        )}
      </footer>
    </motion.div>
  )
}
