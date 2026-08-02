# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

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
