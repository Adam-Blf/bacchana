/**
 * Crash reporting Sentry, activé uniquement si VITE_SENTRY_DSN est défini.
 * Import dynamique pour ne rien peser dans le bundle initial, try/catch
 * silencieux pour que l'app tourne à l'identique hors ligne ou sans clé
 * (même règle de dégradation gracieuse que billing.ts et analytics.ts).
 * RGPD : aucune PII (sendDefaultPii false par défaut), pas de session replay,
 * uniquement les stack traces d'erreurs.
 */
import pkg from '../../package.json';

export async function initMonitoring(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      // Derive de pkg.name : ne se desynchronise plus jamais d'un futur renommage produit.
      release: `${pkg.name}@${pkg.version}`,
      // Erreurs uniquement : pas de tracing ni de replay, la mesure d'audience
      // consentie reste le territoire de PostHog.
      tracesSampleRate: 0,
    });
  } catch {
    // Chunk indisponible (hors ligne) ou init en échec : l'app continue sans.
  }
}
