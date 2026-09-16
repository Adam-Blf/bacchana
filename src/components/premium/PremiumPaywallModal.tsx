import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Offering, Package } from '@revenuecat/purchases-js'
import { Button, Icon } from '@/components/ui'
import { PREMIUM_CATALOG } from '@/core/engine/modeRegistry'
import { BILLING_ENABLED, fetchCurrentOffering, purchasePackage } from '@/lib/billing'
import { track } from '@/lib/analytics'
import { useEntitlementStore, usePurchaseConsentStore } from '@/stores'
import { CGU_VERSION } from '@/components/legal/CguScreen'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useRestaurationAchats } from '@/hooks/useRestaurationAchats'

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
  // Lien qui rattache l'achat web a l'application mobile. Null quand RevenueCat n'en emet
  // pas - la fonctionnalite peut etre coupee cote tableau de bord.
  const [lienDeReprise, setLienDeReprise] = useState<string | null>(null)
  // Double consentement art. 14 CGU/CGV (exécution immédiate + renonciation à la
  // rétractation) : deux cases distinctes, jamais pré-cochées, requises toutes les deux
  // avant d'activer le paiement. Voir docs/... et CguScreen.tsx article 14.
  const [consentImmediateExecution, setConsentImmediateExecution] = useState(false)
  const [consentWithdrawalWaiver, setConsentWithdrawalWaiver] = useState(false)
  // Tracks the previous `open` value so the fetch/track side effects below only fire on the
  // closed -> open transition, via a render-time comparison rather than an effect dependency.
  const [wasOpen, setWasOpen] = useState(open)
  // Restauration exposee ICI et pas seulement dans les Reglages : c'est sur l'ecran
  // de vente que le relecteur du store la cherche (regle App Store 3.1.1), et c'est
  // ici qu'une tablee ayant deja paye risque de croire qu'on lui redemande de payer.
  const restauration = useRestaurationAchats()

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

  // Modèle tarifaire Bacchana : accès premium à vie uniquement
  // Paiement unique, 12,99 EUR, aucun abonnement, aucun essai gratuit.
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

  // Le prix VENU DU MAGASIN, ou rien. Jamais un montant écrit dans ce fichier :
  // Apple et Google fixent le tarif par territoire.
  const prixDuMagasin = selected?.pkg?.webBillingProduct?.price?.formattedPrice ?? null

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
      const resultat = await purchasePackage(selected.pkg)
      if (resultat) {
        useEntitlementStore.getState().setFromCustomerInfo(resultat.customerInfo)
        setPurchaseSuccess(true)
        // Le lien de reprise est deja ecrit dans le stockage par purchasePackage : on ne
        // le garde ici que pour l'afficher tout de suite, au moment ou l'acheteur regarde.
        setLienDeReprise(resultat.redeemUrl)
        track({
          name: 'subscribe_completed',
          props: { product_id: productId, platform: 'web', lien_de_reprise: resultat.redeemUrl !== null },
        })
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
          aria-label="Bacchana Premium"
          onClick={onClose}
        >
          <motion.div
            initial={{ transform: 'scale(0.96)', opacity: 0 }}
            animate={{ transform: 'scale(1)', opacity: 1 }}
            exit={{ transform: 'scale(0.96)', opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            // La feuille de vente suit les classes d'écran (voir DESIGN.md) :
            // figée à `max-w-sm`, elle devenait un timbre-poste au milieu d'un
            // téléviseur, et l'action principale avec elle. Elle grandit donc
            // avec la classe, sans jamais étirer une ligne de texte au-delà de
            // sa mesure lisible.
            className="w-full max-w-sm lg:max-w-md tv:max-w-3xl max-h-[92dvh] overflow-y-auto rounded-card bg-surface-elevated border border-ink relative"
          >
            {/* L'en-tête est un bandeau imprimé à la troisième encre, le pourpre
                du logo : il ne sert qu'ici et au Borderland. `contexte-profond`
                redéfinit les encres dans sa portée, le titre y lit la sienne. */}
            <div className="contexte-profond px-6 pt-5 pb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 border border-filet-clair px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-ink">
                  <Icon name="cadenas" className="w-3.5 h-3.5" aria-hidden="true" />
                  Premium
                </span>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="w-11 h-11 -mr-3 rounded-control flex items-center justify-center text-ink-secondary hover:text-ink focus-ring-neon"
                >
                  <Icon name="fermer" className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <h3 className="font-display text-[52px] uppercase leading-[0.84] text-ink">
                Bacchana Premium
              </h3>
            </div>

            <div className="px-6 pb-6 pt-5">
            {/* CE QUE L'ON ACHETE, ET CE QU'ON N'ACHETE PAS.
                La phrase disait « débloque tous les packs premium », ce qui
                laissait croire que le reste de la carte était fermé. Cinq jeux
                seulement prennent du contenu en plus, et AUCUN mode n'est
                verrouillé : le dire est la seule façon honnête de vendre, et
                ça évite la déception qui suit un achat mal compris. */}
            <p className="text-ink-secondary font-sans text-sm tv:text-2xl leading-relaxed">
              Cinq jeux passent une commande en plus : Action ou Vérité, C&apos;est un 10 mais,
              Je n&apos;ai jamais, Le Taulier et Qui de nous.{' '}
              <span className="text-ink font-bold">
                Toute la carte reste jouable sans payer, ces cinq-là compris.
              </span>
            </p>

            {/* Le bordereau des lots : un filet par ligne, le compte de cartes
                en colonne, et le mot « cartes » imprimé UNE fois en tête. Il
                répétait une étincelle et le mot « cartes » à chaque ligne, cinq
                fois, ce qui faisait de cinq lots une liste d'icônes. */}
            <div className="mt-5 border-t border-ink/25">
              <div className="flex items-baseline justify-between py-1.5 border-b border-ink/25">
                <span className="font-display uppercase text-base tv:text-2xl text-ink-secondary">
                  Les lots
                </span>
                <span className="font-display uppercase text-base tv:text-2xl text-ink-secondary">
                  Cartes
                </span>
              </div>
              <ul className="max-h-40 overflow-y-auto">
                {PREMIUM_CATALOG.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-baseline gap-3 py-2 border-b border-ink/25"
                  >
                    <span className="text-ink font-sans text-sm min-w-0 flex-1">{entry.title}</span>
                    <span className="text-ink font-mono text-sm tabular-nums">
                      {entry.itemCount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* LES PROMESSES SE LISENT TOUJOURS, et c'est un défaut corrigé à la
                capture : elles vivaient dans la branche qui n'existe QUE si le
                magasin a répondu. Or les achats sont fermés tant que Stripe
                n'est pas branché, donc l'écran de vente ne disait alors ni
                « une fois », ni « à vie », ni « pas d'abonnement » - c'est-à-dire
                rien de ce qui décide un acheteur, et cela dans l'état où
                l'application se trouve aujourd'hui.
                Le prix, lui, reste celui du magasin : la phrase se construit
                autour de lui quand il est là, et l'annonce sans marque
                d'attente quand il ne l'est pas. */}
            <p className="mt-5 text-ink-secondary text-sm tv:text-2xl font-sans leading-relaxed">
              {prixDuMagasin ? (
                <span className="text-ink font-bold">{prixDuMagasin} une fois, gardé à vie.</span>
              ) : (
                <span className="text-ink font-bold">Un paiement, gardé à vie.</span>
              )}{' '}
              Pas d&apos;abonnement, pas d&apos;essai gratuit, rien à résilier.
              {!prixDuMagasin && " Le tarif s'affiche dès que la boutique répond."}
            </p>

            {shownPackages.length > 0 ? (
              <div className="mt-5 space-y-2" role="radiogroup" aria-label="Choix de la formule">
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
                          ? 'w-full min-h-[56px] rounded-control border-2 border-premium bg-bg-raised px-4 py-2.5 text-left shadow-gravure focus-ring-neon'
                          : 'w-full min-h-[56px] rounded-control border-2 border-border-strong/30 bg-bg-raised px-4 py-2.5 text-left focus-ring-neon'
                      }
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-ink text-sm">
                          {p.label}
                          {p.badge && (
                            <span className="ml-2 text-sm font-mono uppercase tracking-widest text-premium">
                              {p.badge}
                            </span>
                          )}
                        </span>
                        {/* PAS DE MARQUE D'ATTENTE A LA PLACE D'UN PRIX. Le
                            « ... » qui tenait la place se lisait comme un prix
                            illisible, sur la ligne meme ou l'acheteur cherche le
                            montant. Tant que la boutique n'a pas repondu, la
                            ligne ne montre RIEN et c'est la phrase dessous qui
                            explique pourquoi. */}
                        {packPrice && (
                          <span className="font-mono tabular-nums text-lg tv:text-3xl text-ink">
                            {packPrice}
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-ink-secondary font-sans mt-0.5">{p.note}</span>
                    </button>
                  )
                })}
                {/* Le prix vient du magasin, jamais d'ici. Apple et Google fixent le
                    prix par territoire : un montant en dur dans la mention légale
                    contredirait le prix affiché juste au-dessus dès qu'un acheteur
                    n'est pas en France, ce qui est un motif de rejet pour métadonnées
                    inexactes. On n'écrit donc que ce qui est vrai partout. */}
                {/* Double consentement art. 14 CGU/CGV : exécution immédiate + renonciation
                    à la rétractation de 14 jours. Non pré-cochées, requises toutes les deux
                    pour activer le paiement - la preuve est enregistrée dans
                    usePurchaseConsentStore au moment du clic (handlePurchase). */}
                <div className="mt-3 space-y-2" role="group" aria-label="Consentement avant paiement">
                  <label className="flex items-start gap-3 rounded-control bg-bg-raised border border-border-strong/30 px-3 py-2.5 min-h-[44px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentImmediateExecution}
                      onChange={(e) => setConsentImmediateExecution(e.target.checked)}
                      className="mt-0.5 w-5 h-5 flex-shrink-0 accent-neon-deep focus-ring-neon"
                      aria-describedby="consent-immediate-execution-label"
                    />
                    <span id="consent-immediate-execution-label" className="text-sm text-ink-secondary font-sans leading-snug">
                      Je demande l&apos;exécution immédiate du contenu numérique dès la
                      confirmation du paiement, avant la fin du délai de rétractation de 14 jours.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-control bg-bg-raised border border-border-strong/30 px-3 py-2.5 min-h-[44px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentWithdrawalWaiver}
                      onChange={(e) => setConsentWithdrawalWaiver(e.target.checked)}
                      className="mt-0.5 w-5 h-5 flex-shrink-0 accent-neon-deep focus-ring-neon"
                      aria-describedby="consent-withdrawal-waiver-label"
                    />
                    <span id="consent-withdrawal-waiver-label" className="text-sm text-ink-secondary font-sans leading-snug">
                      Je reconnais qu&apos;en acceptant cette exécution immédiate, je perds mon
                      droit de rétractation de 14 jours.
                    </span>
                  </label>
                </div>

                {billingReady && !consentGiven && (
                  <p className="mt-2 text-center font-sans text-sm text-ink-secondary" role="status">
                    Coche les deux cases ci-dessus pour activer le paiement.
                  </p>
                )}
              </div>
            ) : (
              // LA CASE DU PRIX A DISPARU, et c'est voulu. Elle affichait
              // « Bientôt disponible », exactement le libellé du bouton juste
              // dessous : la même phrase deux fois, l'une dans la case qui doit
              // porter un PRIX, l'autre sur l'action. Depuis que les promesses
              // se lisent au-dessus en toutes circonstances, cette case ne
              // portait plus rien que le bouton ne dise déjà.
              loading && (
                <p className="mt-5 font-sans text-sm text-ink-secondary text-center" role="status">
                  Lecture du tarif…
                </p>
              )
            )}

            {purchaseSuccess ? (
              <p
                className="mt-4 text-center font-sans text-sm text-success"
                role="status"
                aria-live="polite"
              >
                Premium débloqué, bonne soirée !
              </p>
            ) : null}

            {purchaseSuccess && lienDeReprise ? (
              <div className="mt-4 border border-filet-clair p-4">
                <p className="font-sans text-sm text-ink">
                  Ton achat est lié à ce navigateur. Ouvre ce lien depuis ton téléphone pour
                  le retrouver dans l&apos;application.
                </p>
                <a
                  href={lienDeReprise}
                  className="mt-3 block min-h-[44px] break-all font-mono text-xs text-orange-ink underline underline-offset-4 focus-ring-neon"
                >
                  {lienDeReprise}
                </a>
                <p className="mt-3 font-sans text-xs text-ink-secondary">
                  Il reste dans les Réglages, et ton reçu part par courriel. Fais-le dans
                  l&apos;heure : passé ce délai le lien doit être redemandé.
                </p>
              </div>
            ) : null}

            {!purchaseSuccess && (
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
                <button
                  type="button"
                  onClick={() => void restauration.restaurer()}
                  disabled={restauration.enCours}
                  className="w-full mt-3 min-h-[44px] font-mono text-xs uppercase tracking-widest text-ink-secondary underline underline-offset-4 disabled:opacity-60 focus-ring-neon"
                >
                  {restauration.enCours ? 'Restauration…' : 'Restaurer mes achats'}
                </button>
                {restauration.message && (
                  <p
                    className="mt-2 text-center font-sans text-xs text-ink-secondary"
                    role="status"
                    aria-live="polite"
                  >
                    {restauration.message}
                  </p>
                )}
                <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
                  Plus tard
                </Button>
              </>
            )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
