# Audit des deux applications natives - 2026-09-14

Les stores ne recoivent pas l'application web. Ils recoivent `bacchana-android`
et `bacchana-ios`, deux reimplementations natives. Cet audit leur applique les
regles que l'audit web du 2026-09-13/14 a etablies et verrouillees par des
gardes.

## Ce que cet audit N'A PAS pu mesurer, et pourquoi

**Il est entierement fait sur les sources.** Aucune des deux applications n'a
ete rendue, pas une fois. L'environnement n'a ni SDK Android, ni emulateur, ni
Xcode, ni simulateur ; et Maven Central a refuse les dependances de
compilation (HTTP 429, deux tentatives), donc meme les tests unitaires purs de
`:core` - qui ne demandent pas le SDK - n'ont pas pu tourner.

Restent donc NON VERIFIES, et il ne faut pas lire leur absence ici comme un
feu vert :

- la surface reellement tactile des commandes. Les deux plateformes ecrivent
  des planchers de 44 points a peu pres partout, et sur iOS le `.frame(44, 44)`
  est tantot pose sur le `Button`, tantot sur l'`Image` a l'interieur du label -
  deux formes qui ne se testent pas pareil. L'audit web a produit CINQ methodes
  de detection fausses avant d'en trouver une juste : deduire une zone tactile
  d'une lecture de source est precisement ce qui ne marche pas ;
- le rendu en paysage et sur pliables ;
- le contraste a l'ecran ;
- les temps de transition.

Ce qui suit est donc ce qu'on peut etablir sans rendre : des valeurs ecrites
dans les sources, comparees entre les trois depots.

---

## 1. Le lexique alcool - guideline App Store 1.4.3

**Les deux applications affichent « Quitte ou Trinque ».** Le web a renomme ce
mode « Quitte ou Double » le 2026-08-05 et a supprime « trinque » de tout son
code, precisement pour la guideline 1.4.3 - la garde `check_alcohol_lexicon`
existe pour que ca ne revienne pas. Aucune des deux applications natives n'a
suivi.

Texte vu par le joueur, Android :

| Fichier | Ligne | Chaine |
|---|---|---|
| `res/values/strings.xml` | 120 | `quiz_title` = « Quitte ou Trinque » |
| `res/values/strings.xml` | 130 | `quiz_keep` = « Je cumule (quitte ou trinque) » |
| `res/values/strings.xml` | 165 | `wyr_reveal_button` = « Voir qui trinque » |
| `res/values/strings.xml` | 167 | « Egalite ou vote unanime : personne ne trinque ! » |
| `res/values/strings.xml` | 168 | « %1$s trinque(nt) : %2$d penalite(s) chacun ! » |
| `ui/screens/HubScreen.kt` | 314 | `GameMode.QUIZ -> "Quitte ou Trinque"` (en dur, hors ressources) |

Texte vu par le joueur, iOS :

| Fichier | Ligne | Chaine |
|---|---|---|
| `Screens/HubView.swift` | 252 | `Text("QUITTE OU TRINQUE")` |
| `Screens/HubView.swift` | 269 | `accessibilityLabel("Quitte ou Trinque, le quiz")` |
| `Screens/QuizView.swift` | 64 | `Text("QUITTE OU TRINQUE")` |
| `Screens/QuizView.swift` | 253 | « Je cumule (quitte ou trinque) » |
| `Screens/WouldYouRatherView.swift` | 226 | « Egalite ou unanimite : personne ne trinque ! » |

Le reste des occurrences est en commentaire ou en nom de symbole, invisible du
joueur : a nettoyer par coherence, pas par urgence.

**Deux cas a trancher, pas a corriger machinalement.** Le lexique du web
interdit « verre », ce qui attrape `RouletteContent` (« Rapporte un verre
d'eau ») et `WouldYouRatherContent` (« Renverser ton verre sur elle »). Le
premier est de l'eau ; le second est ambigu. Et « pates trop cuites » dans
`RankingContent` est un faux positif du motif `cuite`. Une garde qui accuse ce
qui va bien finit desactivee : si le lexique est porte en natif, ces trois-la
se traitent d'abord.

## 2. La regle du nombre de joueurs

Le web l'applique aux quatre points d'entree et la teste (20 tests,
`regleDesQuatre.test.ts`), avec un seuil complet CALCULE -
`max(minPlayers)` = 4 - jamais ecrit.

**iOS ne filtre pas du tout par nombre de joueurs.** Le hub ne connait qu'un
verrou, le premium :

```swift
// Bacchana/Screens/HubView.swift:38
isUnlocked: !entry.premium || appState.entitlements.isPremium
```

Il n'y a pas une seule lecture de `playerCount` dans `HubView.swift`. Le seul
plancher de toute l'application est `canStart: playerNames.count >= 2`
(`App/AppState.swift:162`). Une tablee de deux peut donc ouvrir Le Tableau
d'Honneur, qui demande un juge plus trois candidats, et Le Pilori, qui demande
un accusateur, un accuse et un votant.

**Android filtre, mais aplatit les modes a paquet.** Chaque tuile porte son
`minPlayers`, et les modes embarques sont justes : roulette 1, tribunal 3,
criee 2, quiz 2, ranking 4. En revanche :

```kotlin
// ui/screens/HubScreen.kt:133
items(freeModes) { mode -> ModeTile(..., minPlayers = 2, ...) }
```

Tous les modes a paquet recoivent 2. Or le web en place trois a 3 :
`picolo` (Le Taulier), `whoAmong` (Qui de nous) et `barometre`. Une tablee de
deux ouvre donc sur Android deux jeux que le web lui refuse.

## 3. Les jetons de couleur ont diverge - les trois applications n'ont plus la meme marque

C'est le point le plus visible, et le plus facile a verifier : il suffit de
lire les trois fichiers.

| Role | Web `tokens.css` | Android `BacchanaPalette.kt` | iOS `ThemePalette.swift` |
|---|---|---|---|
| `ink` | `#2a1140` (pourpre) | `#111111` | `#111111` |
| `ink-secondary` | `#4a2470` | `#44444A` | `#44444A` |
| `ink-muted` | `#6b4a8c` | `#6B6B70` | `#6B6B70` |
| `neon` (l'accent) | `#5b2c87` (**pourpre**) | `#FA5600` (**orange**) | `#FA5600` (**orange**) |
| `neon-deep` | `#4c2371` | `#E24E00` | `#E24E00` |
| `orange-ink` | `#5b2c87` | `#C74300` | `#C74300` |
| `surface` | `#fffdf8` | `#FFFFFF` | `#FFFFFF` |
| `bg-raised` | `#f3e9dc` | `#FFF3E0` | `#FFF3E0` |

Le web est passe au pourpre ; les deux natifs sont restes orange. Son fichier
de jetons le dit lui-meme : « `neon` garde son nom historique de jeton, mais
ce n'est [plus orange] ».

Et l'en-tete de `BacchanaPalette.kt` interdit exactement cette derive :

> Mirrors `docs/DESIGN_TOKENS.md` and `src/styles/tokens.css` on the web -
> same role names, same hex - do not hand-tune a value on one platform without
> updating the others.

La consigne etait juste ; c'est le fait qu'elle ne soit qu'une consigne qui a
laisse passer. Trois fichiers de valeurs recopiees a la main derivent des la
premiere correction - c'est le meme raisonnement qui fait lire les jetons
depuis `tokens.css` dans les maquettes SVG du web plutot que de les y recopier.

**A noter au credit du natif** : les deux plateformes gardent leur contraste
par un test (`BacchanaPaletteContrastTest` cote Kotlin), et documentent
finement les roles qui ne suivent PAS le theme (`tileInk`, `cardAccent`,
`onStatus`) - avec la raison, y compris le defaut reel qui les a fait naitre
(« du blanc sur du jaune c'est illisible »). Ce n'est pas un travail a refaire,
c'est un travail a re-alimenter avec les bonnes valeurs.

## 4. Deux modes sur quinze manquent

`barometre` (Le Barometre) et `fauxFrere` (Le Faux Frere) ne sont dans aucun
des deux `GameMode`. Ce n'est pas un blocage de publication - les natifs en
ont treize - mais c'est l'ecart de contenu, et il se creuse.

## 5. L'orientation n'est bornee ni d'un cote ni de l'autre

**Android** : `AndroidManifest.xml` ne pose aucun `screenOrientation`, et
`MainActivity` declare `configChanges="orientation|screenSize|keyboardHidden"` -
elle encaisse donc la rotation elle-meme, sur telephone comme sur pliable.

**iOS** : `TARGETED_DEVICE_FAMILY: "1,2"`, donc une application universelle.
L'iPhone est bien verrouille en portrait, mais `UISupportedInterfaceOrientations~ipad`
autorise les quatre orientations. Apple examinera donc l'application sur iPad,
en paysage.

L'audit web a trouve deux defauts reels en paysage - l'intro devenait une
impasse, la roue debordait - sur une application dont la mise en page est
pourtant plus souple qu'une mise en page native. Personne n'a regarde ces deux
cas-la. C'est le premier endroit ou brancher un emulateur.

## 6. Ce que le natif n'a pas, et qui n'est pas forcement de la dette

Pas de porte d'age bloquante (les deux affichent un avertissement
« 18 ans et plus » sur l'accueil), pas de palmares, pas de catalogue, pas de
regles maison, pas d'ecran de regles. Les pages legales sont volontairement
absentes : les deux renvoient vers les pages web, et un texte juridique n'a
qu'une version - c'est le bon choix, documente des deux cotes.

Pour le reste, c'est un arbitrage, pas un retard : trois ecrans a ecrire deux
fois, que ni Apple ni Google n'exigent.

---

## Par quoi commencer

1. **Le lexique alcool**, sur les deux plateformes. C'est le seul point de cet
   audit qui porte un risque de REJET, et c'est le moins cher : des chaines.
2. **Les jetons de couleur.** C'est le plus visible - les trois applications
   n'ont plus la meme marque - et la correction est mecanique. La vraie
   question est de ne plus recopier : generer `BacchanaPalette.kt` et
   `ThemePalette.swift` depuis `tokens.css`, comme le web genere ses maquettes.
3. **La regle du nombre de joueurs**, iOS d'abord (absente) puis Android
   (aplatie sur les modes a paquet).
4. **Un emulateur et un simulateur**, pour tout ce que cet audit n'a pas pu
   regarder - et qui est, si l'on en croit l'audit web, la ou se trouvaient
   les defauts qu'aucune lecture n'aurait attrapes.
