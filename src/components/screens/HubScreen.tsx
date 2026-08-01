import { motion } from 'framer-motion'
import { Play, Book, Users, Lock, Dices, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppStore, useGameStore } from '@/stores'
import { cn } from '@/utils'

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const tileVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 22, stiffness: 160 },
  },
}

interface ModeTileProps {
  title: string
  subtitle: string
  description: string
  glyph: string
  onPlay: () => void
  onRules: () => void
}

// Active mode tile - le seul jouable en v1, glyphe neon signature
function ModeTile({ title, subtitle, description, glyph, onPlay, onRules }: ModeTileProps) {
  return (
    <motion.div
      variants={tileVariants}
      whileHover={{ scale: 1.01, y: -4 }}
      className={cn(
        'relative overflow-hidden rounded-card',
        'bg-surface border border-border-strong',
        'p-6 sm:p-8'
      )}
    >
      {/* Neon accent glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-neon/10 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10">
        {/* Mode badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-neon/10 border border-neon/30 mb-5">
          <Dices className="w-4 h-4 text-neon" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-widest text-neon">
            Jeu de cartes
          </span>
        </div>

        {/* Title with glyph */}
        <div className="mb-6">
          <span className="text-5xl text-neon block mb-2" aria-hidden="true">{glyph}</span>
          <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-ink">
            {title}
          </h2>
          <p className="text-ink-secondary font-mono text-sm mt-3 tabular-nums">
            {subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-ink-secondary font-sans text-center mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="xl" onClick={onPlay} className="w-full">
            <Play className="w-6 h-6 mr-3 fill-current" aria-hidden="true" />
            <span className="text-xl uppercase tracking-wide">Jouer</span>
          </Button>

          <Button variant="secondary" size="lg" onClick={onRules} className="w-full">
            <Book className="w-5 h-5 mr-2" aria-hidden="true" />
            Règles du jeu
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

interface ComingSoonTileProps {
  title: string
}

// Disabled mode tile - grise, pas de neon, glyphe cadenas
function ComingSoonTile({ title }: ComingSoonTileProps) {
  return (
    <motion.div
      variants={tileVariants}
      className="relative overflow-hidden rounded-card bg-bg-raised border border-border p-6 opacity-60"
      aria-disabled="true"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl uppercase tracking-tight text-ink-secondary">
            {title}
          </h3>
          <p className="text-ink-muted font-mono text-xs mt-1 uppercase tracking-wider">
            Bientôt
          </p>
        </div>
        <Lock className="w-5 h-5 text-ink-muted" aria-hidden="true" />
      </div>
    </motion.div>
  )
}

interface HubScreenProps {
  onPlayGame?: () => void
}

export function HubScreen({ onPlayGame }: HubScreenProps) {
  const { navigateTo } = useAppStore()
  const { players } = useGameStore()

  const handlePlay = () => {
    if (onPlayGame) {
      onPlayGame()
    } else {
      navigateTo('game')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen flex flex-col relative overflow-hidden bg-bg"
    >
      {/* Ambient neon glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon/[0.05] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="pt-safe pt-12 sm:pt-16 pb-6 text-center px-6 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-5xl sm:text-6xl uppercase tracking-tight text-ink"
        >
          Black<span className="text-neon text-glow-neon">Out</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-ink-secondary font-sans text-sm mt-2"
        >
          Collection de jeux de soirée
        </motion.p>

        {/* Edit players button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-5"
        >
          <Button
            variant="ghost"
            onClick={() => navigateTo('welcome')}
            className="text-sm border border-border hover:border-neon/40"
          >
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            <span className="font-mono tabular-nums">
              {players.length} joueur{players.length !== 1 ? 's' : ''}
            </span>
            <span className="mx-2 text-ink-muted">-</span>
            <span className="text-neon">Modifier</span>
          </Button>
        </motion.div>
      </header>

      {/* Bento grid of modes */}
      <motion.main
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 sm:px-6 pb-8 max-w-lg mx-auto w-full relative z-10 space-y-4"
      >
        <ModeTile
          title="Le Borderland"
          subtitle="52 cartes - 4 règles - 0 pitié."
          description="Tire une carte, découvre son pouvoir. Distribue des pénalités, ou prends-les. Conteste si tu oses. Survis si tu peux."
          glyph="♠"
          onPlay={handlePlay}
          onRules={() => navigateTo('rules')}
        />

        <div className="grid grid-cols-2 gap-4">
          <ComingSoonTile title="Je n'ai jamais" />
          <ComingSoonTile title="Action ou Vérité" />
        </div>

        {/* Coming soon teaser */}
        <motion.div variants={tileVariants} className="text-center pt-2">
          <p className="text-ink-muted text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Plus de jeux bientôt
          </p>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <footer className="py-6 pb-safe text-center relative z-10">
        <p className="text-ink-muted/60 text-xs font-sans">
          Jouez responsable.
        </p>
      </footer>
    </motion.div>
  )
}
