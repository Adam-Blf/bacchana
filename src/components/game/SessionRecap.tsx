import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Home, RotateCcw } from 'lucide-react'
import type { Player } from '@/types'
import type { GameMode } from '@/core/engine/types'
import { track } from '@/lib/analytics'
import { haptic } from '@/utils/haptic'
import { cn } from '@/utils'

interface SessionRecapProps {
  players: Player[]
  onReplay: () => void
  onQuit: () => void
  /**
   * Generic penalty counts keyed by player id, used by the prompt-based modes (picolo,
   * truth or dare, etc). When provided, overrides the Coupe-Gorge-specific
   * drinksGorgees/drinksShots ranking so every mode can reuse this same recap screen.
   */
  penaltyCounts?: Record<string, number>
  /** Mode id for the session_completed analytics event. Defaults to 'borderland'. */
  mode?: GameMode
  /** Number of turns played this session, for the session_completed analytics event. */
  turns?: number
}

/** Ligne pointillée de ticket, réutilisée entre chaque section. */
function ReceiptRule() {
  return <div className="border-t-1 border-dashed border-[#b9b0a2] my-3" aria-hidden="true" />
}

/**
 * L'addition - le récap de fin de partie est imprimé comme un ticket de
 * caisse : papier blanc cassé fixe (objet physique, identique dans les deux
 * thèmes), Space Mono, bords crantés, faux code-barres. Élément signature de
 * l'écran de fin.
 */
export function SessionRecap({
  players,
  onReplay,
  onQuit,
  penaltyCounts,
  mode = 'borderland',
  turns = 0,
}: SessionRecapProps) {
  // Fires once when the recap mounts (i.e. once per finished session), not on every render.
  useEffect(() => {
    track({ name: 'session_completed', props: { mode, turns } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ranked = [...players]
    .map((p) => ({
      ...p,
      total: penaltyCounts
        ? (penaltyCounts[p.id] ?? 0)
        : (p.drinksGorgees ?? 0) + (p.drinksShots ?? 0) * 5,
    }))
    .sort((a, b) => b.total - a.total)

  const champion = ranked[0]
  const totalGorgees = penaltyCounts
    ? players.reduce((s, p) => s + (penaltyCounts[p.id] ?? 0), 0)
    : players.reduce((s, p) => s + (p.drinksGorgees ?? 0), 0)
  const totalShots = players.reduce((s, p) => s + (p.drinksShots ?? 0), 0)
  const grandTotal = penaltyCounts ? totalGorgees : totalGorgees + totalShots * 5

  const now = new Date()
  const stamp = `${now.toLocaleDateString('fr-FR')}  ${now
    .getHours()
    .toString()
    .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const handleShare = async () => {
    haptic('light')
    // Le texte partagé reflète le même classement que l'écran, quel que soit le
    // mode (penaltyCounts pour les modes à prompts, pénalités/majeures au Coupe-Gorge).
    const lines = ranked.map((p, i) =>
      penaltyCounts
        ? `${i + 1}. ${p.name} - ${penaltyCounts[p.id] ?? 0} pénalité${(penaltyCounts[p.id] ?? 0) > 1 ? 's' : ''}`
        : `${i + 1}. ${p.name} - ${p.drinksGorgees ?? 0} pénalités + ${p.drinksShots ?? 0} majeures`
    )
    const text = `La Taverne - l'addition\n\n${lines.join('\n')}\n\nTotal : ${totalGorgees} pénalités${
      penaltyCounts ? '' : `, ${totalShots} majeures`
    } distribuées.\nlataverne.beloucif.com`
    try {
      if (navigator.share) {
        await navigator.share({ title: "La Taverne - L'addition", text })
      } else {
        await navigator.clipboard.writeText(text)
        alert('Addition copiée dans le presse-papiers')
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
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 pt-safe pb-safe bg-bg text-ink"
    >
      {/* Le ticket : papier fixe, légère rotation d'objet posé sur la table. */}
      <motion.div
        initial={{ opacity: 0, y: -240 }}
        animate={{ opacity: 1, y: 0, rotate: -1.2 }}
        transition={{ type: 'spring', damping: 18, stiffness: 120, delay: 0.15 }}
        className="w-full max-w-sm bg-[#FBF7EE] text-[#1c1a17] font-receipt shadow-brutal mb-8 relative"
        style={{
          // Bords crantés haut et bas, découpe de ticket.
          clipPath:
            'polygon(0 8px, 4% 0, 8% 8px, 12% 0, 16% 8px, 20% 0, 24% 8px, 28% 0, 32% 8px, 36% 0, 40% 8px, 44% 0, 48% 8px, 52% 0, 56% 8px, 60% 0, 64% 8px, 68% 0, 72% 8px, 76% 0, 80% 8px, 84% 0, 88% 8px, 92% 0, 96% 8px, 100% 0, 100% calc(100% - 8px), 96% 100%, 92% calc(100% - 8px), 88% 100%, 84% calc(100% - 8px), 80% 100%, 76% calc(100% - 8px), 72% 100%, 68% calc(100% - 8px), 64% 100%, 60% calc(100% - 8px), 56% 100%, 52% calc(100% - 8px), 48% 100%, 44% calc(100% - 8px), 40% 100%, 36% calc(100% - 8px), 32% 100%, 28% calc(100% - 8px), 24% 100%, 20% calc(100% - 8px), 16% 100%, 12% calc(100% - 8px), 8% 100%, 4% calc(100% - 8px), 0 100%)',
        }}
      >
        <div className="px-5 pt-7 pb-8 text-[13px] leading-relaxed">
          {/* En-tête maison */}
          <div className="text-center">
            <div className="font-bold text-lg tracking-wide uppercase">La Taverne</div>
            <div className="text-[11px] text-[#6e6759]">Au coin du comptoir - Chevilly-Larue</div>
            <div className="text-[11px] text-[#6e6759]">lataverne.beloucif.com</div>
          </div>

          <ReceiptRule />

          <div className="flex justify-between text-[11px] text-[#6e6759]">
            <span>{stamp}</span>
            <span className="uppercase">Table de {players.length}</span>
          </div>

          <ReceiptRule />

          {/* Lignes du ticket : un joueur = un article */}
          <div className="uppercase text-[11px] text-[#6e6759] flex justify-between">
            <span>Article</span>
            <span>Pénalités</span>
          </div>
          <div className="mt-1 space-y-1">
            {ranked.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + 0.08 * i }}
                className={cn('flex items-baseline gap-2', i === 0 && 'font-bold')}
              >
                <span className="whitespace-nowrap">
                  {i + 1}. {p.name}
                  {i === 0 && ' *'}
                </span>
                <span className="flex-1 overflow-hidden text-[#b9b0a2] select-none" aria-hidden="true">
                  {'.'.repeat(60)}
                </span>
                <span className="tabular-nums whitespace-nowrap">
                  {penaltyCounts ? (
                    (penaltyCounts[p.id] ?? 0)
                  ) : (
                    <>
                      {p.drinksGorgees ?? 0}
                      {(p.drinksShots ?? 0) > 0 && (
                        <span className="text-[#8E1F26]"> +{p.drinksShots} MAJ</span>
                      )}
                    </>
                  )}
                </span>
              </motion.div>
            ))}
          </div>

          <ReceiptRule />

          <div className="flex items-baseline justify-between font-bold text-base">
            <span className="uppercase">Total</span>
            <span className="tabular-nums">{grandTotal}</span>
          </div>
          {!penaltyCounts && (
            <div className="flex items-baseline justify-between text-[11px] text-[#6e6759]">
              <span>dont pénalités majeures</span>
              <span className="tabular-nums">{totalShots}</span>
            </div>
          )}

          <ReceiptRule />

          <div className="text-center text-[11px]">
            <div>
              * {champion?.name ?? '-'} est élu{' '}
              <span className="font-bold uppercase text-[#8E1F26]">champion de la tablée</span>
            </div>
            <div className="mt-1 text-[#6e6759]">La maison ne fait pas crédit.</div>
          </div>

          {/* Faux code-barres */}
          <div className="mt-4 flex items-end justify-center gap-[2px] h-9" aria-hidden="true">
            {ranked
              .flatMap((p) => [p.total % 4, (p.total + 2) % 3, 1, p.total % 2, 2])
              .concat([1, 3, 0, 2, 1, 3, 2, 0, 1, 2])
              .slice(0, 36)
              .map((w, i) => (
                <span
                  key={i}
                  className="inline-block bg-[#1c1a17]"
                  style={{ width: `${1 + w}px`, height: i % 5 === 4 ? '70%' : '100%' }}
                />
              ))}
          </div>
          <div className="text-center text-[10px] tracking-[0.3em] text-[#6e6759] mt-1">
            MERCI DE VOTRE VISITE
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-md">
        <button
          onClick={handleShare}
          className="flex-1 min-w-[140px] min-h-[44px] bg-neon text-tile-ink font-semibold px-5 py-3 rounded-pill hover:bg-neon-soft transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" /> Partager
        </button>
        <button
          onClick={() => { haptic('light'); onReplay() }}
          className="flex-1 min-w-[140px] min-h-[44px] bg-surface border border-border-strong text-ink font-semibold px-5 py-3 rounded-pill hover:border-neon/50 hover:text-neon transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Revanche
        </button>
        <button
          onClick={() => { haptic('medium'); onQuit() }}
          className="w-full min-h-[44px] bg-transparent border border-border-strong text-ink-secondary px-5 py-3 rounded-pill hover:bg-surface/60 transition-colors inline-flex items-center justify-center gap-2 focus-ring-neon"
        >
          <Home className="w-4 h-4" aria-hidden="true" /> Retour à l'accueil
        </button>
      </div>

      <p className="mt-8 text-xs font-mono text-ink-muted text-center">
        Jouez responsable : la taverne veille sur sa tablée.
      </p>
    </motion.div>
  )
}
