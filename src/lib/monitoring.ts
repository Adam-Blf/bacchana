/**
 * Crash reporting Sentry, activé uniquement si VITE_SENTRY_DSN est défini.
 * Import dynamique pour ne rien peser dans le bundle initial, try/catch
 * silencieux pour que l'app tourne à l'identique hors ligne ou sans clé
 * (même règle de dégradation gracieuse que billing.ts et analytics.ts).
 *
 * RGPD - aucun prénom de joueur ni contenu de partie ne doit atteindre Sentry :
 * - `sendDefaultPii: false` (explicite) : pas d'IP, pas de cookies, pas d'en-têtes.
 * - `beforeSend` retire `request` (URL/query string) et `user` de chaque évènement,
 *   au cas où une intégration future les repeupillerait.
 * - `beforeBreadcrumb` supprime les breadcrumbs `console` (un futur `console.log`
 *   de debug pourrait contenir un objet joueur) et n'garde des requêtes réseau que
 *   la méthode et le code HTTP, jamais le corps ni les paramètres.
 * - Pas de session replay, pas de tracing (`tracesSampleRate: 0`) : la mesure
 *   d'audience consentie reste le territoire de PostHog.
 */
import pkg from '../../package.json';
import type { Breadcrumb, ErrorEvent } from '@sentry/react';

/** Bruit navigateur sans valeur actionnable - garde le volume d'erreurs représentatif. */
const IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
];

function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null;
  if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
    return {
      ...breadcrumb,
      data: {
        method: breadcrumb.data?.method,
        status_code: breadcrumb.data?.status_code,
      },
    };
  }
  return breadcrumb;
}

function scrubEvent(event: ErrorEvent): ErrorEvent {
  delete event.request;
  delete event.user;
  return event;
}

export async function initMonitoring(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      // Derive de pkg.name : ne se desynchronise plus jamais d'un futur renommage produit.
      release: `${pkg.name}@${pkg.version}`,
      // Separe le bruit de dev du volume de production - sinon un seul poste en local
      // avec la cle configuree fausse le taux d'erreurs/heure suivi en alerting.
      environment: import.meta.env.MODE,
      // Erreurs uniquement : pas de tracing ni de replay, la mesure d'audience
      // consentie reste le territoire de PostHog.
      tracesSampleRate: 0,
      sendDefaultPii: false,
      ignoreErrors: IGNORED_ERRORS,
      beforeBreadcrumb: scrubBreadcrumb,
      beforeSend: scrubEvent,
    });
  } catch {
    // Chunk indisponible (hors ligne) ou init en échec : l'app continue sans.
  }
}
