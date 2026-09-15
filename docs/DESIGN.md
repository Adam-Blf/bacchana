---
name: Bacchana
description: Les meilleurs jeux de soirée, réunis dans une seule app
colors:
  rouge-imprimerie: "#c21f1a"
  rouge-imprimerie-nuit: "#f0503c"
  encre-sur-rouge: "#fffcf4"
  bristol-paille: "#e9cf6b"
  bristol-saumon: "#e6ae9b"
  bristol-bleu: "#a7c5d4"
  bristol-tilleul: "#b7cb8e"
  encre-noire: "#17130f"
  pourpre-logo: "#5b2c87"
  papier-chamois: "#efe6d2"
  papier-chamois-relief: "#e4d8be"
  papier-surface: "#f8f2e4"
  salle-eteinte: "#14100d"
  salle-surface: "#221c17"
  salle-surface-haute: "#2c241e"
  encre-jour-secondaire: "#3b342c"
  encre-jour-sourde: "#5c5347"
  encre-nuit: "#efe6d2"
  encre-nuit-secondaire: "#cec3ad"
  encre-nuit-sourde: "#a2967f"
  face-de-carte: "#fffcf4"
  pion-blond: "#d6b27a"
  pion-chiffre: "#8f1712"
  danger-jour: "#8a2e0b"
  danger-nuit: "#ffa07e"
  succes-jour: "#1b6b45"
  alerte-jour: "#6e4a00"
typography:
  display:
    fontFamily: "Big Shoulders Display, Chivo, system-ui, sans-serif"
    fontWeight: 900
    letterSpacing: "0"
  body:
    fontFamily: "Chivo, system-ui, -apple-system, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontWeight: 700
    fontFeature: "tnum"
  receipt:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontWeight: 400
rounded:
  control: "3px"
  card: "4px"
  pill: "3px"
components:
  button-primary:
    backgroundColor: "{colors.rouge-imprimerie}"
    textColor: "{colors.encre-sur-rouge}"
    rounded: "{rounded.control}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.papier-surface}"
    textColor: "{colors.encre-noire}"
    rounded: "{rounded.control}"
    height: "44px"
  ligne-de-lot:
    backgroundColor: "{colors.papier-chamois}"
    textColor: "{colors.encre-noire}"
    height: "76px"
  panneau-borderland:
    backgroundColor: "{colors.pourpre-logo}"
    textColor: "#fffcf4"
    rounded: "{rounded.card}"
    padding: "20px"
---

# Design System: Bacchana

Version 5.1, « Loto », seconde version, arrêtée le 2026-09-15. Remplace la
première version de la même direction (commit `3a6c4bc`), jugée « IA » par
Adam : cartons pastel en grille uniforme, nom écrit en boules colorées, police
ronde, ombres douces. Écrite après la construction, depuis
`src/styles/tokens.css`, `tailwind.config.js`, `src/index.css` et les écrans
livrés.

Les valeurs normatives du thème clair et du thème sombre sont dans la
frontmatter ; le thème daltonien et les canaux RGB vivent dans
`src/styles/tokens.css`, qui fait foi en cas d'écart.

## Overview

**Creative North Star: "L'affiche du loto, imprimée en deux encres"**

Bacchana emprunte ses formes aux objets réels d'un loto de salle des fêtes, pas
à l'idée qu'on s'en fait. Le carton de loto se vend en bristol de 224 à 250 g,
de plusieurs coloris, imprimé à l'encre noire. Les pions de tirage sont des
disques blonds de 18 mm, chiffres rouges en relief. L'affiche « SUPER LOTO »
pose le mot en très gros, au moins trois fois le texte courant, et liste ses
lots de haut en bas. Une impression en deux passages décale une couleur d'un
ou deux millimètres.

Sources consultées le 2026-09-15 : cartaloto.net et lepalaisduloto.fr (cartons
et pions), bingoloto.net (pions numérotés), fete-de-village.org (hiérarchie
d'une affiche de loto communal), splitarrowprints.com et oxfordgreenprint.com
(défauts de registre d'une impression en deux passages).

L'univers narratif du jeu (le comptoir, le taulier, la tablée, la pénalité)
ne change pas. L'application se joue le soir, un téléphone qui passe de main en
main : le thème sombre, une salle lumière éteinte, reste la référence.

**Key Characteristics:**
- Deux encres, noir et rouge, sur un papier bristol ; le pourpre du logo en troisième encre, rare.
- Une grotesque condensée d'affiche, Big Shoulders Display, en capitales et à grande échelle.
- Chaque jeu est une ligne de lot : grand numéro rouge, nom en capitales, filet dessous.
- Des angles francs ; seul le pion de tirage est rond.
- Aucune ombre douce, aucun dégradé, aucun flou.

## Colors

Une palette d'imprimerie : deux encres, un papier, quatre bristols sourds.

### Primary
- **Rouge imprimerie** (#c21f1a le jour, #f0503c la nuit) : le rouge des chiffres de pion. Fond de tout bouton primaire, de « Lance la soirée », numéros de ligne du hub, second passage du nom. Encre crème par-dessus le jour, encre noire la nuit.

### Secondary
- **Bristol paille** (#e9cf6b), **saumon** (#e6ae9b), **bleu** (#a7c5d4), **tilleul** (#b7cb8e) : les teintes des gammes de cartons de loto. Au hub, elles bordent la tranche de chaque ligne de lot et ne remplissent plus rien. Elles restent les aplats des écrans de jeu (roue, quiz, classement), encre noire par-dessus dans les trois thèmes.

### Tertiary
- **Pourpre logo** (#5b2c87) : la troisième encre, réservée au panneau du Borderland et au bandeau du paywall. La classe `contexte-profond` y redéfinit les encres, crème et jaune.

### Neutral
- **Papier chamois** (#efe6d2) le jour, **salle éteinte** (#14100d) la nuit : le fond de page.
- **Encre noire** (#17130f), un noir chaud qui a bu le papier, et **encre nuit** (#efe6d2), la couleur du papier retournée.
- **Face de carte** (#fffcf4) : un bristol blanc cassé, fixe dans les trois thèmes.
- **Pion blond** (#d6b27a) et **chiffre de pion** (#8f1712) : fixes, c'est un objet.
- **Danger** (#8a2e0b le jour, #ffa07e la nuit) : un brun orangé, jamais le rouge imprimerie.

### Named Rules
**The Two Inks Rule.** Un écran s'imprime en noir et rouge. Le pourpre n'apparaît qu'au Borderland et au paywall ; les bristols ne remplissent que les écrans de jeu qui en ont besoin.

**The Red Is Pressed Rule.** Le rouge est réservé à ce qui se presse et aux numéros. Une erreur ne le porte jamais.

**The Colour Is Never Alone Rule.** Chaque état porte aussi une icône ou un libellé. Le thème daltonien écarte les teintes en luminosité et passe le rouge au jaune, il ne remplace jamais cette règle.

## Typography

**Display Font:** Big Shoulders Display (repli Chivo, system-ui)
**Body Font:** Chivo (repli system-ui)
**Label/Mono Font:** Space Mono, réservée au ticket de l'addition

**Character:** une grotesque condensée d'affiche de fête, portée en Black ; Chivo garde des chiffres tabulaires qui tiennent une colonne de scores immobile.

### Hierarchy
- **Affiche** (Big Shoulders Display 900, 76 à 120 points, interligne 0,8) : le nom BACCHANA à l'accueil, 40 à 52 points au hub.
- **Display** (900, 52 à 68 points, capitales, interligne 0,82 à 0,85) : Borderland, prénom du joueur dont c'est le tour, titre du paywall.
- **Numéro de lot** (900, 44 points, rouge imprimerie, chiffres tabulaires) : rang des jeux au hub.
- **Title** (900, 25 à 36 points, capitales) : titres de ligne de lot, « Lance la soirée », « La tablée ».
- **Body** (Chivo 400 à 500, 16 à 24 points) : consignes lues à voix haute, calées à gauche.
- **Label** (Chivo 700, 10 à 14 points, capitales espacées) : cases du menu, « Règles », compteurs.

### Named Rules
**The Three Times Rule.** Un titre d'affiche fait au moins trois fois le texte courant qui l'accompagne. Sous ce rapport, la hiérarchie redevient celle d'une interface générique.

## Layout

Une colonne de 512 points au plus, calée à gauche dans son conteneur : le nom,
le prénom annoncé et le texte des cartes s'alignent sur le bord gauche, comme
une affiche composée, jamais centrés par défaut.

Le hub se lit de haut en bas comme une affiche de loto : le nom et la tablée en
tête, une barre de cinq cases séparées d'un filet (règles maison, jeux, scores,
thème, réglages), l'action « Lance la soirée » hors de la zone qui défile, le
panneau du Borderland, puis la liste des lots. Toutes les cibles tactiles font
au moins 44 points.

## Elevation & Depth

L'imprimé est à plat. Il reste un trait de contact d'un point sous ce qui se
presse (`--ombre-carton`), deux points pour « Lance la soirée », et il disparaît
à l'appui. En daltonien, ce trait devient un anneau blanc d'un à deux points.
La profondeur ne se lit qu'aux filets et aux aplats.

### Named Rules
**The Flat Print Rule.** Aucune ombre floue. Une surface se détache par son filet ou par son aplat, pas par une lumière.

## Shapes

Des cartons massicotés : 4 points pour les cartons, feuilles et panneaux,
3 points pour les boutons, champs et étiquettes. Le pion de tirage est le seul
élément rond. La face de carte d'une consigne porte une ligne de perforation en
haut (`carton-perfore`), le carton détaché de sa planche.

## Components

### Nom d'affiche (`NomAffiche`)
Le nom en capitales condensées, encre noire, avec un second passage rouge décalé
de 0,04 em qui se pose une seule fois à l'ouverture, en 240 ms. En multiplication
sur le papier clair, en aplat sous l'encre claire la nuit. C'est le seul endroit
de l'application où ce décalage existe.

### Buttons
- **Shape:** angles de 3 points, hauteur 44 à 68 points.
- **Primary:** rouge imprimerie, encre crème le jour, encre noire la nuit, trait de contact d'un point.
- **Hover / Focus:** survol vers le rouge profond sur les pointeurs qui survolent seulement ; focus en anneau de deux points rouge.
- **Pressed:** descend de deux points, le trait disparaît, 100 ms.
- **Secondary:** papier cerné d'encre noire.
- **Disabled:** contour seul, encre sourde.

### Ligne de lot (hub)
Tranche de 6 points à la teinte du bristol du mode, numéro de 44 points en rouge,
titre en capitales, sous-titre, icône du mode en encre sourde, puis une case
« Règles » séparée d'un filet. Filet d'encre à 25 % sous chaque ligne.

### Panneau Borderland
Pourpre logo, titre de 58 à 68 points, pique à l'échelle de l'affiche coupé par
le bord à 10 % d'encre, bouton « Jouer » jaune rectangulaire.

### Pion de tirage (`.jeton`)
Disque blond, chiffre rouge en Big Shoulders Display 900, liseré intérieur et
trait bas pour l'épaisseur. Numéros de joueur à l'accueil, numéros de règle.

### Tampon
Le compte de la tablée à l'accueil : cadre de 2 points et encre rouge, incliné
de 2 degrés, posé en 200 ms.

### Carte de consigne
Face de carte fixe, bord haut perforé, texte calé à gauche en Chivo 500 de 20 à
24 points, prénom du joueur au-dessus en display.

### Paywall
Bandeau pourpre en tête (étiquette « Premium », titre display), corps sur papier.
Le double consentement, deux cases distinctes jamais pré-cochées, ne change pas.

### Ticket de l'addition
Inchangé : papier crème fixe, Space Mono, bords crantés, code-barres.

## Do's and Don'ts

### Do:
- **Do** caler à gauche les titres et le texte lu à voix haute.
- **Do** réserver le rouge imprimerie aux actions et aux numéros.
- **Do** poser une encre fixe (`tile-ink`, `card-ink`) sur tout bristol et toute face de carte.
- **Do** redéfinir les encres d'un panneau sombre avec `contexte-profond`.

### Don't:
- **Don't** revenir à une grille de cartons de même taille pour les jeux : c'est la mise en page qu'on poserait sur n'importe quelle application.
- **Don't** arrondir une étiquette en pastille ni poser une ombre floue.
- **Don't** répéter le décalage du second passage ailleurs que sur le nom.
- **Don't** reprendre une police fermée à un autre projet dans `~/.claude/design/fonts-registry.json`.
