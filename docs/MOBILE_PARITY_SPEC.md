# Spec de parite mobile - 5 modes manquants (Meskova)

Plan de reference pour porter sur Android et iOS les 5 modes de jeu presents cote web
mais absents des apps mobiles. Etabli le 2026-08-03 (analyse read-only du code reel).

## Point d'architecture determinant

Deux familles de modes cote web :
- **Modes pack-driven** (picolo, truthOrDare, etc.) : contenu dans `content/fr/packs/*.json`,
  moteur generique `PromptSession`. Deja portes sur mobile.
- **Modes embarques** (les 5 a porter) : aucun JSON, contenu en dur dans `src/content/*.ts`
  avec des types bespoke. Ils n'entrent PAS dans `ContentPackSchema`, ne passent PAS par
  `PackRepository`/`PackCatalog`, et le pipeline `sync_content.py` ne les couvre PAS. Il faut
  bundler leur contenu comme constantes natives (`*Content.kt` / `*Content.swift`), hors pipeline.

**Piege recap/penalites** : cote web, chaque mode embarque nomme (tribunal, quiz, ranking)
tient un `penaltyCounts: Record<playerId, number>` local a l'ecran et le passe a `SessionRecap`.
Cote mobile, `RecapScreen.kt` / `RecapView.swift` lisent `Player.penaltiesStandard/Major`
(immutables, alimentes seulement par Borderland) : il n'existe AUCUN equivalent mobile de
`SessionRecap` a penaltyCounts. Donc chaque nouveau mode nomme doit embarquer SON PROPRE recap
local (composable/vue interne sur un `Map<playerId, Int>`), jamais reutiliser `RecapScreen`.
Roulette et auction ne nomment personne : pas de recap, on compte les tours, `track(session_completed)`,
retour hub.

**Enums a etendre** : Android `GameMode` (`core/.../ContentPack.kt`) et iOS `GameMode`
(`ContentPack.swift`) ont deja TRIBUNAL/ROULETTE mais PAS quiz/ranking/auction. Ajouter
`QUIZ`/`RANKING`/`AUCTION` (Android) et `quiz`/`ranking`/`auction` (iOS) pour aligner sur les
13 modes de `src/core/engine/modeRegistry.ts`.

**Navigation** : modes embarques = routes dediees (pas `prompt/{mode}` faute de `PromptSession`).
Android routes string + NavHost ; iOS `AppState.Route` enum + switch `RootView.swift`. Hub :
ajouter des tuiles explicites en dur (le hub est pack-driven, il n'affiche pas ces modes).

## Ordre d'implementation recommande

| # | Mode | Web (ref) | Effort | Justification |
|---|------|-----------|--------|---------------|
| 1 | roulette (La Roue du Destin) | `RouletteScreen.tsx`, `content/roulette.ts` | S | Deja dans l'enum, aucun joueur, aucun recap, aucun moteur. Valide la chaine route+hub+ecran embarque. |
| 2 | tribunal (Le Pilori) | `TribunalScreen.tsx`, `content/tribunal.ts` | M | Deja dans l'enum. Introduit le pattern recap local a penaltyCounts + collecte multi-joueurs. |
| 3 | auction (La Criee) | `AuctionScreen.tsx`, `content/auction.ts` | M | Ajout enum + pattern timer natif. Pas de recap. |
| 4 | quiz (Quitte ou Double) | `quizSession.ts`, `QuizScreen.tsx` | L | Ajout enum + premier moteur pur porte (cagnotte quitte-ou-double) avec tests + recap local. |
| 5 | ranking (Le Tableau d'Honneur) | `rankingSession.ts`, `RankingScreen.tsx` | L | Le plus complexe : 6 phases, information cachee (question secrete), penalites asymetriques (3 vs 1). |

Regle transverse par mode : creer d'abord le contenu natif + le moteur pur teste
(`:core` / `LaTaverneCore`), puis la route, puis l'ecran, puis la tuile hub, build vert a chaque etape.

## Fichiers a toucher

**Android** - a modifier : `core/.../ContentPack.kt` (enum +3), `app/.../ui/LaTaverneNav.kt`
(routes), `app/.../ui/LaTaverneApp.kt` (NavHost), `app/.../ui/screens/HubScreen.kt` (tuiles +
`modeDisplayName`). A creer : `core/.../{Roulette,Tribunal,Quiz,Ranking,Auction}Content.kt`,
`core/.../{Tribunal,Quiz,Ranking}Session.kt`, `app/.../ui/{Quiz,Ranking}ViewModel.kt`,
`app/.../ui/screens/{Roulette,Tribunal,Auction,Quiz,Ranking}Screen.kt`.

**iOS** - a modifier : `LaTaverneCore/.../ContentPack.swift` (enum +3), `App/AppState.swift`
(Route +5), `Screens/RootView.swift` (switch), `Screens/HubView.swift` (tuiles + `glyph`). A
creer : `LaTaverneCore/.../{Roulette,Tribunal,Quiz,Ranking,Auction}Content.swift`,
`{Tribunal,Quiz,Ranking}Session.swift`, `Screens/{Roulette,Tribunal,Auction,Quiz,Ranking}View.swift`.

## Pieges par mode

- **roulette** : 8 segments fixes, easing casino ~3.2s, respecter reduced-motion. Segments perso
  (`customRulesStore`) hors scope v1. Ne pas toucher `Player` ni `RecapScreen`.
- **tribunal** : `pickAccused` exclut l'auteur de l'accusation ; penalite = +1 simple ; interpolation
  `{player}` = nom de l'accuse ; recap local ; `minPlayers=3` ; gratuit.
- **auction** : timer 60s avec cleanup imperatif a la sortie (coroutine annulee / Timer invalide
  `onDisappear`) ; `pickTheme` evite la repetition ; pas de recap ; themes perso hors scope v1.
- **quiz** : porter fidelement les 4 transitions de cagnotte (`answerCorrect/Wrong`, `distributePot`,
  `keepPot`) ; points re-roll a chaque `advance` ; `Random` injectable pour tests ; recap local.
- **ranking** : la question reste SECRETE jusqu'au reveal (ne jamais l'afficher en `guessing`/`reveal`) ;
  `buildRound` = 3 leurres + la vraie, melanges, distincts ; `minPlayers=4` ; penalites 3 (juge) vs 1
  (groupe) ; `Random` injectable ; recap local.

## Dette (hors scope v1, a documenter)

Contenu perso runtime absent sur mobile : segments roulette perso (`customRulesStore`), themes Criee
perso (`customThemesStore`), regles perso Borderland. Les 5 modes embarques fonctionnent avec leurs
constantes fixes ; l'editeur bottom-sheet de la Criee et les segments perso sont a planifier en v2.
