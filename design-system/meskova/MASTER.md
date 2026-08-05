# Meskova - Brand book & design system

> Source de vérité du design. Les valeurs vivent dans `src/styles/tokens.css`
> (+ miroir hexadécimal dans `tailwind.config.js`). Pour le détail exhaustif des
> couleurs (rôles, hex, ratios de contraste mesurés, règles de portage
> Android/iOS), voir [`docs/DESIGN_TOKENS.md`](../../docs/DESIGN_TOKENS.md) -
> ce document-ci reste la vue d'ensemble marque + composants.
>
> Succède à [`design-system/la-taverne/MASTER.md`](../la-taverne/MASTER.md)
> (archive historique de l'ère « La Taverne », 0.8.0 -> 0.30.x). L'univers
> narratif (la taverne, le comptoir, le taulier, la tablée, la pénalité) est
> conservé à l'identique : seul le nom du produit change.

## 1. La marque

**Nom** : Meskova
**Éditeur** : Adam Beloucif, nom commercial **BLF Lab's** (blflabs.com)
**Pitch** : Les meilleurs jeux de soirée, réunis dans une seule app.
**Promesse** : tu sors ton téléphone, la soirée démarre. Pas de matériel, pas de
règles à lire pendant vingt minutes, pas d'écran de pub entre deux fous rires.

**Voix de marque** : celle du pote qui anime la table. Tutoiement systématique,
phrases courtes, humour complice, jamais moqueur ni vulgaire. On dit « pénalité »,
jamais « verre », « shot » ni aucune marque d'alcool (règle store-safe absolue -
la table décide dans la vraie vie de ce que vaut une pénalité).

**Wordmark** : « Meskova » en Anton, orange accent avec ombre portée dure.
Logo : deux verres qui trinquent (orange + jaune), éclat « tchin » en étoile,
contours encre épais - voir `public/icon.svg`. Sceau de cire premium :
monogramme **M** (voir `src/components/ui/WaxSeal.tsx`).

## 2. Direction artistique - néobrutalisme

Références : aplats vifs très contrastés, bordures encre épaisses (2 px),
ombres portées franches jamais floutées, formes géométriques (étoiles, badges),
typographie massive, coins peu arrondis. L'interface doit donner l'impression
d'un jeu de société physique posé sur la table.

### Les 5 règles d'or
1. **Toute surface interactive** porte `border-2 border-ink` + une ombre dure
   (`shadow-brutal` / `brutal-sm` / `brutal-lg`).
2. **L'état pressé écrase l'ombre** : `active:translate-x/y` de la valeur de
   l'ombre + `active:shadow-none`. Jamais de scale-only.
3. **Jamais de flou** : pas de drop-shadow douce, pas de glassmorphism. Le seul
   flou toléré est le halo d'ambiance décoratif d'arrière-plan (`bg-neon/[0.05]`).
4. **Une couleur d'aplat par carte/tuile**, texte encre par-dessus. Le blanc
   (`surface`) est un aplat comme un autre.
5. **En sombre, la bordure et l'ombre restent le repère principal d'élévation**,
   comme en clair - la rampe de fond (bg/raised/surface/elevated) est un
   complément, jamais la seule information (voir section « Mode sombre »).

## 3. Palette claire (inchangée)

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FFF9F0` | Fond papier crème |
| `bg-raised` | `#FFF3E0` | Fond secondaire |
| `surface` | `#FFFFFF` | Cartes, boutons secondaires |
| `surface-elevated` | `#FFEFD6` | Modales, bandeaux |
| `ink` | `#111111` | Texte, bordures, ombres |
| `ink-secondary` | `#44444A` | Texte secondaire |
| `ink-muted` | `#6B6B70` | Légendes (min. AA sur crème) |
| `neon` | `#FA5600` (app) / `#FF5C00` (graphiques) | Accent de marque |
| `orange-ink` | `#C74300` | Orange utilisé comme texte (< 18px non-gras) |
| `card-face` / `card-ink` / `card-red` | `#FFFFFF` / `#111111` / `#C71F2D` | Cartes à jouer (pips physiques, fixes dans les 2 thèmes) |
| `danger` | `#C71F2D` (= card-red en clair) | Rouge sémantique (erreur, suppression) - theme-able, distinct de card-red |
| `premium` | `#855C12` | Or premium |
| `success` / `warning` | `#177C50` / `#B45309` | États |

## 4. Typographie

Trois familles Google Fonts, **auto-hébergées** en woff2 (`public/fonts/`,
récupérées par `scripts/fetch-fonts.mjs`) - jamais de CDN :

| Rôle | Famille | Graisses | Usage |
|---|---|---|---|
| Display | **Anton** | 400 (pèse comme un Black) | Titres, noms de modes, compteurs géants - toujours en capitales |
| Texte/UI | **Bricolage Grotesque** | 400 / 500 / 600 / 700 | Corps, boutons, formulaires |
| HUD | **Bricolage Grotesque** + `tabular-nums` | 500 / 700 | Scores, valeurs de cartes |
| Ticket | **Space Mono** | 400 / 700 | Réservée au ticket de caisse de l'addition (élément signature) |

Interdits : toute police basique (Inter, Arial, Roboto par défaut, Montserrat,
Poppins), **IBM Plex** (toutes graisses), **JetBrains Mono**, Orbitron, Archivo
(reliquats d'anciennes identités), tout italique décoratif, et tout `@import`
de CDN.

## 5. Composants

- **Button** (`src/components/ui/Button.tsx`) : `primary` = aplat orange,
  `secondary` = blanc (hover jaune), `ghost` = transparent. Min 44 px de haut.
- **QuitButton** (`ui/QuitButton.tsx`) : bouton quitter partagé, `fixed top-safe
  left-4 z-controls`, 44×44, aria français.
- **ConfirmDialog** (`ui/ConfirmDialog.tsx`) : confirmation destructive.
- **WaxSeal** (`ui/WaxSeal.tsx`) : sceau premium, monogramme **M**.
- **PlayingCard** : pips réels 2-10, figures V/D/R en miroir, Joker étoilé.
- **ModeTile** (hub) : aplat `TILE_COLORS` en rotation, icône Lucide encre.

## 6. Ombres, radius, z-index

- Ombres : `--shadow-brutal-sm` 3px, `--shadow-brutal` 4px, `--shadow-brutal-lg`
  6px - toujours `0` de flou, toujours `--color-ink` (encre en clair, crème en
  sombre).
- Radius : `card` 12 px, `control` 10 px, `pill` 9999.
- Échelle z (tokens Tailwind) : contenu < `z-banner` (30) < `z-controls` (40) <
  `z-overlay` (50) < `z-modal` (60).

## 7. Mode sombre - refonte 2026-08-04 (hiérarchie d'élévation)

Deux thèmes, bascule via `[data-theme]` sur `<html>` (store `themeStore`,
préférence persistée, « system » suit l'OS en direct).

**Diagnostic de la refonte** : la rampe précédente (`bg` #141216, `surface`
#1D1B20, `surface-elevated` #26232B) ne produisait que 1.09:1 à 1.20:1 de
contraste entre paliers - quasi invisible, d'où le retour « le sombre fait
fade ». La courbe gamma sRGB compresse énormément le contraste perçu près du
noir : il faut des écarts RGB beaucoup plus larges qu'en clair pour obtenir une
élévation lisible.

| Palier | Hex | Ratio vs `bg` |
|---|---|---|
| `bg` (fond) | `#141216` | - |
| `bg-raised` | `#221E28` | 1.14:1 |
| `surface` (cartes) | `#2E2836` | 1.31:1 |
| `surface-elevated` (modales) | `#3C3446` | 1.57:1 |

Le détail complet (chaque couleur, ratio mesuré, règle d'usage par composant)
vit dans [`docs/DESIGN_TOKENS.md`](../../docs/DESIGN_TOKENS.md). Résumé :

- `ink-muted` éclairci de `#837D8F` à `#958FA3` pour repasser AA texte sur
  `bg`/`bg-raised`/`surface` ; sur `surface-elevated`, réservé aux icônes et
  labels décoratifs (AA-large uniquement, 3.80:1).
- `--alpha-border` passe de 0.20 à 0.38 en sombre : la bordure fine (divider,
  progress track) atteint 3.27:1 contre 1.76:1 avant (seuil WCAG 1.4.11 pour
  les limites d'objet UI non textuel).
- Nouveau token `danger` (`#FF7878` en sombre, `#C71F2D` en clair = card-red) :
  rouge sémantique pour erreur/suppression/alerte, distinct de `card-red` qui
  reste fixe (pip physique de carte, ne suit jamais le thème).
- Les aplats pop (`pop-yellow/pink/blue/lime`), `neon`, `premium`, `success`,
  `warning` sont inchangés dans leurs valeurs, déjà vérifiés AA/AAA.

Invariants : les cartes à jouer (`card-face`/`card-ink`/`card-red`) et le texte
posé sur les aplats pop des tuiles (`tile-ink`) restent fixes, ces surfaces
sont claires dans les deux thèmes.

## 8. Accessibilité (checklist de sortie)

- [x] Zoom pinch actif (pas de `user-scalable=no`)
- [x] Cibles tactiles ≥ 44 px
- [x] `aria-live="polite"` sur les résultats de jeu
- [x] Modales : fermeture Escape + retour matériel + croix visible
- [x] Labels français accentués (« Dame de Cœur », « Carte face cachée »)
- [x] Contrastes AA sur les deux thèmes, AAA sur le texte courant clair

## 9. Nommage des jeux - registre taverne (univers narratif, inchangé)

Les modes originaux portent des noms de taverne, les jeux universels gardent
leur nom générique (découvrabilité) avec un sous-titre thématisé. Ce lexique
ne bouge pas avec le renommage produit.

| Identifiant technique | Nom affiché |
|---|---|
| `borderland` | Le Coupe-Gorge |
| `picolo` | Le Taulier |
| `auction` | La Criée |
| `ranking` | Le Tableau d'Honneur |
| `tribunal` | Le Pilori |
| `roulette` | La Roue du Destin |
| `quiz` | Quitte ou Double (ex-« Quitte ou Trinque », renommé 2026-08-05) |
| autres | noms génériques conservés |

L'écran de fin s'appelle « L'addition », la liste des joueurs « La tablée »,
le CTA d'entrée « Pousser la porte ». Les identifiants techniques, clés
d'analytics et schémas de packs ne changent jamais avec les libellés.
