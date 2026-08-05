# Design tokens La Tournée - référence de portage (web, Android, iOS)

Ce document fait autorité pour la palette La Tournée. Toute implémentation native
(Kotlin/Compose sur `la-tournee-android`, Swift/SwiftUI sur `la-tournee-ios`) doit
reproduire ces valeurs à l'identique - hex, rôle et règle d'usage - sans
deviner ou réinterpréter. Source de vérité technique côté web :
`src/styles/tokens.css` (+ miroir Tailwind dans `tailwind.config.js`). Vue
d'ensemble marque/composants : `design-system/la-tournee/MASTER.md`.

Tous les ratios ci-dessous sont mesurés par la formule de luminance relative
WCAG 2.1 (`(L1 + 0.05) / (L2 + 0.05)`, L1 ≥ L2), pas estimés. Seuils de
référence : **AA texte normal** 4.5:1, **AA texte large** (≥ 24px normal ou
≥ 18.7px gras) 3:1, **AA objets UI non textuels** (bordures, contrôles) 3:1,
**AAA texte normal** 7:1.

## 1. Principe : deux thèmes, un seul univers narratif

Le produit s'appelle **La Tournée**. L'univers narratif du jeu (la taverne, le
comptoir, le taulier, la tablée, la pénalité, l'arrière-salle) reste
inchangé - seul le nom de marque affiché en façade a changé. Les tokens
ci-dessous n'ont pas de dépendance à ce renommage : ils s'appliquent tels
quels quel que soit le nom produit.

Bascule clair/sombre : attribut `[data-theme]` sur la racine (web) - `light`,
`dark`, ou absent (`system`, suit `prefers-color-scheme` / le thème OS natif
sur mobile). Aucune couleur codée en dur dans un composant : toujours passer
par le token.

## 2. Thème clair (papier)

| Token | Rôle | Hex | RGB |
|---|---|---|---|
| `bg` | Fond primaire (canvas) | `#FFF9F0` | 255 249 240 |
| `bg-raised` | Fond secondaire (bandes, inputs) | `#FFF3E0` | 255 243 224 |
| `surface` | Cartes, boutons secondaires | `#FFFFFF` | 255 255 255 |
| `surface-elevated` | Modales, bandeaux, popovers | `#FFEFD6` | 255 239 214 |
| `ink` | Texte principal, bordures, ombres | `#111111` | 17 17 17 |
| `ink-secondary` | Texte secondaire | `#44444A` | 68 68 74 |
| `ink-muted` | Légendes, labels discrets | `#6B6B70` | 107 107 112 |
| `neon` | Accent de marque (app) | `#FA5600` | 250 86 0 |
| `neon` (marketing) | Accent de marque (assets marketing uniquement) | `#FF5C00` | 255 92 0 |
| `neon-deep` | Déclinaison accent (aplats uniquement) | `#E24E00` | 226 78 0 |
| `neon-soft` | Déclinaison accent (aplats uniquement) | `#FF8A3D` | 255 138 61 |
| `orange-ink` | Orange utilisé comme **texte** (< 18px, non-gras) | `#B33D00` | 179 61 0 |
| `pop-yellow` | Aplat tuile / surbrillance | `#FFD029` | 255 208 41 |
| `pop-pink` | Aplat tuile | `#FF6FB2` | 255 111 178 |
| `pop-blue` | Aplat tuile | `#6E9BFF` | 110 155 255 |
| `pop-lime` | Aplat tuile / succès de jeu | `#9BE94C` | 155 233 76 |
| `card-face` | Fond des cartes à jouer (fixe, objet physique) | `#FFFFFF` | 255 255 255 |
| `card-ink` | Texte des cartes à jouer (fixe) | `#111111` | 17 17 17 |
| `card-red` | Pips rouges des cartes (fixe, **jamais** de texte UI) | `#C71F2D` | 199 31 45 |
| `danger` | Rouge sémantique UI (erreur, suppression, alerte) | `#C71F2D` (= card-red en clair) | 199 31 45 |
| `premium` | Or premium (sceau, badges) | `#855C12` | 133 92 18 |
| `success` | État de succès | `#177C50` | 23 124 80 |
| `warning` | État d'avertissement | `#B45309` | 180 83 9 |
| `border` | Bordure fine (dividers) | `rgba(17,17,17,0.15)` | - |
| `border-strong` | Bordure épaisse néobrutaliste (2-4px) | `#111111` | 17 17 17 |

### Ratios mesurés (texte sur `bg`, sauf mention)

| Token texte | Ratio vs `bg` | Seuil atteint |
|---|---|---|
| `ink` | 18.04:1 | AAA |
| `ink-secondary` | 9.24:1 | AAA |
| `ink-muted` | 5.06:1 | AA texte normal |
| `orange-ink` | 5.60:1 | AA texte normal (assombri le 2026-08-05, voir section 6) |
| `neon` | 3.14:1 | AA texte **large uniquement** (≥ 18px gras/24px normal) - ne jamais utiliser en texte courant, utiliser `orange-ink` |
| `premium` | 5.67:1 | AA texte normal |
| `success` | 4.97:1 | AA texte normal |
| `warning` | 4.80:1 | AA texte normal |
| `card-red` / `danger` | 5.48:1 (vs `bg`), 5.73:1 (vs `card-face` blanc) | AA texte normal |

Les aplats `pop-*` ne servent **jamais** de couleur de texte eux-mêmes (1.4:1
à 2.6:1 sur `bg`, hors seuil) : ce sont des fonds de tuile/bandeau, toujours
surmontés de texte **`tile-ink`** - jamais `ink` (voir section 2bis, piège
corrigé le 2026-08-04).

## 2bis. Texte sur pop (`tile-ink`) - règle absolue, corrigée le 2026-08-04

**Bug réel** signalé en jouant : "du blanc sur du jaune c'est illisible, du
blanc sur du vert clair c'est illisible, la roulette est illisible". Cause
racine : `ink` s'inverse avec le thème (`#111111` en clair, `#F4EFE6` crème en
sombre) alors que les aplats `pop-*` restent **clairs dans les deux thèmes**.
Du texte `ink` posé sur un `pop-*` tombait à 1.20:1-2.03:1 en thème sombre
(seuil AA texte normal : 4.5:1) - jamais détecté car les ratios `pop-*`
documentés plus haut ne mesurent que l'aplat contre `bg` (son usage comme
*surface*), jamais contre un texte posé *dessus*. Deux paires différentes,
un seul chiffre publié - d'où le bug.

**Règle** : tout texte, icône ou bordure posé sur une surface `bg-pop-*`
(plein ou au survol) utilise `text-tile-ink` (`--color-tile-ink`, fixe,
`#111111` dans les deux thèmes - même valeur que `card-ink`, pour la même
raison : objet visuel qui ne suit pas le thème). Jamais `text-ink`.

| Encre (fixe) | Aplat | Ratio clair | Ratio sombre | Seuil |
|---|---|---|---|---|
| `tile-ink` | `pop-yellow` | 12.86:1 | 13.65:1 | AAA |
| `tile-ink` | `pop-lime` | 12.73:1 | 13.70:1 | AAA |
| `tile-ink` | `pop-pink` | 7.35:1 | 8.12:1 | AAA |
| `tile-ink` | `pop-blue` | 7.01:1 | 8.59:1 | AAA |

Pour mémoire, la paire fautive avant correction (`ink` thémable sur `pop-*`
en thème sombre, jamais conforme) :

| Encre (thémable, fautive) | Aplat (sombre) | Ratio | Seuil |
|---|---|---|---|
| `ink` (`#F4EFE6`) | `pop-yellow` (`#FFD84D`) | 1.21:1 | échec (min. 4.5:1) |
| `ink` (`#F4EFE6`) | `pop-lime` (`#A6F05A`) | 1.20:1 | échec |
| `ink` (`#F4EFE6`) | `pop-pink` (`#FF7FBE`) | 2.03:1 | échec |
| `ink` (`#F4EFE6`) | `pop-blue` (`#7FB0FF`) | 1.92:1 | échec |

Vérifié mécaniquement par `scripts/check_contrast.mjs` (branché en CI,
`npm run check:contrast`) - ne repose plus sur une relecture manuelle.

## 3. Thème sombre (encre pop) - refonte 2026-08-04

### 3.1 Diagnostic (pourquoi l'ancienne palette "faisait fade")

L'ancienne rampe de surfaces (`bg` `#141216`, `surface` `#1D1B20`,
`surface-elevated` `#26232B`) ne produisait que **1.09:1 à 1.20:1** de
contraste entre paliers - en dessous du seuil de perception fiable à l'œil nu.
Cause : la courbe gamma sRGB comprime fortement le contraste perçu près du
noir (`L = ((c+0.055)/1.055)^2.4`), un écart RVB qui paraît net en clair
devient quasi invisible en sombre. Deux bugs additionnels aggravaient l'effet :
l'alpha des bordures fines (0.20) ne franchissait pas le seuil WCAG 1.4.11
(objets UI non textuels, 3:1) et l'animation `glow-pulse` (inutilisée, retirée)
avait une ombre codée en dur `#111111`, invisible sur fond sombre.

### 3.2 Hiérarchie d'élévation (nouvelle rampe)

| Token | Rôle | Hex | RGB | Ratio vs `bg` |
|---|---|---|---|---|
| `bg` | Fond primaire (canvas) | `#141216` | 20 18 22 | 1.00 (référence) |
| `bg-raised` | Fond secondaire (bandes, inputs) | `#221E28` | 34 30 40 | 1.14:1 |
| `surface` | Cartes, boutons secondaires | `#2E2836` | 46 40 54 | 1.31:1 |
| `surface-elevated` | Modales, bandeaux, popovers | `#3C3446` | 60 52 70 | 1.57:1 |

Chaque palier est distinctement visible du précédent (delta RGB volontairement
large pour compenser la compression gamma). **Règle de portage** : ne jamais
interpoler linéairement ces valeurs pour un 5e palier - recalculer le ratio
avec la formule WCAG, pas une simple moyenne RGB.

Les bordures neobrutalistes (`border-strong`, 2-4px) et les ombres dures
restent le repère principal d'élévation, identique en clair et en sombre - la
rampe de fond est un renfort visuel, jamais la seule information (accessibilité
aux daltoniens/contrastes réduits).

### 3.3 Couleurs de texte et d'accent

| Token | Hex | RGB | vs `bg` | vs `bg-raised` | vs `surface` | vs `surface-elevated` |
|---|---|---|---|---|---|---|
| `ink` | `#F4EFE6` | 244 239 230 | 16.26:1 | 14.28:1 | 12.45:1 | 10.35:1 |
| `ink-secondary` | `#A39DB0` | 163 157 176 | 7.10:1 | 6.23:1 | 5.44:1 | 4.52:1 |
| `ink-muted` | `#958FA3` | 149 143 163 | 5.97:1 | 5.24:1 | 4.57:1 | 3.80:1 |
| `neon` / `orange-ink` | `#FF7A2E` | 255 122 46 | 7.16:1 | 6.29:1 | 5.48:1 | 4.56:1 |
| `pop-yellow` | `#FFD84D` | 255 216 77 | 13.46:1 | 11.82:1 | 10.31:1 | 8.57:1 |
| `pop-pink` | `#FF7FBE` | 255 127 190 | 8.01:1 | 7.03:1 | 6.13:1 | 5.10:1 |
| `pop-blue` | `#7FB0FF` | 127 176 255 | 8.47:1 | 7.44:1 | 6.49:1 | 5.39:1 |
| `pop-lime` | `#A6F05A` | 166 240 90 | 13.51:1 | 11.86:1 | 10.34:1 | 8.60:1 |
| `premium` | `#D9A441` | 217 164 65 | 8.28:1 | 7.27:1 | 6.34:1 | 5.27:1 |
| `success` | `#3EA876` | 62 168 118 | 6.27:1 | 5.50:1 | 4.80:1 | 3.99:1 |
| `warning` | `#D67428` | 214 116 40 | 5.66:1 | 4.97:1 | 4.34:1 | 3.61:1 |
| `danger` | `#FF7878` | 255 120 120 | 7.28:1 | 6.39:1 | 5.57:1 | 4.63:1 |
| `card-red` (fixe, pip physique uniquement) | `#C71F2D` | 199 31 45 | 3.25:1 | 2.85:1 | 2.49:1 | 2.07:1 |

**Règle d'usage `ink-muted` en sombre** : passe l'AA texte normal (4.5:1) sur
`bg`, `bg-raised` et `surface`. Sur `surface-elevated` il ne reste qu'à
3.80:1 (AA-large seulement) - y réserver `ink-muted` aux icônes et grands
libellés décoratifs (≥ 18px), et utiliser `ink-secondary` pour tout texte
courant affiché sur une modale (`surface-elevated`). Composants déjà corrigés
dans ce sens : `ContestModal` (labels joueurs, "Qui perd la contestation ?"),
`GameBoard` (libellé "Valeur"). Vérifier ce point sur toute nouvelle modale.

**Règle `card-red` vs `danger`** : `card-red` est l'identifiant technique
figé du rouge des pips de carte (cœur/carreau) - c'est un **objet physique**,
il ne suit jamais le thème et ne doit **jamais** servir de couleur de texte UI
(2.07:1 à 3.25:1 selon la surface, hors seuil AA). Pour tout rouge sémantique
(erreur de paiement, compte à rebours, action de suppression, bouton
destructif), utiliser `danger`, qui est theme-able et vérifié AA sur toutes
les surfaces (min. 4.63:1). Exception documentée : les deux endroits où
`card-red` reste correct en tant que texte sont ceux posés sur `card-face`
(toujours blanc fixe dans les deux thèmes, ex. `RouletteScreen`,
`TribunalScreen`) - le fond ne change jamais, donc le ratio (5.73:1) ne
change jamais non plus.

### 3.4 Bordures

| Token | Clair | Sombre |
|---|---|---|
| `border` (fine, dividers) | `rgba(17,17,17,0.15)` | `rgba(244,239,230,0.38)` |
| `border-strong` (épaisse néobrutaliste) | `#111111` | `#F4EFE6` |

L'alpha de la bordure fine en sombre est passé de **0.20 à 0.38** : à 0.20,
la bordure blendée sur `bg` n'atteignait que **1.76:1** (sous le seuil WCAG
1.4.11 de 3:1 pour les limites d'objet UI non textuel comme un champ de
saisie ou une piste de progress bar). À 0.38, elle atteint **3.27:1**. La
bordure épaisse (`border-strong`, opaque, utilisée sur les cartes/boutons/
modales) était déjà largement conforme (16.26:1, c'est le token `ink`) - le
problème ne touchait que la variante fine à faible opacité.

### 3.5 Ombres

Les ombres dures néobrutalistes (`--shadow-brutal-sm/base/lg`) suivent
`--color-ink` : encre `#111111` en clair, crème `#F4EFE6` en sombre - seule la
couleur change, la mécanique (offset fixe, zéro flou) reste identique dans les
deux thèmes.

## 4. Typographie (rappel, indépendant du thème)

| Rôle | Famille | Fichier |
|---|---|---|
| Display | Anton | `anton-latin-regular.woff2` |
| Texte/UI | Bricolage Grotesque (400/500/600/700) | `bricolage-grotesque-latin-*.woff2` |
| Mono signature (ticket uniquement) | Space Mono (400/700) | `space-mono-latin-*.woff2` |

**Interdits, absolus** : IBM Plex (toutes graisses), JetBrains Mono, Inter en
police par défaut, tout italique décoratif, toute police chargée depuis un CDN
(auto-hébergement obligatoire).

## 5. Checklist de portage Android/iOS

1. Reproduire les deux tables de couleurs (section 2 et 3.3) comme
   `Color.kt`/`Colors.swift` avec les **mêmes noms de rôle** que les tokens
   web (`bg`, `surface`, `inkSecondary`, `danger`...), pas de renommage libre.
2. Implémenter la rampe d'élévation à 4 paliers (3.2) - ne pas se contenter de
   2 paliers "fond/carte", la modale doit être visuellement distincte de la
   carte.
3. Respecter la règle `ink-muted` vs `ink-secondary` sur surface-elevated
   (3.3) : sur Compose/SwiftUI, encoder ça comme deux styles de texte
   distincts (`textMuted` limité aux libellés ≥ 18px, `textSecondary` pour le
   corps de texte des modales).
4. `card-red` reste un token à part de `danger` - ne jamais fusionner les
   deux, même s'ils partagent la même valeur en clair.
5. Bordures : reproduire l'alpha exact (0.38 en sombre, 0.15 en clair) sur la
   variante fine ; la variante épaisse est opaque (pas d'alpha).
6. Revérifier chaque ratio après portage avec la même formule WCAG (section
   liminaire) - ne pas supposer qu'un rendu "à l'œil" sur mobile est identique
   au rendu web (gamma d'écran, mode sombre système OLED vs LCD).
7. `tileInk`/`cardInk` (section 2bis) : une seule valeur fixe (`#111111`),
   **jamais** de variante par thème - piège déjà rencontré côté web (bug
   corrigé le 2026-08-04), à ne pas réintroduire au portage.

## 6. Audit visuel du 2026-08-05 - angles morts de la garde par tokens

La garde `scripts/check_contrast.mjs` (section précédente) vérifie des paires
**écrites à la main** depuis `tokens.css` - elle ne voit ni les styles
inline/calculés en JS, ni les opacités composées (`bg-x/NN`, `text-x/NN`), ni
les états (survol, focus, verrouillé), ni ce qu'une bibliothèque tierce rend.
Un audit avec un vrai navigateur (Playwright + axe-core, `npm run
check:contrast:visual`, voir `scripts/visual-contrast/README.md`) a mesuré le
rendu réel de chaque écran, dans les deux thèmes, et trouvé 9 défauts que la
garde par tokens ne pouvait structurellement pas voir. Tous corrigés.

### 6.1 Encre fixe diluée par une opacité Tailwind (`/60`, `/70`)

`tile-ink` et `card-ink` sont fixes par construction (section 2bis) - mais
une classe `text-tile-ink/60` ou `/70` recompose une couleur EFFECTIVE en
mélangeant l'encre fixe avec le fond, et ce mélange, lui, n'est plus fixe :
son ratio dépend du fond ET du thème. `/60` échoue sur tous les aplats pop
mesurés (3.36:1 à 4.46:1 selon le fond/thème) ; `/70` échoue sur `pop-pink`
et `pop-blue` en thème clair (4.37:1 et 4.19:1). `/80` passe partout avec
marge (5.11:1 minimum mesuré) - **règle** : plancher `/80` pour toute encre
fixe diluée sur un aplat pop ou sur `neon`, jamais `/60` ni `/70`. Sur
`neon` spécifiquement, même `/80` ne laissait que 4.50:1 en clair (pile au
seuil, marge nulle) - `/90` (5.21:1) est le plancher retenu quand le fond est
`neon`. Composants corrigés : `HubScreen` (sous-titre de tuile, sous-titre du
Coupe-Gorge), `RankingScreen` (écran "passe le téléphone"), `WouldYouRatherScreen`
(libellés "Option A/B").

### 6.2 Encre thémable posée sur `card-face` (fixe)

Inverse du 2bis : `card-face` reste blanc dans les deux thèmes (objet
physique), donc tout texte posé dessus doit être `card-ink`/`card-red` (fixes)
- jamais `text-ink-muted`, `text-neon` ou `text-danger` (thémables), qui
éclaircissent en sombre et deviennent illisibles sur ce blanc fixe. Mesuré :
`ink-muted` sur `card-face` ne fait que 3.11-3.12:1 en sombre (`AuctionScreen`
"Le thème", `RankingScreen` "Question secrète") ; `text-neon` 2.60:1 et
`text-danger` 2.56:1 en sombre (`PromptGameScreen`, libellé de cible et de
pénalité) ; `text-ink-muted` 3.11:1 (`TribunalScreen`, mention "accusation
anonyme"). Correctifs : `text-card-ink/70` pour le texte discret,
`text-card-red` pour le rouge (il vaut exactement `danger` en clair), et
`text-[#b33d00]` fixe (valeur `orange-ink` clair) pour l'accent orange sans
équivalent fixe existant.

### 6.3 Encre fixe héritée sur un enfant à fond thémable

`QuizScreen` posait `bg-card-face text-card-ink` sur le conteneur de la carte
de question, correct pour la carte elle-même - mais le bouton interne "Voir
la réponse" a son propre fond `bg-surface` (thémable) sans jamais surcharger
la couleur de texte héritée : en sombre, `bg-surface` devient `#2E2836`
pendant que le texte reste `card-ink` fixe `#111111` (1.32:1, quasi invisible).
**Règle** : tout élément qui pose son propre fond thémable à l'intérieur d'un
conteneur à encre fixe doit reposer une couleur de texte explicite, jamais
compter sur l'héritage.

### 6.4 Survol qui ne retire pas l'état hérité du variant

`SettingsScreen` surchargeait `Button variant="secondary"` avec
`text-danger hover:bg-danger/10` sans `hover:text-danger` - le
`hover:text-tile-ink` du variant (pensé pour son survol par défaut
`hover:bg-pop-yellow`) restait actif, twMerge ne dédoublonnant que les
classes strictement en conflit. Résultat en sombre : `tile-ink` fixe sur
`bg-danger/10` composé (≈ `#2c1c20`), 1.16:1. **Règle** : toute surcharge de
`text-*`/`border-*`/`bg-*` sur un `Button` doit aussi surcharger l'état
`hover:` correspondant si le variant en pose un, sans quoi l'ancien état
survit au survol.

### 6.5 Opacité de conteneur qui dilue du texte à marge déjà fine

`opacity-70` sur toute une carte (teaser premium verrouillé de `HubScreen`)
assombrit texte ET fond de la même façon vers l'arrière-plan - `ink-secondary`
tombait à 3.95:1, `ink-muted` à 2.76:1, le badge `premium` à 2.83:1, tous sous
l'AA alors que ces mêmes tokens passent largement à pleine opacité sur
`bg-raised` (5.24:1 à 8.82:1). Même mécanique sur la carte de formule active
de `PremiumPaywallModal` (`bg-premium/15`) : teinter un fond VERS la couleur
du texte qui repose dessus (badge et note utilisent aussi `premium`/
`ink-secondary`) réduit le contraste au lieu de le préserver - mesuré
4.03:1 (badge, sombre) et 3.46:1 (note, sombre). **Règle** : ne jamais
utiliser `opacity-N` sur un CONTENEUR de texte pour un état visuel (verrouillé,
sélectionné) - dimmer le texte et son fond ensemble érode toujours la marge la
plus fine des deux. Préférer une bordure/fond plein distinct (déjà le cas
partout ailleurs dans ce design système néobrutaliste) et laisser le texte à
pleine opacité.

### 6.6 Garde renforcée

`scripts/check_contrast_visual.mjs` (Playwright + axe-core, `npm run
check:contrast.visual`) rend chaque écran dans un vrai Chromium et mesure les
couleurs CALCULÉES - il ne peut pas "oublier" une combinaison comme une liste
écrite à la main. Les deux gardes tournent en CI (`.github/workflows/ci.yml`) :
`check_contrast.mjs` à chaque push (instantané), `check_contrast_visual.mjs`
après le build (~2-3 min, navigateur). Détail du compromis et de la couverture
exacte : `scripts/visual-contrast/README.md`.
