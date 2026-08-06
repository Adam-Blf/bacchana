# Observabilite - Bacchana

Document operationnel unique : ce qui est deja fait, ce qui reste a brancher, dans quel
ordre, et avec quelle cle exacte. Complete `docs/MONITORING.md` (choix de stack) sans le
dupliquer - lire MONITORING.md pour le pourquoi, ce document pour le comment.

Aucun compte n'a ete cree pour produire ces artefacts (Sentry, Grafana Cloud, UptimeRobot,
PostHog restent a la main d'Adam). Rien n'est gated derriere une cle absente : l'app tourne
en mode invite sans aucune des variables ci-dessous.

## Incoherences trouvees dans le plan de mesure existant (a corriger dans `bacchana-content`)

`ANALYTICS.md` (repo `bacchana-content`) decrivait un plan ecrit avant le pivot du
4 aout 2026 vers le paiement unique a vie. Trois ecarts entre ce fichier et le code reel
verifie le 5 aout 2026 dans `src/lib/analytics.ts` :

1. **`subscribe_started` / `subscribe_completed` n'existaient pas du tout dans le code.**
   L'entonnoir premium documente (`premium_paywall_viewed` -> `subscribe_started` ->
   `subscribe_completed`) etait donc invérifiable. Corrige dans cette PR : ces deux
   evenements sont maintenant emis par `PremiumPaywallModal.tsx`, plus un troisieme
   (`subscribe_failed`) absent du plan mais necessaire pour detecter un checkout casse.
2. **`product_id` documente comme un enum obsolete** (`premium_monthly`, `premium_yearly`,
   `premium_lifetime`) alors que la grille reelle (`PRICING.md`, RevenueCat projet
   `2b8d469c`) n'a plus qu'un seul produit a vie, `premium_lifetime`, plus des packs
   `pack_*`. Les evenements emis portent le vrai identifiant RevenueCat
   (`webBillingProduct.identifier`), pas l'id de package interne (`lifetime`).
3. **Noms de proprietes divergents** entre le plan et le code : `mode_started` n'emet que
   `mode` + `pack` (pas `players`/`packs` en liste), `session_completed` n'emet que
   `mode` + `turns` (pas `duration_s`/`cards_played`), `consent_updated` emet
   `analytics: boolean` (pas `consent: granted|denied` + `surface`). Non corrige dans cette
   PR (renommer ces proprietes touche le moteur de session et les stores, hors perimetre
   observabilite) - les insights PostHog livres ici utilisent les **vrais** noms actuels,
   documentes dans `docs/posthog/insights.json`. A trancher : soit aligner le code sur le
   plan (ajouter `players`, `packs`, `duration_s`, `cards_played` a l'instrumentation), soit
   mettre `ANALYTICS.md` a jour sur le schema reel - ne pas laisser les deux diverger.

## Sentry (erreurs)

**Deja fait avant cette PR** - integration gatee par `VITE_SENTRY_DSN`, import dynamique,
zero PII par defaut, `release` derive de `package.json`, pas de tracing.

**Complete par cette PR** (`src/lib/monitoring.ts`) -
- `sendDefaultPii: false` explicite (etait implicite).
- `environment` = `import.meta.env.MODE` : separe le bruit d'un poste de dev du volume de
  production suivi par l'alerte "> 10 erreurs/heure".
- `beforeSend` retire `request` (URL/query string) et `user` de chaque evenement.
- `beforeBreadcrumb` supprime les breadcrumbs `console` (un futur `console.log` de debug
  pourrait contenir un objet joueur) et ne garde des breadcrumbs reseau que la methode et
  le code HTTP, jamais le corps ni les parametres de requete.
- `ignoreErrors` : bruit navigateur sans valeur (`ResizeObserver loop limit exceeded` et
  variantes, rejections de promesses non standard venant d'extensions tierces).
- Tests : `src/lib/monitoring.test.ts` verrouille ce contrat (PII scrub + config).

**Reste a faire (Adam, ~5 min)**
1. Creer un compte sentry.io (plan Developer gratuit, 5k events/mois), organisation
   **BLF Lab's**, projet React **bacchana**.
2. Project Settings > Client Keys (DSN) - copier le DSN.
3. Coller dans Vercel : `VITE_SENTRY_DSN` (environnements Production **et** Preview) et dans
   `.env.local` en dev.
4. Redeployer, provoquer une erreur en preview (ex. `throw new Error('test')` temporaire
   dans la console du navigateur), verifier qu'elle arrive dans Sentry avec le bon
   `release` et `environment: production`.
5. **Regle d'alerte a creer** (Sentry > Alerts > Create Alert Rule, projet bacchana) -
   - Regle 1 : "Nouvelle issue" -> notifier `adambeloucif@gmail.com` immediatement (aucune
     erreur de production ne doit dormir).
   - Regle 2 : "Plus de 10 evenements en 1 heure" sur `environment:production` -> notifier
     `adambeloucif@gmail.com` (seuil deja documente dans `docs/MONITORING.md`).
6. Plus tard (apps natives Android/iOS) - `sentry-android` / `sentry-cocoa`, meme
   organisation, meme regle de scrub PII a repliquer.

## PostHog (produit)

**Deja fait avant cette PR** - SDK integre, consentement RGPD strict (aucune capture avant
choix explicite), 4 evenements produit deja en place.

**Complete par cette PR**
- `subscribe_started`, `subscribe_completed`, `subscribe_failed` ajoutes dans
  `src/lib/analytics.ts` et cables dans `PremiumPaywallModal.tsx` (voir Incoherences ci-dessus)
  - sans ca, la conversion premium etait invisible.
- `docs/posthog/insights.json` : specification exacte de 5 insights (evenements reels,
  requetes, periode, type de graphique) pour le dashboard "Produit - activation et
  conversion premium" (id connu `867195`, projet EU `238190`).
- `scripts/posthog-setup.mjs` : script idempotent qui lit ce JSON et cree/met a jour le
  dashboard + les insights via l'API PostHog. Relancable sans doublon (matche par nom
  exact). Sans cle, affiche la marche a suivre et sort proprement (code 0). Lit
  `POSTHOG_PERSONAL_API_KEY` dans l'environnement du shell, sinon dans `.env.local`.

**Format API - correction du 5 aout 2026** : la premiere version de ce script envoyait un
insight au format herite (`filters`). PostHog a depreciee ce format cote ecriture et
renvoie desormais `403 permission_denied` sur toute creation ou mise a jour au format
`filters` - verifie en conditions reelles sur le projet 238190. Corrige : les insights
utilisent maintenant le format `query` (`InsightVizNode` encapsulant une `TrendsQuery` ou
`FunnelsQuery`), schema verifie contre le code source de PostHog
(`posthog/posthog@master`, `frontend/src/queries/schema/schema-general.ts` et
`products/product_analytics/backend/api/insight.py`). Le script detecte aussi le cas d'un
insight existant encore au format `filters` (rejet `403`) et le remplace proprement
(suppression puis recreation au format `query`) plutot que d'echouer.

**Deja execute (5 aout 2026)** - synchronisation reelle sur le projet EU 238190, dashboard
`867195` reutilise (pas duplique). 5 insights crees ou mis a jour avec leurs id reels :
entonnoir premium (`5285219`), parties par mode (`5331577`), joueurs actifs/jour
(`5331578`), consentement RGPD (`5331579`), echecs d'achat (`5331580`).
`https://eu.posthog.com/project/238190/dashboard/867195`.

**Reste a faire (Adam, ~2 min)**
1. **Revoquer la cle personnelle** utilisee pour cette synchronisation - c'est un outil
   d'exploitation ponctuel, pas un secret qui doit vivre en permanence dans un `.env`. Une
   nouvelle cle (memes scopes : `insight:read`, `insight:write`, `dashboard:read`,
   `dashboard:write`, projet **238190**) suffira pour relancer `npm run posthog:setup` le
   jour ou `docs/posthog/insights.json` change.
2. Si le script echoue avec `404` sur le dashboard `867195` (id d'un autre projet, ou
   jamais cree), il retombe automatiquement sur une recherche par nom puis en cree un
   nouveau - relire la sortie console pour recuperer le nouvel id.

## RevenueCat (revenu)

Deja en place (mode bac a sable, `VITE_REVENUECAT_TEST_STORE_KEY`) et documente dans
`bacchana-content/PRICING.md`. Rien a brancher cote observabilite : le dashboard
RevenueCat (`https://app.revenuecat.com/projects/2b8d469c`) reste la source du revenu, pas
de datasource Grafana native pour ca (voir panneau texte du dashboard Grafana). Le
recoupement avec PostHog se fait via `product_id` (`premium_lifetime`), identique des deux
cotes.

## Grafana Cloud (agregation et alerting)

**Rien n'etait implemente avant cette PR.** Livre : `docs/grafana/bacchana-sante-prod.json`,
un dashboard exportable au format standard Grafana (`__inputs` + `__requires`) - l'import
demande a choisir les datasources au moment de l'import, rien n'est code en dur.

**Reste a faire (Adam, ~20 min, dans cet ordre)**
1. Compte gratuit sur grafana.com (plan Cloud Free : 10k series metriques, 50 Go logs,
   alerting inclus).
2. **Plugin Sentry** (Connections > Add new connection > rechercher "Sentry", installer
   `grafana-sentry-datasource`, officiel Grafana Labs, gratuit). Creer le datasource avec
   un **token d'organisation Sentry** (Sentry > Settings > Auth Tokens > New, scopes
   `org:read`, `project:read`, `event:read`) - a coller dans le champ Auth Token du
   datasource Grafana, jamais ailleurs.
3. **Plugin Infinity** (Connections > Add new connection > rechercher "Infinity", installer
   `yesoreyeram-infinity-datasource`, gratuit). Dans la config du datasource, section
   "Secrets" : ajouter un champ nomme exactement `uptimerobotApiKey` avec la cle **Main API
   Key** UptimeRobot (voir section suivante) - c'est ce nom que les requetes du dashboard
   referencent via `${secureData.uptimerobotApiKey}`.
4. Dashboards > Import > coller le contenu de `docs/grafana/bacchana-sante-prod.json` (ou
   uploader le fichier). Grafana demande alors de choisir le datasource Sentry et le
   datasource Infinity crees aux etapes 2-3.
5. Dans le dashboard importe, editer les variables `sentry_org` et `sentry_project` (en
   haut de l'ecran) avec le vrai slug d'organisation et de projet Sentry.
6. Verifier chaque panneau s'affiche (pas de "No data" ni d'erreur de champ) - si un champ
   du plugin Sentry ou Infinity a change de nom depuis la redaction de ce document, l'editeur
   de requete Grafana permet de re-mapper visuellement, panneau par panneau.
7. **Alerte minimale a creer** (Grafana > Alerting > Alert rules, pas embarquable dans le
   JSON du dashboard) - condition : disponibilite UptimeRobot < 99 % sur 24h OU volume
   Sentry > 10/heure -> contact point email `adambeloucif@gmail.com`. Doublonne
   volontairement l'alerte Sentry (etape 5 de la section Sentry) : deux chemins
   d'alerte independants valent mieux qu'un seul qui peut tomber en panne silencieusement.

## UptimeRobot (disponibilite, alimente le dashboard Grafana)

**Rien n'est cree.**
1. Compte gratuit sur uptimerobot.com (`adambeloucif@gmail.com`).
2. Add New Monitor - HTTP(s), URL `https://lataverne.beloucif.com`, intervalle 5 minutes
   (plan gratuit).
3. My Settings > API Settings > **Main API Key** - c'est cette cle qui va dans le champ
   `uptimerobotApiKey` du datasource Infinity de Grafana (etape 3 ci-dessus), jamais dans
   ce repo, jamais dans un `.env`.
4. UptimeRobot a sa propre alerte native (email/SMS) independamment de Grafana - l'activer
   en complement, pas en remplacement (defense en profondeur, section precedente).

## Ordre operatoire recommande (du plus rapide au plus optionnel)

1. Sentry (5 min) - le filet de securite le plus simple a activer, deja code.
2. PostHog (10 min) - `npm run posthog:setup`, la conversion premium redevient mesurable.
3. UptimeRobot (5 min) - prerequis du dashboard Grafana.
4. Grafana Cloud (20 min) - branche Sentry + UptimeRobot, un seul ecran pour tout.
5. Alertes (Sentry + Grafana, ~10 min au total) - sans elles, l'observabilite est un
   tableau qu'on regarde, pas un systeme qui previent.

## Indicateurs qui comptent vraiment

8 indicateurs, pas 30 : mieux vaut huit chiffres regardes chaque semaine que trente
personne ne consulte. Aucun indicateur d'abonnement (MRR, churn, taux de renouvellement) -
le modele Bacchana est un paiement unique a vie, ces metriques n'ont pas de sens ici.

| # | Indicateur | Definition | Source | Seuil d'alerte |
|---|------------|------------|--------|-----------------|
| 1 | Disponibilite | % de checks HTTP reussis sur 24h/30j | UptimeRobot (panneau Grafana "Disponibilite 30 jours") | < 99 % sur 24 h |
| 2 | Latence | Temps de reponse HTTP du monitor principal | UptimeRobot (panneau Grafana "Temps de reponse") | p50 > 2000 ms sur 15 min (site statique Vercel) |
| 3 | Volume d'erreurs | Evenements Sentry par heure, `environment:production` | Sentry (panneau Grafana "Issues actives" + alerte Sentry) | > 10 evenements/heure |
| 4 | Nouvelles issues critiques | Issues jamais vues avant, niveau error/fatal | Sentry (alerte "Nouvelle issue") | >= 1 dans les 24h suivant un deploiement |
| 5 | Joueurs actifs/jour | Utilisateurs uniques sur `session_completed` (activation reelle, pas juste un lancement) | PostHog (insight "Joueurs actifs par jour") | baisse > 30 % jour sur jour (hors saisonnalite connue) |
| 6 | Conversion paywall -> achat | `subscribe_completed` / `premium_paywall_viewed`, 30j glissants (le `subscribe_failed` associe signale un checkout casse independamment du taux) | PostHog (insight "Entonnoir premium" + "Echecs d'achat") | < 1 % sur 30 j, ou tout `subscribe_failed` en serie (3+/jour) |
| 7 | Revenu cumule | Somme des achats `premium_lifetime` confirmes | RevenueCat (dashboard, lien depuis Grafana) | baisse a 0 vente sur 14 j apres le lancement officiel |
| 8 | Acceptation du consentement | % `analytics: true` parmi `consent_updated` | PostHog (insight "Consentement RGPD") | < 20 % (rend les indicateurs 5-6 non representatifs, revoir le bandeau) |
