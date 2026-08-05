import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeOff, Gavel, PenLine, Receipt, Sparkles, ThumbsDown, ThumbsUp, RotateCcw } from '@/components/ui/icons'
import { Button, QuitButton, ModeRulesButton } from '@/components/ui'
import { SessionRecap } from '@/components/game/SessionRecap'
import { useAppStore } from '@/stores'
import { useGameStore } from '@/stores'
import { interpolate } from '@/core/engine/interpolate'
import { calculatePenalty } from '@/core/borderland'
import { TRIBUNAL_CHARGES } from '@/content/tribunal'
import type { Player } from '@/types'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface Accusation {
  text: string
  /** null = accusation embarquée dans l'app. */
  authorId: string | null
}

function pickAccused(players: Player[], excludeIds: Array<string | null>): Player {
  const pool = players.filter((p) => p.active && !excludeIds.includes(p.id))
  const candidates = pool.length > 0 ? pool : players.filter((p) => p.active)
  return pickRandom(candidates)
}

type Phase = 'intro' | 'collect-handoff' | 'collect-write' | 'defense' | 'vote' | 'finished'

/**
 * Le Procès - chaque joueur écrit une accusation secrète (ou la table joue avec
 * celles de l'app). Les accusations sont tirées au hasard : l'accusé se défend,
 * puis vote à main levée. La majorité décide de la peine.
 */
export function TribunalScreen() {
  const { players } = useGameStore()

  const activePlayers = useMemo(() => players.filter((p) => p.active), [players])

  const [phase, setPhase] = useState<Phase>('intro')
  const [writerIndex, setWriterIndex] = useState(0)
  const [draft, setDraft] = useState('')
  const [pool, setPool] = useState<Accusation[]>([])
  const [current, setCurrent] = useState<Accusation | null>(null)
  const [accused, setAccused] = useState<Player | null>(null)
  const [votesGuilty, setVotesGuilty] = useState(0)
  const [votesInnocent, setVotesInnocent] = useState(0)
  const [verdict, setVerdict] = useState<'guilty' | 'innocent' | null>(null)
  const [penaltyCounts, setPenaltyCounts] = useState<Record<string, number>>({})
  const [trialsPlayed, setTrialsPlayed] = useState(0)

  const writer = activePlayers[writerIndex] ?? null

  const startTrialFrom = useCallback(
    (accusations: Accusation[]) => {
      const source =
        accusations.length > 0
          ? accusations
          : TRIBUNAL_CHARGES.map((c) => ({ text: c.text, authorId: null }))
      const accusation = pickRandom(source)
      const nextAccused = pickAccused(activePlayers, [accusation.authorId])
      setPool(accusations.filter((a) => a !== accusation))
      setCurrent(accusation)
      setAccused(nextAccused)
      setVotesGuilty(0)
      setVotesInnocent(0)
      setVerdict(null)
      setPhase('defense')
    },
    [activePlayers]
  )

  const handleUseAppCharges = () => {
    haptic('light')
    startTrialFrom([])
  }

  const handleStartCollect = () => {
    haptic('light')
    setWriterIndex(0)
    setDraft('')
    setPool([])
    setPhase('collect-handoff')
  }

  const handleSubmitAccusation = () => {
    if (!writer || !draft.trim()) return
    haptic('light')
    const nextPool = [...pool, { text: draft.trim(), authorId: writer.id }]
    setDraft('')
    if (writerIndex + 1 < activePlayers.length) {
      setPool(nextPool)
      setWriterIndex(writerIndex + 1)
      setPhase('collect-handoff')
    } else {
      startTrialFrom(nextPool)
    }
  }

  const handleVerdict = useCallback(() => {
    if (!accused) return
    haptic('medium')
    const guilty = votesGuilty > votesInnocent
    setVerdict(guilty ? 'guilty' : 'innocent')
    setTrialsPlayed((n) => n + 1)
    if (guilty) {
      const penalty = calculatePenalty(1, 0, 'gorgees')
      setPenaltyCounts((prev) => ({
        ...prev,
        [accused.id]: (prev[accused.id] ?? 0) + penalty.amount,
      }))
    }
  }, [votesGuilty, votesInnocent, accused])

  const handleNewTrial = useCallback(() => {
    haptic('light')
    startTrialFrom(pool)
  }, [pool, startTrialFrom])

  const finishSession = useCallback(() => {
    haptic('medium')
    setPhase('finished')
  }, [])

  const replaySession = useCallback(() => {
    setPenaltyCounts({})
    setTrialsPlayed(0)
    setPhase('intro')
  }, [])

  const chargeText =
    current && accused
      ? interpolate(current.text, activePlayers, accused, `${current.text}-${accused.id}`)
      : ''

  // Etat terminal : le mode debouche sur l'addition comme tous les autres, ce qui
  // alimente l'ardoise de la soiree et l'evenement de fin de session.
  if (phase === 'finished') {
    return (
      <SessionRecap
        players={activePlayers}
        penaltyCounts={penaltyCounts}
        mode="tribunal"
        turns={trialsPlayed}
        onReplay={replaySession}
        onQuit={() => useAppStore.getState().goToHub()}
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
      <QuitButton aria-label="Quitter le procès et revenir à l'accueil" />
      <ModeRulesButton mode="tribunal" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          Le Pilori
        </p>
        {(phase === 'defense' || phase === 'vote') && accused && (
          <>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink mt-1">
              {accused.name}
            </h2>
            <p className="text-ink-secondary font-sans text-sm mt-1">
              comparaît devant la cour
            </p>
          </>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Choix du deck d'accusations */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full text-center"
            >
              <Gavel className="w-10 h-10 mx-auto mb-4 text-neon" aria-hidden="true" />
              <p className="font-display text-2xl uppercase tracking-tight text-ink mb-2">
                La cour est ouverte
              </p>
              <p className="text-ink-secondary font-sans text-sm mb-6">
                Chacun écrit une accusation secrète contre la table… ou vous laissez
                l'app fournir les chefs d'accusation.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" className="w-full" onClick={handleStartCollect}>
                  <PenLine className="w-5 h-5 mr-2" aria-hidden="true" />
                  On écrit nos accusations
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={handleUseAppCharges}>
                  <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                  Accusations de l'app
                </Button>
              </div>
            </motion.div>
          )}

          {/* Passage du téléphone au rédacteur suivant */}
          {phase === 'collect-handoff' && writer && (
            <motion.div
              key={`handoff-${writer.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-card p-8 bg-pop-blue text-tile-ink border-2 border-ink shadow-card-elevated text-center"
            >
              <EyeOff className="w-10 h-10 mx-auto mb-4 text-tile-ink" aria-hidden="true" />
              <p className="font-sans text-tile-ink/80">Accusation secrète {writerIndex + 1}/{activePlayers.length}</p>
              <p className="font-display text-3xl uppercase tracking-tight text-tile-ink mt-2">
                Passe le téléphone à {writer.name}
              </p>
            </motion.div>
          )}

          {/* Écriture secrète */}
          {phase === 'collect-write' && writer && (
            <motion.div
              key={`write-${writer.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full"
            >
              <p className="text-ink-secondary font-sans text-sm text-center mb-3">
                {writer.name}, accuse qui tu veux - ton accusation restera anonyme.
              </p>
              <label htmlFor="accusation" className="sr-only">
                Ton accusation
              </label>
              <textarea
                id="accusation"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 200))}
                rows={4}
                placeholder="Ex. : quelqu'un ici a déjà quitté une soirée sans dire au revoir…"
                className="w-full rounded-card bg-surface border-2 border-ink shadow-brutal-sm p-4 font-sans text-ink placeholder:text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-neon resize-none"
              />
              <p className="text-right font-mono text-xs text-ink-muted tabular-nums mt-1">
                {draft.length}/200
              </p>
            </motion.div>
          )}

          {/* Lecture de l'accusation + défense */}
          {(phase === 'defense' || phase === 'vote') && current && accused && (
            <motion.div
              key={`trial-${chargeText}-${accused.id}`}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 160 }}
              className="w-full"
            >
              <div
                className={cn(
                  'w-full rounded-card p-8 sm:p-10',
                  'bg-card-face text-card-ink',
                  'border-2 border-ink shadow-card-elevated',
                  'text-center'
                )}
              >
                <Gavel className="w-8 h-8 mx-auto mb-4 text-card-red" aria-hidden="true" />
                <p className="font-sans text-lg sm:text-xl leading-relaxed">{chargeText}</p>
                {/* text-card-ink/70, pas text-ink-muted : cette carte est bg-card-face
                    fixe (voir le commentaire équivalent dans AuctionScreen/RankingScreen,
                    même bug, audit visuel 2026-08-05). */}
                {current.authorId && (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-card-ink/70 mt-4">
                    accusation anonyme de la table
                  </p>
                )}
              </div>

              {phase === 'defense' && (
                <p className="text-ink-secondary font-sans text-sm text-center mt-5" aria-live="polite">
                  {accused.name} a 30 secondes pour se défendre. Écoutez… puis votez.
                </p>
              )}

              {phase === 'vote' && (
                <>
                  <div className="w-full mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { haptic('light'); setVotesGuilty((v) => v + 1) }}
                      disabled={verdict !== null}
                      className="min-h-[64px] rounded-card bg-surface border-2 border-ink shadow-brutal-sm flex flex-col items-center justify-center gap-1 transition-colors focus-ring-neon disabled:opacity-40"
                    >
                      <ThumbsDown className="w-5 h-5 text-neon" aria-hidden="true" />
                      <span className="font-mono tabular-nums text-lg font-bold text-ink">{votesGuilty}</span>
                      <span className="text-[10px] font-mono text-ink-muted uppercase">Coupable</span>
                    </button>
                    <button
                      onClick={() => { haptic('light'); setVotesInnocent((v) => v + 1) }}
                      disabled={verdict !== null}
                      className="min-h-[64px] rounded-card bg-surface border-2 border-ink shadow-brutal-sm flex flex-col items-center justify-center gap-1 transition-colors focus-ring-neon disabled:opacity-40"
                    >
                      <ThumbsUp className="w-5 h-5 text-success" aria-hidden="true" />
                      <span className="font-mono tabular-nums text-lg font-bold text-ink">{votesInnocent}</span>
                      <span className="text-[10px] font-mono text-ink-muted uppercase">Non coupable</span>
                    </button>
                  </div>

                  {verdict && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      aria-live="polite"
                      className={cn(
                        'mt-6 font-display text-2xl uppercase tracking-tight text-center',
                        verdict === 'guilty' ? 'text-neon' : 'text-success'
                      )}
                    >
                      {verdict === 'guilty' ? 'Coupable - 1 pénalité' : 'Non coupable - libéré'}
                    </motion.p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
        {phase === 'collect-handoff' && writer && (
          <Button variant="primary" size="xl" className="w-full" onClick={() => setPhase('collect-write')}>
            C'est moi, {writer.name}
          </Button>
        )}
        {phase === 'collect-write' && (
          <Button
            variant="primary"
            size="xl"
            className="w-full"
            disabled={!draft.trim()}
            onClick={handleSubmitAccusation}
          >
            Accusation déposée
          </Button>
        )}
        {phase === 'defense' && (
          <Button variant="primary" size="xl" className="w-full" onClick={() => { haptic('light'); setPhase('vote') }}>
            <Gavel className="w-6 h-6 mr-3" aria-hidden="true" />
            <span className="text-xl uppercase tracking-wide">Passer au vote</span>
          </Button>
        )}
        {phase === 'vote' && verdict === null && (
          <Button variant="primary" size="xl" className="w-full" onClick={handleVerdict}>
            <Gavel className="w-6 h-6 mr-3" aria-hidden="true" />
            <span className="text-xl uppercase tracking-wide">Verdict</span>
          </Button>
        )}
        {phase === 'vote' && verdict !== null && (
          <>
            <Button variant="primary" size="xl" className="w-full" onClick={handleNewTrial}>
              <RotateCcw className="w-6 h-6 mr-3" aria-hidden="true" />
              <span className="text-xl uppercase tracking-wide">
                {pool.length > 0 ? 'Procès suivant' : 'Nouveau procès'}
              </span>
            </Button>
            <Button variant="secondary" className="w-full" onClick={finishSession}>
              <Receipt className="w-5 h-5 mr-2" aria-hidden="true" />
              Terminer et voir l'addition
            </Button>
          </>
        )}

        {(phase === 'vote' || phase === 'defense') && Object.keys(penaltyCounts).length > 0 && (
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
