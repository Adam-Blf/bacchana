import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppStore } from '@/stores'
import { SUIT_RULES, SUIT_SYMBOLS, type Suit } from '@/types'
import { cn } from '@/utils'

interface RuleCardProps {
  suit: Suit
  index: number
}

// Coeur + carreau en rouge neon, pique + trefle en encre neutre (coherent avec la carte)
const suitColors: Record<Suit, string> = {
  hearts: 'text-neon',
  diamonds: 'text-neon',
  clubs: 'text-ink',
  spades: 'text-ink',
}

function RuleCard({ suit, index }: RuleCardProps) {
  const rule = SUIT_RULES[suit]
  const symbol = SUIT_SYMBOLS[suit]
  const color = suitColors[suit]

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1, type: 'spring', damping: 20 }}
      className="rounded-card p-5 bg-surface border border-border-strong relative overflow-hidden"
    >
      {/* Decorative background symbol */}
      <div className={cn('absolute -right-4 -bottom-4 text-8xl opacity-[0.06] pointer-events-none select-none', color)}>
        {symbol}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with symbol and title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-control flex items-center justify-center bg-bg-raised border border-border">
            <span className={cn('text-2xl', color)}>{symbol}</span>
          </div>
          <h3 className="font-display text-xl uppercase tracking-tight text-ink">
            {rule.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-ink-secondary font-sans leading-relaxed">
          {rule.description}
        </p>
      </div>
    </motion.div>
  )
}

export function RulesScreen() {
  const { goToHub } = useAppStore()
  const suits: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen bg-bg"
    >
      {/* Header with back button */}
      <header className="sticky top-0 pt-safe z-30 bg-bg/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={goToHub} className="mr-3" aria-label="Retour au hub">
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">
            Règles du Borderland
          </h1>
        </div>
      </header>

      {/* Rules content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-safe">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <p className="text-ink-secondary font-sans">
            Chaque carte arrive face cachée : fais deviner sa valeur avant de la retourner.
            Chaque couleur a ensuite sa propre règle.
            <br />
            <span className="text-neon font-medium">Les As valent une PÉNALITÉ MAJEURE.</span>
          </p>
        </motion.div>

        {/* Rule cards */}
        {suits.map((suit, index) => (
          <RuleCard key={suit} suit={suit} index={index} />
        ))}

        {/* Contest rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-card p-5 mt-6 bg-surface-elevated border border-neon/30 relative overflow-hidden"
        >
          <h3 className="font-display text-lg uppercase tracking-tight text-neon mb-2">
            Le Contest
          </h3>
          <p className="text-ink-secondary text-sm leading-relaxed font-sans">
            Tu peux contester une carte pour doubler la mise. Le joueur suivant
            peut accepter ou escalader (x2, puis x4). Celui qui accepte prend
            tout. Courage ou folie ?
          </p>
        </motion.div>
      </main>
    </motion.div>
  )
}
