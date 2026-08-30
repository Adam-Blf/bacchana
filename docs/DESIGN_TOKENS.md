# Jetons de design Bacchana - référence de portage (web, Android, iOS)

> **Ce fichier est GÉNÉRÉ.** Ne pas l'éditer à la main : lancer
> `node scripts/gen_design_tokens_doc.mjs`. Il lit `src/styles/tokens.css`,
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
| `--color-bg` | `#fff9f0` | `#5b2c87` | `#3d1c5c` |
| `--color-bg-raised` | `#f3e9dc` | `#5b2c87` | `#3d1c5c` |
| `--color-surface` | `#fffdf8` | `#5b2c87` | `#3d1c5c` |
| `--color-surface-elevated` | `#f3e9dc` | `#4c2371` | `#2a1140` |
| `--color-ink` | `#2a1140` | `#fff9f0` | `#ffffff` |
| `--color-ink-secondary` | `#4a2470` | `#dccfea` | `#eadff5` |
| `--color-ink-muted` | `#6b4a8c` | `#c0aad6` | `#d6c4e8` |
| `--color-surimpression` | `#5b2c87` | `#ffd029` | `#ffdd4a` |
| `--color-sur-surimpression` | `#fff9f0` | `#2a1140` | `#1a0a28` |
| `--color-neon` | `#5b2c87` | `#ffd029` | `#ffdd4a` |
| `--color-neon-deep` | `#4c2371` | `#e8b81c` | `#e8c31c` |
| `--color-neon-soft` | `#7e49ae` | `#ffe07a` | `#ffe894` |
| `--color-orange-ink` | `#5b2c87` | `#ffd029` | `#ffdd4a` |
| `--color-premium` | `#5b2c87` | `#ffd029` | `#ffdd4a` |
| `--color-filet-clair` | `#2a1140` | `#fff9f0` | `#ffffff` |
| `--color-filet-chaud` | `#5b2c87` | `#ffd029` | `#ffdd4a` |
| `--color-depth` | `#5b2c87` | `#2a1140` | `#1a0a28` |
| `--color-appareil` | `#150a20` | `#150a20` | `#0f0618` |
| `--color-card-face` | `#fff9f0` | `#fff9f0` | `#ffffff` |
| `--color-card-ink` | `#2a1140` | `#2a1140` | `#000000` |
| `--color-card-red` | `#5b2c87` | `#5b2c87` | `#3d1c5c` |
| `--color-tile-ink` | `#2a1140` | `#2a1140` | `#1a0a28` |
| `--color-danger` | `#8e2a14` | `#ff9c84` | `#ffb199` |
| `--color-success` | `#1b6b45` | `#86dcac` | `#a8e8c8` |
| `--color-warning` | `#7a5200` | `#ffb020` | `#ffc966` |
| `--color-aplat-1` | `#ffd029` | `#ffd029` | `#ffd029` |
| `--color-aplat-2` | `#ffb020` | `#ffb020` | `#ffb020` |
| `--color-aplat-3` | `#ffe07a` | `#ffe07a` | `#ffe07a` |
| `--color-aplat-4` | `#e8b81c` | `#e8b81c` | `#e8b81c` |
| `--color-border` | `rgba(42, 17, 64, 0.48)` | `rgba(255, 249, 240, 0.48)` | `rgba(255, 255, 255, 0.56)` |
| `--color-border-strong` | `#2a1140` | `#fff9f0` | `#ffffff` |

## Contraste des encres sur chaque fond

Calculé sur les valeurs ci-dessus, thème par thème. Une case sous son seuil
est un défaut à corriger dans `tokens.css`, jamais à contourner dans un
composant.

### Thème clair

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 16.01 | 13.97 | 1.72 |
| `ink-secondary` | 11.29 | 9.85 | 1.21 |
| `ink-muted` | 6.72 | 5.87 | 1.38 |
| `surimpression` | 9.31 | 8.12 | 1.00 |
| `danger` | 8.05 | 7.02 | 1.16 |
| `success` | 6.20 | 5.41 | 1.50 |
| `warning` | 6.61 | 5.77 | 1.41 |
| `filet-clair` | 16.01 | 13.97 | 1.72 |

### Thème sombre

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 9.31 | 11.23 | 16.01 |
| `ink-secondary` | 6.57 | 7.93 | 11.30 |
| `ink-muted` | 4.62 | 5.58 | 7.95 |
| `surimpression` | 6.64 | 8.01 | 11.42 |
| `danger` | 4.80 | 5.79 | 8.25 |
| `success` | 5.96 | 7.19 | 10.26 |
| `warning` | 5.33 | 6.43 | 9.17 |
| `filet-clair` | 9.31 | 11.23 | 16.01 |

### Thème daltonien

| Encre | sur `bg` | sur `surface-elevated` | sur `depth` |
|---|---|---|---|
| `ink` | 13.82 | 16.76 | 18.78 |
| `ink-secondary` | 10.78 | 13.07 | 14.64 |
| `ink-muted` | 8.51 | 10.31 | 11.56 |
| `surimpression` | 10.33 | 12.53 | 14.04 |
| `danger` | 7.90 | 9.58 | 10.73 |
| `success` | 9.90 | 12.01 | 13.45 |
| `warning` | 9.08 | 11.02 | 12.34 |
| `filet-clair` | 13.82 | 16.76 | 18.78 |

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
5. **Aucune ombre.** Les six `--shadow-*` valent `none` : l'élévation passe
   par `--rule-engraved`.
6. **La couleur ne porte jamais seule le sens.** `success`, `warning` et
   `danger` se distinguent par la teinte, l'axe que la deutéranopie confond :
   une icône ou un libellé double toujours l'information.

La garde `scripts/check_contrast.mjs` vérifie ces paires à chaque exécution
et sort en 1 si l'une d'elles passe sous son seuil.
