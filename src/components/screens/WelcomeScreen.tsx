import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { cn } from '@/utils'

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
  const { navigateTo } = useAppStore()
  const { players, setPlayers } = useGameStore()

  const [names, setNames] = useState<string[]>(() =>
    players.length > 0 ? players.map((p) => p.name) : ['', '']
  )

  const addName = () => {
    if (names.length < 8) {
      setNames([...names, ''])
    }
  }

  const removeName = (index: number) => {
    if (names.length > 2) {
      setNames(names.filter((_, i) => i !== index))
    }
  }

  const updateName = (index: number, value: string) => {
    const updated = [...names]
    updated[index] = value
    setNames(updated)
  }

  const validNames = names.filter((n) => n.trim().length > 0)
  const canEnter = validNames.length >= 2

  const handleEnter = () => {
    if (canEnter) {
      setPlayers(names)
      navigateTo('hub')
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe pb-safe relative overflow-hidden bg-bg"
    >
      {/* Ambient neon glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-neon/[0.06] rounded-full blur-[120px]" />
      </div>

      {/* Header - titre geant, slogan de l'arène */}
      <motion.div variants={titleVariants} className="text-center mb-10 relative z-10">
        <h1 className="font-display text-6xl sm:text-7xl uppercase tracking-tight leading-none text-ink">
          Black<span className="text-neon text-glow-neon">Out</span>
        </h1>
        <p className="text-ink-secondary font-mono text-sm mt-4 tabular-nums">
          52 cartes - 4 règles - 0 pitié.
        </p>
      </motion.div>

      {/* Inscription card - liste d'inscription a l'arène */}
      <motion.div
        variants={floatVariants}
        className="w-full max-w-md relative z-10 bg-surface border border-border-strong rounded-card p-6 sm:p-8"
      >
        <div className="relative z-10">
          {/* Player count badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4, damping: 15 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-neon/10 border border-neon/30 mb-6"
          >
            <Users className="w-4 h-4 text-neon" aria-hidden="true" />
            <span className="text-sm font-mono tabular-nums font-semibold text-neon">
              {validNames.length} joueur{validNames.length !== 1 ? 's' : ''}
            </span>
          </motion.div>

          <h2 className="font-display text-lg uppercase tracking-tight text-ink-secondary mb-4">
            Liste des joueurs
          </h2>

          {/* Player inputs */}
          <div className="space-y-3 mb-6">
            <AnimatePresence mode="popLayout">
              {names.map((name, index) => (
                <motion.div
                  key={index}
                  variants={playerInputVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="flex gap-3 items-center"
                >
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
                    value={name}
                    onChange={(e) => updateName(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canEnter) {
                        handleEnter()
                      }
                    }}
                    placeholder={`Joueur ${index + 1}`}
                    maxLength={20}
                    className={cn(
                      'flex-1 min-h-[44px] px-4 rounded-control',
                      'bg-bg-raised border border-border text-ink font-sans',
                      'placeholder:text-ink-muted',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-neon focus-visible:border-neon',
                      'transition-colors'
                    )}
                  />

                  {/* Remove button */}
                  {names.length > 2 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeName(index)}
                      aria-label={`Retirer le joueur ${index + 1}`}
                      className="flex-shrink-0 w-9 h-9 rounded-full bg-transparent border border-border text-ink-muted hover:text-neon hover:border-neon/50 transition-colors flex items-center justify-center focus-ring-neon"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add player button */}
          {names.length < 8 && (
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
                <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                Ajouter un joueur
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
            Entrer dans l&apos;arène
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>

          <p className="text-ink-muted text-sm text-center mt-4 font-sans">
            Minimum 2 joueurs, maximum 8
          </p>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div variants={floatVariants} className="mt-8 text-center relative z-10">
        <p className="text-ink-muted/70 text-xs font-sans">
          Ces noms seront utilisés pour tous les jeux
        </p>
      </motion.div>
    </motion.div>
  )
}
