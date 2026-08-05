import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, X, Sparkles, LoaderCircle } from 'lucide-react'
import type { Offering, Package } from '@revenuecat/purchases-js'
import { Button } from '@/components/ui'
import { PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { BILLING_ENABLED, fetchCurrentOffering, purchasePackage } from '@/lib/billing'
import { track } from '@/lib/analytics'
import { useEntitlementStore } from '@/stores'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'

interface PremiumPaywallModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Premium paywall - lists the locked premium packs and, if RevenueCat offerings are
 * reachable, their real price. Real purchases stay behind VITE_BILLING_ENABLED until
 * Stripe is connected in the RevenueCat dashboard - button shows "Bientôt disponible"
 * (disabled) otherwise, never a broken checkout.
 */
export function PremiumPaywallModal({ open, onClose }: PremiumPaywallModalProps) {
  const [offering, setOffering] = useState<Offering | null>(null)
  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  // Tracks the previous `open` value so the fetch/track side effects below only fire on the
  // closed -> open transition, via a render-time comparison rather than an effect dependency.
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setLoading(true)
      setPurchaseError(null)
      setPurchaseSuccess(false)
    }
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

  // Modèle tarifaire Meskova : accès premium à vie uniquement
  // Paiement unique, 14,99 EUR, aucun abonnement, aucun essai gratuit.
  const [selectedPlan, setSelectedPlan] = useState<'lifetime'>('lifetime')

  const packages: { id: 'lifetime'; label: string; note: string; pkg: Package | null; badge?: string }[] = [
    {
      id: 'lifetime',
      label: 'À vie',
      note: 'Paiement unique, accès perpétuel',
      pkg: offering?.lifetime ?? null,
      badge: 'Seule offre',
    },
  ]
  const shownPackages = packages.filter((p) => p.pkg !== null)
  const selected = shownPackages.find((p) => p.id === selectedPlan) ?? shownPackages[0] ?? null

  const purchaseReady = BILLING_ENABLED && Boolean(selected?.pkg)

  const handlePurchase = async () => {
    if (!selected?.pkg || purchasing) return
    // Identifiant produit RevenueCat/Stripe reel (ex. "premium_lifetime"), pas l'id de
    // package interne ("lifetime") : c'est celui qui recoupe le chiffre d'affaires (PRICING.md).
    const productId = selected.pkg.webBillingProduct?.identifier ?? selected.pkg.identifier
    track({ name: 'subscribe_started', props: { product_id: productId } })
    setPurchasing(true)
    setPurchaseError(null)
    try {
      const info = await purchasePackage(selected.pkg)
      if (info) {
        useEntitlementStore.getState().setFromCustomerInfo(info)
        setPurchaseSuccess(true)
        track({ name: 'subscribe_completed', props: { product_id: productId, platform: 'web' } })
      } else {
        setPurchaseError("L'achat n'a pas abouti. Réessaie dans un instant.")
        track({ name: 'subscribe_failed', props: { product_id: productId } })
      }
    } finally {
      setPurchasing(false)
    }
  }

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
          aria-label="Meskova Premium"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-card bg-surface-elevated border-2 border-premium/60 p-6 shadow-premium-glow"
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

            {/* Titre en encre pleine : le text-glow-premium (ombre portee) brouillait la
                nettete du texte, surtout en sombre. Contraste re-verifie pour Meskova
                dans docs/DESIGN_TOKENS.md (neon vs surface-elevated) - mais seulement
                en theme sombre (4.56:1). En clair, text-neon sur bg-surface-elevated ne
                fait que 2.90:1 (echec meme du seuil AA-large 3:1, audit visuel
                2026-08-05) : text-neon-deep restaure 3.49:1 en clair et reste a 3.45:1
                en sombre, marge suffisante dans les deux themes. */}
            <h3 className="font-display text-3xl uppercase tracking-tight text-neon-deep">
              Meskova Premium
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
                  <span className="text-ink-secondary font-mono text-xs tabular-nums ml-auto">
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
                        // bg-premium/15 teintait le fond VERS le texte lui-même
                        // (badge et note utilisent aussi text-premium/text-ink-secondary) :
                        // plus l'aplat se rapproche de la couleur du texte, plus le
                        // contraste s'effondre - mesuré 4.03:1 (badge) et 3.46:1 (note)
                        // en thème sombre, 4.30:1 (badge) en clair, tous sous l'AA
                        // (audit visuel 2026-08-05). border-2 border-premium + l'ombre
                        // dure suffisent déjà à distinguer la carte sélectionnée ; sans
                        // teinte de fond, badge et note retombent sur les paires
                        // premium/bg-raised et ink-secondary/bg-raised déjà vérifiées
                        // (5.25-8.82:1 selon le thème).
                        active
                          ? 'w-full min-h-[56px] rounded-control border-2 border-premium bg-bg-raised px-4 py-2.5 text-left shadow-brutal-sm focus-ring-neon'
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
                <p className="text-ink-secondary text-xs font-sans text-center pt-1">
                  Accès premium à vie : paiement unique, 14,99 EUR, aucun renouvellement.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-control bg-bg-raised border border-border px-4 py-3 text-center">
                <p className="font-mono tabular-nums text-2xl text-ink">
                  {loading ? '...' : 'Bientôt disponible'}
                </p>
              </div>
            )}

            {purchaseSuccess ? (
              <p
                className="mt-4 text-center font-sans text-sm text-success"
                role="status"
                aria-live="polite"
              >
                Premium débloqué, bonne soirée !
              </p>
            ) : (
              purchaseError && (
                <p className="mt-4 text-center font-sans text-sm text-danger" role="alert">
                  {purchaseError}
                </p>
              )
            )}

            {purchaseSuccess ? (
              <Button variant="primary" className="w-full mt-2" onClick={onClose}>
                Fermer
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="w-full mt-4"
                  disabled={!purchaseReady || purchasing}
                  onClick={() => void handlePurchase()}
                >
                  {purchasing ? (
                    <>
                      <LoaderCircle className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Achat en cours…
                    </>
                  ) : purchaseReady ? (
                    'Débloquer Meskova Premium'
                  ) : (
                    'Bientôt disponible'
                  )}
                </Button>
                <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
                  Plus tard
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
