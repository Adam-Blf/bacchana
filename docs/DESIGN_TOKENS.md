# Jetons de design Bacchana - référence de portage (web, Android, iOS)

> **Ce fichier est GÉNÉRÉ.** Ne pas l'éditer à la main : lancer
> `node scripts/outils/gen_design_tokens_doc.mjs`. Il lit `src/styles/tokens.css`,
> qui est lui-même le report du fichier Figma `yw0aNHttIR5oWAw3k2VEiC`.
> En cas d'écart entre Figma et le CSS, Figma a raison.
>
> Une table de couleurs recopiée à la main diverge au premier correctif, et
> personne ne le voit. C'est exactement ce qui s'est produit entre la maquette
> et le code jusqu'au 2026-08-30 : le CSS décrivait encore un système
> néobrutaliste orange que plus aucun écran ne montrait.

Toute implémentation native (Kotlin/Compose sur `bacchana-android`,
Swift/SwiftUI sur `bacchana-ios`) reproduit ces valeurs à l'identique, sans
deviner ni réinterpréter.

Les ratios sont calculés par la formule de luminance relative WCAG 2.1,
pas estimés. Seuils : **texte normal 4,5:1**, **texte large 3:1**,
**objet d'interface 3:1**.

## Les trois thèmes

| Jeton | Clair | Sombre (référence) | Daltonien |
|---|---|---|---|
| `--color-bg` | `#e3ede6` | `#1c0f2b` | `#120a1c` |
| `--color-bg-raised` | `#d4e2d9` | `#27163b` | `#1d1230` |
| `--color-surface` | `#f4f8f4` | `#27163b` | `#1d1230` |
| `--color-surface-elevated` | `#ffffff` | `#33204c` | `#281a40` |
| `--color-ink` | `#1c0f2b` | `#f4f0fb` | `#ffffff` |
| `--color-ink-secondary` | `#3b2b4d` | `#d6cce6` | `#e6def2` |
| `--color-ink-muted` | `#54466a` | `#ac9ec4` | `#c2b6d6` |
| `--color-surimpression` | `#c0122c` | `#ff5a6a` | `#ffd23f` |
| `--color-sur-surimpression` | `#ffffff` | `#1c0f2b` | `#120a1c` |
| `--color-neon` | `#c0122c` | `#ff5a6a` | `#ffd23f` |
| `--color-neon-deep` | `#9e0e24` | `#e8475a` | `#e8b81c` |
| `--color-neon-soft` | `#a80f26` | `#ff7c88` | `#ffe07a` |
| `--color-orange-ink` | `#a80f26` | `#ff7c88` | `#ffd23f` |
| `--color-premium` | `#5b2c87` | `#cda9f5` | `#e2c8ff` |
| `--color-filet-clair` | `#1c0f2b` | `#f4f0fb` | `#ffffff` |
| `--color-filet-chaud` | `#c0122c` | `#ff5a6a` | `#ffd23f` |
| `--color-depth` | `#5b2c87` | `#5b2c87` | `#3d1c5c` |
| `--color-appareil` | `#150a20` | `#0e0718` | `#0a0512` |
| `--color-card-face` | `#ffffff` | `#ffffff` | `#ffffff` |
| `--color-card-ink` | `#1c0f2b` | `#1c0f2b` | `#000000` |
| `--color-card-red` | `#c0122c` | `#c0122c` | `#3d1c5c` |
| `--color-tile-ink` | `#1c0f2b` | `#1c0f2b` | `#120a1c` |
| `--color-card-ink-muted` | `#5f4f6e` | `#5f4f6e` | `#4f4059` |
| `--color-card-danger` | `#8a2e0b` | `#8a2e0b` | `#7d1928` |
| `--color-danger` | `#8a2e0b` | `#ffa07e` | `#ffb199` |
| `--color-success` | `#1b6b45` | `#86dcac` | `#a8e8c8` |
| `--color-warning` | `#6e4a00` | `#ffb020` | `#ffc966` |
| `--color-aplat-1` | `#ffd23f` | `#ffd23f` | `#ffd23f` |
| `--color-aplat-2` | `#ff8fb6` | `#ff8fb6` | `#ff8fb6` |
| `--color-aplat-3` | `#5ec2ee` | `#5ec2ee` | `#5ec2ee` |
| `--color-aplat-4` | `#9cd85a` | `#9cd85a` | `#9cd85a` |
| `--color-border` | `rgba(28, 15, 43, 0.48)` | `rgba(244, 240, 251, 0.48)` | `rgba(255, 255, 255, 0.56)` |
| `--color-border-strong` | `#1c0f2b` | `#f4f0fb` | `#ffffff` |

## Contraste des encres sur chaque fond

Calculé sur les valeurs ci-dessus, thème par thème. Une case sous son seuil
est un défaut à corriger dans `tokens.css`, jamais à contourner dans un
composant.

### Thème clair

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 15.20 | 18.22 | 1.87 |
| `ink-secondary` | 10.69 | 12.82 | 1.32 |
| `ink-muted` | 7.12 | 8.53 | 1.14 |
| `surimpression` | 5.21 | 6.24 | 1.56 |
| `danger` | 7.08 | 8.48 | 1.15 |
| `success` | 5.42 | 6.49 | 1.50 |
| `warning` | 6.63 | 7.95 | 1.23 |
| `filet-clair` | 15.20 | 18.22 | 1.87 |

### Thème sombre

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 16.23 | 12.88 | 8.68 |
| `ink-secondary` | 11.83 | 9.40 | 6.33 |
| `ink-muted` | 7.32 | 5.82 | 3.92 |
| `surimpression` | 6.01 | 4.77 | 3.21 |
| `danger` | 9.18 | 7.29 | 4.91 |
| `success` | 11.15 | 8.85 | 5.96 |
| `warning` | 9.96 | 7.91 | 5.33 |
| `filet-clair` | 16.23 | 12.88 | 8.68 |

### Thème daltonien

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 19.34 | 16.01 | 13.82 |
| `ink-secondary` | 14.82 | 12.27 | 10.60 |
| `ink-muted` | 10.09 | 8.35 | 7.21 |
| `surimpression` | 13.39 | 11.08 | 9.57 |
| `danger` | 11.05 | 9.15 | 7.90 |
| `success` | 13.85 | 11.46 | 9.90 |
| `warning` | 12.71 | 10.52 | 9.08 |
| `filet-clair` | 19.34 | 16.01 | 13.82 |

## Les règles qui ne se déduisent pas de la table

1. **Sur un aplat `surimpression`, la seule encre admise est
   `sur-surimpression`.** L'encre claire n'atteint que 1,4 à 2,6:1 dessus.
2. **`depth` est un FOND, pas une encre.** C'est un panneau sombre dans les
   trois thèmes, y compris le clair. Ce qui vit dedans bascule ses jetons via
   la classe `.contexte-profond` (voir `tokens.css`) : un descendant qui
   repeint le fond sans repeindre le texte donne 1,72:1, mesuré le 2026-08-30.
3. **Les cartes à jouer et les aplats `pop-*` sont FIXES** dans les trois
   thèmes. L'encre posée dessus (`tile-ink`, `card-ink`) ne suit pas le
   thème, donc le fond ne le peut pas non plus.
4. **Le voile de modale (`scrim`) ne suit pas le thème.** Un voile qui
   suivrait l'encre virerait au crème en thème sombre et éclaircirait ce qu'il
   masque.
5. **Des ombres de carton, courtes.** Un carton est posé sur la table :
   `--ombre-carton` pour ce qui repose, `--ombre-carton-haute` pour ce qu'on
   tient en main. L'appui fait descendre le carton de deux points.
6. **La couleur ne porte jamais seule le sens.** `success`, `warning` et
   `danger` se distinguent par la teinte, l'axe que la deutéranopie confond :
   une icône ou un libellé double toujours l'information.

La garde `scripts/gardes/check_contrast.mjs` vérifie ces paires à chaque exécution
et sort en 1 si l'une d'elles passe sous son seuil.
