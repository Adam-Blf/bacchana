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
| `--color-bg` | `#efe6d2` | `#14100d` | `#0f0c0a` |
| `--color-bg-raised` | `#e4d8be` | `#1e1915` | `#1a1612` |
| `--color-surface` | `#f8f2e4` | `#221c17` | `#1a1612` |
| `--color-surface-elevated` | `#fffcf4` | `#2c241e` | `#25201a` |
| `--color-ink` | `#17130f` | `#efe6d2` | `#ffffff` |
| `--color-ink-secondary` | `#3b342c` | `#cec3ad` | `#e8e0d0` |
| `--color-ink-muted` | `#5c5347` | `#a2967f` | `#c4b9a6` |
| `--color-surimpression` | `#c21f1a` | `#f0503c` | `#f5d23a` |
| `--color-sur-surimpression` | `#fffcf4` | `#14100d` | `#0f0c0a` |
| `--color-neon` | `#c21f1a` | `#f0503c` | `#f5d23a` |
| `--color-neon-deep` | `#9f1914` | `#d8432f` | `#ddb91f` |
| `--color-neon-soft` | `#a81b16` | `#f46a57` | `#f8e07a` |
| `--color-orange-ink` | `#a81b16` | `#f46a57` | `#f5d23a` |
| `--color-premium` | `#5b2c87` | `#c9a7ee` | `#e2c8ff` |
| `--color-filet-clair` | `#17130f` | `#efe6d2` | `#ffffff` |
| `--color-filet-chaud` | `#c21f1a` | `#f0503c` | `#f5d23a` |
| `--color-depth` | `#5b2c87` | `#5b2c87` | `#3d1c5c` |
| `--color-appareil` | `#120e0b` | `#0c0907` | `#080605` |
| `--color-card-face` | `#fffcf4` | `#fffcf4` | `#ffffff` |
| `--color-card-ink` | `#17130f` | `#17130f` | `#000000` |
| `--color-card-red` | `#c21f1a` | `#c21f1a` | `#3d1c5c` |
| `--color-tile-ink` | `#17130f` | `#17130f` | `#0f0c0a` |
| `--color-card-ink-muted` | `#5c5347` | `#5c5347` | `#4f4a40` |
| `--color-card-danger` | `#8a2e0b` | `#8a2e0b` | `#7d1928` |
| `--color-pion` | `#d6b27a` | `#d6b27a` | `#d6b27a` |
| `--color-pion-ink` | `#8f1712` | `#8f1712` | `#8f1712` |
| `--color-danger` | `#8a2e0b` | `#ffa07e` | `#ffb199` |
| `--color-success` | `#1b6b45` | `#86dcac` | `#a8e8c8` |
| `--color-warning` | `#6e4a00` | `#f2b233` | `#ffc966` |
| `--color-aplat-1` | `#e9cf6b` | `#e9cf6b` | `#e9cf6b` |
| `--color-aplat-2` | `#e6ae9b` | `#e6ae9b` | `#e6ae9b` |
| `--color-aplat-3` | `#a7c5d4` | `#a7c5d4` | `#a7c5d4` |
| `--color-aplat-4` | `#b7cb8e` | `#b7cb8e` | `#b7cb8e` |
| `--color-border` | `rgba(23, 19, 15, 0.48)` | `rgba(239, 230, 210, 0.48)` | `rgba(255, 255, 255, 0.56)` |
| `--color-border-strong` | `#17130f` | `#efe6d2` | `#ffffff` |

## Contraste des encres sur chaque fond

Calculé sur les valeurs ci-dessus, thème par thème. Une case sous son seuil
est un défaut à corriger dans `tokens.css`, jamais à contourner dans un
composant.

### Thème clair

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 14.89 | 18.02 | 1.90 |
| `ink-secondary` | 9.87 | 11.95 | 1.26 |
| `ink-muted` | 6.08 | 7.36 | 1.29 |
| `surimpression` | 4.83 | 5.84 | 1.63 |
| `danger` | 6.83 | 8.27 | 1.15 |
| `success` | 5.23 | 6.33 | 1.50 |
| `warning` | 6.40 | 7.75 | 1.23 |
| `filet-clair` | 14.89 | 18.02 | 1.90 |

### Thème sombre

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 15.25 | 12.28 | 7.85 |
| `ink-secondary` | 10.84 | 8.73 | 5.58 |
| `ink-muted` | 6.49 | 5.23 | 3.34 |
| `surimpression` | 5.33 | 4.29 | 2.75 |
| `danger` | 9.54 | 7.68 | 4.91 |
| `success` | 11.58 | 9.32 | 5.96 |
| `warning` | 10.09 | 8.12 | 5.19 |
| `filet-clair` | 15.25 | 12.28 | 7.85 |

### Thème daltonien

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 19.49 | 16.15 | 13.82 |
| `ink-secondary` | 14.86 | 12.31 | 10.54 |
| `ink-muted` | 10.06 | 8.34 | 7.13 |
| `surimpression` | 13.15 | 10.89 | 9.32 |
| `danger` | 11.14 | 9.23 | 7.90 |
| `success` | 13.96 | 11.57 | 9.90 |
| `warning` | 12.81 | 10.61 | 9.08 |
| `filet-clair` | 19.49 | 16.15 | 13.82 |

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
