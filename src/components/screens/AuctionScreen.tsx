import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone, Minus, PencilLine, Plus, RotateCcw, TimerReset, Trash2, X } from 'lucide-react'
import { Button, QuitButton } from '@/components/ui'
import { AUCTION_THEMES, type AuctionTheme } from '@/content/auction'
import { CUSTOM_THEME_MAX_LENGTH, useCustomThemesStore } from '@/stores/customThemesStore'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

const CHALLENGE_SECONDS = 60

function pickTheme(pool: AuctionTheme[], exclude: string | null): AuctionTheme {
  const candidates = pool.filter((t) => t.id !== exclude)
  const source = candidates.length > 0 ? candidates : pool
  return source[Math.floor(Math.random() * source.length)]
}

type Phase = 'bidding' | 'challenge' | 'result'

/**
 * L'Enchère - un thème s'affiche, les joueurs surenchérissent à voix haute
 * (« je peux en citer 5 ! », « moi 7 ! »)… jusqu'à ce que quelqu'un crie
 * « tu mens ! ». Le dernier enchérisseur doit alors citer son compte en une
 * minute : la table compte les bonnes réponses. Perdu = autant de pénalités
 * que l'enchère ; réussi = c'est l'accusateur qui les prend.
 */
export function AuctionScreen() {
  const customThemes = useCustomThemesStore((s) => s.themes)
  const addTheme = useCustomThemesStore((s) => s.add)
  const removeTheme = useCustomThemesStore((s) => s.remove)
  const toggleTheme = useCustomThemesStore((s) => s.toggle)
  const [theme, setTheme] = useState<AuctionTheme>(() => pickTheme(AUCTION_THEMES, null))
  const [editorOpen, setEditorOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [phase, setPhase] = useState<Phase>('bidding')
  const [bid, setBid] = useState(0)
  const [cited, setCited] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(CHALLENGE_SECONDS)
  const [timerRunning, setTimerRunning] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setTimerRunning(false)
  }

  const resolveChallenge = (won: boolean) => {
    stopTimers()
    setSuccess(won)
    setPhase('result')
    haptic('heavy')
  }

  // Affichage du décompte : une seule sous-seconde d'état, la résolution du défi
  // passe par le setTimeout de fin (jamais de setState en cascade dans un effet).
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  useEffect(() => () => stopTimers(), [])

  const startChallenge = () => {
    if (bid < 1) return
    haptic('medium')
    setCited(0)
    setSecondsLeft(CHALLENGE_SECONDS)
    setTimerRunning(true)
    setSuccess(null)
    setPhase('challenge')
    timeoutRef.current = setTimeout(() => resolveChallenge(false), CHALLENGE_SECONDS * 1000)
  }

  const handleCite = () => {
    haptic('light')
    const next = cited + 1
    setCited(next)
    if (next >= bid) {
      resolveChallenge(true)
    }
  }

  const submitDraft = () => {
    if (addTheme(draft)) {
      haptic('light')
      setDraft('')
    }
  }

  const nextRound = () => {
    haptic('light')
    stopTimers()
    // Le pool est relu au moment du tirage : thèmes embarqués + thèmes actifs
    // de la tablée (le store est la source, pas le rendu).
    const pool = [...AUCTION_THEMES, ...useCustomThemesStore.getState().getAuctionThemes()]
    setTheme((t) => pickTheme(pool, t.id))
    setBid(0)
    setCited(0)
    setSecondsLeft(CHALLENGE_SECONDS)
    setSuccess(null)
    setPhase('bidding')
  }

  return (
    <motion.div
      className="min-h-screen w-full flex flex-col px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <QuitButton aria-label="Quitter l'Enchère et revenir à l'accueil" />

      <header className="flex-shrink-0 mb-4 pt-16 relative z-10 text-center">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest">
          La Criée
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        {/* Thème */}
        <div className="w-full rounded-card p-6 bg-card-face border-2 border-ink shadow-card-elevated text-center mb-6">
          <Megaphone className="w-7 h-7 mx-auto mb-3 text-neon" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-1">
            {theme.id.startsWith('custom-') ? 'Thème de la tablée' : 'Le thème'}
          </p>
          <p className="font-display text-2xl uppercase tracking-tight text-card-ink">
            {theme.text}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'bidding' && (
            <motion.div
              key="bidding"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full text-center"
            >
              <p className="text-ink-secondary font-sans text-sm mb-4">
                Annoncez à voix haute combien vous pouvez en citer en 1 minute.
                Surenchérissez… ou criez <strong>« tu mens ! »</strong>
              </p>

              <div className="flex items-center justify-center gap-4 mb-2">
                <button
                  onClick={() => { haptic('light'); setBid((b) => Math.max(0, b - 1)) }}
                  aria-label="Baisser l'enchère"
                  className="w-12 h-12 rounded-control bg-surface border-2 border-ink shadow-brutal-sm flex items-center justify-center focus-ring-neon active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  <Minus className="w-5 h-5" aria-hidden="true" />
                </button>
                <span
                  className="font-display text-7xl text-ink tabular-nums min-w-[100px]"
                  aria-live="polite"
                  aria-label={`Enchère actuelle : ${bid}`}
                >
                  {bid}
                </span>
                <button
                  onClick={() => { haptic('light'); setBid((b) => b + 1) }}
                  aria-label="Monter l'enchère"
                  className="w-12 h-12 rounded-control bg-pop-yellow border-2 border-ink shadow-brutal-sm flex items-center justify-center focus-ring-neon active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <p className="font-mono text-xs text-ink-muted uppercase tracking-wide">
                dernière enchère annoncée
              </p>
            </motion.div>
          )}

          {phase === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full text-center"
            >
              <p
                className={cn(
                  'font-display text-6xl tabular-nums mb-1',
                  secondsLeft <= 10 ? 'text-card-red' : 'text-ink'
                )}
                aria-live="polite"
              >
                {secondsLeft}s
              </p>
              <p className="text-ink-secondary font-sans text-sm mb-5">
                Cite-les ! La table valide chaque bonne réponse.
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => { haptic('light'); setCited((c) => Math.max(0, c - 1)) }}
                  aria-label="Retirer une bonne réponse"
                  className="w-12 h-12 rounded-control bg-surface border-2 border-ink shadow-brutal-sm flex items-center justify-center focus-ring-neon"
                >
                  <Minus className="w-5 h-5" aria-hidden="true" />
                </button>
                <span className="font-display text-7xl text-ink tabular-nums" aria-live="polite">
                  {cited}
                  <span className="text-2xl text-ink-muted">/{bid}</span>
                </span>
                <button
                  onClick={handleCite}
                  aria-label="Compter une bonne réponse"
                  className="w-12 h-12 rounded-control bg-pop-lime border-2 border-ink shadow-brutal-sm flex items-center justify-center focus-ring-neon"
                >
                  <Plus className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'w-full rounded-card p-8 border-2 border-ink shadow-card-elevated text-center',
                success ? 'bg-pop-lime' : 'bg-pop-pink'
              )}
              aria-live="polite"
            >
              <p className="font-display text-3xl uppercase tracking-tight text-ink">
                {success ? 'Pari tenu !' : 'Ça sentait le bluff…'}
              </p>
              <p className="font-sans text-ink/80 mt-3">
                {success
                  ? `${bid} cité${bid > 1 ? 's' : ''} sur ${bid}. Celui qui a crié « tu mens » prend ${bid} pénalité${bid > 1 ? 's' : ''}.`
                  : `${cited} cité${cited > 1 ? 's' : ''} sur ${bid} annoncés. L'enchérisseur prend ${bid} pénalité${bid > 1 ? 's' : ''}.`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="flex-shrink-0 mt-auto pt-6 relative z-10 flex flex-col gap-3">
        {phase === 'bidding' && (
          <>
            <Button variant="primary" size="xl" className="w-full" onClick={startChallenge} disabled={bid < 1}>
              <TimerReset className="w-6 h-6 mr-3" aria-hidden="true" />
              « Tu mens ! » - lancer le chrono
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={nextRound}>
                Changer de thème
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => { haptic('light'); setEditorOpen(true) }}
              >
                <PencilLine className="w-4 h-4 mr-2" aria-hidden="true" />
                Mes thèmes{customThemes.length > 0 ? ` (${customThemes.length})` : ''}
              </Button>
            </div>
          </>
        )}
        {phase === 'challenge' && (
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => resolveChallenge(cited >= bid)}
          >
            Arrêter le défi
          </Button>
        )}
        {phase === 'result' && (
          <Button variant="primary" size="xl" className="w-full" onClick={nextRound}>
            <RotateCcw className="w-6 h-6 mr-3" aria-hidden="true" />
            Nouveau thème
          </Button>
        )}
      </footer>

      {/* Éditeur des thèmes de la tablée - persistés sur l'appareil, comme Mes règles. */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal bg-ink/50 flex items-end sm:items-center justify-center"
            onClick={() => setEditorOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mes thèmes de Criée"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full sm:max-w-md max-h-[80dvh] overflow-y-auto bg-bg border-2 border-ink rounded-t-card sm:rounded-card shadow-brutal-lg p-5 pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl uppercase tracking-tight text-ink">
                  Mes thèmes
                </h2>
                <button
                  onClick={() => setEditorOpen(false)}
                  aria-label="Fermer"
                  className="w-11 h-11 rounded-control bg-surface border-2 border-ink shadow-brutal-sm flex items-center justify-center focus-ring-neon"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-ink-secondary font-sans text-sm mb-3">
                Vos thèmes rejoignent la pioche de la Criée et restent enregistrés
                sur cet appareil.
              </p>

              <div className="flex gap-2 mb-4">
                <label htmlFor="custom-theme-input" className="sr-only">
                  Nouveau thème
                </label>
                <input
                  id="custom-theme-input"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitDraft() }}
                  maxLength={CUSTOM_THEME_MAX_LENGTH}
                  placeholder="Des choses qu'on crie au comptoir…"
                  className="flex-1 min-w-0 min-h-[44px] px-3 rounded-control bg-bg-raised border-2 border-ink text-ink placeholder:text-ink-muted focus-ring-neon"
                />
                <Button variant="primary" onClick={submitDraft} disabled={draft.trim().length === 0}>
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Ajouter le thème</span>
                </Button>
              </div>

              {customThemes.length === 0 ? (
                <p className="text-ink-muted font-mono text-xs uppercase tracking-wide text-center py-4">
                  Aucun thème pour l'instant
                </p>
              ) : (
                <ul className="space-y-2">
                  {customThemes.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 rounded-control border-2 border-ink bg-surface px-3 py-2"
                    >
                      <button
                        onClick={() => { haptic('light'); toggleTheme(t.id) }}
                        role="switch"
                        aria-checked={t.enabled}
                        aria-label={`${t.enabled ? 'Désactiver' : 'Activer'} le thème : ${t.text}`}
                        className={cn(
                          'w-11 h-6 rounded-pill border-2 border-ink flex-shrink-0 relative transition-colors focus-ring-neon',
                          t.enabled ? 'bg-pop-lime' : 'bg-bg-raised'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-ink transition-all',
                            t.enabled ? 'left-[22px]' : 'left-0.5'
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      <span
                        className={cn(
                          'flex-1 min-w-0 font-sans text-sm break-words',
                          t.enabled ? 'text-ink' : 'text-ink-muted line-through'
                        )}
                      >
                        {t.text}
                      </span>
                      <button
                        onClick={() => { haptic('medium'); removeTheme(t.id) }}
                        aria-label={`Supprimer le thème : ${t.text}`}
                        className="w-11 h-11 rounded-control flex items-center justify-center text-ink-muted hover:text-card-red focus-ring-neon flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
