import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SessionRecap } from '@/components/game'
import { Button, QuitButton, ModeRulesButton, Icon } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import {
  answerCorrect,
  answerWrong,
  createQuizSession,
  distributePot,
  getCurrentQuizPlayer,
  keepPot,
  type QuizSessionState,
} from '@/core/engine/quizSession'
import { QUIZ_QUESTIONS } from '@/content/quiz'
import { haptic } from '@/utils/haptic'

/**
 * Quitte ou Double - quiz culture G à cagnotte. Bonne réponse : les points
 * s'ajoutent à ta cagnotte, et tu choisis entre cumuler (tout risquer) ou
 * distribuer. Mauvaise réponse : tu prends ta cagnotte + les points en jeu.
 */
export function QuizScreen() {
  const { goToHub } = useAppStore()
  const { players } = useGameStore()

  const [session, setSession] = useState<QuizSessionState>(() =>
    createQuizSession(QUIZ_QUESTIONS, players)
  )
  const [answerShown, setAnswerShown] = useState(false)
  // Quitter en cours de partie doit quand même passer par l'addition - sans quoi ni
  // l'ardoise de la soirée ni l'évènement session_completed ne se déclenchaient.
  const [quitting, setQuitting] = useState(false)

  const currentPlayer = getCurrentQuizPlayer(session)
  const pot = currentPlayer ? (session.pots[currentPlayer.id] ?? 0) : 0

  if (session.phase === 'finished' || quitting) {
    return (
      <SessionRecap
        players={session.players}
        penaltyCounts={session.penaltyCounts}
        mode="quiz"
        turns={session.turnNumber}
        onReplay={() => {
          setSession(createQuizSession(QUIZ_QUESTIONS, players))
          setAnswerShown(false)
          setQuitting(false)
        }}
        onQuit={goToHub}
      />
    )
  }

  const handleCorrect = () => {
    haptic('light')
    setSession(answerCorrect(session))
    setAnswerShown(false)
  }

  const handleWrong = () => {
    haptic('medium')
    setSession(answerWrong(session))
    setAnswerShown(false)
  }

  const total = session.turnNumber + session.queue.length

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <QuitButton aria-label="Quitter le quiz et revenir à l'accueil" onQuit={() => setQuitting(true)} />
      <ModeRulesButton mode="quiz" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Quitte ou Double
        </p>
        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink mt-1">
          {currentPlayer?.name}
        </h2>
        <div className="mt-2 inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-aplat-1 text-tile-ink border-2 border-tile-ink font-mono text-xs font-bold tabular-nums">
            <Icon name="flamme" className="w-3.5 h-3.5" aria-hidden="true" />
            Cagnotte : {pot}
          </span>
          <span className="font-mono text-xs text-ink-muted tabular-nums">
            {session.turnNumber}/{total}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {session.phase === 'question' && session.currentQuestion && (
            <motion.div
              key={session.currentQuestion.id}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 160 }}
              className="w-full max-w-md rounded-card p-6 sm:p-8 bg-card-face text-card-ink border-2 border-tile-ink shadow-card-elevated text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-pill bg-aplat-3 text-tile-ink border-2 border-tile-ink font-mono text-xs font-bold uppercase">
                  {session.currentQuestion.category}
                </span>
                <span className="px-3 py-1 rounded-pill bg-aplat-2 text-tile-ink border-2 border-tile-ink font-mono text-xs font-bold tabular-nums">
                  {session.currentPoints} point{session.currentPoints > 1 ? 's' : ''} en jeu
                </span>
              </div>

              <p className="font-sans text-lg sm:text-xl leading-relaxed font-medium">
                {session.currentQuestion.question}
              </p>

              {answerShown ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 font-sans text-base bg-aplat-4 text-tile-ink border-2 border-tile-ink rounded-control px-4 py-3"
                  aria-live="polite"
                >
                  {session.currentQuestion.answer}
                </motion.p>
              ) : (
                <button
                  onClick={() => setAnswerShown(true)}
                  className="mt-5 inline-flex items-center gap-2 px-4 min-h-[44px] rounded-control bg-surface border-2 border-ink shadow-gravure font-sans font-bold text-sm focus-ring-neon active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  <Icon name="oeil" className="w-4 h-4" aria-hidden="true" />
                  Voir la réponse
                </button>
              )}
            </motion.div>
          )}

          {session.phase === 'choice' && (
            <motion.div
              key="choice"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-card p-6 sm:p-8 bg-aplat-1 text-tile-ink border-2 border-tile-ink shadow-card-elevated text-center"
            >
              <Icon name="cerveau" className="w-8 h-8 mx-auto mb-3 text-tile-ink" aria-hidden="true" />
              <p className="font-display text-2xl uppercase tracking-tight text-tile-ink">
                Bien joué !
              </p>
              <p className="font-sans text-tile-ink/80 mt-2">
                Ta cagnotte monte à <strong className="tabular-nums">{pot}</strong>. Tu la
                laisses grossir… ou tu la distribues maintenant ?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bandeau de résultat du tour précédent */}
        <AnimatePresence>
          {session.lastOutcome && session.phase === 'question' && (
            <motion.p
              key={`outcome-${session.turnNumber}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 font-mono text-xs uppercase tracking-wide text-ink-secondary text-center"
              aria-live="polite"
            >
              {session.lastOutcome.kind === 'busted'
                ? `${session.players.find((p) => p.id === session.lastOutcome?.playerId)?.name} a craqué : ${session.lastOutcome.amount} pénalité${session.lastOutcome.amount > 1 ? 's' : ''} !`
                : `${session.players.find((p) => p.id === session.lastOutcome?.playerId)?.name} distribue ${session.lastOutcome.amount} pénalité${session.lastOutcome.amount > 1 ? 's' : ''} à la table !`}
            </motion.p>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
        {session.phase === 'question' ? (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" size="lg" onClick={handleWrong} className="w-full">
              <Icon name="fermer" className="w-5 h-5 mr-2" aria-hidden="true" />
              Raté
            </Button>
            <Button variant="primary" size="lg" onClick={handleCorrect} className="w-full">
              <Icon name="valider" className="w-5 h-5 mr-2" aria-hidden="true" />
              Bonne réponse
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => { haptic('medium'); setSession(distributePot(session)) }}
            >
              Je distribue mes {pot} point{pot > 1 ? 's' : ''}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => { haptic('light'); setSession(keepPot(session)) }}
            >
              Je cumule (quitte ou double)
            </Button>
          </>
        )}
      </footer>
    </motion.div>
  )
}
