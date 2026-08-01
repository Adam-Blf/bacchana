# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

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
