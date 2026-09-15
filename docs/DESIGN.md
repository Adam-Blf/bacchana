---
name: Bacchana
description: Les meilleurs jeux de soirée, réunis dans une seule app
colors:
  jeton-rouge: "#c0122c"
  jeton-rouge-nuit: "#ff5a6a"
  encre-sur-jeton: "#ffffff"
  carton-jaune-poussin: "#ffd23f"
  carton-rose-bonbon: "#ff8fb6"
  carton-bleu-lagon: "#5ec2ee"
  carton-vert-anis: "#9cd85a"
  encre-de-carton: "#1c0f2b"
  boulier-pourpre: "#5b2c87"
  table-formica: "#e3ede6"
  table-formica-relief: "#d4e2d9"
  surface-claire: "#f4f8f4"
  table-de-nuit: "#1c0f2b"
  surface-de-nuit: "#27163b"
  surface-de-nuit-haute: "#33204c"
  encre-jour: "#1c0f2b"
  encre-jour-secondaire: "#3b2b4d"
  encre-jour-sourde: "#54466a"
  encre-nuit: "#f4f0fb"
  encre-nuit-secondaire: "#d6cce6"
  encre-nuit-sourde: "#ac9ec4"
  face-de-carte: "#ffffff"
  danger-jour: "#8a2e0b"
  danger-nuit: "#ffa07e"
  succes-jour: "#1b6b45"
  alerte-jour: "#6e4a00"
typography:
  display:
    fontFamily: "Rubik, Chivo, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.01em"
  display-nom:
    fontFamily: "Rubik, Chivo, system-ui, sans-serif"
    fontWeight: 900
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
  control: "12px"
  card: "18px"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.jeton-rouge}"
    textColor: "{colors.encre-sur-jeton}"
    rounded: "{rounded.control}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface-claire}"
    textColor: "{colors.encre-jour}"
    rounded: "{rounded.control}"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.carton-jaune-poussin}"
    textColor: "{colors.encre-de-carton}"
  carton-de-mode:
    backgroundColor: "{colors.carton-bleu-lagon}"
    textColor: "{colors.encre-de-carton}"
    rounded: "{rounded.card}"
    padding: "16px 16px 48px"
  panneau-boulier:
    backgroundColor: "{colors.boulier-pourpre}"
    textColor: "#fff9f0"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: Bacchana

Version 5, « Loto », arrêtée le 2026-09-15. Remplace la v4 « Tirage de nuit »,
qui se relit dans l'historique git au commit `ad64a63`. Écrite après la
construction, depuis `src/styles/tokens.css`, `tailwind.config.js`,
`src/index.css` et les écrans livrés, pas avant.

Les valeurs normatives sont dans la frontmatter ci-dessus pour le thème clair
et le thème sombre ; le troisième thème, daltonien, et les canaux RGB vivent
dans `src/styles/tokens.css`, qui fait foi en cas d'écart.

## Overview

**Creative North Star: "Le loto de la salle des fêtes"**

Bacchana ne ressemble plus à une affiche de taverne. C'est la table d'un loto
associatif un soir de fête : chaque jeu est un carton de sa propre couleur,
chaque choix pose un jeton rouge, chaque consigne est une boule tirée et
annoncée à voix haute. L'univers narratif du jeu (le comptoir, le taulier, la
tablée, la pénalité) ne change pas ; c'est l'objet qu'on tient qui change.

L'application se joue le soir, dans une pièce sombre, un téléphone qui passe de
main en main. Le thème sombre, une table prune profonde, reste la référence :
un grand aplat clair au passage du téléphone détruit la vision nocturne de la
tablée. Les cartons, eux, gardent leur couleur dans les trois thèmes, comme de
vrais cartons posés sur une vraie table.

La densité est celle d'un carton de loto : des cases franches, de gros numéros,
une seule action évidente par écran.

**Key Characteristics:**
- Quatre cartons de couleur fixe, en rotation sur les modes de jeu.
- Un seul rouge, le jeton, réservé à ce qui se presse ou qui est choisi.
- Des boules cerclées pour tout ce qui s'annonce : le nom de l'app, les numéros de joueur, les règles numérotées.
- Des cartons découpés, coins arrondis, posés sur la table avec une ombre courte.
- Rubik pour les titres et les numéros, Chivo pour le texte.

## Colors

Une palette pleine : quatre cartons saturés, un rouge d'action, un pourpre de
marque, sur une table vert d'eau le jour et prune la nuit.

### Primary
- **Rouge jeton** (#c0122c le jour, #ff5a6a la nuit) : le fond de tout bouton primaire, de « Lance la soirée », de la pastille de joueurs et des jetons posés sur les cartons. Son encre est blanche le jour (6,24:1) et encre de nuit la nuit (6,01:1).

### Secondary
- **Carton jaune poussin** (#ffd23f), **rose bonbon** (#ff8fb6), **bleu lagon** (#5ec2ee), **vert anis** (#9cd85a) : les quatre cartons de mode, distribués par index. Aucun ne porte de sens propre. Encre de carton par-dessus dans les trois thèmes (12,6 / 8,6 / 9,1 / 10,7:1), et 80 % d'encre pour les sous-titres, qui restent au-dessus de 4,5:1.

### Tertiary
- **Pourpre boulier** (#5b2c87) : le pourpre du logo. Panneau du Borderland, dos de carte, badge premium. Il porte ses propres encres par la classe `contexte-profond`, crème et jaune.

### Neutral
- **Table formica** (#e3ede6) et **table de nuit** (#1c0f2b) : le fond de page de chaque thème.
- **Surface claire** (#f4f8f4) et **surface de nuit** (#27163b) : les cartons neutres, champs et boutons secondaires.
- **Encre jour** (#1c0f2b) et **encre nuit** (#f4f0fb), avec leurs secondaires et sourdes, toutes au-dessus de 7:1 sur le fond.
- **Danger** (#8a2e0b le jour, #ffa07e la nuit) : un brun orangé, jamais le rouge jeton.

### Named Rules
**The One Jeton Rule.** Le rouge jeton n'apparaît que sur ce qui se presse ou qui est choisi. Un titre, une décoration, un état d'erreur ne le portent jamais : le jour où tout est rouge, plus rien n'est une action.

**The Fixed Carton Rule.** Un carton de mode et une face de carte à jouer ne changent pas de couleur avec le thème, et leur encre non plus : `tile-ink` ou `card-ink`, jamais l'encre thématique, qui s'inverse et tombe à 1,2:1.

**The Colour Is Never Alone Rule.** Chaque état porte aussi une icône ou un libellé. Le thème daltonien écarte les teintes en luminosité et passe le jeton au jaune, il ne remplace jamais cette règle.

## Typography

**Display Font:** Rubik (repli Chivo, system-ui)
**Body Font:** Chivo (repli system-ui)
**Label/Mono Font:** Space Mono, réservée au ticket de l'addition

**Character:** Rubik est ronde et lourde comme les numéros imprimés d'un carton de loto ; Chivo garde des chiffres tabulaires qui tiennent une colonne de scores immobile.

### Hierarchy
- **Nom** (Rubik 900, 18 à 30 points selon l'écran) : le nom BACCHANA, une lettre par boule.
- **Display** (Rubik 800, 36 à 48 points, capitales, -0,01 em) : titres d'écran, nom du joueur dont c'est le tour, « Lance la soirée ».
- **Title** (Rubik 800, 18 à 20 points, capitales) : titres de carton de mode, en-têtes de feuille.
- **Body** (Chivo 400, 16 à 20 points) : consignes lues à voix haute, texte des règles.
- **Label** (Chivo 700, 11 à 14 points, chiffres tabulaires) : compteurs, pastilles, boutons de règles.

### Named Rules
**The ExtraBold Rule.** Les titres se portent en Rubik 800. Le 900 bouche les contreformes sous 20 points et reste réservé au nom posé sur ses boules.

## Layout

Une colonne centrée de 512 points au plus (`max-w-lg`), sur toute largeur. Le
hub garde un en-tête fixe (nom, compte des jeux, raccourcis), l'action « Lance
la soirée » hors de la zone qui défile, puis une grille de cartons en deux
colonnes à hauteurs égales. La table porte une grille de cases de 44 points,
la cible tactile du jeu, tracée à 5 ou 6 % d'encre.

Les feuilles montent du bas sur téléphone et se centrent en fenêtre à partir de
640 points. Toutes les cibles tactiles font au moins 44 points.

## Elevation & Depth

Un système en ombres courtes : un carton est posé sur la table, pas imprimé
dessus. Un trait net d'un point au contact, puis une ombre douce décalée vers le
bas. Presser un carton le fait descendre de deux points et coucher son ombre.

### Shadow Vocabulary
- **Carton** (`0 1px 0 rgba(28,15,43,.22), 0 6px 14px -8px rgba(28,15,43,.5)` le jour) : boutons, cartons de mode, pastilles.
- **Carton haut** (`0 2px 0 rgba(28,15,43,.28), 0 16px 28px -12px rgba(28,15,43,.55)` le jour) : ce qu'on tient en main, carte à jouer, carton d'inscription, feuilles, « Lance la soirée ».

La nuit, les mêmes ombres passent au noir (0,55 à 0,8). En daltonien, un anneau
blanc de 1 à 2 points s'ajoute pour que la limite se lise sans la teinte.

### Named Rules
**The Press Is A Jeton Rule.** L'appui ne change pas de couleur : il descend de deux points et l'ombre se couche. Transition de 100 ms, courbe `cubic-bezier(0.23, 1, 0.32, 1)`.

## Shapes

Des cartons découpés : coins de 18 points pour les cartons et feuilles, 12
points pour les boutons et champs. La boule et le jeton sont ronds. La boule
est un disque blanc cerclé d'un anneau de couleur de carton et d'un filet
d'encre de deux points, dessiné en ombres portées pour ne pas prendre de place.

## Components

### Buttons
- **Shape:** coins de carton (12px), hauteur 44 à 60 points.
- **Primary:** rouge jeton, encre blanche le jour, encre de nuit la nuit, ombre de carton.
- **Hover / Focus:** survol vers le rouge profond (#a80f26) sur les pointeurs qui survolent seulement ; focus en anneau de deux points couleur jeton.
- **Secondary:** carton neutre cerné d'encre ; au survol il devient un carton jaune poussin.
- **Disabled:** contour seul, encre sourde, sans aplat ni ombre.

### Cartons de mode
- **Corner Style:** 18px.
- **Background:** un des quatre cartons, par rotation.
- **Structure:** une rangée de sept cases avec deux ou trois jetons rouges, dérivés du titre du jeu ; l'icône du mode ; le titre en capitales ; le sous-titre ; une pastille « Règles » en bas à droite.
- **Border:** un point d'encre de carton.

### Panneau boulier (Borderland)
Le jeu vedette est un panneau pourpre boulier, encre crème, bouton « Jouer » jaune. Le rouge reste au seul bouton « Lance la soirée » posé au-dessus.

### Boule
Nom de l'application tiré lettre par lettre, numéro de joueur à l'accueil, numéro de règle dans les feuilles. Anneau de la couleur d'un carton, en rotation.

### Inputs / Fields
- **Style:** cellule de 44 points, fond de relief, bord d'encre à 48 %, coins de 12 points.
- **Focus:** anneau de deux points couleur jeton.

### Carte à jouer
Face blanche fixe, pips rouge jeton pour cœur et carreau, encre de carton pour pique et trèfle. Le dos est un carton de loto pourpre à cases, jetons posés et boule « B » au centre (`public/card-back.svg`).

## Do's and Don'ts

### Do:
- **Do** poser une encre fixe (`tile-ink`, `card-ink`) sur tout carton de couleur et toute face de carte.
- **Do** réserver le rouge jeton aux actions et aux choix.
- **Do** redéfinir les jetons dans la portée d'un panneau sombre avec `contexte-profond`, plutôt que d'y poser une encre spéciale.
- **Do** donner à chaque état une icône ou un libellé en plus de sa couleur.

### Don't:
- **Don't** utiliser le rouge jeton pour un danger ou une erreur : le danger est brun orangé (#8a2e0b).
- **Don't** animer une boule ou un carton plus de 450 ms, ni sans respecter `prefers-reduced-motion`.
- **Don't** reprendre une police fermée à un autre projet dans `~/.claude/design/fonts-registry.json`.
