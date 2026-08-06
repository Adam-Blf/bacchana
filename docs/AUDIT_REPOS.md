# Bacchana - Audit sante des 4 repos (2026-08-03)

Audit agence des 4 depots (conseil : cadre, chef de produit, developpeur, QA,
user researcher). Etat a la date, backlog priorise en fin de doc. Complement de
`MARKET.md` (niche) et `MOBILE_PARITY_SPEC.md` (pattern de portage).

## Vue d'ensemble

| Repo | Stack | Version | Tests | CI | Sante |
|---|---|---|---|---|---|
| la-taverne (web) | React 19 + Vite + TS, Zustand, Vitest | 0.22.1 | 15 fichiers | lint/test/build + garde typo + gitleaks | bonne |
| bacchana-content | packs JSON + ajv | 1.8.1 (desync) | 0 (dir vide) | validate | correcte, dette doc |
| bacchana-android | Kotlin 2.0 / Compose, minSdk 26 | 0.7.0 | 9 fichiers / 100 tests | core:test + assembleDebug + lint | bonne |
| bacchana-ios | SwiftUI + LaTourneeCore (XcodeGen) | 0.8.0 | 8 fichiers / 53 tests | xcodebuild test macos-15 | bonne |

Constat transverse : les 4 repos sont sains, `main` propre, CI vertes, parite des
13 modes web sur Android + iOS. Trois faiblesses structurelles reelles ressortent,
detaillees plus bas.

## la-taverne (web)

- Structure claire : `src/{core/engine, content, components/{game,screens,ui,premium,legal}, stores, lib}`.
- Moteurs de mode purs et testes (RNG injectable), catalogue unique
  `src/core/engine/modeRegistry.ts` (`ModeDefinition`), dispatch lazy dans `App.tsx`.
- 0 TODO dans `src/`, deps modernes, garde typo em/en dash en CI.
- **Risques** :
  1. **Premium 100 % cote client** (`entitlementStore` + RevenueCat sandbox) : aucun
     garde serveur, un client modifie peut forcer `isPremium`. Acceptable en v1 gated
     (pas d'encaissement reel avant Stripe), a durcir avant paiements en prod.
  2. **Derive de doc 13 vs 10 modes** : la prose dit 13, la checklist et le Mermaid du
     README disent 10. A corriger (WS4).
  3. **Case de retractation non pre-cochee bloquant le paiement** encore listee "reste
     a implementer" (CHANGELOG 0.22.0) : gap conformite a fermer avant encaissement.

## bacchana-content

- 12 packs JSON (`content/fr/packs`), schema draft 2020-12 strict
  (`additionalProperties:false`), `validate.mjs` verifie l'unicite des ids + garde
  typo `/[--·]/` sur `text`/`textAlt`.
- **Risques** :
  1. **Version desynchronisee** : `package.json`/README = 1.8.1, CHANGELOG en tete =
     1.9.0 (bump oublie apres `gen_form_banner.py`). Pas de `sync_version`.
  2. **`tests/` vide** alors que le README les vend comme garant de parite
     cross-plateforme : aucune fixture reelle.
  3. **Pas de scan anti-alcool automatise** en CI, et garde typo limitee aux items de
     packs (pas aux `.md`). Le contenu sensible n'a pas de filet mecanique.
- Point cle : le JSON ne porte que les 7 modes a prompts. Les modes natifs
  (borderland, roulette, tribunal, quiz, ranking, auction) vivent hors JSON, en dur
  dans le code de chaque app.

## bacchana-android

- 2 modules : `:core` (JVM pur, 0 dep Android, tous les moteurs + contenu) + `:app`
  (Compose). 100 tests JUnit sur le core, RNG deterministe.
- **Risques** :
  1. **`docs/` vide** : aucun diagramme d'architecture Mermaid ni ADR malgre la regle.
  2. **Zero test UI/ViewModel** : couverture moteur seule, aucun `androidTest/`.
  3. **Signing release fail-open** : APK non signe si les env vars absentes
     (`build.gradle.kts`), a surveiller a la publication.
- 2 TODO assumes : stubs PostHog + RevenueCat gated (`BILLING_ENABLED=false`,
  `ANALYTICS_ENABLED=false`). Le paywall complet vit sur la branche non mergee
  `feat/android-paywall-and-icon` (WS3).

## bacchana-ios

- `LaTourneeCore` = framework XcodeGen (pas de `Package.swift`), `.xcodeproj` genere
  et gitignore, build/test CI-only (dev sous Windows). 53 tests XCTest, RNG injecte.
- **Risques** :
  1. **Aucun garde de parite** TS <-> Kotlin <-> Swift : les `*Session`/`*Content` sont
     des ports main du TS, derive silencieuse possible. C'est le seul risque structurel
     serieux du portage (partage avec Android).
  2. **Gating min-joueurs incoherent** : pas de `maxPlayers`, min hardcode par tuile,
     absent sur quiz/borderland/roulette/auction.
  3. **Billing = stub no-op** (`StubEntitlements`, `StubAnalytics`) alors que le premium
     en depend : a remplacer par RevenueCat + PostHog reels gated (WS3).
- 2 TODO (PostHog + RevenueCat), `shuffle<T>` duplique entre `QuizSession` et
  `RankingSession` (dette mineure).

## Backlog priorise (impact / effort)

| # | Action | Repo(s) | Impact | Effort | WS |
|---|---|---|---|---|---|
| 1 | Mode "Tu preferes" a vote A/B (mecanique propre, anti-4.3) | 3 apps | fort | moyen | WS1 |
| 2 | Contenu au max (80-100 / pack) + modes natifs etoffes | content + 3 apps | fort | eleve | WS2 |
| 3 | Paywall Android merge + RevenueCat/PostHog natifs (iOS + Android) | android + ios | fort | eleve | WS3 |
| 4 | Garde de parite contenu TS/Kotlin/Swift (compte d'items par mode) | 3 apps | moyen | moyen | WS3/4 |
| 5 | Sync version content + scan anti-alcool en CI | content | moyen | faible | WS4 |
| 6 | docs/ Android (Mermaid + ADR), derive doc 13/10 web | web + android | faible | faible | WS4 |
| 7 | Durcir le premium (garde serveur) avant encaissement | web | fort | eleve | bloque Stripe (Adam) |

Rien de bloquant cote code. Les blocages restants sont administratifs (comptes stores,
SIRET, Stripe, DNS), inchanges et hors perimetre agence.
