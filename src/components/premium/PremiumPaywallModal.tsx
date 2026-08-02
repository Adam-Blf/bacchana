import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, X, Sparkles } from 'lucide-react'
import type { Offering, Package } from '@revenuecat/purchases-js'
import { Button } from '@/components/ui'
import { PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { BILLING_ENABLED, fetchCurrentOffering } from '@/lib/billing'
import { track } from '@/lib/analytics'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'

interface PremiumPaywallModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Premium paywall - lists the locked premium packs and, if RevenueCat offerings are
 * reachable, their real price. Real purchases stay behind VITE_BILLING_ENABLED until
 * Stripe is connected in the RevenueCat dashboard - button shows "Bientot disponible"
 * (disabled) otherwise, never a broken checkout.
 */
export function PremiumPaywallModal({ open, onClose }: PremiumPaywallModalProps) {
  const [offering, setOffering] = useState<Offering | null>(null)
  const [loading, setLoading] = useState(false)
  // Tracks the previous `open` value so the fetch/track side effects below only fire on the
  // closed -> open transition, via a render-time comparison rather than an effect dependency.
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setLoading(true)
  }

  useBackClose(open, onClose, 'premium-paywall')
  useKeyboard({ Escape: onClose }, open)

  useEffect(() => {
    if (!open) return
    track({ name: 'premium_paywall_viewed' })
    fetchCurrentOffering()
      .then(setOffering)
      .finally(() => setLoading(false))
  }, [open])

  // Le lifetime est l'option par défaut : c'est notre différenciant face aux
  // concurrents 100 % abonnement (décision d'audit, docs/MARKET.md).
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('lifetime')

  const packages: { id: 'monthly' | 'annual' | 'lifetime'; label: string; note: string; pkg: Package | null; badge?: string }[] = [
    {
      id: 'lifetime',
      label: 'À vie',
      note: 'Paiement unique, à toi pour toujours',
      pkg: offering?.lifetime ?? null,
      badge: 'Meilleure offre',
    },
    {
      id: 'annual',
      label: 'Annuel',
      note: "7 jours d'essai gratuit inclus",
      pkg: offering?.annual ?? null,
    },
    {
      id: 'monthly',
      label: 'Mensuel',
      note: "7 jours d'essai gratuit inclus",
      pkg: offering?.monthly ?? offering?.availablePackages[0] ?? null,
    },
  ]
  const shownPackages = packages.filter((p) => p.pkg !== null)
  const selected = shownPackages.find((p) => p.id === selectedPlan) ?? shownPackages[0] ?? null

  const purchaseReady = BILLING_ENABLED && Boolean(selected)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-black/70 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-label="La Taverne Premium"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-card bg-surface-elevated border border-premium/40 p-6 shadow-premium-glow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-premium/10 border-2 border-premium flex items-center justify-center">
                <Lock className="w-5 h-5 text-premium" aria-hidden="true" />
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-9 h-9 rounded-pill flex items-center justify-center text-ink-muted hover:text-ink focus-ring-neon"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <h3 className="font-display text-3xl uppercase tracking-tight text-ink text-glow-premium">
              La Taverne Premium
            </h3>
            <p className="text-ink-secondary font-sans text-sm mt-2">
              Débloque tous les packs premium de la collection, directement dans l&apos;app.
            </p>

            <ul className="mt-5 space-y-2 max-h-40 overflow-y-auto pr-1">
              {PREMIUM_CATALOG.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 text-sm text-ink-secondary font-sans"
                >
                  <Sparkles className="w-3.5 h-3.5 text-premium flex-shrink-0" aria-hidden="true" />
                  <span className="text-ink">{entry.title}</span>
                  <span className="text-ink-muted font-mono text-xs tabular-nums ml-auto">
                    {entry.itemCount} cartes
                  </span>
                </li>
              ))}
            </ul>

            {shownPackages.length > 0 ? (
              <div className="mt-6 space-y-2" role="radiogroup" aria-label="Choix de la formule">
                {shownPackages.map((p) => {
                  const packPrice = p.pkg?.webBillingProduct?.price?.formattedPrice
                  const active = selected?.id === p.id
                  return (
                    <button
                      key={p.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedPlan(p.id)}
                      className={
                        active
                          ? 'w-full min-h-[56px] rounded-control border-2 border-premium bg-premium/10 px-4 py-2.5 text-left shadow-brutal-sm focus-ring-neon'
                          : 'w-full min-h-[56px] rounded-control border-2 border-border-strong/30 bg-bg-raised px-4 py-2.5 text-left focus-ring-neon'
                      }
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-ink text-sm">
                          {p.label}
                          {p.badge && (
                            <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-premium">
                              {p.badge}
                            </span>
                          )}
                        </span>
                        <span className="font-mono tabular-nums text-lg text-ink">{packPrice ?? '...'}</span>
                      </span>
                      <span className="block text-xs text-ink-secondary font-sans mt-0.5">{p.note}</span>
                    </button>
                  )
                })}
                <p className="text-ink-muted text-[11px] font-sans text-center pt-1">
                  Abonnements : renouvellement automatique, résiliable à tout moment, aucun débit si tu
                  résilies pendant l&apos;essai. À vie : paiement unique, sans abonnement.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-control bg-bg-raised border border-border px-4 py-3 text-center">
                <p className="font-mono tabular-nums text-2xl text-ink">
                  {loading ? '...' : 'Bientôt disponible'}
                </p>
              </div>
            )}

            <Button
              variant="primary"
              className="w-full mt-4"
              disabled={!purchaseReady}
              onClick={onClose}
            >
              {purchaseReady ? 'Débloquer La Taverne Premium' : 'Bientôt disponible'}
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
              Plus tard
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
