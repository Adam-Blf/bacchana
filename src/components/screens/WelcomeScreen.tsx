import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAppStore, useConsentStore, useGameStore } from '@/stores'
import { cn } from '@/utils'
import type { PlayerGender, PlayerRelationship } from '@/types'

/** One row of the player roster before it becomes a real `Player` (no id yet). */
interface PlayerEntry {
  name: string
  gender?: PlayerGender
  relationship?: PlayerRelationship
}

const GENDER_OPTIONS: { value: PlayerGender; label: string }[] = [
  { value: 'm', label: 'Homme' },
  { value: 'f', label: 'Femme' },
  { value: 'x', label: 'Autre' },
]

const RELATIONSHIP_OPTIONS: { value: PlayerRelationship; label: string }[] = [
  { value: 'single', label: 'Célibataire' },
  { value: 'couple', label: 'En couple' },
]

/** Same sanitization as gameStore.setPlayers - kept aligned so indices match after Enter. */
function sanitizeName(name: string): string {
  return name.trim().slice(0, 20).replace(/[<>]/g, '')
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 150 },
  },
}

const floatVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 200,
    },
  },
}

const playerInputVariants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 200 },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

export function WelcomeScreen() {
  const { navigateTo, goBack } = useAppStore()
  const { players, setPlayers, setPlayerAttributes, hasPlayers } = useGameStore()
  const consentDecided = useConsentStore((s) => s.hasValidConsent())

  const [entries, setEntries] = useState<PlayerEntry[]>(() =>
    players.length > 0
      ? players.map((p) => ({ name: p.name, gender: p.gender, relationship: p.relationship }))
      : [{ name: '' }, { name: '' }]
  )
  // Un seul panneau d'attributs ouvert à la fois - reste compact, jamais imposé.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const addName = () => {
    if (entries.length < 8) {
      setEntries([...entries, { name: '' }])
    }
  }

  const removeName = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index))
      setExpandedIndex(null)
    }
  }

  const updateName = (index: number, value: string) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, name: value } : e)))
  }

  const updateGender = (index: number, gender: PlayerGender | undefined) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, gender } : e)))
  }

  const updateRelationship = (index: number, relationship: PlayerRelationship | undefined) => {
    setEntries(entries.map((e, i) => (i === index ? { ...e, relationship } : e)))
  }

  const validEntries = entries
    .map((e) => ({ ...e, name: sanitizeName(e.name) }))
    .filter((e) => e.name.length > 0)
  const canEnter = validEntries.length >= 2

  const handleEnter = () => {
    if (!canEnter) return
    // Coming from the hub ("Modifier"): pop back. First launch: welcome is the history
    // root, so swap it for the hub instead of stacking a duplicate entry.
    const returning = hasPlayers()
    setPlayers(validEntries.map((e) => e.name))

    // setPlayers crée des joueurs frais (nouveaux ids) dans le même ordre que
    // validEntries (même sanitization) - on peut donc reporter genre/statut par index.
    const created = useGameStore.getState().players
    validEntries.forEach((entry, index) => {
      const player = created[index]
      if (player && (entry.gender || entry.relationship)) {
        setPlayerAttributes(player.id, { gender: entry.gender, relationship: entry.relationship })
      }
    })

    if (returning) {
      goBack()
    } else {
      navigateTo('hub', { replace: true })
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        'min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative overflow-hidden bg-bg',
        // Keep the main CTA reachable above the cookie banner on first launch.
        !consentDecided && 'pb-64'
      )}
    >
      {/* Back to hub - only when a valid player list already exists, so the screen
          never becomes a dead end. */}
      {hasPlayers() && (
        <button
          onClick={() => goBack()}
          aria-label="Revenir à l'accueil"
          className={cn(
            'fixed top-safe left-4 z-controls',
            'w-11 h-11 rounded-pill',
            'bg-surface border border-border-strong',
            'flex items-center justify-center',
            'text-ink-secondary hover:text-orange-ink hover:border-neon/50',
            'transition-colors duration-200 focus-ring-neon'
          )}
        >
          <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      {/* Ambient glow. Le halo pourpre, plus haut et discret, adoucit la
          couture entre le splash de démarrage (fond plein pourpre, voir
          index.html/vite.config.ts) et l'univers créme du jeu : premier
          écran vu après l'icône, dernier endroit où le pourpre de marque
          se laisse encore deviner avant de céder la place au néon. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-table" />
      </div>

      {/* Header - titre geant, slogan de l'arène */}
      <motion.div variants={titleVariants} className="text-center mb-10 relative z-10">
        <h1 className="font-display text-6xl sm:text-7xl uppercase tracking-tight leading-none text-ink">
          <span className="text-neon text-glow-neon">Bacchana</span>
        </h1>
        <p className="text-ink-secondary font-mono text-sm mt-4 tabular-nums">
          Les meilleurs jeux de soirée, servis au comptoir.
        </p>
      </motion.div>

      {/* Inscription card - liste d'inscription a l'arène */}
      <motion.div
        variants={floatVariants}
        className="w-full max-w-md relative z-10 bg-surface border-2 border-ink shadow-brutal-lg rounded-card p-6 sm:p-8"
      >
        <div className="relative z-10">
          {/* Player count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4, damping: 15 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-neon/10 border border-neon/30 mb-6"
          >
            <Icon name="joueurs" className="w-4 h-4 text-neon" aria-hidden="true" />
            <span className="text-sm font-mono tabular-nums font-semibold text-orange-ink">
              {validEntries.length} à la tablée
            </span>
          </motion.div>

          <h2 className="font-display text-lg uppercase tracking-tight text-ink-secondary mb-4">
            La tablée
          </h2>

          {/* Player inputs */}
          <div className="space-y-3 mb-2">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => {
                const isExpanded = expandedIndex === index
                const hasAttributes = Boolean(entry.gender || entry.relationship)

                return (
                  <motion.div
                    key={index}
                    variants={playerInputVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="flex flex-col gap-2"
                  >
                    <div className="flex gap-3 items-center">
                      {/* Player number badge */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-bg-raised border border-border flex items-center justify-center">
                        <span className="text-ink-secondary font-mono tabular-nums text-sm font-bold">{index + 1}</span>
                      </div>

                      {/* Input */}
                      <label htmlFor={`player-${index}`} className="sr-only">
                        Nom du joueur {index + 1}
                      </label>
                      <input
                        id={`player-${index}`}
                        type="text"
                        value={entry.name}
                        onChange={(e) => updateName(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && canEnter) {
                            handleEnter()
                          }
                        }}
                        placeholder={`Joueur ${index + 1}`}
                        maxLength={20}
                        className={cn(
                          // min-w-0 : un input possede une largeur intrinseque (~20
                          // caracteres) qui empeche flex-1 de retrecir et fait
                          // deborder la ligne sur mobile.
                          'flex-1 min-w-0 min-h-[44px] px-4 rounded-control',
                          'bg-bg-raised border border-border text-ink font-sans',
                          'placeholder:text-ink-muted',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:border-neon',
                          'transition-colors'
                        )}
                      />

                      {/* Genre + statut - optionnel, replié par défaut */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        aria-label={`Genre et statut de Joueur ${index + 1}, facultatif`}
                        aria-expanded={isExpanded}
                        className={cn(
                          'flex-shrink-0 w-9 h-9 rounded-full border transition-colors flex items-center justify-center focus-ring-neon',
                          isExpanded || hasAttributes
                            ? 'bg-neon/10 border-neon/50 text-orange-ink'
                            : 'bg-transparent border-border text-ink-muted hover:text-orange-ink hover:border-neon/50'
                        )}
                      >
                        <Icon name="curseurs" className="w-4 h-4" aria-hidden="true" />
                      </motion.button>

                      {/* Remove button */}
                      {entries.length > 2 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeName(index)}
                          aria-label={`Retirer le joueur ${index + 1}`}
                          className="flex-shrink-0 w-9 h-9 rounded-full bg-transparent border border-border text-ink-muted hover:text-orange-ink hover:border-neon/50 transition-colors flex items-center justify-center focus-ring-neon"
                        >
                          <Icon name="fermer" className="w-4 h-4" aria-hidden="true" />
                        </motion.button>
                      )}
                    </div>

                    {/* Panneau genre / statut relationnel - facultatif et local */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-12"
                        >
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            <div
                              role="group"
                              aria-label={`Genre de Joueur ${index + 1}`}
                              className="flex flex-wrap gap-1.5"
                            >
                              {GENDER_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    updateGender(index, entry.gender === opt.value ? undefined : opt.value)
                                  }
                                  aria-pressed={entry.gender === opt.value}
                                  aria-label={`Genre ${opt.label}, Joueur ${index + 1}`}
                                  className={cn(
                                    'min-h-[44px] px-3 rounded-pill border font-sans text-xs font-semibold transition-colors focus-ring-neon',
                                    entry.gender === opt.value
                                      ? 'bg-neon/15 border-neon text-orange-ink'
                                      : 'bg-bg-raised border-border text-ink-muted hover:border-neon/40'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                            <div
                              role="group"
                              aria-label={`Statut relationnel de Joueur ${index + 1}`}
                              className="flex flex-wrap gap-1.5"
                            >
                              {RELATIONSHIP_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    updateRelationship(
                                      index,
                                      entry.relationship === opt.value ? undefined : opt.value
                                    )
                                  }
                                  aria-pressed={entry.relationship === opt.value}
                                  aria-label={`Statut ${opt.label}, Joueur ${index + 1}`}
                                  className={cn(
                                    'min-h-[44px] px-3 rounded-pill border font-sans text-xs font-semibold transition-colors focus-ring-neon',
                                    entry.relationship === opt.value
                                      ? 'bg-neon/15 border-neon text-orange-ink'
                                      : 'bg-bg-raised border-border text-ink-muted hover:border-neon/40'
                                  )}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <p className="text-ink-muted text-xs font-sans mb-4">
            Genre et statut sont facultatifs, juste pour des jeux plus personnalisés. Rien ne
            quitte ton téléphone.
          </p>

          {/* Add player button */}
          {entries.length < 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="ghost"
                onClick={addName}
                className="w-full mb-6 border border-dashed border-border-strong hover:border-neon/50"
              >
                <Icon name="ajouter-joueur" className="w-4 h-4 mr-2" aria-hidden="true" />
                Une chaise de plus
              </Button>
            </motion.div>
          )}

          <div className="h-px bg-border-strong mb-6" />

          {/* Enter button */}
          <Button
            variant="primary"
            size="xl"
            onClick={handleEnter}
            disabled={!canEnter}
            className="w-full"
          >
            Pousser la porte
            <Icon name="suivant" className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>

          <p className="text-ink-muted text-sm text-center mt-4 font-sans" aria-live="polite">
            {canEnter
              ? 'Minimum 2 joueurs, maximum 8'
              : 'Ajoute au moins 2 joueurs pour continuer'}
          </p>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div variants={floatVariants} className="mt-8 text-center relative z-10">
        <p className="text-ink-muted text-xs font-sans">
          Ces noms seront utilisés pour tous les jeux
        </p>
      </motion.div>
    </motion.div>
  )
}
