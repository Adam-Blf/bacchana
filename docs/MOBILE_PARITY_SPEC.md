# Parite web / Android / iOS - etat des lieux

**Releve le 2026-09-14**, en lisant les trois depots, pas en se fiant a ce
document. C'est la lecon que `STORE_ACCOUNTS.md` a apprise a ses depens sur
l'identifiant de bundle : une page de documentation qui affirme un fait
verifiable coute plus cher que pas de page du tout. Les inventaires ci-dessous
sont donc dates, et se refont a la lecture des depots au moment du geste.

> **Ce document a ete entierement reecrit.** Sa version precedente, du
> 2026-08-03, planifiait le portage de cinq modes embarques - roulette,
> tribunal, criee, quiz, tableau d'honneur. **Ces cinq modes sont portes, sur
> les deux plateformes**, enums comprises. Le plan etait donc devenu une carte
> d'un territoire deja traverse, et quelqu'un qui l'aurait suivi aurait
> refait un travail fait. Ce qui reste de vrai - les pieges d'architecture de
> ces modes, et la dette de contenu perso - est conserve plus bas.

Un audit des deux applications natives, mene le meme jour et avec les memes
regles que celui du web, est dans `AUDIT_NATIF.md`. Il dit aussi, et surtout,
ce qu'il n'a PAS pu mesurer faute d'emulateur.

## Trois depots, pas un

| Depot | Ce qu'il contient | Dernier envoi |
|---|---|---|
| `bacchana` | L'application web (React + Vite), la reference | 2026-09-14 |
| `bacchana-android` | Une application **native Kotlin/Compose**, pas une enveloppe | 2026-08-31 |
| `bacchana-ios` | Une application **native Swift/SwiftUI**, pas une enveloppe | 2026-08-31 |
| `bacchana-content` | Les paquets de cartes, source unique des trois | - |

Les deux applications mobiles sont des reimplementations natives : leurs
moteurs vivent dans `:core` (Kotlin) et `BacchanaCore` (Swift), avec leurs
propres tests. Elles ne chargent pas le web dans une vue. **Il n'y a donc
aucune enveloppe native a ajouter au depot web** - ni Capacitor, ni Cordova,
ni TWA. En ajouter une ouvrirait une troisieme strategie de publication en
concurrence des deux qui existent.

## L'ecart, au 2026-09-14

### Les modes : 13 des 15 sont portes

Portes sur les deux plateformes : borderland, picolo, truthOrDare,
neverHaveIEver, whoAmong, wouldYouRather, itsA10But, sevenSeconds, tribunal,
roulette, auction, quiz, ranking.

Absents des deux : **barometre** (Le Barometre) et **fauxFrere** (Le Faux
Frere), les deux derniers modes ajoutes au web. Ils ne sont ni dans
`GameMode` (Kotlin), ni dans `GameMode` (Swift).

### Les ecrans hors jeu

| Ecran web | Android | iOS | Remarque |
|---|---|---|---|
| Accueil / inscription des joueurs | oui (`WelcomeScreen`) | oui (`WelcomeView`) | Le web l'a scinde en accueil + intro ; le natif le tient en un ecran |
| Hub | oui | oui | |
| Reglages | oui | oui | |
| Paywall | oui | oui | |
| Recap de fin | oui | oui | |
| Banniere de consentement | oui | oui | |
| **Porte d'age** | non | non | Les deux portent un avertissement « 18 ans et plus » sur l'accueil, pas une porte bloquante |
| **Palmares (les scores)** | non | non | Refait a neuf cote web le 2026-09-14 |
| **Catalogue des jeux** | non | non | Ajoute au web le 2026-09-14 |
| **Regles maison** | non | non | |
| **Regles / regles d'un mode** | non | non | |
| Pages legales | non, et c'est voulu | non, et c'est voulu | Les deux renvoient vers les pages web hebergees. Un contenu juridique duplique en trois endroits derive ; une URL n'a qu'une version |

### Ce que le web a gagne depuis le dernier envoi mobile

Trente-quatre changements en quinze jours, dont plusieurs touchent des regles
partagees et pas seulement la presentation : la regle des quatre joueurs
appliquee aux quatre points d'entree, le jeu d'icones passe a Phosphor, la
reparation de « Pousser la porte » qui fermait l'application au retour, le
paysage et les pliables, les cibles tactiles a 44 points, et le changement
d'ecran ramene de 1900 a 210 ms.

**Aucun de ces changements n'est automatiquement vrai cote natif.** Les trois
implementations partagent leur contenu (`bacchana-content`), pas leur code.

## Pieges d'architecture des modes embarques

Conserves de la version du 2026-08-03 : ils decrivent comment les cinq modes
ont ete portes, et s'appliquent tels quels aux deux qui restent.

Deux familles de modes cote web :
- **Modes pack-driven** (picolo, truthOrDare...) : contenu dans
  `content/fr/packs/*.json`, moteur generique `PromptSession`.
- **Modes embarques** : aucun JSON, contenu en dur dans `src/content/*.ts`
  avec des types bespoke. Ils n'entrent PAS dans `ContentPackSchema`, ne
  passent PAS par `PackRepository`/`PackCatalog`, et le pipeline de contenu ne
  les couvre PAS. Leur contenu se bundle en constantes natives
  (`*Content.kt` / `*Content.swift`), hors pipeline.

**Piege recap et penalites** : cote web, chaque mode embarque qui nomme
quelqu'un (tribunal, quiz, ranking) tient un `penaltyCounts` local a l'ecran.
Cote mobile, `RecapScreen.kt` / `RecapView.swift` lisent
`Player.penaltiesStandard/Major`, immuables et alimentes seulement par
Borderland : il n'existe aucun equivalent mobile de `SessionRecap` a
`penaltyCounts`. Chaque mode nomme embarque SON PROPRE recap local, jamais
`RecapScreen`.

**Navigation** : modes embarques = routes dediees (pas `prompt/{mode}`, faute
de `PromptSession`). Android : routes string + NavHost. iOS : `AppState.Route`
+ switch dans `RootView.swift`. Le hub etant pack-driven, il faut une tuile
explicite en dur.

Regle transverse : d'abord le contenu natif et le moteur pur teste
(`:core` / `BacchanaCore`), puis la route, puis l'ecran, puis la tuile hub,
build vert a chaque etape.

### Par mode deja porte, ce qui avait ete releve

- **roulette** : 8 segments fixes, easing casino ~3,2 s, respecter
  reduced-motion. Ne touche ni `Player` ni `RecapScreen`.
- **tribunal** : `pickAccused` exclut l'auteur de l'accusation ; penalite
  +1 simple ; interpolation `{player}` = nom de l'accuse ; recap local ;
  `minPlayers=3` ; gratuit.
- **auction** : timer 60 s avec nettoyage imperatif a la sortie (coroutine
  annulee / `Timer` invalide dans `onDisappear`) ; `pickTheme` evite la
  repetition ; pas de recap.
- **quiz** : porter fidelement les quatre transitions de cagnotte
  (`answerCorrect/Wrong`, `distributePot`, `keepPot`) ; points retires a
  chaque `advance` ; `Random` injectable ; recap local.
- **ranking** : la question reste SECRETE jusqu'au reveal ; `buildRound` =
  3 leurres + la vraie, melanges, distincts ; `minPlayers=4` ; penalites 3
  (juge) contre 1 (groupe) ; `Random` injectable ; recap local.

## Dette connue

Contenu perso au runtime, absent des deux plateformes mobiles : segments de
roulette perso (`customRulesStore`), themes de Criee perso
(`customThemesStore`), regles perso Borderland. Les modes embarques
fonctionnent avec leurs constantes fixes.

Le palmares, le catalogue et l'ecran de regles maison n'ont pas d'equivalent
mobile : ce n'est pas de la dette de portage, c'est un choix a faire - trois
ecrans a ecrire deux fois, pour une application dont les stores ne les
exigent pas.
