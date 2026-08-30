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

- **Renommer les jetons `pop-*`.** Ils s'appellent encore `pop-pink`,
  `pop-blue`, `pop-lime` alors que ce sont quatre ambres depuis le passage au
  pourpre. Les noms sont conservés parce que dix fichiers y sont liés ; le
  renommage est un lot à part, mécanique mais à faire d'un bloc.
- **Reprendre les composants qui dessinaient une ombre.** Les six variables
  `--shadow-*` valent `none` pour ne casser aucune règle existante, ce qui
  aplatit visuellement les composants sans les casser. Chacun doit passer au
  filet gravé, en commençant par `Button.tsx` dont l'état pressé n'a plus de
  repère depuis que l'ombre a disparu.
- **Supprimer `public/fonts/anton-*` et `bricolage-grotesque-*`** une fois la
  reprise des composants finie. Ils ne sont plus déclarés nulle part.
