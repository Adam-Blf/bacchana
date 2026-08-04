import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAppStore, useConsentStore } from '@/stores'
import { applyAnalyticsConsent, initAnalytics } from '@/lib/analytics'
import { useBackClose } from '@/hooks/useBackClose'
import { haptic } from '@/utils/haptic'

/**
 * Cookie consent banner + customize panel, per docs/legal/cookie-banner-spec.md.
 *
 * - First visit (no valid consent): shows the bottom sheet, level 1 (Tout refuser /
 *   Accepter l'analyse, same visual weight, + lien Personnaliser).
 * - "Cookies" entry in the footer reopens the same sheet directly on level 2
 *   (granularity), pre-filled with the current choice - see consentStore.openPanel().
 * - No tracker (PostHog) fires before an explicit choice is recorded here.
 */
export function CookieConsent() {
  const consent = useConsentStore((s) => s.consent)
  const isPanelOpen = useConsentStore((s) => s.isPanelOpen)
  const closePanel = useConsentStore((s) => s.closePanel)
  const acceptAll = useConsentStore((s) => s.acceptAll)
  const rejectAll = useConsentStore((s) => s.rejectAll)
  const savePreferences = useConsentStore((s) => s.savePreferences)
  const hasValidConsent = useConsentStore((s) => s.hasValidConsent)
  const navigateTo = useAppStore((s) => s.navigateTo)

  const [customizing, setCustomizing] = useState(false)
  const [analyticsDraft, setAnalyticsDraft] = useState(() => consent?.analytics ?? false)
  // Tracks the previous isPanelOpen value across renders so we can reset the draft toggle
  // to the current stored choice right when the "Cookies" footer link reopens the sheet -
  // a render-time state adjustment (React-sanctioned pattern), not a setState-in-effect.
  const [prevPanelOpen, setPrevPanelOpen] = useState(isPanelOpen)
  if (isPanelOpen !== prevPanelOpen) {
    setPrevPanelOpen(isPanelOpen)
    if (isPanelOpen) setAnalyticsDraft(consent?.analytics ?? false)
  }

  // No valid choice yet -> the banner shows itself. This is derived, not stored state, so
  // it stays perfectly in sync the moment acceptAll/rejectAll/savePreferences resolve.
  const showBanner = !hasValidConsent()

  // The preferences panel (reopened from the footer) closes on hardware back; the
  // first-visit banner does not - a consent choice stays required.
  useBackClose(isPanelOpen, closePanel, 'cookie-panel')

  // Returning visitor who already accepted analytics - re-init PostHog silently. A pure
  // "synchronize with an external system" effect, no local setState involved.
  useEffect(() => {
    if (hasValidConsent() && consent?.analytics) {
      void initAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeEverything = () => {
    setCustomizing(false)
    closePanel()
  }

  const handleAcceptAll = () => {
    haptic('light')
    acceptAll()
    applyAnalyticsConsent(true)
    closeEverything()
  }

  const handleRejectAll = () => {
    haptic('light')
    rejectAll()
    applyAnalyticsConsent(false)
    closeEverything()
  }

  const handleSavePreferences = () => {
    haptic('light')
    savePreferences(analyticsDraft)
    applyAnalyticsConsent(analyticsDraft)
    closeEverything()
  }

  const visible = showBanner || isPanelOpen
  const showLevel2 = customizing || isPanelOpen

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-consent"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          role="dialog"
          aria-modal="true"
          aria-label="Préférences de cookies"
          className="fixed inset-x-0 bottom-0 z-banner pb-safe px-3"
        >
          <div className="max-w-lg mx-auto mb-3 rounded-card bg-surface-elevated border border-border-strong shadow-card-elevated p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-control bg-neon/10 border border-neon/30 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-[18px] h-[18px] text-neon" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-base uppercase tracking-tight text-ink">Cookies</h2>
                {showLevel2 ? (
                  <p className="text-ink-secondary font-sans text-sm mt-1 leading-relaxed">
                    Choisissez les traceurs actifs sur La Taverne. Le refus est aussi simple que
                    l&apos;acceptation.
                  </p>
                ) : (
                  <p className="text-ink-secondary font-sans text-sm mt-1 leading-relaxed">
                    La Taverne utilise des traceurs pour mesurer l&apos;audience et améliorer l&apos;expérience de
                    jeu. Vous pouvez accepter, refuser, ou personnaliser vos choix. En savoir plus :{' '}
                    <button
                      onClick={() => navigateTo('confidentialite')}
                      className="text-orange-ink underline underline-offset-2"
                    >
                      politique de confidentialité
                    </button>
                    .
                  </p>
                )}
              </div>
            </div>

            {showLevel2 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between rounded-control bg-surface border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Nécessaire</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Session d&apos;authentification Supabase. Toujours actif.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted px-2 py-1 rounded-pill border border-border flex-shrink-0 ml-3">
                    Actif
                  </span>
                </div>

                <label className="flex items-center justify-between rounded-control bg-surface border border-border px-4 py-3 cursor-pointer min-h-[44px]">
                  <div>
                    <p className="text-sm font-semibold text-ink">Mesure d&apos;audience</p>
                    <p className="text-xs text-ink-muted mt-0.5">PostHog (instance EU), 13 mois maximum.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsDraft}
                    onChange={(e) => setAnalyticsDraft(e.target.checked)}
                    className="w-5 h-5 accent-neon-deep flex-shrink-0 ml-3"
                    aria-label="Activer la mesure d'audience"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {showLevel2 ? (
                <>
                  <Button variant="primary" className="w-full" onClick={handleSavePreferences}>
                    Enregistrer mes choix
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleAcceptAll}>
                    Tout accepter
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Same visual weight, same size, no dark pattern - CNIL requirement. */}
                  <Button variant="secondary" className="w-full" onClick={handleRejectAll}>
                    Tout refuser
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={handleAcceptAll}>
                    Accepter l&apos;analyse
                  </Button>
                </div>
              )}
              {!isPanelOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setCustomizing((c) => !c)}
                >
                  <Settings2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  Personnaliser
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
