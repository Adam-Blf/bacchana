import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Offering, Package } from '@revenuecat/purchases-js'
import { Button, Icon } from '@/components/ui'
import { PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import {
  BILLING_ENABLED,
  PRIX_A_VIE_CENTIMES,
  PRIX_PACK_CENTIMES,
  fetchCurrentOffering,
  purchasePackage,
} from '@/lib/billing'
import { track } from '@/lib/analytics'
import { useEntitlementStore, usePurchaseConsentStore } from '@/stores'
import { CGU_VERSION } from '@/components/legal/CguScreen'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'

interface PremiumPaywallModalProps {
  open: boolean
  onClose: () => void
}

// Les prix ne sont plus definis ici. Ils vivent dans `lib/billing.ts`, avec le
// credit et l'invariant de convergence, parce qu'ils engagent Stripe et
// RevenueCat autant que cet ecran : un prix qui vit dans un composant finit par
// diverger du catalogue distant sans que rien ne le signale.
const PRIX_PACK_UNITE = PRIX_PACK_CENTIMES
const PRIX_A_VIE = PRIX_A_VIE_CENTIMES

/** 1,49 EUR, pas 1.49 : le francais separe les decimales par une virgule. */
function formatPrix(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace('.', ',')} EUR`
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
  // Double consentement art. 14 CGU/CGV (exécution immédiate + renonciation à la
  // rétractation) : deux cases distinctes, jamais pré-cochées, requises toutes les deux
  // avant d'activer le paiement. Voir docs/... et CguScreen.tsx article 14.
  const [consentImmediateExecution, setConsentImmediateExecution] = useState(false)
  const [consentWithdrawalWaiver, setConsentWithdrawalWaiver] = useState(false)
  // Tracks the previous `open` value so the fetch/track side effects below only fire on the
  // closed -> open transition, via a render-time comparison rather than an effect dependency.
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setLoading(true)
      setPurchaseError(null)
      setPurchaseSuccess(false)
      // Le consentement ne se reporte jamais d'une ouverture à l'autre : chaque tentative
      // de paiement doit repartir de deux cases non cochées.
      setConsentImmediateExecution(false)
      setConsentWithdrawalWaiver(false)
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

  // Modèle tarifaire Bacchana : achat unique à vie, ou packs à l'unité.
  // Aucun abonnement, aucun essai gratuit.
  //
  // Ces deux montants sont en centimes et vivent ICI, en source unique de
  // l'affichage. Ils doublent volontairement le catalogue Stripe : tant que
  // l'offering RevenueCat n'est pas peuplé, le prix réel n'arrive pas du
  // réseau, et un paywall qui n'affiche aucun prix ne vend rien. Dès que
  // l'offering répond, le prix affiché sur le bouton vient de lui - ces
  // constantes ne servent alors plus qu'à la comparaison ci-dessous.
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
  // Somme des packs a l'unite, calculee depuis le catalogue reel : elle suit
  // automatiquement l'ajout d'un pack premium, la ou un nombre ecrit a la main
  // deviendrait faux au prochain contenu livre.
  const prixTotalPacks = PREMIUM_CATALOG.length * PRIX_PACK_UNITE

  const shownPackages = packages.filter((p) => p.pkg !== null)
  const selected = shownPackages.find((p) => p.id === selectedPlan) ?? shownPackages[0] ?? null

  const billingReady = BILLING_ENABLED && Boolean(selected?.pkg)
  const consentGiven = consentImmediateExecution && consentWithdrawalWaiver
  const purchaseReady = billingReady && consentGiven

  const handlePurchase = async () => {
    if (!selected?.pkg || purchasing || !purchaseReady) return
    // Preuve de double consentement (art. 14 CGU/CGV), horodatée et rattachée à la version
    // des conditions en vigueur - enregistrée avant l'appel réseau, jamais après.
    usePurchaseConsentStore.getState().recordConsent(CGU_VERSION)
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
          className="fixed inset-0 z-modal bg-scrim/80 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Bacchana Premium"
          onClick={onClose}
        >
          {/* Halo de profondeur pourpre : seul endroit de l'app où le pourpre du
              logo infuse l'ambiance derrière une carte - "arrière-salle premium".
              Bord franc et non flou : la forme est une
              intention géométrique, pas une brume. Décoratif, aucune paire de
              contraste concernée (il passe derrière une carte opaque, jamais
              sous du texte). */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div className="w-[380px] h-[380px] bg-depth/[0.14] rounded-full" />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-card bg-surface-elevated border-2 border-premium/60 p-6 shadow-premium-glow relative"
          >
            <div className="flex items-start justify-between mb-4">
              {/* Sceau "verrouillé" en pourpre de marque : rôle distinct du gold
                  (--color-premium), qui reste réservé à la valeur (prix, catalogue,
                  badge "Seule offre" plus bas). Le pourpre porte le "verrouillé",
                  le gold porte le "ça vaut le coup". Ratio vérifié dans
                  scripts/check_contrast.mjs (paire depth/surface-elevated). */}
              <div className="w-12 h-12 rounded-full bg-depth/10 border-2 border-depth flex items-center justify-center">
                <Icon name="cadenas" className="w-5 h-5 text-depth" aria-hidden="true" />
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-9 h-9 rounded-pill flex items-center justify-center text-ink-muted hover:text-ink focus-ring-neon"
              >
                <Icon name="fermer" className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Titre en encre pleine : le text-glow-premium (ombre portee) brouillait la
                nettete du texte, surtout en sombre. Contraste re-verifie pour Bacchana
                dans docs/DESIGN_TOKENS.md (neon vs surface-elevated) - mais seulement
                en theme sombre (4.56:1). En clair, text-neon sur bg-surface-elevated ne
                fait que 2.90:1 (echec meme du seuil AA-large 3:1, audit visuel
                2026-08-05) : text-neon-deep restaure 3.49:1 en clair et reste a 3.45:1
                en sombre, marge suffisante dans les deux themes. */}
            <h3 className="font-display text-3xl uppercase tracking-tight text-neon-deep">
              Bacchana Premium
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
                  <Icon name="etincelles" className="w-3.5 h-3.5 text-premium flex-shrink-0" aria-hidden="true" />
                  <span className="text-ink">{entry.title}</span>
                  <span className="text-ink-secondary font-hud text-xs tabular-nums ml-auto">
                    {entry.itemCount} cartes
                  </span>
                  <span className="text-ink-secondary font-hud text-xs tabular-nums w-14 text-right">
                    {formatPrix(PRIX_PACK_UNITE)}
                  </span>
                </li>
              ))}
            </ul>

            {/* L'arithmetique, ecrite noir sur blanc.
                PAS de prix barré ici, et c'est délibéré : la somme des packs
                (7,45) est INFERIEURE a l'achat a vie (9,99). Presenter 9,99
                comme une remise sur 7,45 serait faux, donc trompeur au sens de
                l'article L121-1 du code de la consommation.
                Ce que l'achat a vie apporte n'est pas une reduction, c'est le
                contenu a venir, plus le fait que rien de deja paye n'est perdu.
                C'est ce qu'on dit, parce que c'est ce qui est vrai. */}
            <p className="mt-4 flex items-baseline justify-center gap-2 font-hud text-caption tabular-nums">
              <span className="text-ink-secondary">{formatPrix(prixTotalPacks)}</span>
              <span className="text-ink-secondary">les {PREMIUM_CATALOG.length} packs actuels, ou</span>
              <span className="font-bold text-premium">{formatPrix(PRIX_A_VIE)}</span>
              <span className="text-ink-secondary">pour tout</span>
            </p>
            <p className="mt-1 text-center font-sans text-caption text-ink-secondary">
              Chaque pack acheté se déduit de l&apos;accès à vie, et tout ce qui
              sortira ensuite y est compris. Commencer par un pack ne coûte
              jamais plus cher.
            </p>

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
                            <span className="ml-2 text-label font-hud uppercase tracking-widest text-premium">
                              {p.badge}
                            </span>
                          )}
                        </span>
                        <span className="font-hud tabular-nums text-lg text-ink">{packPrice ?? '...'}</span>
                      </span>
                      <span className="block text-xs text-ink-secondary font-sans mt-0.5">{p.note}</span>
                    </button>
                  )
                })}
                <p className="text-ink-secondary text-xs font-sans text-center pt-1">
                  Accès premium à vie : paiement unique, 9,99 EUR, aucun renouvellement.
                </p>

                {/* Double consentement art. 14 CGU/CGV : exécution immédiate + renonciation
                    à la rétractation de 14 jours. Non pré-cochées, requises toutes les deux
                    pour activer le paiement - la preuve est enregistrée dans
                    usePurchaseConsentStore au moment du clic (handlePurchase). */}
                <div className="mt-3 space-y-2" role="group" aria-label="Consentement avant paiement">
                  <label className="flex items-start gap-3 rounded-control bg-bg-raised border border-border-strong/30 px-3 py-2.5 min-h-touch cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentImmediateExecution}
                      onChange={(e) => setConsentImmediateExecution(e.target.checked)}
                      className="mt-0.5 w-5 h-5 flex-shrink-0 accent-neon-deep focus-ring-neon"
                      aria-describedby="consent-immediate-execution-label"
                    />
                    <span id="consent-immediate-execution-label" className="text-xs text-ink-secondary font-sans leading-snug">
                      Je demande l&apos;exécution immédiate du contenu numérique dès la
                      confirmation du paiement, avant la fin du délai de rétractation de 14 jours.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-control bg-bg-raised border border-border-strong/30 px-3 py-2.5 min-h-touch cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentWithdrawalWaiver}
                      onChange={(e) => setConsentWithdrawalWaiver(e.target.checked)}
                      className="mt-0.5 w-5 h-5 flex-shrink-0 accent-neon-deep focus-ring-neon"
                      aria-describedby="consent-withdrawal-waiver-label"
                    />
                    <span id="consent-withdrawal-waiver-label" className="text-xs text-ink-secondary font-sans leading-snug">
                      Je reconnais qu&apos;en acceptant cette exécution immédiate, je perds mon
                      droit de rétractation de 14 jours.
                    </span>
                  </label>
                </div>

                {billingReady && !consentGiven && (
                  <p className="mt-2 text-center font-sans text-xs text-ink-muted" role="status">
                    Coche les deux cases ci-dessus pour activer le paiement.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-control bg-bg-raised border border-border px-4 py-3 text-center">
                <p className="font-hud tabular-nums text-2xl text-ink">
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
                      <Icon name="chargement" className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Achat en cours…
                    </>
                  ) : billingReady ? (
                    'Débloquer Bacchana Premium'
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
