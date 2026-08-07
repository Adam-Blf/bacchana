import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, ConfirmDialog, Icon } from '@/components/ui'
import { PremiumPaywallModal } from '@/components/premium'
import { useAppStore, useConsentStore, useEntitlementStore, useGameStore } from '@/stores'
import { useThemeStore, resolveTheme } from '@/stores/themeStore'
import { applyAnalyticsConsent } from '@/lib/analytics'
import { cn } from '@/utils'
import pkg from '../../../package.json'

/**
 * Écran Réglages - consolide les contrôles jusque-là éparpillés entre le hub, le pied de
 * page et le bandeau de cookies : apparence, premium, confidentialité, contenu, légal, à
 * propos, réinitialisation. Ne réimplémente rien : chaque section délègue au store ou à
 * l'écran existant (themeStore, entitlementStore, consentStore, customRulesStore, écrans
 * légaux).
 */
export function SettingsScreen() {
  const { goBack, navigateTo } = useAppStore()

  const themePreference = useThemeStore((s) => s.preference)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const isDark = resolveTheme(themePreference) === 'dark'

  const isPremium = useEntitlementStore((s) => s.isPremium)
  const restore = useEntitlementStore((s) => s.restore)
  const [showPaywall, setShowPaywall] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  const consent = useConsentStore((s) => s.consent)
  const savePreferences = useConsentStore((s) => s.savePreferences)
  const openCookiePanel = useConsentStore((s) => s.openPanel)
  const analyticsEnabled = consent?.analytics ?? false

  const { clearPlayers, resetGame } = useGameStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleRestore = async () => {
    setRestoring(true)
    setRestoreStatus(null)
    try {
      const result = await restore()
      setRestoreStatus(
        result === 'restored-premium'
          ? 'Premium restauré avec succès.'
          : result === 'restored-no-premium'
            ? "Aucun achat actif trouvé pour cet appareil."
            : 'Bientôt disponible.'
      )
    } finally {
      setRestoring(false)
    }
  }

  const handleAnalyticsToggle = (checked: boolean) => {
    savePreferences(checked)
    applyAnalyticsConsent(checked)
  }

  const handleReset = () => {
    clearPlayers()
    resetGame()
    setConfirmReset(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-bg"
    >
      <header className="sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => goBack()} className="mr-3" aria-label="Revenir à l'accueil">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">Réglages</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-safe-24 space-y-6">
        {/* Apparence */}
        <SettingsSection title="Apparence">
          <button
            onClick={toggleTheme}
            aria-pressed={isDark}
            className="w-full flex items-center justify-between rounded-control bg-surface border-2 border-ink px-4 py-3 min-h-row focus-ring-neon transition-colors"
          >
            <span className="font-sans font-bold text-sm text-ink flex items-center gap-2">
              {isDark ? <Icon name="lune" className="w-4 h-4" aria-hidden="true" /> : <Icon name="soleil" className="w-4 h-4" aria-hidden="true" />}
              Thème {isDark ? 'sombre' : 'clair'}
            </span>
            <span className="font-hud text-label uppercase tracking-widest text-ink-muted px-2 py-1 rounded-pill border border-border">
              Changer
            </span>
          </button>
        </SettingsSection>

        {/* Premium */}
        <SettingsSection title="Premium">
          <div className="rounded-control bg-surface border-2 border-ink px-4 py-3 mb-3 flex items-center justify-between min-h-row">
            <span className="font-sans font-bold text-sm text-ink flex items-center gap-2">
              <Icon name="cadenas" className="w-4 h-4" aria-hidden="true" />
              Statut
            </span>
            <span
              className={cn(
                'font-hud text-label uppercase tracking-widest px-2 py-1 rounded-pill border',
                isPremium
                  ? 'bg-premium/10 border-premium/40 text-premium'
                  : 'border-border text-ink-muted'
              )}
            >
              {isPremium ? 'Premium actif' : 'Invité'}
            </span>
          </div>

          {!isPremium && (
            <Button variant="primary" className="w-full mb-2" onClick={() => setShowPaywall(true)}>
              <Icon name="etincelles" className="w-4 h-4 mr-2" aria-hidden="true" />
              Débloquer le premium
            </Button>
          )}

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => void handleRestore()}
            disabled={restoring}
          >
            {restoring ? 'Restauration…' : 'Restaurer mes achats'}
          </Button>
          {restoreStatus && (
            <p className="text-ink-secondary font-sans text-xs mt-2 text-center" role="status" aria-live="polite">
              {restoreStatus}
            </p>
          )}
        </SettingsSection>

        {/* Confidentialité */}
        <SettingsSection title="Confidentialité">
          <label className="flex items-center justify-between rounded-control bg-surface border-2 border-ink px-4 py-3 mb-3 cursor-pointer min-h-row">
            <div>
              <p className="font-sans font-bold text-sm text-ink flex items-center gap-2">
                <Icon name="bouclier" className="w-4 h-4" aria-hidden="true" />
                Mesure d&apos;audience
              </p>
              <p className="text-ink-muted font-sans text-xs mt-0.5">PostHog (instance EU), 13 mois maximum.</p>
            </div>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => handleAnalyticsToggle(e.target.checked)}
              className="w-5 h-5 accent-neon-deep flex-shrink-0 ml-3"
              aria-label="Activer la mesure d'audience"
            />
          </label>

          <div className="flex flex-col gap-2">
            <Button variant="ghost" className="justify-start" onClick={openCookiePanel}>
              <Icon name="cookie" className="w-4 h-4 mr-2" aria-hidden="true" />
              Gérer les cookies
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateTo('confidentialite')}>
              <Icon name="regles" className="w-4 h-4 mr-2" aria-hidden="true" />
              Politique de confidentialité
            </Button>
          </div>
        </SettingsSection>

        {/* Contenu */}
        <SettingsSection title="Contenu">
          <Button variant="ghost" className="justify-start w-full" onClick={() => navigateTo('custom-rules')}>
            <Icon name="editer" className="w-4 h-4 mr-2" aria-hidden="true" />
            Mes règles
          </Button>
        </SettingsSection>

        {/* Legal */}
        <SettingsSection title="Legal">
          <div className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start" onClick={() => navigateTo('mentions-legales')}>
              Mentions légales
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateTo('cgu')}>
              CGU / CGV
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => navigateTo('confidentialite')}>
              Politique de confidentialité
            </Button>
          </div>
        </SettingsSection>

        {/* À propos */}
        <SettingsSection title="À propos">
          <div className="rounded-control bg-surface border-2 border-ink px-4 py-3 flex items-center gap-3">
            <Icon name="info" className="w-5 h-5 text-ink-muted flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-display uppercase tracking-tight text-ink">Bacchana</p>
              <p className="text-ink-muted font-hud text-xs tabular-nums mt-0.5">Version {pkg.version}</p>
              <p className="text-ink-secondary font-sans text-xs mt-1">
                Éditeur : Adam Beloucif, nom commercial BLF Lab's
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Réinitialiser */}
        <SettingsSection title="Réinitialiser">
          <Button
            variant="secondary"
            // hover:text-tile-ink du variant "secondary" (pensé pour le survol
            // bg-pop-yellow) n'est jamais retiré par un simple hover:bg-danger/10 :
            // twMerge ne déduplique que les classes qui se chevauchent (même
            // groupe hover:text-*), donc sans ce hover:text-danger explicite le
            // bouton retombait sur une encre fixe #111111 posée sur un fond
            // bg-danger/10 quasi-noir en thème sombre (ratio mesuré 1.16:1,
            // audit visuel 2026-08-05 - "Réinitialiser la tablée" au survol).
            className="w-full border-danger/50 text-danger hover:bg-danger/10 hover:text-danger"
            onClick={() => setConfirmReset(true)}
          >
            <Icon name="recommencer" className="w-4 h-4 mr-2" aria-hidden="true" />
            Réinitialiser la tablée
          </Button>
          <p className="text-ink-muted font-sans text-xs mt-2">
            Efface les joueurs et la partie en cours sur cet appareil. Le statut premium et les
            achats ne sont jamais touchés.
          </p>
        </SettingsSection>
      </main>

      <ConfirmDialog
        open={confirmReset}
        id="settings-reset-tablee"
        title="Réinitialiser la tablée ?"
        message="Les joueurs et la partie en cours seront effacés sur cet appareil. Cette action est irréversible."
        confirmLabel="Réinitialiser"
        onConfirm={handleReset}
        onClose={() => setConfirmReset(false)}
      />

      <PremiumPaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </motion.div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-sm uppercase tracking-wide text-ink-muted mb-2">{title}</h2>
      {children}
    </section>
  )
}
