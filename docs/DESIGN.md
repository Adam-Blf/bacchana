# Bacchana - Direction artistique

Version 4, « Tirage de nuit », arrêtée le 2026-08-30. Remplace la v3
néobrutaliste, qui se relit dans l'historique git, au commit précédant la
version 0.44.0.

**La source de vérité est désormais le fichier Figma `yw0aNHttIR5oWAw3k2VEiC`.**
`src/styles/tokens.css` en est le report, et il ne doit rien inventer : en cas
d'écart entre les deux, c'est Figma qui a raison, et c'est le CSS qu'on
corrige.

## Le concept, en une phrase

Un aplat pourpre, deux encres, une surimpression jaune, un filet gravé.

Le pourpre est celui du logo, `#5B2C87`, pas une approximation. Le reste
découle d'une idée simple : l'application se regarde le soir, à plusieurs,
dans une pièce sombre, et le téléphone passe de main en main. Un grand aplat
clair au moment du passage détruit la vision nocturne de toute la tablée -
c'est pourquoi le thème sombre est le thème de référence, et non une option.

## Les cinq règles, non négociables

1. **Aucune ombre.** Ni floue, ni dure. L'élévation se lit au FILET gravé
   (`--rule-engraved`), un trait d'un point. C'est la rupture nette avec le
   néobrutalisme, qui posait son élévation dans une ombre décalée de 4 points.
2. **Aucun flou, aucun dégradé.** Les aplats sont pleins.
3. **Angles francs**, sauf la carte à jouer : c'est un objet physique, elle
   garde son rayon.
4. **Une seule couleur d'aplat par surface**, encre par-dessus. Sur un aplat
   d'accent, la seule encre admise est `sur-surimpression`.
5. **La couleur ne porte jamais seule le sens.** Chaque état porte aussi une
   icône ou un libellé. Trois teintes d'état se distinguent par la teinte,
   précisément l'axe que la deutéranopie confond.

## Trois thèmes, pas deux

`:root` (clair), `[data-theme='dark']` (le pourpre, référence),
`[data-theme='daltonien']`. Le troisième n'invente pas d'autres teintes : il
écarte les mêmes en luminosité. Il ne remplace jamais la règle 5.

## Typographie

| Rôle | Police | Note |
|---|---|---|
| Display, titres | **Big Shoulders Display** | chasse étroite, tient un titre de capitales sur deux lignes dans 350 points |
| Corps, interface | **Chivo** | vrais chiffres tabulaires, c'est la raison du choix : une colonne de scores qui danse à chaque pénalité se lit mal |
| Ticket de l'addition | **Space Mono** | élément signature, réservé à cet écran |

Les deux premières sont **réservées à Bacchana** dans
`~/.claude/design/fonts-registry.json` : une police adoptée par un projet est
fermée aux suivants. Anton et Bricolage Grotesque ont été libérées en quittant
le néobrutalisme.

**Piège de nommage.** La fonderie a renommé « Big Shoulders Display » en « Big
Shoulders ». Figma affiche encore l'ancien nom, Google sert le nouveau. Le
`@font-face` de `src/index.css` déclare la famille sous l'ANCIEN nom, servie
depuis les fichiers `big-shoulders-*` : sans ça, le même système porterait deux
noms et un contrôle de police croirait à une dérive.

## Ce qui reste à faire, et qui est de la dette écrite

Les trois lots ouverts au 2026-08-30 sont **faits** : les jetons `pop-*` sont
renommés `aplat-1` à `aplat-4` (98 occurrences, plus quatre variables ajoutées
dans Figma sous `aplat/1` à `aplat/4`), `Button.tsx` a retrouvé un état pressé,
et les fichiers de police d'Anton et Bricolage Grotesque sont supprimés.

Ce qui reste :

- **Les autres composants qui dessinaient une ombre.** Les six `--shadow-*`
  valent `none`, ce qui les aplatit sans les casser. `Button.tsx` est repris ;
  les cartes, modales et feuilles de bas d'écran restent à passer au filet.
- **Le produit à 12,99 EUR dans RevenueCat** et dans les deux consoles. Le
  code, la documentation et les tests sont déjà alignés.

## L'état pressé, et pourquoi il a changé de forme

Le néobrutalisme faisait « écraser » une ombre dure : le bouton se translatait
de 4 points vers le coin de son ombre, qui disparaissait. Sans ombre, il n'y a
plus rien à écraser, et le bouton est resté sans aucun repère entre le 2026-08-30
et sa reprise.

Il ENFONCE désormais son filet : le trait passe de un à deux points, en
intérieur. Ça creuse la surface sans la déplacer, ce qui vaut mieux sur un
téléphone tenu à bout de bras. La translation part avec l'ombre qu'elle
accompagnait ; le léger retrait d'échelle reste le retour tactile.

**Et une règle qui se lit mal si on ne la nomme pas :** l'encre posée sur un
aplat d'accent est TOUJOURS `sur-surimpression`, jamais `tile-ink`. Depuis le
passage au pourpre, `neon` vaut pourpre en thème clair, où `tile-ink` tombe à
1,6:1 - le bouton primaire était illisible et personne ne l'avait vu.
`tile-ink` ne vaut que sur les aplats FIXES, `aplat-1` à `aplat-4` et les
cartes à jouer, qui ne changent pas avec le thème.
