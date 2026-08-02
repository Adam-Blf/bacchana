# La Taverne - Brand book & design system

> Source de vérité du design. Les valeurs vivent dans `src/styles/tokens.css`
> (+ miroir hexadécimal dans `tailwind.config.js`). Tout écart entre ce document
> et les tokens est un bug de documentation.

## 1. La marque

**Nom** : La Taverne
**Pitch** : Les meilleurs jeux de soirée, réunis dans une seule app.
**Promesse** : tu sors ton téléphone, la soirée démarre. Pas de matériel, pas de
règles à lire pendant vingt minutes, pas d'écran de pub entre deux fous rires.

**Voix de marque** : celle du pote qui anime la table. Tutoiement systématique,
phrases courtes, humour complice, jamais moqueur ni vulgaire. On dit « pénalité »,
jamais « verre », « shot » ni aucune marque d'alcool (règle store-safe absolue -
la table décide dans la vraie vie de ce que vaut une pénalité).

**Wordmark** : « La Taverne » en Montserrat Black, « Taverne » en orange accent avec
ombre portée dure. Logo : deux verres qui trinquent (orange + jaune), éclat
« tchin » en étoile, contours encre épais - voir `public/icon.svg`.

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
5. **Le crème est le papier, l'encre est le stylo** : fond `#FFF9F0`, tout le
   texte courant en `#111111`.

## 3. Palette

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FFF9F0` | Fond papier crème |
| `bg-raised` | `#FFF3E0` | Fond secondaire |
| `surface` | `#FFFFFF` | Cartes, boutons secondaires |
| `surface-elevated` | `#FFEFD6` | Modales, bandeaux |
| `ink` | `#111111` | Texte, bordures, ombres |
| `ink-secondary` | `#44444A` | Texte secondaire |
| `ink-muted` | `#6B6B70` | Légendes (min. AA sur crème) |
| `neon` | `#FA5600` (app) / `#FF5C00` (graphiques) | **Accent de marque** - assombri d'un cran dans l'app pour passer AA-large sur crème (3.14:1), la valeur pleine reste pour le marketing |
| `neon-deep` / `neon-soft` | `#E24E00` / `#FF8A3D` | Déclinaisons de l'accent |
| `pop-yellow` | `#FFD029` | Aplat tuile / surbrillance |
| `pop-pink` | `#FF6FB2` | Aplat tuile |
| `pop-blue` | `#6E9BFF` | Aplat tuile (éclairci pour AA avec texte encre) |
| `pop-lime` | `#9BE94C` | Aplat tuile / succès de jeu |
| `card-face` / `card-ink` / `card-red` | `#FFFFFF` / `#111111` / `#DD2A38` | Cartes à jouer (rouge assombri : 4.71:1 sur blanc) |
| `premium` | `#96690F` | Or premium (4.64:1 sur crème, AA) |
| `success` / `warning` | `#177C50` / `#B45309` | États (4.97 / 4.80 sur crème) |

Contraste : audit WCAG complet du 2026-08-02, 24 paires réelles x 2 thèmes, 0 échec.
Règles : texte encre sur tous les aplats ≥ AA - `ink-muted` réservé aux corps ≥ 12 px -
jamais de texte orange < 18 px sur crème - tout texte posé sur orange utilise `tile-ink`
(encre fixe #111111), jamais `text-ink` themable ni blanc.

## 4. Typographie

Deux familles Google Fonts, **auto-hébergées** en woff2 (`public/fonts/`,
récupérées par `scripts/fetch-fonts.mjs`) - jamais de CDN :

| Rôle | Famille | Graisses | Usage |
|---|---|---|---|
| Display | **Anton** | 400 (pèse comme un Black) | Titres, noms de modes, compteurs géants - toujours en capitales, esprit enseigne peinte |
| Texte/UI | **Bricolage Grotesque** | 400 / 500 / 600 / 700 | Corps, boutons, formulaires - grotesque à forte personnalité |
| HUD | **Bricolage Grotesque** + `tabular-nums` | 500 / 700 | Scores, valeurs de cartes (le slot `font-mono` mappe sur Bricolage) |
| Ticket | **Space Mono** | 400 / 700 | Réservée au ticket de caisse de l'addition (élément signature) |

Interdits : toute police basique (Inter, Arial, Roboto par défaut, Montserrat,
Poppins), IBM Plex, JetBrains Mono, Orbitron, Archivo (reliquats d'anciennes
identités), et tout `@import` de CDN. Préloads : Anton + Bricolage regular
uniquement (`index.html`).

## 5. Composants

- **Button** (`src/components/ui/Button.tsx`) : `primary` = aplat orange,
  `secondary` = blanc (hover jaune), `ghost` = transparent. Min 44 px de haut.
- **QuitButton** (`ui/QuitButton.tsx`) : bouton quitter partagé, `fixed top-safe
  left-4 z-controls`, 44×44, aria français. Obligatoire sur tout écran de jeu.
- **ConfirmDialog** (`ui/ConfirmDialog.tsx`) : confirmation destructive, se ferme
  au retour matériel (via `useBackClose`) et à Escape.
- **PlayingCard** : pips réels 2-10, figures V/D/R en miroir avec emblème
  (épée/joyau/couronne), Joker étoilé, dos rayé signature (`public/card-back.svg`).
- **ModeTile** (hub) : aplat `TILE_COLORS` en rotation, icône Lucide encre.

## 6. Ombres, radius, z-index

- Ombres : `--shadow-brutal-sm` 3px, `--shadow-brutal` 4px, `--shadow-brutal-lg`
  6px - toujours `0` de flou, toujours encre.
- Radius : `card` 12 px, `control` 10 px, `pill` 9999.
- Échelle z (tokens Tailwind) : contenu < `z-banner` (30, cookies) <
  `z-controls` (40, boutons fixes) < `z-overlay` (50, pickers) < `z-modal` (60).
  Le bandeau cookies ne recouvre **jamais** un bouton de navigation.

## 7. Safe-area & navigation

- Utilitaires plugin Tailwind : `top-safe`, `pt-safe`, `pb-safe`, `pt-safe-N`
  (inset + spacing). Tout élément `fixed` en haut d'écran utilise `top-safe`.
- Navigation : couche historique (`src/core/navigation/history.ts`). Le retour
  matériel ferme d'abord l'overlay ouvert, puis remonte l'écran, puis affiche le
  toast « Appuie encore pour quitter ». Toute nouvelle modale **doit** utiliser
  `useBackClose`.

## 8. Motion

- Framer Motion, `MotionConfig reducedMotion="user"` global + media query CSS.
- Entrées : spring damping 22-26. Presses : translation vers l'ombre (pas de
  scale suspendu). Flip de carte : 600 ms, `initial={false}` (jamais de flash de
  la face).

## 9. Accessibilité (checklist de sortie)

- [x] Zoom pinch actif (pas de `user-scalable=no`)
- [x] Cibles tactiles ≥ 44 px
- [x] `aria-live="polite"` sur les résultats de jeu
- [x] Modales : fermeture Escape + retour matériel + croix visible
- [x] Labels français accentués (« Dame de Cœur », « Carte face cachée »)
- [x] Contrastes AA sur la palette claire

## Mode sombre - la taverne à la bougie (2026-08-02)

Deux thèmes, bascule via `[data-theme]` sur `<html>` (store `themeStore`,
préférence persistée, « system » suit l'OS en direct). Tailwind consomme les
canaux RGB de `tokens.css`, les modificateurs d'opacité suivent donc le thème.

| Token | Clair (papier) | Sombre (bois à la bougie) |
|---|---|---|
| bg | `#FFF9F0` | `#1A120D` |
| bg-raised | `#FFF3E0` | `#281C14` |
| ink | `#111111` | `#F5EAD7` |
| neon (accent) | `#FF5C00` | `#FF7A2E` (lueur de lanterne) |
| premium | `#A87718` | `#D9A441` (laiton) |
| success | `#1B8A5A` | `#3EA876` (feutre vert) |

Invariants : les cartes à jouer (`card-face`/`card-ink`) et le texte posé sur
les aplats pop des tuiles (`tile-ink`) restent fixes, ces surfaces sont claires
dans les deux thèmes. Les ombres dures suivent `--color-ink` : encre en clair,
crème en sombre (effet enseigne peinte). Contrastes vérifiés sur WebKit :
titre 15,5:1 et corps 10,3:1 en sombre.

## Nommage des jeux - registre taverne (2026-08-02)

Les modes originaux portent des noms de taverne, les jeux universels gardent
leur nom générique (découvrabilité) avec un sous-titre thématisé.

| Identifiant technique | Nom affiché |
|---|---|
| `borderland` | Le Coupe-Gorge |
| `picolo` | Le Taulier |
| `auction` | La Criée |
| `ranking` | Le Tableau d'Honneur |
| `tribunal` | Le Pilori |
| `roulette` | La Roue du Destin |
| `quiz` | Quitte ou Trinque (inchangé) |
| autres | noms génériques conservés |

L'écran de fin s'appelle « L'addition », la liste des joueurs « La tablée »,
le CTA d'entrée « Pousser la porte ». Les identifiants techniques, clés
d'analytics et schémas de packs ne changent jamais avec les libellés.
