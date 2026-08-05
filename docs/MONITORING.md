# Monitoring - La Tournée

Stack retenue (2026-08-04) : **Sentry** (crash reporting) + **Grafana Cloud**
(agrégation/alerting), en complément de PostHog (produit) et UptimeRobot
(disponibilité). Tout en tiers gratuits.

Ce fichier documente le choix de stack (le pourquoi). Pour le runbook complet
(ce qui est fait, ce qui reste à brancher, quelle clé exacte, dans quel ordre) :
voir [`docs/OBSERVABILITE.md`](OBSERVABILITE.md).

## Sentry (erreurs front)

- Intégré dans `src/lib/monitoring.ts`, appelé au démarrage (`App.tsx`).
- **Gated par env** : sans `VITE_SENTRY_DSN`, rien n'est chargé ni envoyé.
  Import dynamique + try/catch : hors ligne ou sans clé, zéro impact.
- RGPD : erreurs uniquement. Pas de PII (`sendDefaultPii: false` explicite),
  `beforeSend`/`beforeBreadcrumb` retirent `request`, `user` et les corps de
  requête réseau, pas de session replay, pas de tracing. La mesure
  d'audience consentie reste chez PostHog. Contrat verrouillé par
  `src/lib/monitoring.test.ts`.
- `environment` = mode de build (`production`/`development`) : sépare le
  bruit d'un poste de dev du volume suivi par l'alerte de seuil.
- `release` = `la-tournee@<version package.json>` : chaque crash est rattaché
  à la version déployée.

### Mise en service (côté Adam, ~5 min)
1. Créer un compte sentry.io (plan Developer gratuit, 5k events/mois),
   organisation « BLF Lab's », projet React « la-tournee ».
2. Copier le DSN dans Vercel (env `VITE_SENTRY_DSN`, environnements
   Production + Preview) et dans `.env.local` en dev.
3. Redéployer. Vérifier : provoquer une erreur en preview et la voir
   arriver dans Sentry.
4. Plus tard (apps natives) : ajouter sentry-android / sentry-cocoa dans
   les repos frères, même organisation.

## Grafana Cloud (agrégation et alerting)

Compte gratuit (grafana.com, plan Cloud Free : 10k séries métriques,
50 Go logs, alerting inclus). Rôle : un seul écran pour la santé du
produit, sans rien héberger.

Dashboard exportable livré : [`docs/grafana/la-tournee-sante-prod.json`](grafana/la-tournee-sante-prod.json)
(format Grafana standard, importable via Dashboards > Import). Sources :

| Source | Branchement | Panneaux |
|--------|-------------|----------|
| Sentry | plugin datasource « Sentry » (officiel, gratuit) + auth token org | top issues non résolues (7 j), nombre d'issues actives |
| UptimeRobot | plugin communautaire Infinity (`yesoreyeram-infinity-datasource`), clé API en Secure Field | disponibilité 30 j, latence, derniers incidents |
| PostHog | pas de datasource native fiable : dashboards dans PostHog (`867195`, voir [`docs/posthog/insights.json`](posthog/insights.json)), liens dans deux panneaux texte | - |
| RevenueCat | pas de datasource : lien dans un panneau texte vers le dashboard RevenueCat | - |
| Vercel | logs/erreurs runtime restent dans Vercel ; option plus tard : drain de logs vers Grafana Loki (free tier) | - |

Procédure de branchement complète (comptes, clés, ordre) : voir
[`docs/OBSERVABILITE.md`](OBSERVABILITE.md).

Alerte minimale à configurer : > 10 erreurs Sentry/heure OU uptime < 99 %
sur 24 h → mail adam@beloucif.com.

À ne pas faire : héberger un Grafana/Prometheus soi-même (rien à scraper
sur une PWA statique, coût d'entretien sans valeur), activer le tracing
Sentry (quota gratuit vite épuisé, inutile à ce volume).
