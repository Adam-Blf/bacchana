import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chrono, SessionRecap } from '@/components/game'
import { Button, BarreDeJeu, Icon } from '@/components/ui'
import { usePromptStore, useAppStore } from '@/stores'
import { interpolate } from '@/core/engine/interpolate'
import { enumerer } from '@/core/text/francais'
import { getCurrentPlayer } from '@/core/engine/promptSession'
import { penaltyFromItem, DEFAULT_MANUAL_PENALTY, formatPenaltyCount } from '@/core/engine/penalties'
import { getModeDefinition } from '@/core/engine/modeRegistry'
import { isResolvableTarget, resolveTarget, seededRng } from '@/core/engine/targeting'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'
import { track } from '@/lib/analytics'

/**
 * Generic screen for every prompt-based mode (picolo, truth or dare, never have I ever,
 * who among us, would you rather, it's a 10 but, seven seconds). Reads the active session
 * from promptStore and renders one big interpolated prompt card, persistent-rule pills, and
 * the "done / penalty" turn controls.
 */
export function PromptGameScreen() {
  const { session, packTitle, next, penalize, reset, replay } = usePromptStore()
  const { activeMode, goToHub } = useAppStore()

  // No live session (deep reload, store reset): never render a dead black screen -
  // send the user back to the hub and show the loader meanwhile.
  useEffect(() => {
    if (!session) {
      goToHub()
    }
  }, [session, goToHub])

  if (!session) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-ink-muted font-mono text-sm">
        chargement…
      </div>
    )
  }

  const modeDef = activeMode ? getModeDefinition(activeMode) : null
  const currentPlayer = getCurrentPlayer(session)

  const handleQuit = () => {
    // Emis AVANT reset() : apres, la session n'existe plus et le numero de
    // tour est perdu. C'est ce qui manquait - l'abandon etait le seul denouement
    // de partie a ne produire aucun evenement.
    if (activeMode) {
      track({
        name: 'session_abandoned',
        props: {
          mode: activeMode,
          turn: session.turnNumber,
          total: session.shownIds.length + session.queue.length,
        },
      })
    }
    reset()
    goToHub()
  }

  if (session.finished) {
    return (
      <SessionRecap
        players={session.players}
        penaltyCounts={session.penaltyCounts}
        mode={activeMode ?? undefined}
        turns={session.turnNumber}
        onReplay={replay}
        onQuit={handleQuit}
      />
    )
  }

  const total = session.shownIds.length + session.queue.length + (session.currentItem ? 1 : 0)
  const progress = total > 0 ? ((session.turnNumber - 1) / total) * 100 : 0

  const promptText = session.currentItem && currentPlayer
    ? interpolate(
        session.currentItem.text,
        session.players,
        currentPlayer,
        `${session.currentItem.id}-${session.turnNumber}`
      )
    : ''

  const itemPenalty = session.currentItem ? penaltyFromItem(session.currentItem) : null

  // Cible de contenu (genre / statut relationnel / paire) : résolue de façon déterministe
  // par tour (seed = item + numéro de tour) pour ne jamais changer entre deux re-rendus
  // du même tour. Reste gracieux - une prompt sans `targets` n'affiche rien de plus.
  const targetPlayers =
    session.currentItem && isResolvableTarget(session.currentItem.targets)
      ? resolveTarget(
          session.players,
          session.currentItem.targets,
          seededRng(`${session.currentItem.id}-${session.turnNumber}`)
        )
      : []
  const targetLabel =
    targetPlayers.length > 1
      // `join(' et ')` rendait « Alice et Bo et Cyr ».
      ? `C'est à ${enumerer(targetPlayers.map((p) => p.name))} de jouer`
      : targetPlayers.length === 1
        ? `C'est à ${targetPlayers[0].name} de jouer`
        : null
  const penaltyAmount = itemPenalty?.amount ?? DEFAULT_MANUAL_PENALTY

  const handleDone = () => {
    haptic('light')
    if (activeMode && session.currentItem) {
      track({ name: 'item_resolved', props: { mode: activeMode, itemId: session.currentItem.id, outcome: 'done' } })
    }
    next()
  }

  const handlePenalty = () => {
    haptic('medium')
    if (activeMode && session.currentItem) {
      track({ name: 'item_resolved', props: { mode: activeMode, itemId: session.currentItem.id, outcome: 'penalty' } })
    }
    if (currentPlayer) {
      penalize(currentPlayer.id, penaltyAmount)
    }
    next()
  }

  return (
    <motion.div
      className="min-h-dvh w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grain" />
      </div>

      {activeMode && <BarreDeJeu mode={activeMode} onQuit={handleQuit} />}

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          {packTitle && modeDef && packTitle.startsWith(modeDef.title)
            ? packTitle
            : `${modeDef?.title ?? ''}${packTitle ? ` - ${packTitle}` : ''}`}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1 relative h-1.5 rounded-pill bg-surface overflow-hidden border border-border">
            <motion.div
              className="absolute inset-y-0 left-0 bg-neon rounded-pill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface border border-border">
            <span className="font-mono tabular-nums font-bold text-sm text-ink">
              {session.turnNumber}
            </span>
            <span className="font-mono tabular-nums text-xs text-ink-muted">/{total}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-ink mb-6 text-center">
          {currentPlayer?.name ?? 'Joueur'}
        </h2>

        <AnimatePresence mode="wait">
          {session.currentItem && (
            <motion.div
              key={session.currentItem.id}
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 160 }}
              className={cn(
                'w-full max-w-md rounded-card p-8 sm:p-10',
                'bg-card-face text-card-ink',
                'border border-tile-ink shadow-card-elevated',
                'text-center'
              )}
            >
              <p className="font-sans text-lg sm:text-xl leading-relaxed">
                {promptText}
              </p>

              {targetLabel && (
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-card-red">
                  {targetLabel}
                </p>
              )}

              {modeDef?.chronoSecondes && (
                <Chrono
                  secondes={modeDef.chronoSecondes}
                  cle={`${session.currentItem.id}-${session.turnNumber}`}
                />
              )}

              {itemPenalty && (
                <p className="mt-6 font-mono text-xs uppercase tracking-widest text-card-danger">
                  {itemPenalty.displayText}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {(session.activeRules.length > 0 || session.activeRole) && (
        <div className="relative z-10 flex flex-wrap gap-2 justify-center mb-4">
          {session.activeRole && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-premium/10 border border-premium/30 text-premium text-xs font-mono uppercase tracking-wide">
              <Icon name="couronne" className="w-3.5 h-3.5" aria-hidden="true" />
              {session.players.find((p) => p.id === session.activeRole?.ownerId)?.name}
            </span>
          )}
          {session.activeRules.map((rule) => (
            <span
              key={`${rule.item.id}-${rule.ownerId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-neon/10 border border-neon/30 text-orange-ink text-xs font-mono uppercase tracking-wide"
            >
              <Icon name="horloge" className="w-3.5 h-3.5" aria-hidden="true" />
              {Number.isFinite(rule.expiresAtTurn)
                ? `encore ${rule.expiresAtTurn - session.turnNumber} tour${rule.expiresAtTurn - session.turnNumber > 1 ? 's' : ''}`
                : 'jusqu\'à la fin'}
            </span>
          ))}
        </div>
      )}

      <footer className="flex-shrink-0 mt-auto pt-2 relative z-10 flex flex-col gap-3">
        <Button variant="secondary" size="lg" className="w-full" onClick={handlePenalty}>
          {formatPenaltyCount(penaltyAmount)}
        </Button>
        <Button variant="primary" size="xl" className="w-full" onClick={handleDone}>
          <Icon name="valider" className="w-6 h-6 mr-3" aria-hidden="true" />
          <span className="text-xl uppercase tracking-wide">Fait</span>
        </Button>
      </footer>
    </motion.div>
  )
}
