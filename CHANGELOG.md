# Changelog

## [0.34.1] - 2026-08-05

Reponse a l'attaque de chaine d'approvisionnement **ChainDrop**, dite Mini Shai-Hulud,
qui a frappe le registre npm le 4 aout 2026. Un ver auto-replicant a contamine plus de
deux mille versions de paquets en ajoutant a chacun un crochet
`"preinstall": "node setup.mjs"` qui volait les jetons npm, GitHub, AWS et Vault.

### Constat

Ce projet est **sain**, verifie contre les 2 235 couples nom plus version publies par
Wiz Research, croises sur les trois lockfiles et le cache npm global. Aucun
`preinstall`, aucun hameçon d'editeur, aucun veilleur, aucun runtime Bun depose.

Trois paquets portent toutefois un nom de la liste dans une version saine :
`keyv@4.5.4`, `flat-cache@4.0.1`, `file-entry-cache@8.0.0`. Une montee de version les
ferait entrer dans la zone empoisonnee.

### Securite

- **`.npmrc` versionne avec `ignore-scripts=true`.** Ferme le vecteur exact de
  l'attaque : aucun script de cycle de vie d'aucune dependance ne s'execute.
  **Aucune exception n'est necessaire**, verifie par installation neuve : `esbuild` et
  `sharp` livrent desormais leurs binaires par dependance optionnelle de plateforme.
- **Garde `npm run check:supply-chain`**, branchee en integration continue. Elle echoue
  si le reglage disparait du `.npmrc` ou si une version listee entre dans le lockfile.
  Prouvee rouge puis verte sur les deux regressions.
- **Epinglage defensif** par `overrides` sur `keyv`, `flat-cache` et
  `file-entry-cache`, pour qu'aucune resolution transitive ni proposition automatisee
  ne les fasse monter dans la zone dangereuse.
- **`docs/SUPPLY_CHAIN.md`** documente l'incident, la protection, et surtout ses
  limites : `ignore-scripts` ne protege pas d'une charge placee dans le code du paquet
  lui-meme, et npm n'offre pas de quarantaine par age de publication.

### Note importante

`npm audit signatures` renvoie **vert** sur les paquets empoisonnes de cette attaque :
les versions malveillantes portaient des attestations SLSA valides, le ver signant
lui-meme ce qu'il republiait. Ne jamais s'en servir comme preuve d'innocuite.

## [0.34.0] - 2026-08-05

Durcissement de securite issu de l'audit complet des cinq depots. Aucun constat
critique n'avait ete trouve et le scan de l'historique des 305 commits est propre,
mais trois constats de gravite elevee portaient sur la chaine d'outillage, et un
constat moyen sur la falsification de l'acces payant.

### Securite

- **Identifiants d'administration exposes au deploiement.** Il n'existait aucun
  `.vercelignore` alors que le deploiement en ligne de commande est utilise : un
  `vercel --prod` televersait le contexte de compilation, donc `.env.local` et ses
  trois identifiants serveur. Fichier d'exclusion ajoute. La rotation des trois cles
  reste a faire cote Adam, elle ne peut pas l'etre depuis le depot.
- **Aucun en-tete de securite sur une application publique.** Politique de securite
  du contenu a 12 directives ajoutee, sans `unsafe-inline` sur les scripts, plus
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Strict-Transport-Security`, `X-Frame-Options` et les deux en-tetes
  `Cross-Origin`. Politique exercee dans un navigateur avant livraison, pas
  seulement ecrite.
- **PostHog chargeait deux scripts distants** (configuration a distance et module de
  sondages) depuis `eu-assets.i.posthog.com`. Plutot que d'autoriser l'execution de
  code tiers dans la page, ces fonctions inutilisees sont desactivees
  (`disable_external_dependency_loading`, `disable_surveys`,
  `advanced_disable_feature_flags`). La capture d'evenements continue de fonctionner,
  verifie par requetes reseau reelles.
- **Actions d'integration continue epinglees** sur des empreintes de commit et non
  sur des tags mutables, qu'un mainteneur peut republier. Blocs `permissions` en
  lecture seule ajoutes aux deux workflows, avec `pull-requests: read` sur le seul
  job de scan de secrets, que gitleaks exige pour lire les commits d'une PR.
- **Acces payant falsifiable.** Le cache local d'acces payant n'avait aucune borne :
  ecrire `isPremium` a la main dans le stockage du navigateur accordait le premium
  indefiniment, puisque le rafraichissement au demarrage n'ecrase le cache que si le
  serveur repond. Le cache porte desormais l'horodatage de la derniere confirmation
  serveur et n'est accepte que sept jours. Un cache sans horodatage, avec un
  horodatage non numerique ou situe dans le futur est refuse a la rehydratation,
  donc avant tout affichage. Falsification rejouee dans un navigateur : refusee.
  Ce n'est pas une preuve, c'est une borne : la vraie protection reste que le contenu
  payant n'est jamais embarque dans le paquet livre, seulement ses metadonnees.
- **Surveillance des dependances** activee, sans quoi l'epinglage par empreinte
  figerait aussi les correctifs de securite.
- **`vite-plugin-pwa` reclasse en dependance de developpement.** Declare en
  production, il tirait Vite avec lui et faisait remonter 14 vulnerabilites du
  serveur de developpement comme si elles etaient exposees en production.
  `npm audit --omit=dev` passe de 14 vulnerabilites a **zero**.
- `.gitignore` complete des magasins de cles, certificats et motifs de jetons
  manquants.

### Corrige

- Huit mediopoints dans les commentaires de `sync-topics.yml`, contraires a la regle
  typographique du projet. La garde typographique de l'integration continue couvre
  desormais `.github/workflows` en plus du README et du CHANGELOG, pour que le cas
  ne puisse plus reapparaitre.

## [0.33.1] - 2026-08-05

Correction bloquante pour la review App Store : le validateur du dépôt de contenu
(`la-taverne-content`) bloque tout terme d'alcool dans les packs JSON, mais
`src/core/engine/modeRegistry.ts` et le contenu embarqué en dur (`src/content/*.ts`)
sont du CODE et échappaient à cette garde. Un reviewer Apple qui ouvre l'app y
trouvait "trinque" (7 occurrences), "tu bois", "boire", un mode nommé « Quitte ou
Trinque » et « la maison ne fait pas crédit » - guideline 1.4.3, rejet quasi certain.

### Corrigé
- `modeRegistry.ts` : mode `quiz` renommé **« Quitte ou Double »** (affichage
  uniquement, identifiant technique `quiz` inchangé - zéro impact sur les données
  persistées ou l'analytics). Toutes les pénalités prescriptives reformulées en
  abstrait ("tu bois ta cagnotte" -> "tu perds ta cagnotte", "le juge trinque" ->
  "le juge prend la pénalité", etc.) sur les 10 modes concernés.
- `QuizScreen.tsx`, `ContestModal.tsx`, `SessionRecap.tsx` ("La maison ne fait pas
  crédit." -> "Ici, tout le monde règle l'addition."), `WouldYouRatherScreen.tsx`,
  `RankingScreen.tsx`, `content/quiz.ts`, `content/roulette.ts` ("verre d'eau" ->
  "eau fraîche"), `content/ranking.ts` ("pâtes trop cuites" -> "pâtes ratées"),
  `content/wouldYouRather.ts` : mêmes reformulations, chaînes UI et commentaires.
- Documentation alignée : `README.md`, `docs/STORE_LISTING.md`, `docs/BRAND.md`,
  `docs/USER_STORIES.md`, `docs/AUDIT_EQUIPE.md`, `docs/ETUDE_BETA_2026-08.md`,
  `docs/MOBILE_PARITY_SPEC.md`, `design-system/meskova/MASTER.md`, `tasks/todo.md`.

### Ajouté
- `scripts/check_alcohol_lexicon.mjs` (`npm run check:alcohol`, branché en CI) :
  scanne `src/**/*.ts(x)` (hors `*.test.ts(x)`, hors JSON déjà gardé côté dépôt de
  contenu) contre un lexique de 21 termes/variantes et échoue si l'un d'eux
  apparaît. N'exclut jamais "alcool" seul (légitime dans "sans alcool") ni les
  identifiants techniques déjà en place (`unit: 'gorgees'`/`'SHOT'`, schéma de
  pack `sips`/`shots`) - seule la prose accentuée est ciblée. Vérifié en injectant
  puis retirant un terme interdit : rouge sur l'injection, vert après revert.

### Signalé (non corrigé dans cette PR, hors périmètre)
- `public/icon.svg` (et les exports PWA/App Store qui en dérivent) représente
  littéralement deux verres qui trinquent - le risque de rejet Apple 1.4.3 le
  plus sérieux du projet, plus grave que n'importe quel texte. Nécessite un
  nouvel asset de marque, hors périmètre de ce correctif de lexique.
- `docs/STORE_LISTING.md` promettait encore "7 jours d'essai gratuit" alors que
  le modèle est passé à un paiement unique sans essai (v0.31.3) - même défaut
  de cohérence contrat/produit que le correctif CGV de la 0.33.0, à corriger.
- `docs/BATTLE_PLAN.md` (mécanique "L'Ardoise", roadmap non implémentée) propose
  "la maison distribue le dernier verre" - à reformuler avant toute implémentation.

## [0.33.0] - 2026-08-05

Correction juridique bloquante : les CGU/CGV (article 14) décrivaient un mécanisme de
double consentement (exécution immédiate + renonciation à la rétractation de 14 jours)
que le paywall web n'implémentait pas - zéro case à cocher dans
`PremiumPaywallModal.tsx`. Un contrat qui affirme une chose fausse rend la clause de
renonciation inopposable : un client aurait pu se rétracter dans les 14 jours après
avoir tout débloqué, en s'appuyant sur les CGV elles-mêmes.

### Ajouté
- `PremiumPaywallModal.tsx` : deux cases à cocher distinctes, non pré-cochées,
  affichées avant le bouton de paiement - (1) demande d'exécution immédiate du
  contenu numérique, (2) renonciation expresse au droit de rétractation de 14 jours.
  Libellés alignés sur l'esprit exact de l'article 14 des CGU (`CguScreen.tsx`).
  Le bouton de paiement reste désactivé tant que les deux ne sont pas cochées, avec
  un message explicite ("Coche les deux cases ci-dessus pour activer le paiement.").
  Cases atteignables au clavier, libellés cliquables (`<label>` englobant), cible
  tactile 44px minimum, focus visible (`focus-ring-neon`).
- `src/stores/purchaseConsentStore.ts` : preuve de consentement horodatée
  (`consentedAt`), rattachée à la version des CGU en vigueur (`cguVersion`),
  persistée en `localStorage` (`meskova-purchase-consent`) au moment du clic sur
  le bouton de paiement - jamais réinitialisée après coup, conformément à la
  promesse de conservation des CGU.
- `CguScreen.tsx` exporte désormais `CGU_VERSION`, source unique de la chaîne de
  version des CGU - réutilisée par `PremiumPaywallModal.tsx` pour éviter toute
  divergence entre le contrat affiché et la preuve de consentement enregistrée.
- Tests : `purchaseConsentStore.test.ts` (3 tests) et 4 tests supplémentaires dans
  `PremiumPaywallModal.test.tsx` prouvant que le paiement reste impossible tant que
  les deux cases ne sont pas cochées, qu'aucune case n'est pré-cochée, et que la
  preuve de consentement est bien enregistrée avant l'appel réseau RevenueCat.

## [0.32.1] - 2026-08-05

Correction du script de synchronisation PostHog : exécuté pour de vrai contre le projet
de production, il échouait avec `403 permission_denied` (PostHog a déprécié la création/
mise à jour d'insights au format `filters` hérité).

### Corrigé
- `docs/posthog/insights.json` : les 5 insights passent du champ `posthog_filters` au
  champ `posthog_query` (`InsightVizNode` encapsulant `TrendsQuery`/`FunnelsQuery`),
  schéma vérifié contre le code source de PostHog (`posthog/posthog@master`), pas deviné.
- `scripts/posthog-setup.mjs` : envoie désormais `query` au lieu de `filters`, remplace
  proprement (suppression + recréation) un insight existant encore au format `filters`
  plutôt que d'échouer sur le `PATCH`, et lit `POSTHOG_PERSONAL_API_KEY` dans `.env.local`
  en repli quand la variable d'environnement est absente (jamais loggée).

### Exécuté réellement (pas simulé)
Synchronisation lancée contre le projet EU 238190 - dashboard `867195` réutilisé, 5
insights créés/mis à jour : `5285219`, `5331577`, `5331578`, `5331579`, `5331580`. Détail
dans `docs/OBSERVABILITE.md`.

## [0.32.0] - 2026-08-05

Artefacts d'observabilité de production : disponibilité, erreurs, produit et revenu
réunis dans des fichiers importables, sans qu'aucun compte n'ait été créé pour les
produire.

### Ajouté
- `docs/grafana/meskova-sante-prod.json` : dashboard Grafana Cloud importable
  (disponibilité/latence UptimeRobot, erreurs Sentry, liens PostHog et RevenueCat).
- `docs/posthog/insights.json` + `scripts/posthog-setup.mjs` (`npm run posthog:setup`) :
  spécification et création/mise à jour idempotente de 5 insights PostHog (entonnoir
  premium, parties par mode, joueurs actifs/jour, consentement RGPD, échecs d'achat).
- Événements `subscribe_started` / `subscribe_completed` / `subscribe_failed` dans
  `src/lib/analytics.ts`, câblés dans `PremiumPaywallModal.tsx` avec le vrai `product_id`
  RevenueCat (`premium_lifetime`) - l'entonnoir de conversion premium documenté dans
  `ANALYTICS.md` n'était jusque-là pas mesurable, ces événements n'existaient pas.
- `docs/OBSERVABILITE.md` : runbook unique (déjà fait / reste à faire / clé exacte /
  ordre) pour Sentry, PostHog, Grafana Cloud et UptimeRobot, plus le tableau des 8
  indicateurs retenus avec leur seuil d'alerte.

### Corrigé
- `src/lib/monitoring.ts` (Sentry) : `sendDefaultPii: false` explicite, `environment`
  séparé du build (évite qu'un poste de dev fausse le seuil d'alerte "> 10 erreurs/h"),
  `beforeSend`/`beforeBreadcrumb` retirent `request`, `user` et les corps de requêtes
  réseau, `ignoreErrors` filtre le bruit navigateur sans valeur. Verrouillé par
  `src/lib/monitoring.test.ts`.
- `release` Sentry recalé sur `meskova@<version>` (référençait encore l'ancien nom de
  produit `la-taverne`).

### Signalé (non corrigé dans cette PR, hors périmètre observabilité)
- `ANALYTICS.md` (repo `la-taverne-content`) documente un `product_id` obsolète
  (enum d'abonnement mensuel/annuel/à vie) et des propriétés (`players`, `packs`,
  `duration_s`, `cards_played`, `consent`, `surface`) que le code n'émet pas -
  détail dans `docs/OBSERVABILITE.md`, section Incohérences.

## [0.31.3] - 2026-08-05

Correction juridique : les écrans légaux décrivaient encore l'ancien modèle
par abonnement (essai gratuit 7 jours, renouvellement mensuel/annuel,
résiliation via App Store/Google Play/Stripe) alors que le pricing a été
refondu le 2026-08-04 en un paiement unique à vie, sans abonnement ni essai.

### Corrigé
- `CguScreen.tsx` : sections « Essai gratuit », « Renouvellement
  automatique » et « Résiliation de l'abonnement » supprimées (promesse
  d'essai gratuit inexistant = pratique commerciale trompeuse). Contenu
  aligné sur `la-taverne-content/legal/cgu-cgv.md` v1.14.0 - accès premium
  à vie 14,99 EUR + packs à la carte 2,99 EUR, aucun abonnement, aucune
  création de compte. 19 sections renumérotées en 20 (Partie 2 étoffée des
  articles Livraison du contenu numérique, Restauration des achats et
  Garantie légale de conformité), toutes les références croisées internes
  (ex. renvoi de l'article rétractation vers l'article prix) vérifiées et
  mises à jour.
- Médiation de la consommation : adhésion **CM2C** effective (valide
  jusqu'au 5 août 2029) publiée avec ses coordonnées complètes dans
  `CguScreen.tsx` et `MentionsLegalesScreen.tsx` - la note de suivi
  signalant l'absence de médiateur est retirée (art. L641-1 du Code de la
  consommation : amende jusqu'à 3 000 EUR pour une personne physique en cas
  d'absence de cette mention).
- `MentionsLegalesScreen.tsx` : adresse, SIREN (108386855), SIRET
  (10838685500010), code APE et régime fiscal réels publiés (immatriculation
  validée le 4 août 2026) - les deux notes de suivi correspondantes
  (adresse à publier, immatriculation en cours) sont retirées car résolues.
  Mention d'un abonnement premium remplacée par accès à vie + packs à la
  carte.
- `ConfidentialiteScreen.tsx` : tableau des données et sous-traitants
  réaligné sur le modèle sans compte utilisateur (suppression des colonnes
  « données d'abonnement/renouvellement », ajout des données de transaction
  Stripe et d'entitlement RevenueCat), section « Suppression de compte »
  remplacée par « Effacement des données et désinstallation ».
- Note de suivi restante (toujours pertinente, non résolue) : DPA à
  archiver avec Stripe/RevenueCat/PostHog/Vercel avant mise en production
  complète (`ConfidentialiteScreen.tsx`, section 3).

## [0.31.2] - 2026-08-05

### Corrigé
- Nom commercial **BLF Lab's** (avec apostrophe, nom enregistré au RNE)
  corrigé partout où il apparaissait sans apostrophe (« BLF Labs ») :
  `LICENSE`, `README.md`, `index.html` (meta author), `package.json`
  (champ author), `SettingsScreen.tsx`, `design-system/meskova/MASTER.md`,
  `docs/BRAND.md`, `docs/MONITORING.md`, `docs/STORE_ACCOUNTS.md`,
  `docs/STORE_LISTING.md`.

## [0.31.1] - 2026-08-04

Correction d'accessibilité urgente : texte illisible sur les aplats pop en
thème sombre, signalé en jouant ("du blanc sur du jaune c'est illisible, du
blanc sur du vert clair c'est illisible, la roulette est illisible").

### Corrigé
- Bug racine : `--color-ink` s'inverse avec le thème (sombre en clair, crème
  en sombre) alors que les aplats `pop-yellow`/`pop-pink`/`pop-blue`/`pop-lime`
  restent clairs dans les deux thèmes - du texte `text-ink` posé dessus tombait
  à 1.20-2.03:1 en thème sombre (seuil WCAG AA : 4.5:1).
- Nouveau token `tile-ink` formalisé dans `tokens.css` (`--color-tile-ink`,
  canal `--c-tile-ink`) et exposé à Tailwind (`text-tile-ink`, `bg-tile-ink`,
  modificateurs d'opacité `/NN` inclus) : encre fixe, ne suit jamais le thème.
  Le token existait déjà partiellement (composant `ModeTile` du hub) mais
  n'était ni documenté comme règle, ni appliqué ailleurs.
- Appliqué sur tous les aplats pop pleins et les survols qui basculent sur un
  pop : `Button` (secondary hover), `AuctionScreen`, `CustomRulesScreen`,
  `HubScreen` (options du Coupe-Gorge), `OnboardingScreen`, `QuizScreen`,
  `RankingScreen`, `TribunalScreen`, `WouldYouRatherScreen`.
- Bug additionnel trouvé par balayage systématique : le panneau de résultat de
  `WouldYouRatherScreen` posait du texte `text-ink` (thémable) sur
  `bg-card-face` (blanc fixe, objet physique comme les cartes à jouer) -
  1.15:1 en thème sombre, pire que le bug pop. Corrigé en `text-card-ink`,
  cohérent avec le reste du produit (`AuctionScreen`, `QuizScreen`,
  `RouletteScreen`, `TribunalScreen`).
- **La Roue du Destin**, signalée explicitement : libellés de segments trop
  petits (9-10px) ET en `text-ink` (mauvais contraste). Taille augmentée
  (11-13px, gras), couleur calculée dynamiquement par segment via
  `src/utils/contrast.ts` (`pickForeground`) plutôt que figée en dur - si un
  futur segment reçoit un aplat foncé, le libellé reste lisible sans y
  repenser. Pointeur de la roue : passé de `#111111` figé (invisible sur le
  fond quasi-noir du thème sombre) à `var(--color-ink)`, cohérent avec la
  bordure de la roue.

### Ajouté
- `scripts/check_contrast.mjs` : garde mécanique de contraste WCAG 2.1, lit
  les vraies valeurs de `tokens.css`, vérifie 32 paires premier plan/arrière
  plan réellement utilisées dans le produit (clair + sombre), échoue si une
  paire descend sous le seuil AA applicable (4.5:1 texte normal, 3:1 texte
  large). Branché en étape dédiée dans la CI (`.github/workflows/ci.yml`) et
  accessible en local via `npm run check:contrast`.
- `src/utils/contrast.ts` (+ tests) : calcul de contraste WCAG réutilisable
  côté app, utilisé par la roulette pour choisir dynamiquement son encre de
  segment.
- `docs/DESIGN_TOKENS.md` : nouvelle section "Texte sur pop" documentant la
  règle `tile-ink`, la table de ratios mesurés et le piège corrigé (les
  ratios `pop-*` déjà présents dans la doc mesuraient l'aplat contre le fond
  de page, jamais contre un texte posé dessus - d'où le bug jamais détecté).

## [0.31.0] - 2026-08-04

Renommage produit **La Taverne -> Meskova** et refonte du theme sombre
(retour direct d'Adam : "le mode sombre fait fade").

### Rebranding Meskova
- Nom d'app partout : `package.json`, `index.html` (title, meta description,
  apple-mobile-web-app-title), manifest PWA (`vite.config.ts`), ecrans (Hub,
  A propos, paywall, ticket de fin de partie), pages legales (mentions
  legales, CGU/CGV, politique de confidentialite), commentaires SVG
  (favicon, icone, dos de carte), sceau de cire premium (monogramme LT -> M).
- Univers narratif **conserve a l'identique** : les modes gardent leurs noms
  (Le Taulier, La Criee, Le Pilori...), le lexique (le comptoir, la tablee,
  l'arriere-salle, la penalite) ne bouge pas. Seul le nom du produit change.
- Migration `localStorage` : nouvelle etape `la-taverne-*` -> `meskova-*`
  ajoutee a la chaine historique (`blackout-*` -> `la-tournee-*` ->
  `la-taverne-*` -> `meskova-*`), toutes les cles zustand persist
  (`consentStore`, `gameStore`, `entitlementStore`, `customRulesStore`,
  `customThemesStore`, `onboardingStore`, `themeStore`) et `ANON_ID_KEY`
  migrees vers le prefixe `meskova-`. Tests Vitest dedies
  (`src/utils/migrateStorage.test.ts`) prouvant la chaine complete.
- Identifiant technique RevenueCat `La Taverne Pro` **conserve a l'identique**
  (un entitlement RevenueCat n'est pas renommable sans migration dashboard) -
  seul le libelle affiche a l'utilisateur devient "Meskova Premium".
- `design-system/meskova/MASTER.md` remplace `design-system/la-taverne/MASTER.md`
  comme source de verite (l'ancien reste comme archive de l'ere precedente).
- Sentry : le tag de release derive desormais de `pkg.name` au lieu d'une
  chaine codee en dur, pour ne plus jamais se desynchroniser d'un renommage.

### Refonte theme sombre
- Diagnostic mesure (formule de luminance relative WCAG) : l'ancienne rampe
  de surfaces ne produisait que 1.09:1 a 1.20:1 de contraste entre paliers
  (bg/surface/surface-elevated), quasi invisible pres du noir a cause de la
  compression gamma sRGB - cause racine du retour "fait fade".
  Nouvelle rampe a 4 paliers distincts (1.14:1 / 1.31:1 / 1.57:1 vs bg).
- Bordures fines en sombre : alpha 0.20 -> 0.38 (1.76:1 -> 3.27:1, seuil
  WCAG 1.4.11 pour les limites d'objet UI non textuel).
- `ink-muted` eclairci (`#837D8F` -> `#958FA3`) pour repasser AA texte sur
  bg/bg-raised/surface ; reserve aux icones/labels decoratifs sur
  surface-elevated (`ink-secondary` desormais utilise a la place dans
  `ContestModal` et `GameBoard` pour le texte courant des modales).
- Nouveau token `danger` (rouge semantique erreur/suppression, theme-able)
  distinct de `card-red` (fixe, reserve aux pips physiques des cartes) -
  7 ecrans corriges (AuctionScreen, CustomRulesScreen, PremiumPaywallModal,
  PromptGameScreen, SettingsScreen) qui utilisaient `card-red` a tort comme
  couleur de texte, illisible en sombre (2.07:1 a 3.25:1 selon la surface).
- Suppression de l'animation Tailwind `glow-pulse` : code mort, inutilisee,
  et son ombre codee en dur `#111111` etait de toute facon invisible en
  sombre.
- Documentation complete de la palette (hex, roles, ratios mesures, regles
  de portage Android/iOS) dans `docs/DESIGN_TOKENS.md`, nouveau document
  faisant autorite pour les agents mobile.

## [0.30.0] - 2026-08-04

Version issue de l'etude beta (16 reponses au questionnaire, 03-04/08) et d'un
audit de bugs en profondeur - docs/ETUDE_BETA_2026-08.md pour l'analyse complete.

### Nouveaux ecrans
- Onboarding premier lancement : 3 panneaux skippables (promesse, zero pub /
  hors ligne, penalites decidees par la table), flag `la-taverne-onboarding`.
- Regles pour les 13 modes : champ `rules` dans le registre, ecran generique
  `ModeRulesScreen`, bouton « ? » sur chaque tuile du hub et en jeu.
- Fin de session branchee sur La Criee, La Roue du Destin et Tu preferes
  (SessionRecap + ardoise de la soiree, bouton « Terminer la partie »).

### Corrections (audit 2026-08-04)
- RGPD : le toggle « Mesure d'audience » des Reglages coupe reellement PostHog
  (`applyAnalyticsConsent` partage avec le bandeau cookies), et un re-accord
  apres refus reactive la capture (`opt_in_capturing`).
- Premium : le mode « cartes a l'infini » est verifie au runtime contre
  l'entitlement (une valeur trafiquee en localStorage est neutralisee).
- Paywall : vrai flux d'achat `purchasePackage` (loading/erreur/succes),
  toujours degrade en « Bientot disponible » sans `VITE_BILLING_ENABLED`.
- Contestation du Coupe-Gorge : choix du contestataire et attribution de la
  penalite au vrai perdant (fini le « Adam VS Adam »).
- Robustesse hors ligne : imports dynamiques billing/analytics proteges,
  restauration d'achat avec finally, init entitlement silencieuse.
- Migration localStorage : seules les options de jeu sont reprises des anciens
  prefixes (plus de parties fantomes ressuscitees).
- Identite des joueurs preservee quand la tablee est revalidee sans changement
  (l'ardoise ne se dedouble plus), revanche fonctionnelle sur les modes a
  prompts, cible `{player2}` stable au re-rendu, recap emis quand on quitte
  Quitte ou Trinque / Le Tableau d'Honneur en cours, themes perso presents des
  la premiere manche de La Criee, message honnete de l'ErrorBoundary.

### Marque et docs
- Editeur BLF Labs credite partout (brand book, MASTER, STORE_LISTING,
  STORE_ACCOUNTS, LICENSE, README, package.json, meta author) - les residus
  ABEL LABS sont purges.
- Pricing revise d'apres l'etude : lifetime 14,99 EUR en offre heros (promo
  lancement 9,99), abonnements retires, packs a la carte 1,99 EUR
  (docs/BRAND.md, a appliquer dans RevenueCat).
- Monitoring : Sentry integre (gated par `VITE_SENTRY_DSN`, erreurs
  uniquement, zero PII) + runbook Grafana Cloud dans docs/MONITORING.md.

## [0.29.2] - 2026-08-03

- Titre du paywall "La Taverne Premium" mis en orange (accent de marque) au lieu de l encre : en encre il se confondait avec le fond et la bordure (noir sur noir en clair, blanc sur blanc en sombre), illisible.

## [0.29.1] - 2026-08-03

- Lisibilite du paywall corrigee dans les deux themes : titre sans glow, contrastes AA, etat de formule selectionnee plus net.

## [0.29.0] - 2026-08-03

- Ecran Reglages : apparence, premium et restauration des achats, confidentialite, legal, a propos, reinitialisation.
- Nouveau bouton engrenage dans le hub, route dediee `settings` (App.tsx + appStore), reutilise integralement themeStore, entitlementStore, consentStore, customRulesStore, PremiumPaywallModal et les ecrans legaux existants.
- `lib/billing.ts` gagne `restorePurchases()` et `entitlementStore` un `restore()` (statuts `restored-premium` / `restored-no-premium` / `unavailable`), requis pour la review Apple/Play - degrade proprement en "Bientot disponible" en mode invite.

## [0.28.0] - 2026-08-03

- Genre et statut relationnel optionnels par joueur dans le setup de la tablee (Homme / Femme / Autre, Celibataire / En couple, ou rien). Inclusif, facultatif, replie par defaut.
- Donnees strictement LOCALES : jamais envoyees a PostHog ni a aucun serveur, elles ne servent qu a personnaliser les tours.
- Nouveau resolveur de cibles `targeting.ts` (gender-m, gender-f, pair, single, couple) avec repli aleatoire gracieux, branche sur l affichage des prompts.

## [0.27.1] - 2026-08-03

- Retrait de la police serif Fraunces, jugee trop marquee ; la palette sombre pop et les corrections de contraste de la 0.27.0 restent.

## [0.27.0] - 2026-08-03

- Refonte DA : theme sombre pop sur encre neutre, contrastes clair securises AA, ajout serif Fraunces sur les grands titres.
- Theme sombre reintroduit sur une base encre neutre (#141216/#1D1B20/#26232B), zero brun/bois : accent orange #FF7A2E (7.16:1 AAA), pops eclaircis (jaune #FFD84D, rose #FF7FBE, bleu #7FB0FF, lime #A6F05A), tous >= 8:1 sauf mention. Bascule via le bouton soleil/lune du hub (`themeStore`, persiste + suit l'OS en mode systeme).
- Clair : nouveau token `orange-ink` (#C74300, 4.74:1 AA) pour tout texte/petit label orange (liens legaux, badges, footer), distinct de `neon`/`neon-deep` reserves aux gros aplats et titres (AA-large). Or premium assombri (#96690F -> #855C12, 4.64:1 -> 5.67:1) et rouge carte assombri (#DD2A38 -> #C71F2D, 4.70:1 -> 5.73:1).
- Police serif Fraunces (black + italic, auto-hebergee, zero CDN) posee sur 2 endroits signature : le sous-titre du hero (Welcome) et le titre de l'ecran regles (RulesScreen), en complement du display Anton - jamais en petit.

## [0.26.1] - 2026-08-03

- Coherence doc : README aligne sur 13 modes reels (6 prompts + 7 embarques, la derive "10 modes" du registre et du diagramme Mermaid est corrigee), Tu preferes reclasse en mode a vote embarque.
- Brand book : wordmark corrige dans design-system/la-taverne/MASTER.md (Anton, la police display reelle, au lieu de la mention obsolete Montserrat Black).

## [0.26.0] - 2026-08-03

- Brand book marketing complet (docs/BRAND.md) : plateforme de marque (mission, vision, valeurs, archetype, positionnement), univers et lexique (13 modes definis), voix de marque (5 principes + do/don't), taglines (12 candidates + recommandations), messaging par persona (etudiant, sober-curious, groupe vacances), activation GTM (campagne lancement, TikTok/Reels, ASO, influenceurs, referral, calendrier saisonnier), identite visuelle (neobrutalisme, palette, typo Anton, logo, motion press-to-squash, templates), checklist d'assets.

## [0.25.0] - 2026-08-03

- Sous-titres de modes reecrits dans le ton taverne : Action ou Verite ("Aveu au comptoir ou gage, choisis"), Je n'ai jamais ("Les confidences de la tablee"), C'est un 10 mais ("Le defaut qui gache tout", anglicisme "deal-breaker" retire), 7 Secondes ("Reponds avant le dernier grain").
- La Roue du Destin etoffee de 8 a 40 segments varies (penalites abstraites, defis d'ambiance, mimes, votes, gages soft), toujours zero alcool et store-safe.
- Le Pilori etoffe de 10 a 40 chefs d'accusation de soiree, toujours zero alcool et store-safe.
- Pack orphelin retire cote web : "Tu preferes" etant desormais un mode de vote embarque sans pack, la copie tu-preferes-classique.json est supprimee de src/content et l'index genere ne l'importe plus (source encore presente cote la-taverne-content, non re-synchronisee volontairement).
- docs/STORE_LISTING.md : nouvelle section "Notes de review App Store" documentant la mecanique proprietaire (vote Tu preferes, enchere La Criee, proces Le Pilori, quiz Quitte ou Trinque, classement Le Tableau d'Honneur), le positionnement sans alcool, l'absence de pub et l'originalite du contenu (parade guideline 4.3), plus une liste de mots-cles ASO FR longue traine.
- Typographie : tirets longs purges de docs/USER_STORIES.md (regle typographique interne).

## [0.24.0] - 2026-08-03

- Contenu des packs gratuits porte a 80 items via sync depuis la-taverne-content 1.10.0. Six packs gratuits (Action ou Verite, C'est un 10, Never, Picolo, Qui de nous, Sept secondes) passent de 30-40 a 80 items ; le catalogue premium reflete les nouveaux itemCount (80). Le pack Tu preferes reste inchange (mecanique de vote proprietaire, sans dependance de pack).

## [0.23.0] - 2026-08-03

- **Tu preferes** passe d'une carte a lire a un vrai mode de jeu a mecanique de **vote**. Un dilemme A ou B s'affiche, le telephone tourne, chaque joueur tape son camp, puis au reveal la **minorite trinque** (egalite ou vote unanime : personne ne trinque). Recap local par joueur en fin de partie.
- **84 dilemmes** originaux et store-safe (34 soft, 30 medium, 20 hot), 100 % sans reference a l'alcool, ecrits main. Le mode ne depend plus d'un pack de contenu.
- Moteur pur teste (13 tests, RNG injectable) sur le meme moule que le quiz et le podium ; la minorite, l'egalite et le cumul des penalites sont couverts. La tuile reste "Tu preferes" au hub, sans doublon.
- Interet produit : une mecanique proprietaire (pas un simple deck a lire) qui appuie la difference fonctionnelle demandee par la review App Store (guideline 4.3).

## [0.22.1] - 2026-08-03

- Editeur declare corrige dans les mentions legales, les CGU et la politique de confidentialite : l'editeur est **Adam Beloucif, exercant sous le nom commercial BLF Labs** (en lieu et place d'Abel Studio), la personne physique restant responsable de traitement et directeur de la publication.
- README : la ligne de direction artistique annoncait Montserrat Black / Poppins, corrigee en Anton / Bricolage Grotesque, conforme a la DA appliquee depuis la 0.12.0.

## [0.22.0] - 2026-08-03

Corrections issues de l'audit juridique mene avec le toolkit claude-for-legal.

- Mentions legales : l'exemption de publication d'adresse invoquee (article 6-III-2 de la LCEN) ne couvre que les editeurs non professionnels. l'editeur exerçant une activite commerciale, c'est l'article 6-III-1 qui s'applique et impose la publication de l'adresse. L'affirmation inexacte est remplacee par une note de revue explicite : publier l'adresse du siege ou passer par une domiciliation commerciale des l'immatriculation.
- Nouvelle section sur les informations commerçant exigees par le reglement europeen sur les services numeriques, que les plateformes de distribution reclament desormais a chaque developpeur.
- TVA : les conditions affirmaient une TVA française applicable a toutes les ventes. Les deux regimes sont desormais distingues - franchise en base (article 293 B du CGI) sur les ventes web tant que le seuil n'est pas franchi, et TVA collectee par Apple et Google en qualite de revendeurs reputes sur les achats effectues depuis les boutiques.
- Droit de retractation : le renoncement etait presente comme implicite ("en validant son achat"). La jurisprudence europeenne exige un consentement expres et distinct. Les conditions decrivent maintenant une case a cocher dediee, non pre-cochee, bloquant le paiement web tant qu'elle n'est pas cochee, avec conservation de la preuve horodatee. Reste a implementer dans le parcours de paiement.
- Mediation de la consommation : la note de revue precise que l'obligation naît des la premiere vente a un consommateur, et non a la mise en production.

## [0.21.1] - 2026-08-03

- L'editeur declare est precise dans les mentions legales, les CGU et la politique de confidentialite : Adam Beloucif, entreprise individuelle, exploitant le service La Taverne. La propriete intellectuelle des contenus lui est rattachee, et la mention d'immatriculation renvoie desormais au guichet unique INPI. (Nom commercial reformule en 0.22.1.)

## [0.21.0] - 2026-08-02

Deuxieme lot issu de l'audit : les trois modes qui ne se terminaient jamais.

- Le Pilori debouche desormais sur l'addition, comme les autres jeux : bouton "Terminer et voir l'addition" apres un verdict, penalites reportees a l'ardoise de la soiree, evenement de fin de session emis. Les penalites accumulees etaient jusqu'ici jetees a la sortie de l'ecran.
- La Criee et La Roue du Destin recoivent une fin de partie explicite qui cloture la session et compte les manches. Ces deux modes ne designent jamais nommement le joueur puni (tout se joue a voix haute), donc pas d'addition chiffree : fabriquer un classement aurait produit des donnees fausses.
- Consequence mesurable : l'evenement de debut de partie partait pour les treize jeux mais celui de fin n'arrivait que pour six. L'entonnoir d'analyse etait faux sur pres de la moitie du catalogue.

## [0.20.0] - 2026-08-02

Premier lot de corrections issues de l'audit d'equipe (docs/AUDIT_EQUIPE.md).

- Poids : le service worker ne precache plus les modules de facturation et d'analytics, charges a la demande. Le precache passe de 2039 a 1049 kilo-octets - un visiteur qui refuse les cookies et n'ouvre jamais le paywall ne telecharge plus un mega-octet pour rien.
- PostHog passe en import dynamique : le module n'est plus preleve au premier rendu alors que tout premier lancement se fait sans consentement. L'evenement de consentement attend desormais que le module soit pret, sinon il etait silencieusement perdu.
- L'ardoise de la soiree est indexee par identifiant de joueur et non plus par prenom : deux joueurs homonymes a la meme table fusionnaient leurs penalites et faussaient le classement.
- Code mort supprime : handleCardAction, une fonction vide exposee dans l'interface du store de jeu, et le middleware de persistance de appStore qui n'ecrivait qu'une cle vide a chaque navigation.

## [0.19.1] - 2026-08-02

- docs/AUDIT_EQUIPE.md : audit mene en parallele par cinq specialistes (produit, UX, editorial, technique, growth) sur le produit reel. Verdict jeu par jeu, jeux a ajouter, frictions UX classees, etat du contenu, dette technique bloquante, leviers de croissance, et ordre d'execution recommande de la v0.20 a la v0.23.

## [0.19.0] - 2026-08-02

- Suppression du mode sombre : l'app est desormais claire en toutes circonstances, y compris quand le systeme est en sombre. Le store de theme, le selecteur du hub et le bloc de tokens sombres disparaissent - une seule palette a maintenir, une seule verification de contraste, zero surprise sur les aplats pop.
- Correction RGPD : les ecrans legaux etaient inatteignables au premier lancement. La garde qui renvoie vers l'accueil tant qu'aucun joueur n'est saisi excluait mentions legales, confidentialite et CGU, or le bandeau cookies renvoie vers la politique de confidentialite avant toute saisie de joueur - le lien rebondissait donc immediatement sur l'accueil.
- Deux mediopoints interdits par la charte typographique subsistaient dans l'interface (RankingScreen, CustomRulesScreen), remplaces par des tirets courts.

## [0.18.0] - 2026-08-02

- Icones des jeux : les pictogrammes filaires generiques de lucide-react sont remplaces par un jeu vendorise localement (Icons8, style Hatch - formes pleines et epaisses, esprit gravure), choisi via le MCP icons8 parce qu'un jeu d'icones passe-partout trahissait la direction artistique neobrutaliste. Script reproductible scripts/fetch-mode-icons.mjs, aucun CDN, les identifiants techniques des modes sont inchanges.
- Mentions legales : nouvelle section credits et ressources tierces (attribution Icons8 requise par la licence gratuite, polices sous licence SIL Open Font, contenus de jeu originaux).

## [0.17.0] - 2026-08-02

- Le hub n'affiche plus que les jeux reellement lancables avec la tablee du moment : proposer une tuile qui refuse de demarrer etait une fausse promesse. A deux joueurs, les quatre jeux qui en exigent trois ou quatre disparaissent et un bandeau annonce combien de jeux s'ouvrent, a partir de quel effectif, avec un raccourci vers l'ecran des joueurs.
- Pied du hub : "Buvez responsable" remplace par "Jouez responsable : la taverne veille sur sa tablee" - derniere mention de consommation dans l'interface, incompatible avec la regle store-safe.

## [0.16.0] - 2026-08-02

- L'ardoise de la soiree : le cumul des penalites de TOUS les jeux joues depuis l'ouverture de l'app s'imprime sur le ticket de caisse des la deuxieme partie (classement, nombre de parties et de jeux, cumul de la maison, meneur d'ardoise). Volontairement non persiste : l'ardoise se remet a zero a chaque lancement, comme la session. Premiere brique de la mecanique signature "l'Ardoise" du plan de bataille.

## [0.15.0] - 2026-08-02

- Paywall : selecteur de formule a trois options (a vie / annuel / mensuel), le lifetime est l'option par defaut avec badge "Meilleure offre" - decision issue de l'audit concurrentiel (aucun concurrent n'a de paiement unique, la colere anti-abonnement est documentee chez Picolo et TOZ). Mentions legales par formule (essai 7 jours sur les abos, paiement unique sur le lifetime).
- docs/BATTLE_PLAN.md : plan de bataille n°1 FR issu de 4 audits paralleles (teardowns Picolo et TOZ, balayage FR + mondial, facteurs de ranking stores) - positionnement d'attaque, roadmap produit priorisee, mecaniques signature (l'Ardoise, le Taulier tournant, le Grand Livre), SEO de conquete, lancement en 5 phases.

## [0.14.1] - 2026-08-02

- docs/STORE_ACCOUNTS.md : runbook d'ouverture des comptes Play Console (25 USD, exigence 12 testeurs / 14 jours en compte perso) et Apple Developer (99 USD/an, Small Business Program 15 %), avec la decision perso vs organisation tant qu'ABEL LABS est en pause et l'ordre optimal de lancement.

## [0.14.0] - 2026-08-02

- Audit WCAG complet des couleurs : 24 paires reelles x 2 themes, 0 echec apres correction. Ajustements light : neon #FA5600 (3.14:1 en display sur creme), card-red #DD2A38 (4.71:1), premium #96690F (4.64:1), success #177C50 (4.97:1). Tout texte pose sur orange passe en encre fixe tile-ink (l'encre themable tombait a 2.2:1 en sombre), boutons primaires inclus.
- docs/MARKET.md : audit de niche et de concurrence (Picolo, TOZ, Sombre soiree...), decisions actees (zero pub, pas de palier hebdo, lifetime en avant, ASO hors "jeu a boire", offline visible), backlog growth priorise.
- design-system/MASTER.md : palette et regles de contraste mises a jour avec les ratios mesures.

## [0.13.0] - 2026-08-02

- La Criee : la tablee peut creer ses propres themes ("Mes themes"). Ils rejoignent la pioche, s'activent/se desactivent d'un interrupteur, se suppriment, et restent enregistres sur l'appareil (localStorage la-taverne-custom-themes, entrees corrompues ecartees a l'hydratation). Le theme tire affiche "Theme de la tablee" quand il vient du groupe.

## [0.12.1] - 2026-08-02

- Fiche stores refondue en passe ASO complete (docs/STORE_LISTING.md) : nom/sous-titre/mots-cles App Store dedupliques et a la limite exacte (27/28/100), texte promotionnel 160, courte description Play 79, description longue restructuree (hook probleme, essai gratuit 7 jours mentionne).
- Purge store-safe de la fiche : suppression de la mention "L'abus d'alcool...", de l'emoji chopes et de "soiree arrosee" - marqueurs de produit alcoolise en review. Risque "Quitte ou Trinque" documente avec fallback "Quitte ou Double".

## [0.12.0] - 2026-08-02

- Typographie de marque refondue : Anton (display, esprit enseigne peinte) + Bricolage Grotesque (UI et corps) remplacent Montserrat/Poppins, jugees trop basiques. Space Mono reste reservee au ticket de caisse.
- Fallback display 'Arial Black' remplace par 'Impact'. Anton declare en 100-900 pour neutraliser le faux gras synthetise.
- `docs/DESIGN.md` reecrit : il decrivait encore la DA Neo-Tokyo abandonnee (dont une mention IBM Plex Mono, police bannie) et contredisait `design-system/la-taverne/MASTER.md`.

## [0.11.0] - 2026-08-02

- Coupe-Gorge : le tirage se fait desormais en touchant le paquet de cartes lui-meme (pile de dos de cartes cliquable avec compteur), plus intuitif que l'ancien bouton "Tirer une carte" en pied d'ecran.

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

## [0.10.0] - 2026-08-02

### Added
- **L'addition en ticket de caisse** : l'ecran de fin est imprime comme un
  vrai ticket - Space Mono (auto-hebergee), bords crantes, lignes pointillees,
  TOTAL, code-barres decoratif, « La maison ne fait pas credit. ». Papier fixe
  dans les deux themes (objet physique).
- **Sceau de cire** : les packs et options premium portent un sceau de cire
  rouge au monogramme LT (SVG maison) a la place du cadenas.

### Changed
- **Chaque lancement repart de la tablee** : l'app demarre sur la saisie des
  joueurs et fermer l'app remet la partie a zero. Seuls survivent les reglages
  du paquet, le theme, le consentement et les regles perso.

### Fixed
- **Carte trefle visible en superposition sur iPhone** : les deux faces de la
  carte etaient coplanaires et Safari faisait percer la face cachee a travers
  backface-visibility (enfants z-index promus). Chaque face est maintenant
  poussee de 1px le long de sa normale et les z-index internes retires.
  Verifie sur WebKit : le dos seul est visible sur un trefle face cachee.
- Le pied de page du recap ne mentionne plus la boisson (reliquat store-safe).

## [0.9.1] - 2026-08-02

### Fixed
- Les champs de la tablee ne debordent plus de l'ecran sur mobile : un input
  garde une largeur intrinseque (~20 caracteres) qui empechait flex-1 de
  retrecir, corrige par min-w-0. Verifie sur WebKit en 320 px et 393 px.

## [0.9.0] - 2026-08-02

### Added - Mode sombre « taverne à la bougie »
- Deux thèmes complets : papier crème le jour, bois sombre et lueur de
  lanterne la nuit. Bascule persistée sur l'appareil, « system » suit l'OS
  en direct, meta theme-color synchronisée pour la barre de statut PWA.
- Tokens convertis en canaux RGB : les opacités Tailwind suivent le thème.
  Cartes à jouer et texte des tuiles pop restent en encre fixe (surfaces
  claires dans les deux thèmes). Contrastes AA vérifiés sur WebKit.

### Changed - La carte des jeux passe en langage taverne
- Le Borderland devient **Le Coupe-Gorge**, Le Meneur **Le Taulier**,
  L'Enchère **La Criée**, Le Podium **Le Tableau d'Honneur**, Le Procès
  **Le Pilori**, La Roulette **La Roue du Destin**. Les jeux universels
  (Action ou Vérité, Je n'ai jamais...) gardent leur nom, sous-titres
  thématisés. Identifiants techniques et analytics inchangés.
- Textes d'ambiance : « La tablée », « Une chaise de plus », « Pousser la
  porte », « Au menu ce soir », écran de fin renommé « L'addition ».

## [0.8.1] - 2026-08-02

### Added - Essai gratuit de 7 jours
- Les abonnements mensuel et annuel comportent un essai gratuit de 7 jours,
  reserve aux nouveaux clients (produits RevenueCat recrees avec l'option
  Free trial, identifiants inchanges).
- CGV : nouvel article 11 « Essai gratuit » (information de reconduction,
  aucun debit en cas de resiliation pendant l'essai), articles suivants
  renumerotes.
- Paywall : mention de l'essai et de la resiliation sous le prix.
- Relecture orthographique complete des chaines visibles : aucune faute
  restante detectee (les occurrences remontees par l'outillage sont des
  identifiants techniques).

## [0.8.0] - 2026-08-02

### Changed - Renommage « La Taverne »
- Nom définitif : **La Taverne**. Le nom « La Tournée » retenu en 0.7.0 n'aura
  jamais été publié sur les stores, la direction artistique néobrutaliste et
  l'ensemble des écrans sont conservés tels quels.
- Domaine : `lataverne.beloucif.com`. Identifiant natif `com.beloucif.lataverne`.
- Entitlement RevenueCat renommé `La Taverne Pro`, packages et prix inchangés.
- Clés `localStorage` migrées vers le préfixe `la-taverne-`. La table de
  migration conserve les deux préfixes historiques (`blackout-`, `la-tournee-`)
  afin qu'aucune partie sauvegardée ne soit orpheline.
- Dépôts renommés : `la-taverne`, `la-taverne-content`, `la-taverne-android`,
  `la-taverne-ios`.

## [0.7.0] - 2026-08-01

### Changed - Rebranding « La Tournée »
- Nouveau nom : **La Tournée** (ex-BlackOut), nouvelle direction artistique
  **néobrutalisme** : fond papier crème `#FFF9F0`, encre `#111111`, accent orange
  `#FF5C00`, aplats pop (jaune/rose/bleu/lime), bordures 2 px, ombres dures.
- Typographie : Montserrat 800/900 (display) + Poppins 400-700 (UI et HUD tabulaire),
  Google Fonts auto-hébergées ; correction du bug qui faisait retomber le corps
  de texte sur la police système (tokens Inter/IBM Plex fantômes).
- Nouveau logo (verres qui trinquent), nouveau dos de carte, favicon, jeu complet
  d'icônes iOS (120/152/167/180) et Android/PWA (48→512 + maskable 192/512),
  splash iPhone, manifest et theme-color alignés.
- Migration automatique des clés localStorage `blackout-*` → `la-tournee-*`.
- Brand book réécrit : `design-system/la-tournee/MASTER.md`.

### Added - Nouveaux jeux & personnalisation
- **Quitte ou Trinque** : quiz culture G à cagnotte (60 questions originales) -
  bonne réponse : cumule ou distribue ; mauvaise : tu prends ta cagnotte.
- **Le Podium** : le juge classe la table selon une question secrète, le groupe
  doit retrouver la vraie question parmi 4 propositions (40 questions).
- **L'Enchère** : surenchères sur un thème (« je peux en citer 8 ! »), défi
  « tu mens ! » chronométré 60 s (50 thèmes).
- **Le Procès** (ex-Tribunal, renommé) : chaque joueur écrit désormais une
  accusation secrète en début de partie (pass-the-phone), tirage aléatoire,
  défense, puis vote à main levée.
- **Mes règles** : création de règles personnalisées (texte, pénalité, jetons
  {player}/{player2}, modes ciblés), persistées sur l'appareil, injectées dans
  les modes à prompts et en segments supplémentaires de la Roulette.
- **Borderland** : choix de 1 à 3 paquets (52-156 cartes), jokers (2 par paquet,
  règle « carte blanche »), mode cartes aléatoires à l'infini réservé premium ;
  52 cartes au design unique (pips réels 2-10, figures V/D/R en miroir, jokers).

### Fixed - Zones mortes & « bug du trèfle »
- Couche de navigation history/popstate : le bouton retour Android/navigateur
  navigue dans l'app au lieu de la fermer ; les modales se ferment au retour ;
  toast « Appuie encore pour quitter » sur l'accueil ; confirmation avant de
  quitter une partie de Borderland entamée.
- Plus aucun écran noir (`return null`) ni écran sans issue : bouton retour sur
  l'écran joueurs, boutons « quitter » repositionnés sous l'encoche
  (`top-safe`), utilitaires safe-area en plugin Tailwind, échelle z-index
  tokenisée (le bandeau cookies ne recouvre plus les CTA).
- **Le Guess corrigé** : toutes les cartes arrivent face cachée - une carte
  cachée n'est plus forcément un trèfle, et la mise du contest n'est plus
  révélée avant le retournement de la carte.
- Les pénalités d'un contest perdu sont enfin créditées au récap de session ;
  le texte partagé reflète le vrai classement des modes à prompts.

### Accessibility
- Zoom pinch réactivé (suppression de `user-scalable=no`), `touch-action:
  manipulation`, cibles tactiles ≥ 44 px, `aria-live` sur les résultats,
  fermeture Escape partout, labels français accentués, contrastes AA sur la
  nouvelle palette claire.

## [0.6.0] - 2026-08-01

### Added
- Pages légales (`src/components/legal`) : mentions légales, politique de confidentialité,
  CGU/CGV, rendues depuis le contenu source `blackout-content/legal/*.md` en composants TSX
  (pas de dépendance markdown), nouvelles routes `AppScreen` (`mentions-legales`,
  `confidentialite`, `cgu`), liens accessibles depuis le pied de page du hub.
- Bandeau de consentement cookies RGPD (`CookieConsent`, `consentStore`) conforme à la spec
  CNIL (`cookie-banner-spec.md`) : deux niveaux (bandeau + personnalisation granulaire),
  boutons "Tout refuser" / "Accepter l'analyse" de même poids visuel, aucune case pré-cochée,
  aucun traceur avant choix explicite, consentement versionné et expirant à 6 mois, entrée
  "Cookies" dans le pied de page pour rouvrir le panneau à tout moment.
- Analytics produit consenti (`src/lib/analytics.ts`, PostHog EU Cloud) : initialisation
  uniquement après consentement analytics, `opt_out`/`reset` si le consentement est retiré,
  événements typés `mode_started`, `session_completed`, `premium_paywall_viewed`,
  `consent_updated` branchés sur le hub et `SessionRecap`.
- Infra premium RevenueCat Web (`src/lib/billing.ts`, sandbox `VITE_REVENUECAT_TEST_STORE_KEY`,
  SDK chargé dynamiquement) : `entitlementStore` fait un `getCustomerInfo()` best-effort au
  démarrage avec fallback sur le cache localStorage en cas d'échec (offline, pas de clé),
  `PremiumPaywallModal` affiche les packs premium débloqués et le prix live si l'offering
  RevenueCat est disponible, sinon "Bientôt disponible". Achat réel désactivé derrière
  `VITE_BILLING_ENABLED` tant que Stripe n'est pas connecté dans le dashboard RevenueCat.
- 15 nouveaux tests Vitest (`consentStore`, `CookieConsent`) - 76 tests au total - garantissant
  qu'aucun événement PostHog ne part avant un choix explicite et que le refus fonctionne
  réellement (pas de dark pattern).

### Changed
- `vite.config.ts` : chunks vendor dédiés `vendor-analytics` et `vendor-billing` pour isoler
  ces SDK du bundle principal.

## [0.5.1] - 2026-08-01

### Changed
- Dos de carte : nouvel asset SVG signature (`public/card-back.svg`, pique néon + lettre B en
  path géométrique, double liseret, motif losanges) affiché via `<img>` dans `PlayingCard`,
  remplace les éléments décoratifs CSS du dos ("card back asset").

## [0.5.0] - 2026-08-01

### Added
- Moteur multi-modes générique (`src/core/engine`) : registre de 10 modes (`modeRegistry`),
  session de prompts pure et testée (`promptSession` - pile mélangée sans répétition, rotation
  de tour, règles persistantes avec expiration par nombre de tours, rôles permanents jusqu'à
  remplacement), interpolation `{player}` / `{player2}` (`interpolate`), extension des pénalités
  aux modes de prompts (`penalties`), schéma zod strict aligné sur `content.schema.json`.
- 7 modes de prompts jouables via un écran générique (`PromptGameScreen`) : Le Meneur (picolo),
  Action ou Vérité, Je n'ai jamais, Qui de nous, Tu préfères, C'est un 10 mais, 7 Secondes.
- Le Tribunal (accusé aléatoire, vote coupable/innocent à main levée, verdict majoritaire) et
  La Roulette (roue animée à 8 segments de gages/pénalités) - modes embarqués, sans pack.
- Pipeline de contenu reproductible (`scripts/sync-content.mjs`, `npm run sync-content`) :
  synchronise les 7 packs gratuits du repo `blackout-content` en JSON commité, et extrait la
  métadonnée des 5 packs premium dans `src/content/premium-catalog.json` pour les tuiles
  verrouillées du hub.
- Gating premium (stub `entitlementStore`, `isPremium: false`) : tuiles et packs premium
  affichent un cadenas et une modale "BlackOut Premium arrive bientôt", sans paiement réel (M6).
- Hub refondu : grille bento des 10 modes, sélecteur de pack (gratuit jouable / premium
  verrouillé) pour les modes qui en ont plusieurs, avertissement inline si le nombre de joueurs
  est insuffisant pour un mode.
- 47 nouveaux tests Vitest sur le moteur (rotation, expiration des règles, remplacement de rôle,
  non-répétition, filtrage par `minPlayers`, validation zod, registre de modes) - 61 tests au total.

### Changed
- `App.tsx` route désormais `game` via le registre de modes (lazy loading par mode) ; Le
  Borderland garde son flux dédié (`BorderlandScreen`, extrait tel quel de l'ancien `App.tsx`).
- `SessionRecap` accepte un `penaltyCounts` générique pour être réutilisé par tous les modes de
  prompts, en plus du calcul historique `drinksGorgees`/`drinksShots` du Borderland.
- `appStore` gagne `activeMode` (quel mode du registre est actif) et `setActiveMode`.

### Removed
- `src/data/prompts.ts` et les types `PromptGameType`/`PromptGameConfig` (contenu français en
  dur) - remplacés par le pipeline de contenu `blackout-content` + le moteur multi-modes.

## [0.4.0] - 2026-08-01

### Changed
- Conformite stores (Apple App Store 1.4.3, Google Play) : plus aucune mention d'alcool dans l'app. Le jeu distribue des penalites abstraites, le groupe decide de leur nature dans la vraie vie.
- Sweep complet des chaines FR visibles : "jeux a boire" -> "jeux de soiree", "gorgee(s)" -> "penalite(s)", "SHOT(S)" -> "PENALITE MAJEURE", "il boit" -> "il prend une penalite", "A consommer avec moderation" -> "Jouez responsable."
- `calculatePenalty` affiche "N penalite(s)" et "PENALITE MAJEURE (xN)" - les valeurs internes de `PenaltyUnit` ('gorgees' | 'SHOT') restent inchangees, aucun breaking change de schema.
- SessionRecap : stats et texte de partage neutres (penalites / majeures), icone Wine remplacee par Zap.
- Prompts nettoyes des references a l'alcool, README + meta description + manifest PWA reformules "Collection de jeux de soiree".

## [0.3.0] - 2026-08-01

### Added
- Rebranding complet "Neo-Tokyo Borderland" : palette noir profond + neon rouge, carte blanche geante signature, tokens partages (blackout-content).
- Nouveau logo (carte + pique + halo neon), favicon et icones PWA regenerees (script sharp reproductible).
- Polices self-hosted optimisees (woff2 subset latin, font-display swap, preload) : Anton, Space Grotesk, IBM Plex Mono. Zero CDN.
- Grille bento du hub avec tuiles de modes verrouillees, stagger d'apparition.
- Accessibilite : MotionConfig reducedMotion, cibles 44px, focus ring neon, safe-area, ARIA clavier sur la carte.

### Changed
- Purge du theme casino (vert feutrine, or, Cinzel/Playfair/Montserrat) et de la palette neon legacy (NeonColor).
- Correction des accents sur toutes les chaines FR visibles.

## [0.2.0] - 2026-08-01

### Added
- Vitest test suite covering the pure Borderland game logic (deck integrity, penalty units, contest multipliers, player rotation).
- ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh) - `npm run lint` now works.
- Global `ErrorBoundary` with a recovery screen.
- `vercel.json` (SPA rewrite, immutable asset caching) - deployment moves from Apache to Vercel.
- GitHub Actions CI: lint, tests, build, typography guard, gitleaks secret scanning.
- Defensive `.gitignore` patterns (build artifacts, secrets, `.vercel`).

### Changed
- Pure game logic extracted from the store to `src/core/borderland.ts` (testable without DOM).
- `App.tsx`: store subscription via hook instead of `getState()` in render, screen redirect moved to an effect.
- PWA manifest: name and `theme_color` aligned with the design, removed references to missing assets.

### Fixed
- Clubs cards no longer flash their face before the flip: reveal state is now reset during render (not in an effect after paint) and the card mounts directly back-side up (`initial={false}`). "Le Guess" stays guessable.
- Share recap text: forbidden middle dots replaced, wrong domain corrected to blackout.beloucif.com.

### Removed
- i18next stack (unused: no component consumed translations) - FR only, content schema keeps a `lang` field for later.
- Committed build artifacts (`vite.config.js`, `*.tsbuildinfo`).
- `public/.htaccess` (replaced by Vercel config).

## [0.0.1] - 2026-04-14

Initial version - Le Borderland card game, casino theme, PWA.
