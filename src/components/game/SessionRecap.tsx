import { motion } from 'framer-motion'
import { Share2, Home, RotateCcw, Trophy, Wine } from 'lucide-react'
import type { Player } from '@/types'
import { haptic } from '@/utils/haptic'

interface SessionRecapProps {
  players: Player[]
  onReplay: () => void
  onQuit: () => void
}

export function SessionRecap({ players, onReplay, onQuit }: SessionRecapProps) {
  const ranked = [...players]
    .map((p) => ({
      ...p,
      total: (p.drinksGorgees ?? 0) + (p.drinksShots ?? 0) * 5,
    }))
    .sort((a, b) => b.total - a.total)

  const champion = ranked[0]
  const totalGorgees = players.reduce((s, p) => s + (p.drinksGorgees ?? 0), 0)
  const totalShots = players.reduce((s, p) => s + (p.drinksShots ?? 0), 0)

  const handleShare = async () => {
    haptic('light')
    const text = `🎴 BlackOut - session finie\n\n${ranked
      .map((p, i) => `${i + 1}. ${p.name} - ${p.drinksGorgees ?? 0} 🍺 + ${p.drinksShots ?? 0} 🥃`)
      .join('\n')}\n\nTotal : ${totalGorgees} gorgées, ${totalShots} shots distribués.\nblackout.beloucif.com`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BlackOut - Session Recap', text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Recap copié dans le presse-papier')
      }
    } catch {
      // Share cancelled by the user - nothing to do.
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-black via-[#0a0a0b] to-black text-white"
    >
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl mb-4"
        >
          <Trophy className="w-10 h-10 text-black" />
        </motion.div>
        <div className="font-mono text-xs tracking-widest text-yellow-400/80 uppercase">Fin de partie</div>
        <h1 className="text-5xl md:text-6xl font-bold mt-2 bg-gradient-to-r from-yellow-400 to-yellow-100 bg-clip-text text-transparent">
          {champion?.name ?? '—'}
        </h1>
        <p className="text-sm text-white/50 mt-1">est le <strong>champion</strong> des gorgées</p>
      </div>

      <div className="w-full max-w-md space-y-2 mb-8">
        {ranked.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className={
              'flex items-center justify-between rounded-2xl px-4 py-3 ' +
              (i === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5 border border-white/10')
            }
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/40 w-5">#{i + 1}</span>
              <span className="font-semibold">{p.name}</span>
            </div>
            <div className="text-xs text-white/60 font-mono">
              <span className="text-yellow-400">{p.drinksGorgees ?? 0}</span>🍺
              {' · '}
              <span className="text-red-400">{p.drinksShots ?? 0}</span>🥃
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Wine className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
          <div className="font-bold text-xl">{totalGorgees}</div>
          <div className="text-[10px] font-mono text-white/50 uppercase">gorgées</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="w-4 h-4 mx-auto text-red-400 mb-1">🥃</div>
          <div className="font-bold text-xl">{totalShots}</div>
          <div className="text-[10px] font-mono text-white/50 uppercase">shots</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button onClick={handleShare} className="flex-1 min-w-[140px] bg-yellow-500 text-black font-semibold px-5 py-3 rounded-full hover:bg-yellow-400 transition inline-flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" /> Partager
        </button>
        <button onClick={() => { haptic('light'); onReplay() }} className="flex-1 min-w-[140px] bg-white/10 text-white font-semibold px-5 py-3 rounded-full hover:bg-white/20 transition inline-flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> Revanche
        </button>
        <button onClick={() => { haptic('medium'); onQuit() }} className="w-full bg-transparent border border-white/20 text-white/80 px-5 py-3 rounded-full hover:bg-white/5 transition inline-flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Retour hub
        </button>
      </div>

      <p className="mt-8 text-xs font-mono text-white/30 text-center">
        Bois avec modération · L'abus d'alcool est dangereux pour la santé
      </p>
    </motion.div>
  )
}
